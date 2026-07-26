const path = require('path');
const fs = require('fs');
const QRCode = require('qrcode');
const pino = require('pino');
const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
} = require('@whiskeysockets/baileys');

const store = require('./store');
const { generateAiReply } = require('./ai');

const AUTH_DIR = path.join(__dirname, 'sessions');
const MAX_RECONNECT_DELAY_MS = 30_000;

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
  return (
    m.conversation ||
    m.extendedTextMessage?.text ||
    m.imageMessage?.caption ||
    m.videoMessage?.caption ||
    ''
  );
}

// Devuelve la REGLA que matchea (no el texto final), porque una regla puede ser
// de tipo 'menu' — en ese caso el llamador arma el texto del menú y guarda el
// estado pendiente para interpretar la respuesta del usuario.
async function computeReply(envId, sessionId, sessionConfig, text) {
  if (!sessionConfig.autoReplyEnabled) return null;
  const lower = (text || '').toLowerCase();
  let fallback = null;
  for (const rule of sessionConfig.rules || []) {
    if (!rule.keyword) {
      fallback = rule;
      continue;
    }
    if (lower.includes(rule.keyword.toLowerCase())) return rule;
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

// Grupos: solo respuestas tipo FAQ por palabra clave exacta — nunca hay respuesta
// "por defecto" para no contestarle a cada mensaje de un grupo lleno de gente.
function matchGroupReply(groupConfig, text) {
  if (!groupConfig?.enabled) return null;
  const lower = (text || '').toLowerCase();
  for (const rule of groupConfig.rules || []) {
    if (rule.keyword && lower.includes(rule.keyword.toLowerCase())) return rule;
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

// Ejecuta una regla ya matcheada: si es un menú, arma el texto y deja el estado
// pendiente; si es simple, devuelve el texto de respuesta tal cual.
function resolveRuleText(rule, pendingKey) {
  if (!rule) return null;
  if (rule.type === 'menu') {
    pendingMenus.set(pendingKey, { options: rule.options, expiresAt: Date.now() + MENU_TTL_MS });
    return buildMenuText(rule);
  }
  return rule.response;
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
      let reply = resolvePendingMenu(key, text);
      if (reply === null) {
        const rule = matchGroupReply(config.groups?.[from], text);
        reply = resolveRuleText(rule, key);
      }
      if (reply) {
        try {
          await sock.sendMessage(from, { text: reply });
        } catch (err) {
          console.error(`[${envId}/${sessionId}] no se pudo responder en el grupo ${from}:`, err.message);
        }
      }
      continue;
    }

    const convId = trackIncoming(envId, sessionId, msg, text);

    const key = pendingMenuKey(envId, sessionId, from, null);
    let reply = resolvePendingMenu(key, text);
    if (reply === null) {
      const rule = await computeReply(envId, sessionId, config, text);
      reply = resolveRuleText(rule, key);
    }
    if (reply) {
      try {
        await sock.sendMessage(from, { text: reply });
        store.appendConversationMessage(envId, convId, { from: 'bot', text: reply, at: Date.now() });
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
};
