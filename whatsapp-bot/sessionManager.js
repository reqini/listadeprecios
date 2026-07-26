const path = require('path');
const fs = require('fs');
const QRCode = require('qrcode');
const pino = require('pino');
const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  generateWAMessageFromContent,
  proto,
} = require('@whiskeysockets/baileys');

const store = require('./store');
const { generateAiReply } = require('./ai');

const AUTH_DIR = path.join(__dirname, 'sessions');
const UPLOADS_DIR = path.join(__dirname, 'uploads');
const MAX_RECONNECT_DELAY_MS = 30_000;

function uploadPath(envId, fileId) {
  return path.join(UPLOADS_DIR, envId, fileId);
}

// runtimeKey (`${envId}::${sessionId}`) -> { sock, status, qrDataUrl, reconnectDelay }
const runtime = new Map();

function runtimeKey(envId, sessionId) {
  return `${envId}::${sessionId}`;
}

function toJid(number) {
  const digits = String(number).replace(/\D/g, '');
  return `${digits}@s.whatsapp.net`;
}

function isGroupJid(jid) {
  return !!jid && jid.endsWith('@g.us');
}

function isStatusBroadcast(jid) {
  return !jid || jid.endsWith('broadcast');
}

function extractText(message) {
  const m = message.message;
  if (!m) return '';
  // Cuando la persona TOCA un botón / opción de un menú interactivo, WhatsApp no
  // manda texto sino la selección — la interpretamos como si hubiera escrito ese id
  // (que nosotros seteamos al número de la opción), así el menú pendiente lo resuelve.
  if (m.buttonsResponseMessage?.selectedButtonId) return m.buttonsResponseMessage.selectedButtonId;
  if (m.templateButtonReplyMessage?.selectedId) return m.templateButtonReplyMessage.selectedId;
  if (m.listResponseMessage?.singleSelectReply?.selectedRowId) {
    return m.listResponseMessage.singleSelectReply.selectedRowId;
  }
  const nativeParams = m.interactiveResponseMessage?.nativeFlowResponseMessage?.paramsJson;
  if (nativeParams) {
    try {
      const parsed = JSON.parse(nativeParams);
      if (parsed.id) return String(parsed.id);
    } catch (_) {
      /* json inesperado: seguimos con el texto normal */
    }
  }
  return (
    m.conversation ||
    m.extendedTextMessage?.text ||
    m.imageMessage?.caption ||
    m.videoMessage?.caption ||
    ''
  );
}

// --- Detección inteligente de palabras clave (tolera typos, acentos y variantes) ---
// En vez de exigir el texto exacto, normalizamos (sin acentos ni puntuación) y
// comparamos palabra por palabra con tolerancia a errores de tipeo. Así "lista de
// precios" matchea "quiero lsita", "lñista", "tienen l lsita", etc. Es determinístico,
// instantáneo y gratis (no llama a la IA en cada mensaje).
const STOPWORDS = new Set([
  'de', 'la', 'el', 'los', 'las', 'un', 'una', 'y', 'o', 'a', 'que', 'en', 'del',
  'al', 'me', 'mi', 'tu', 'su', 'se', 'lo', 'le', 'les', 'por', 'para', 'con', 'sin',
]);

function normalizeText(s) {
  return (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // quita acentos y diéresis
    .replace(/[^a-z0-9\s]/g, ' ') // quita puntuación/emojis
    .replace(/\s+/g, ' ')
    .trim();
}

// Distancia de Damerau-Levenshtein: cuenta inserción, borrado, sustitución y
// transposición de letras adyacentes como 1 edición (clave para typos tipo "lsita").
function editDistance(a, b) {
  const al = a.length;
  const bl = b.length;
  if (!al) return bl;
  if (!bl) return al;
  const d = Array.from({ length: al + 1 }, () => new Array(bl + 1).fill(0));
  for (let i = 0; i <= al; i++) d[i][0] = i;
  for (let j = 0; j <= bl; j++) d[0][j] = j;
  for (let i = 1; i <= al; i++) {
    for (let j = 1; j <= bl; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
      }
    }
  }
  return d[al][bl];
}

// ¿Dos palabras son "la misma" tolerando typos? La tolerancia crece con el largo.
function wordFuzzyEqual(a, b) {
  if (a === b) return true;
  const maxLen = Math.max(a.length, b.length);
  if (maxLen < 4) return a === b; // palabras muy cortas: exigimos exacto (evita falsos positivos)
  const tolerance = maxLen <= 4 ? 1 : maxLen <= 7 ? 2 : 3;
  return editDistance(a, b) <= tolerance;
}

// ¿El mensaje del cliente matchea la palabra clave? Match si el texto contiene la
// frase (ya normalizada) o si al menos la mitad de las palabras significativas de la
// keyword aparecen con typos tolerados.
function keywordMatches(text, keyword) {
  const nText = normalizeText(text);
  const nKey = normalizeText(keyword);
  if (!nKey) return false;
  if (nText.includes(nKey)) return true; // coincidencia directa (ya sin acentos/puntuación)

  const textWords = nText.split(' ').filter(Boolean);
  const keyWords = nKey.split(' ').filter((w) => w.length >= 3 && !STOPWORDS.has(w));
  if (keyWords.length === 0) return nText.includes(nKey); // keyword solo con palabras cortas/stopwords

  let matched = 0;
  for (const kw of keyWords) {
    if (textWords.some((tw) => wordFuzzyEqual(tw, kw))) matched++;
  }
  return matched / keyWords.length >= 0.5;
}

// Devuelve la REGLA que matchea (no el texto final), porque una regla puede ser
// de tipo 'menu' — en ese caso el llamador arma el texto del menú y guarda el
// estado pendiente para interpretar la respuesta del usuario.
async function computeReply(envId, sessionId, sessionConfig, text) {
  if (!sessionConfig.autoReplyEnabled) return null;
  let fallback = null;
  for (const rule of sessionConfig.rules || []) {
    if (!rule.keyword) {
      fallback = rule;
      continue;
    }
    if (keywordMatches(text, rule.keyword)) return rule;
  }

  if (sessionConfig.aiEnabled && sessionConfig.aiContext?.trim()) {
    try {
      const aiReply = await generateAiReply(sessionConfig.aiContext, text);
      if (aiReply) return { keyword: null, response: aiReply };
    } catch (err) {
      console.error(`[${envId}/${sessionId}] error generando respuesta con IA:`, err.message);
    }
  }

  return fallback;
}

// Grupos: solo respuestas tipo FAQ por palabra clave — nunca hay respuesta "por
// defecto" para no contestarle a cada mensaje de un grupo lleno de gente. Usa la
// misma detección inteligente (typos/acentos/variantes) que los chats individuales.
function matchGroupReply(groupConfig, text) {
  if (!groupConfig?.enabled) return null;
  for (const rule of groupConfig.rules || []) {
    if (rule.keyword && keywordMatches(text, rule.keyword)) return rule;
  }
  return null;
}

// --- Menús de opciones (estado en memoria, no se persiste: se pierde si se
// reinicia el server, cosa que está bien para un "elegí 1/2/3" de pocos minutos) ---
const pendingMenus = new Map(); // key -> { options: [{label,response}], expiresAt }
const MENU_TTL_MS = 10 * 60 * 1000;

function pendingMenuKey(envId, sessionId, chatJid, participantJid) {
  return `${envId}::${sessionId}::${chatJid}::${participantJid || ''}`;
}

function buildMenuText(rule) {
  const prompt = rule.prompt?.trim() || '¿Qué opción necesitás?';
  const optionLines = rule.options.map((o, i) => `${i + 1}. ${o.label}`).join('\n');
  return `${prompt}\n\n${optionLines}\n\n_Respondé con el número de la opción._`;
}

function resolvePendingMenu(key, text) {
  const pending = pendingMenus.get(key);
  if (!pending || pending.expiresAt < Date.now()) {
    pendingMenus.delete(key);
    return null;
  }
  pendingMenus.delete(key); // se consume en este intento, matchee o no

  const trimmed = (text || '').trim();
  const asNumber = Number(trimmed);
  if (Number.isInteger(asNumber) && asNumber >= 1 && asNumber <= pending.options.length) {
    return pending.options[asNumber - 1].response;
  }
  const lower = trimmed.toLowerCase();
  const match = pending.options.find((o) => lower.includes(o.label.toLowerCase()));
  return match ? match.response : null;
}

// Ejecuta una regla ya matcheada devolviendo una "acción" a enviar. Si es un menú,
// deja el estado pendiente para interpretar la respuesta; si es archivo, apunta al
// archivo subido; si es simple, es texto plano.
function resolveRuleAction(rule, pendingKey, envId) {
  if (!rule) return null;
  if (rule.type === 'menu') {
    pendingMenus.set(pendingKey, { options: rule.options, expiresAt: Date.now() + MENU_TTL_MS });
    return { kind: 'menu', text: buildMenuText(rule), options: rule.options };
  }
  if (rule.type === 'file') {
    return {
      kind: 'file',
      envId,
      fileId: rule.fileId,
      fileName: rule.fileName || 'archivo',
      mimetype: rule.mimetype || 'application/octet-stream',
      caption: rule.caption || null,
    };
  }
  return { kind: 'text', text: rule.response };
}

// Intenta enviar un menú como botones nativos tocables de WhatsApp. OJO: en la
// conexión no oficial (Baileys) WhatsApp bloquea/ignora estos botones muy seguido,
// por eso el cuerpo del mensaje ya lleva el menú numerado completo — si los botones
// no aparecen, la persona igual ve las opciones y contesta con el número. Si el
// envío interactivo falla, el llamador cae al texto plano.
async function trySendNativeButtons(sock, jid, bodyText, options) {
  try {
    const buttons = options.slice(0, 3).map((o, i) => ({
      name: 'quick_reply',
      buttonParamsJson: JSON.stringify({ display_text: o.label.slice(0, 24), id: String(i + 1) }),
    }));
    const content = {
      interactiveMessage: proto.Message.InteractiveMessage.create({
        body: proto.Message.InteractiveMessage.Body.create({ text: bodyText }),
        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({ buttons }),
      }),
    };
    const msg = generateWAMessageFromContent(jid, content, {});
    await sock.relayMessage(jid, msg.message, { messageId: msg.key.id });
    return true;
  } catch (_) {
    return false;
  }
}

// Envía la acción resuelta y devuelve un texto para registrar en el tablero de
// conversaciones (o null si no había nada que enviar).
async function sendAction(sock, jid, action) {
  if (!action) return null;

  if (action.kind === 'file') {
    const filePath = uploadPath(action.envId, action.fileId);
    if (!fs.existsSync(filePath)) {
      // El archivo se perdió (ej. un redeploy que limpió el disco). Mandamos al menos
      // el texto que lo acompañaba, si había, para no dejar a la persona sin respuesta.
      if (action.caption) {
        await sock.sendMessage(jid, { text: action.caption });
        return action.caption;
      }
      throw new Error('el archivo configurado ya no está disponible');
    }
    await sock.sendMessage(jid, {
      document: fs.readFileSync(filePath),
      fileName: action.fileName,
      mimetype: action.mimetype,
      caption: action.caption || undefined,
    });
    return action.caption ? `📎 ${action.fileName} — ${action.caption}` : `📎 ${action.fileName}`;
  }

  if (action.kind === 'menu') {
    const sent = await trySendNativeButtons(sock, jid, action.text, action.options);
    if (!sent) await sock.sendMessage(jid, { text: action.text });
    return action.text;
  }

  await sock.sendMessage(jid, { text: action.text });
  return action.text;
}

async function startSession(envId, sessionId) {
  const key = runtimeKey(envId, sessionId);
  const existing = runtime.get(key);
  if (existing && (existing.status === 'connected' || existing.status === 'connecting')) return existing;

  const sessionDir = path.join(AUTH_DIR, envId, sessionId);
  const entry = existing || { sock: null, status: 'connecting', qrDataUrl: null, reconnectDelay: 1000 };
  entry.status = 'connecting';
  runtime.set(key, entry);

  try {
    fs.mkdirSync(sessionDir, { recursive: true });
    const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
      version,
      auth: state,
      logger: pino({ level: 'silent' }),
      printQRInTerminal: false,
    });
    entry.sock = sock;

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
      handleConnectionUpdate(envId, sessionId, sessionDir, entry, update).catch((err) => {
        console.error(`[${envId}/${sessionId}] error manejando connection.update:`, err.message);
      });
    });

    sock.ev.on('messages.upsert', ({ messages, type }) => {
      handleIncomingMessages(envId, sessionId, sock, messages, type).catch((err) => {
        console.error(`[${envId}/${sessionId}] error procesando mensaje:`, err.message);
      });
    });
  } catch (err) {
    console.error(`[${envId}/${sessionId}] no se pudo iniciar la sesión:`, err.message);
    entry.status = 'disconnected';
    scheduleReconnect(envId, sessionId, entry);
  }

  return entry;
}

function scheduleReconnect(envId, sessionId, entry) {
  const delay = Math.min(entry.reconnectDelay || 1000, MAX_RECONNECT_DELAY_MS);
  entry.reconnectDelay = Math.min(delay * 2, MAX_RECONNECT_DELAY_MS);
  setTimeout(() => {
    if (store.getSession(envId, sessionId)) startSession(envId, sessionId);
  }, delay);
}

async function handleConnectionUpdate(envId, sessionId, sessionDir, entry, update) {
  const { connection, lastDisconnect, qr } = update;

  if (qr) {
    entry.qrDataUrl = await QRCode.toDataURL(qr);
    entry.status = 'qr';
  }

  if (connection === 'open') {
    entry.status = 'connected';
    entry.qrDataUrl = null;
    entry.reconnectDelay = 1000;
    const phone = entry.sock.user?.id?.split(':')[0];
    if (phone) store.upsertSession(envId, sessionId, { phone });
  }

  if (connection === 'close') {
    entry.status = 'disconnected';
    const statusCode = lastDisconnect?.error?.output?.statusCode;
    const loggedOut = statusCode === DisconnectReason.loggedOut;
    if (loggedOut) {
      runtime.delete(runtimeKey(envId, sessionId));
      fs.rmSync(sessionDir, { recursive: true, force: true });
    } else {
      scheduleReconnect(envId, sessionId, entry);
    }
  }
}

function conversationId(sessionId, jid) {
  return `${sessionId}::${jid}`;
}

function trackIncoming(envId, sessionId, msg, text) {
  const from = msg.key.remoteJid;
  const id = conversationId(sessionId, from);
  const existing = store.getConversation(envId, id);
  const reopen = !existing || existing.status === 'resuelto';

  store.upsertConversation(envId, id, {
    sessionId,
    jid: from,
    phone: from.split('@')[0],
    name: msg.pushName || existing?.name || from.split('@')[0],
    status: reopen ? 'nuevo' : existing.status,
    lastMessage: text,
    lastAt: Date.now(),
  });
  store.appendConversationMessage(envId, id, { from: 'them', text, at: Date.now() });
  return id;
}

async function handleIncomingMessages(envId, sessionId, sock, messages, type) {
  if (type !== 'notify') return;
  const config = store.getSession(envId, sessionId);
  if (!config) return;

  for (const msg of messages) {
    if (!msg.message || msg.key.fromMe) continue;
    const from = msg.key.remoteJid;
    if (isStatusBroadcast(from)) continue;

    // en un grupo, remoteJid es el grupo y participant es quién escribió
    const senderJid = msg.key.participant || from;
    const senderPhone = senderJid.split('@')[0];
    if ((config.excludedContacts || []).includes(senderPhone)) continue;

    const text = extractText(msg);

    if (isGroupJid(from)) {
      const key = pendingMenuKey(envId, sessionId, from, senderJid);
      const pendingText = resolvePendingMenu(key, text);
      const action = pendingText !== null
        ? { kind: 'text', text: pendingText }
        : resolveRuleAction(matchGroupReply(config.groups?.[from], text), key, envId);
      if (action) {
        try {
          await sendAction(sock, from, action);
        } catch (err) {
          console.error(`[${envId}/${sessionId}] no se pudo responder en el grupo ${from}:`, err.message);
        }
      }
      continue;
    }

    const convId = trackIncoming(envId, sessionId, msg, text);

    const key = pendingMenuKey(envId, sessionId, from, null);
    const pendingText = resolvePendingMenu(key, text);
    const action = pendingText !== null
      ? { kind: 'text', text: pendingText }
      : resolveRuleAction(await computeReply(envId, sessionId, config, text), key, envId);
    if (action) {
      try {
        const logged = await sendAction(sock, from, action);
        if (logged) store.appendConversationMessage(envId, convId, { from: 'bot', text: logged, at: Date.now() });
      } catch (err) {
        console.error(`[${envId}/${sessionId}] no se pudo responder a ${from}:`, err.message);
      }
    }

    for (const target of config.forwardTo || []) {
      try {
        await sock.sendMessage(toJid(target), {
          text: `↪️ Reenviado desde ${config.label || sessionId} (${from.split('@')[0]}):\n${text}`,
        });
      } catch (err) {
        console.error(`[${envId}/${sessionId}] no se pudo reenviar a ${target}:`, err.message);
      }
    }
  }
}

async function listGroups(envId, sessionId) {
  const entry = runtime.get(runtimeKey(envId, sessionId));
  if (!entry || entry.status !== 'connected' || !entry.sock) {
    throw new Error('Ese número no está conectado ahora mismo');
  }
  const groupsMap = await entry.sock.groupFetchAllParticipating();
  return Object.values(groupsMap).map((g) => ({ jid: g.id, name: g.subject || g.id }));
}

async function sendManualReply(envId, sessionId, jid, text) {
  const entry = runtime.get(runtimeKey(envId, sessionId));
  if (!entry || entry.status !== 'connected' || !entry.sock) {
    throw new Error('Ese número no está conectado ahora mismo');
  }
  await entry.sock.sendMessage(jid, { text });
  const convId = conversationId(sessionId, jid);
  store.appendConversationMessage(envId, convId, { from: 'me', text, at: Date.now() });
  const conversation = store.getConversation(envId, convId);
  if (conversation && conversation.status === 'nuevo') {
    store.upsertConversation(envId, convId, { status: 'proceso' });
  }
}

function getStatus(envId, sessionId) {
  const entry = runtime.get(runtimeKey(envId, sessionId));
  if (!entry) return { status: 'disconnected', qrDataUrl: null };
  return { status: entry.status, qrDataUrl: entry.qrDataUrl };
}

async function stopSession(envId, sessionId) {
  const key = runtimeKey(envId, sessionId);
  const entry = runtime.get(key);
  if (entry) {
    try {
      await entry.sock?.logout();
    } catch (_) {
      // ignore, session already gone
    }
    runtime.delete(key);
  }
  fs.rmSync(path.join(AUTH_DIR, envId, sessionId), { recursive: true, force: true });
  store.removeSession(envId, sessionId);
}

function restoreAllSessions() {
  const config = store.load();
  for (const envId of Object.keys(config.environments || {})) {
    const env = config.environments[envId];
    Object.keys(env.sessions || {}).forEach((sessionId) => {
      startSession(envId, sessionId).catch((err) =>
        console.error(`[${envId}/${sessionId}] no se pudo restaurar:`, err.message)
      );
    });
  }
}

module.exports = {
  startSession,
  stopSession,
  getStatus,
  restoreAllSessions,
  sendManualReply,
  listGroups,
  UPLOADS_DIR,
};
