require('dotenv').config();
const express = require('express');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const sb = require('./supabase');
const store = require('./store');
const sessions = require('./sessionManager');

const MAX_UPLOAD_BYTES = 16 * 1024 * 1024; // 16 MB — de sobra para una lista de precios
const FILE_ID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

const app = express();
app.set('trust proxy', 1); // needed on Render/Vercel-style proxies so req.ip and req.secure are correct
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// respond with JSON instead of an HTML stack trace when the client sends malformed JSON
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'JSON inválido' });
  if (err.type === 'entity.too.large') return res.status(413).json({ error: 'El archivo es demasiado grande (máximo 16 MB)' });
  next(err);
});

// El usuario/clave del .env es el "administrador": solo puede crear/borrar
// entornos (una empresa cada uno), nunca ve los números o mensajes de adentro.
const ADMIN_USER = process.env.DASHBOARD_USER || 'admin';
const ADMIN_PASSWORD = process.env.DASHBOARD_PASSWORD || 'changeme';
const COOKIE_NAME = 'session';
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;
const activeTokens = new Map(); // token -> { type: 'admin' | 'env', envId?, expiresAt }
const loginAttempts = new Map(); // ip -> { count, lockedUntil }
const LOGIN_MAX_ATTEMPTS = 5;
const LOGIN_LOCK_MS = 5 * 60 * 1000;

if (process.env.NODE_ENV === 'production' && ADMIN_PASSWORD === 'changeme') {
  console.error('DASHBOARD_PASSWORD no está configurada. Definila en las variables de entorno antes de desplegar.');
  process.exit(1);
}

// Login con Google (opcional): solo sirve para entrar a un entorno cuyo email
// de Google fue autorizado por el administrador — no reemplaza el usuario/clave.
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || `http://localhost:${process.env.PORT || 3000}/auth/google/callback`;
const oauthStates = new Map(); // state -> expiresAt

function safeEqual(a, b) {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

// wraps an async route handler so a rejected promise becomes a 500 instead of an unhandled rejection
function asyncRoute(handler) {
  return (req, res, next) => handler(req, res, next).catch(next);
}

const SESSION_ID_RE = /^[a-z0-9-]+$/;
function validSessionId(req, res, next) {
  if (!SESSION_ID_RE.test(req.params.id)) return res.status(400).json({ error: 'ID inválido' });
  next();
}

function parseCookies(req) {
  const header = req.headers.cookie || '';
  return Object.fromEntries(
    header
      .split(';')
      .map((p) => p.trim())
      .filter(Boolean)
      .map((p) => {
        const idx = p.indexOf('=');
        return [p.slice(0, idx), decodeURIComponent(p.slice(idx + 1))];
      })
  );
}

function requireAuth(req, res, next) {
  const token = parseCookies(req)[COOKIE_NAME];
  const auth = token && activeTokens.get(token);
  if (auth && auth.expiresAt > Date.now()) {
    req.auth = auth;
    return next();
  }
  // El token no está en memoria (ej: el server se reinició/redeployó). Si Supabase está
  // configurado, lo buscamos ahí — así un deploy no desloguea a nadie.
  if (token && sb.enabled) {
    return sb
      .kvGet(`token:${token}`)
      .then((remote) => {
        if (remote && remote.expiresAt > Date.now()) {
          activeTokens.set(token, remote);
          req.auth = remote;
          return next();
        }
        if (req.path.startsWith('/api/')) return res.status(401).json({ error: 'No autenticado' });
        return res.redirect('/login.html');
      })
      .catch(() => {
        if (req.path.startsWith('/api/')) return res.status(401).json({ error: 'No autenticado' });
        return res.redirect('/login.html');
      });
  }
  if (req.path.startsWith('/api/')) return res.status(401).json({ error: 'No autenticado' });
  return res.redirect('/login.html');
}

// La mayoría de las rutas (números, reglas, tablero) solo tienen sentido adentro
// de UN entorno — nunca se accede a datos de otro entorno.
function requireEnv(req, res, next) {
  if (req.auth?.type !== 'env') return res.status(403).json({ error: 'Iniciá sesión con un entorno para esto' });
  req.envId = req.auth.envId;
  next();
}

function requireAdmin(req, res, next) {
  if (req.auth?.type !== 'admin') return res.status(403).json({ error: 'Esto requiere el usuario administrador' });
  next();
}

// health check stays open (no auth) so an uptime pinger can hit it to keep a free host awake
app.get('/health', (req, res) => res.status(200).send('ok'));

app.get('/login.html', (req, res) => res.sendFile(path.join(__dirname, 'public', 'login.html')));

app.post('/login', (req, res) => {
  const ip = req.ip;
  const attempt = loginAttempts.get(ip);
  if (attempt?.lockedUntil > Date.now()) {
    return res.redirect('/login.html?error=1');
  }

  const { username, password } = req.body;
  let auth = null;

  if (username && password) {
    if (safeEqual(username, ADMIN_USER) && safeEqual(password, ADMIN_PASSWORD)) {
      auth = { type: 'admin' };
    } else {
      const env = store.findEnvironmentByUsername(username);
      if (env && store.verifyPassword(password, env.passwordSalt, env.passwordHash)) {
        auth = { type: 'env', envId: env.id };
      }
    }
  }

  if (auth) {
    loginAttempts.delete(ip);
    issueSession(req, res, auth);
    return res.redirect('/');
  }

  const count = (attempt?.count || 0) + 1;
  const lockedUntil = count >= LOGIN_MAX_ATTEMPTS ? Date.now() + LOGIN_LOCK_MS : 0;
  loginAttempts.set(ip, { count, lockedUntil });
  return res.redirect('/login.html?error=1');
});

function issueSession(req, res, auth) {
  const token = crypto.randomBytes(24).toString('hex');
  const record = { ...auth, expiresAt: Date.now() + SESSION_TTL_MS };
  activeTokens.set(token, record);
  if (sb.enabled) sb.kvSet(`token:${token}`, record).catch(() => {});
  const secure = req.secure || req.headers['x-forwarded-proto'] === 'https' ? '; Secure' : '';
  res.setHeader(
    'Set-Cookie',
    `${COOKIE_NAME}=${token}; HttpOnly; Path=/; Max-Age=${SESSION_TTL_MS / 1000}; SameSite=Lax${secure}`
  );
}

app.get('/auth/google', (req, res) => {
  if (!GOOGLE_CLIENT_ID) return res.redirect('/login.html?error=google_not_configured');
  const state = crypto.randomBytes(16).toString('hex');
  oauthStates.set(state, Date.now() + 5 * 60 * 1000);
  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  url.searchParams.set('client_id', GOOGLE_CLIENT_ID);
  url.searchParams.set('redirect_uri', GOOGLE_REDIRECT_URI);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope', 'openid email profile');
  url.searchParams.set('state', state);
  url.searchParams.set('prompt', 'select_account');
  res.redirect(url.toString());
});

app.get(
  '/auth/google/callback',
  asyncRoute(async (req, res) => {
    const { code, state, error } = req.query;
    const expiresAt = state && oauthStates.get(state);
    oauthStates.delete(state);
    if (error || !code || !expiresAt || expiresAt < Date.now()) {
      return res.redirect('/login.html?error=1');
    }

    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: GOOGLE_REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    });
    if (!tokenRes.ok) return res.redirect('/login.html?error=1');
    const tokenData = await tokenRes.json();

    const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    if (!userRes.ok) return res.redirect('/login.html?error=1');
    const profile = await userRes.json();

    if (!profile.email || !profile.email_verified) return res.redirect('/login.html?error=1');

    const env = store.findEnvironmentByGoogleEmail(profile.email);
    if (!env) return res.redirect('/login.html?error=google_not_allowed');

    issueSession(req, res, { type: 'env', envId: env.id });
    res.redirect('/');
  })
);

app.get('/logout', (req, res) => {
  const token = parseCookies(req)[COOKIE_NAME];
  activeTokens.delete(token);
  if (token && sb.enabled) sb.kvDelete(`token:${token}`).catch(() => {});
  res.setHeader('Set-Cookie', `${COOKIE_NAME}=; Path=/; Max-Age=0`);
  res.redirect('/login.html');
});

app.use(requireAuth);

app.get('/api/whoami', (req, res) => {
  if (req.auth.type === 'admin') return res.json({ type: 'admin' });
  const env = store.getEnvironment(req.auth.envId);
  if (!env) return res.status(401).json({ error: 'El entorno ya no existe' });
  res.json({ type: 'env', envId: req.auth.envId, name: env.name });
});

// '/' decide qué pantalla mostrar según el tipo de login; debe ir antes que
// express.static para poder redirigir en vez de servir siempre index.html.
app.get('/', (req, res) => {
  if (req.auth.type === 'admin') return res.redirect('/admin.html');
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/admin.html', (req, res) => {
  if (req.auth.type !== 'admin') return res.redirect('/');
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.use(express.static(path.join(__dirname, 'public')));

// --- Entornos (solo el administrador) ---

app.get('/api/environments', requireAdmin, (req, res) => {
  res.json(store.listEnvironments());
});

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

app.post('/api/environments', requireAdmin, (req, res) => {
  const { name, username, password, googleEmail } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: 'Falta el nombre de la empresa' });
  if (!username || !username.trim()) return res.status(400).json({ error: 'Falta el usuario' });
  if (!password || password.length < 6) return res.status(400).json({ error: 'La clave debe tener al menos 6 caracteres' });
  if (googleEmail && !EMAIL_RE.test(googleEmail.trim())) {
    return res.status(400).json({ error: 'El email de Google no es válido' });
  }
  try {
    const env = store.createEnvironment({
      name: name.trim(),
      username: username.trim(),
      password,
      googleEmail: googleEmail?.trim() || null,
    });
    res.json(env);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.patch('/api/environments/:envId', requireAdmin, (req, res) => {
  const { googleEmail } = req.body;
  if (googleEmail && !EMAIL_RE.test(googleEmail.trim())) {
    return res.status(400).json({ error: 'El email de Google no es válido' });
  }
  try {
    const updated = store.updateEnvironmentGoogleEmail(req.params.envId, googleEmail?.trim() || null);
    res.json(updated);
  } catch (err) {
    res.status(err.message === 'No existe' ? 404 : 400).json({ error: err.message });
  }
});

app.delete(
  '/api/environments/:envId',
  requireAdmin,
  asyncRoute(async (req, res) => {
    const env = store.getEnvironment(req.params.envId);
    if (!env) return res.status(404).json({ error: 'No existe' });
    for (const sessionId of Object.keys(env.sessions || {})) {
      await sessions.stopSession(req.params.envId, sessionId).catch(() => {});
    }
    fs.rmSync(path.join(sessions.UPLOADS_DIR, req.params.envId), { recursive: true, force: true });
    if (sb.enabled) {
      sb.kvDeletePrefix(`session:${req.params.envId}:`).catch(() => {});
      sb.storageDeletePrefix(req.params.envId).catch(() => {});
    }
    store.deleteEnvironment(req.params.envId);
    res.json({ ok: true });
  })
);

function slugify(label) {
  return (
    label
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || crypto.randomUUID().slice(0, 8)
  );
}

app.get('/api/sessions', requireEnv, (req, res) => {
  const env = store.getEnvironment(req.envId);
  const list = Object.entries(env?.sessions || {}).map(([id, data]) => ({
    id,
    ...data,
    ...sessions.getStatus(req.envId, id),
  }));
  res.json(list);
});

app.post(
  '/api/sessions',
  requireEnv,
  asyncRoute(async (req, res) => {
    const { label } = req.body;
    if (!label || !label.trim()) return res.status(400).json({ error: 'Falta el nombre del número' });
    if (label.length > 40) return res.status(400).json({ error: 'El nombre es demasiado largo' });

    const env = store.getEnvironment(req.envId);
    let id = slugify(label);
    if (env.sessions[id]) id = `${id}-${crypto.randomUUID().slice(0, 4)}`;

    store.upsertSession(req.envId, id, { ...store.defaultSession(), label: label.trim() });
    await sessions.startSession(req.envId, id);
    res.json({ id });
  })
);

app.get('/api/sessions/:id/status', requireEnv, validSessionId, (req, res) => {
  res.json(sessions.getStatus(req.envId, req.params.id));
});

app.delete(
  '/api/sessions/:id',
  requireEnv,
  validSessionId,
  asyncRoute(async (req, res) => {
    if (!store.getSession(req.envId, req.params.id)) return res.status(404).json({ error: 'No existe' });
    await sessions.stopSession(req.envId, req.params.id);
    res.json({ ok: true });
  })
);

app.patch('/api/sessions/:id', requireEnv, validSessionId, (req, res) => {
  if (!store.getSession(req.envId, req.params.id)) return res.status(404).json({ error: 'No existe' });
  const { autoReplyEnabled, aiEnabled, aiContext } = req.body;
  const patch = {};
  if (typeof autoReplyEnabled === 'boolean') patch.autoReplyEnabled = autoReplyEnabled;
  if (typeof aiEnabled === 'boolean') patch.aiEnabled = aiEnabled;
  if (typeof aiContext === 'string') patch.aiContext = aiContext.slice(0, 4000);
  const updated = store.upsertSession(req.envId, req.params.id, patch);
  res.json(updated);
});

// Subida de archivos (PDF, imágenes) que después una regla puede mandar sola cuando
// detecta una palabra clave. El body llega crudo (no JSON) con el content-type del
// archivo; el nombre viaja en el header X-File-Name. Cada archivo se guarda por entorno.
app.post(
  '/api/uploads',
  requireEnv,
  express.raw({ type: () => true, limit: MAX_UPLOAD_BYTES }),
  (req, res) => {
    const buf = req.body;
    if (!buf || !buf.length) return res.status(400).json({ error: 'El archivo está vacío' });
    const rawName = req.headers['x-file-name'] ? decodeURIComponent(req.headers['x-file-name']) : 'archivo';
    const fileName = rawName.replace(/[\r\n]/g, '').slice(0, 120) || 'archivo';
    // El tipo real viaja en X-File-Type (el Content-Type siempre es octet-stream para
    // que el parser JSON global no intercepte la subida).
    const mimetype = (req.headers['x-file-type'] || req.headers['content-type'] || 'application/octet-stream')
      .toString()
      .slice(0, 100);
    const fileId = crypto.randomUUID();
    const dir = path.join(sessions.UPLOADS_DIR, req.envId);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, fileId), buf);
    // Réplica a Supabase Storage (si está configurado) para que el archivo sobreviva
    // a deploys. El disco local queda como caché de envío.
    if (sb.enabled) {
      sb.storagePut(`${req.envId}/${fileId}`, buf, mimetype).catch((err) =>
        console.error('[supabase] no se pudo replicar el archivo subido:', err.message)
      );
    }
    res.json({ fileId, fileName, mimetype, size: buf.length });
  }
);

// Acepta una regla simple ({keyword, response}), un menú de opciones
// ({keyword, type:'menu', prompt, options:[{label,response}]}) o el envío de un
// archivo ({keyword, type:'file', fileId, fileName, mimetype, caption}). Lanza si es inválida.
function validateRulePayload(body) {
  const keyword = body.keyword?.trim() || null;

  if (body.type === 'file') {
    const fileId = (body.fileId || '').toString().trim();
    if (!FILE_ID_RE.test(fileId)) throw new Error('Subí un archivo primero');
    return {
      keyword,
      type: 'file',
      fileId,
      fileName: (body.fileName || 'archivo').toString().slice(0, 120),
      mimetype: (body.mimetype || 'application/octet-stream').toString().slice(0, 100),
      caption: (body.caption || '').toString().trim().slice(0, 1000) || null,
    };
  }

  if (body.type === 'menu') {
    const options = Array.isArray(body.options) ? body.options : [];
    const clean = options
      .map((o) => ({ label: (o?.label || '').toString().trim(), response: (o?.response || '').toString().trim() }))
      .filter((o) => o.label && o.response);
    if (clean.length < 2) throw new Error('Un menú necesita al menos 2 opciones con etiqueta y respuesta');
    if (clean.length > 10) throw new Error('Máximo 10 opciones por menú');
    return {
      keyword,
      type: 'menu',
      prompt: (body.prompt || '').toString().trim().slice(0, 200),
      options: clean.map((o) => ({ label: o.label.slice(0, 60), response: o.response.slice(0, 1000) })),
    };
  }

  const response = (body.response || '').toString().trim();
  if (!response) throw new Error('Falta el texto de respuesta');
  return { keyword, response: response.slice(0, 1000) };
}

app.post('/api/sessions/:id/rules', requireEnv, validSessionId, (req, res) => {
  const config = store.getSession(req.envId, req.params.id);
  if (!config) return res.status(404).json({ error: 'No existe' });
  let rule;
  try {
    rule = validateRulePayload(req.body);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
  const rules = [...(config.rules || []), rule];
  const updated = store.upsertSession(req.envId, req.params.id, { rules });
  res.json(updated);
});

app.delete('/api/sessions/:id/rules/:index', requireEnv, validSessionId, (req, res) => {
  const config = store.getSession(req.envId, req.params.id);
  if (!config) return res.status(404).json({ error: 'No existe' });
  const rules = (config.rules || []).filter((_, i) => i !== Number(req.params.index));
  const updated = store.upsertSession(req.envId, req.params.id, { rules });
  res.json(updated);
});

app.post('/api/sessions/:id/forward', requireEnv, validSessionId, (req, res) => {
  const { number } = req.body;
  const digits = (number || '').replace(/\D/g, '');
  if (digits.length < 8) return res.status(400).json({ error: 'Número inválido (incluí el código de país)' });
  const config = store.getSession(req.envId, req.params.id);
  if (!config) return res.status(404).json({ error: 'No existe' });
  const forwardTo = [...new Set([...(config.forwardTo || []), digits])];
  const updated = store.upsertSession(req.envId, req.params.id, { forwardTo });
  res.json(updated);
});

app.delete('/api/sessions/:id/forward/:number', requireEnv, validSessionId, (req, res) => {
  const config = store.getSession(req.envId, req.params.id);
  if (!config) return res.status(404).json({ error: 'No existe' });
  const forwardTo = (config.forwardTo || []).filter((n) => n !== req.params.number);
  const updated = store.upsertSession(req.envId, req.params.id, { forwardTo });
  res.json(updated);
});

app.post('/api/sessions/:id/excluded', requireEnv, validSessionId, (req, res) => {
  const { number } = req.body;
  const digits = (number || '').replace(/\D/g, '');
  if (digits.length < 8) return res.status(400).json({ error: 'Número inválido (incluí el código de país)' });
  const config = store.getSession(req.envId, req.params.id);
  if (!config) return res.status(404).json({ error: 'No existe' });
  const excludedContacts = [...new Set([...(config.excludedContacts || []), digits])];
  const updated = store.upsertSession(req.envId, req.params.id, { excludedContacts });
  res.json(updated);
});

app.delete('/api/sessions/:id/excluded/:number', requireEnv, validSessionId, (req, res) => {
  const config = store.getSession(req.envId, req.params.id);
  if (!config) return res.status(404).json({ error: 'No existe' });
  const excludedContacts = (config.excludedContacts || []).filter((n) => n !== req.params.number);
  const updated = store.upsertSession(req.envId, req.params.id, { excludedContacts });
  res.json(updated);
});

const GROUP_JID_RE = /^[0-9-]+@g\.us$/;
function validGroupJid(req, res, next) {
  if (!GROUP_JID_RE.test(req.params.jid)) return res.status(400).json({ error: 'Grupo inválido' });
  next();
}

app.get(
  '/api/sessions/:id/groups',
  requireEnv,
  validSessionId,
  asyncRoute(async (req, res) => {
    const config = store.getSession(req.envId, req.params.id);
    if (!config) return res.status(404).json({ error: 'No existe' });
    let liveGroups;
    try {
      liveGroups = await sessions.listGroups(req.envId, req.params.id);
    } catch (err) {
      return res.status(409).json({ error: err.message });
    }
    const stored = config.groups || {};
    const merged = liveGroups.map((g) => ({
      jid: g.jid,
      name: g.name,
      enabled: !!stored[g.jid]?.enabled,
      rules: stored[g.jid]?.rules || [],
    }));
    res.json(merged);
  })
);

app.patch('/api/sessions/:id/groups/:jid', requireEnv, validSessionId, validGroupJid, (req, res) => {
  const { enabled, name } = req.body;
  const config = store.getSession(req.envId, req.params.id);
  if (!config) return res.status(404).json({ error: 'No existe' });
  const groups = { ...(config.groups || {}) };
  const current = groups[req.params.jid] || { name: name || '', enabled: false, rules: [] };
  groups[req.params.jid] = {
    ...current,
    ...(typeof enabled === 'boolean' ? { enabled } : {}),
    ...(typeof name === 'string' ? { name } : {}),
  };
  const updated = store.upsertSession(req.envId, req.params.id, { groups });
  res.json(updated.groups[req.params.jid]);
});

app.post('/api/sessions/:id/groups/:jid/rules', requireEnv, validSessionId, validGroupJid, (req, res) => {
  const config = store.getSession(req.envId, req.params.id);
  if (!config) return res.status(404).json({ error: 'No existe' });
  let rule;
  try {
    rule = validateRulePayload(req.body);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
  if (!rule.keyword) return res.status(400).json({ error: 'Falta la palabra clave' });
  const groups = { ...(config.groups || {}) };
  const current = groups[req.params.jid] || { name: '', enabled: false, rules: [] };
  groups[req.params.jid] = { ...current, rules: [...(current.rules || []), rule] };
  const updated = store.upsertSession(req.envId, req.params.id, { groups });
  res.json(updated.groups[req.params.jid]);
});

app.delete('/api/sessions/:id/groups/:jid/rules/:index', requireEnv, validSessionId, validGroupJid, (req, res) => {
  const config = store.getSession(req.envId, req.params.id);
  if (!config) return res.status(404).json({ error: 'No existe' });
  const groups = { ...(config.groups || {}) };
  const current = groups[req.params.jid];
  if (!current) return res.status(404).json({ error: 'No existe' });
  groups[req.params.jid] = {
    ...current,
    rules: (current.rules || []).filter((_, i) => i !== Number(req.params.index)),
  };
  const updated = store.upsertSession(req.envId, req.params.id, { groups });
  res.json(updated.groups[req.params.jid]);
});

const VALID_STATUSES = ['nuevo', 'proceso', 'resuelto'];

app.get('/api/conversations', requireEnv, (req, res) => {
  const list = store.listConversations(req.envId).sort((a, b) => b.lastAt - a.lastAt);
  res.json(list);
});

app.patch('/api/conversations/:id', requireEnv, (req, res) => {
  const { status } = req.body;
  if (!VALID_STATUSES.includes(status)) return res.status(400).json({ error: 'Estado inválido' });
  if (!store.getConversation(req.envId, req.params.id)) return res.status(404).json({ error: 'No existe' });
  const updated = store.upsertConversation(req.envId, req.params.id, { status });
  res.json(updated);
});

app.post(
  '/api/conversations/:id/reply',
  requireEnv,
  asyncRoute(async (req, res) => {
    const { text } = req.body;
    if (!text || !text.trim()) return res.status(400).json({ error: 'Falta el mensaje' });
    const conversation = store.getConversation(req.envId, req.params.id);
    if (!conversation) return res.status(404).json({ error: 'No existe' });
    try {
      await sessions.sendManualReply(req.envId, conversation.sessionId, conversation.jid, text.trim());
    } catch (err) {
      return res.status(409).json({ error: err.message });
    }
    res.json(store.getConversation(req.envId, req.params.id));
  })
);

// final safety net: an uncaught error in any route becomes JSON instead of an HTML stack trace / hung request
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Error interno' });
});

const PORT = process.env.PORT || 3000;

// Arranque: si Supabase está configurado, primero restauramos el estado guardado
// (config + luego cada sesión de WhatsApp se restaura al iniciarse). Recién después
// corre la migración legacy y se empieza a escuchar.
async function start() {
  if (sb.enabled) {
    try {
      await sb.ensureBucket();
      await store.syncFromRemote();
    } catch (err) {
      console.error('[supabase] no se pudo restaurar el estado (sigo con disco local):', err.message);
    }
  } else {
    console.warn(
      '[aviso] SUPABASE_URL / SUPABASE_SERVICE_KEY no configuradas: el estado vive solo en disco ' +
        'local y se pierde en cada deploy si el host tiene disco efímero.'
    );
  }
  require('./migrate').run();
  app.listen(PORT, () => {
    console.log(`WhatsApp bot escuchando en http://localhost:${PORT}`);
    sessions.restoreAllSessions();
  });
}

start();
