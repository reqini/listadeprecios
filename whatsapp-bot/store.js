const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { CONFIG_PATH } = require('./storagePaths');
const sb = require('./supabase');

const MAX_MESSAGES_PER_CONVERSATION = 40;

function load() {
  if (!fs.existsSync(CONFIG_PATH)) {
    return { environments: {} };
  }
  const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
  if (!config.environments) config.environments = {};
  return config;
}

function save(config) {
  fs.mkdirSync(path.dirname(CONFIG_PATH), { recursive: true });
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
  // Réplica asincrónica a Supabase (si está configurado): el disco local es la copia
  // de trabajo, Supabase es la fuente que sobrevive a deploys/reinicios.
  if (sb.enabled) {
    sb.kvSet('config', config).catch((err) => console.error('[supabase] no se pudo replicar config:', err.message));
  }
}

// Al arrancar: si Supabase está configurado y tiene un config guardado, lo bajamos al
// disco local antes de que el server empiece a atender. Así, tras un deploy que borró
// el disco, las empresas/reglas/conversaciones vuelven solas.
async function syncFromRemote() {
  if (!sb.enabled) return false;
  const remote = await sb.kvGet('config');
  if (!remote || !remote.environments) return false;
  fs.mkdirSync(path.dirname(CONFIG_PATH), { recursive: true });
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(remote, null, 2));
  console.log('[supabase] config restaurado (empresas, reglas y conversaciones).');
  return true;
}

// --- Contraseñas (hash + salt, nunca texto plano en disco) ---

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return { salt, hash };
}

function verifyPassword(password, salt, hash) {
  if (!salt || !hash) return false;
  const check = crypto.scryptSync(password, salt, 64).toString('hex');
  const a = Buffer.from(check, 'hex');
  const b = Buffer.from(hash, 'hex');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

// --- Entornos (una empresa/cliente = un entorno, con su propio login) ---

function listEnvironments() {
  const config = load();
  return Object.entries(config.environments).map(([id, env]) => ({
    id,
    name: env.name,
    username: env.username,
    googleEmail: env.googleEmail || null,
    createdAt: env.createdAt,
  }));
}

function getEnvironment(envId) {
  const config = load();
  return config.environments[envId];
}

function findEnvironmentByUsername(username) {
  const config = load();
  const match = Object.entries(config.environments).find(([, env]) => env.username === username);
  return match ? { id: match[0], ...match[1] } : null;
}

function findEnvironmentByGoogleEmail(email) {
  const config = load();
  const lower = email.toLowerCase();
  const match = Object.entries(config.environments).find(
    ([, env]) => env.googleEmail && env.googleEmail.toLowerCase() === lower
  );
  return match ? { id: match[0], ...match[1] } : null;
}

function createEnvironment({ name, username, password, googleEmail }) {
  const config = load();
  const exists = Object.values(config.environments).some((env) => env.username === username);
  if (exists) throw new Error('Ya existe un entorno con ese usuario');
  if (googleEmail) {
    const emailTaken = Object.values(config.environments).some(
      (env) => env.googleEmail && env.googleEmail.toLowerCase() === googleEmail.toLowerCase()
    );
    if (emailTaken) throw new Error('Ese email de Google ya está asignado a otro entorno');
  }
  const id = crypto.randomUUID().slice(0, 8);
  const { hash, salt } = hashPassword(password);
  config.environments[id] = {
    name,
    username,
    passwordHash: hash,
    passwordSalt: salt,
    googleEmail: googleEmail || null,
    createdAt: Date.now(),
    sessions: {},
    conversations: {},
  };
  save(config);
  return { id, name, username, googleEmail: googleEmail || null, createdAt: config.environments[id].createdAt };
}

function updateEnvironmentGoogleEmail(envId, googleEmail) {
  const config = load();
  const env = config.environments[envId];
  if (!env) throw new Error('No existe');
  if (googleEmail) {
    const emailTaken = Object.entries(config.environments).some(
      ([id, other]) => id !== envId && other.googleEmail && other.googleEmail.toLowerCase() === googleEmail.toLowerCase()
    );
    if (emailTaken) throw new Error('Ese email de Google ya está asignado a otro entorno');
  }
  env.googleEmail = googleEmail || null;
  save(config);
  return { id: envId, name: env.name, username: env.username, googleEmail: env.googleEmail };
}

function deleteEnvironment(envId) {
  const config = load();
  delete config.environments[envId];
  save(config);
}

// --- Sesiones (números) dentro de un entorno ---

function getSession(envId, id) {
  const env = getEnvironment(envId);
  return env?.sessions?.[id];
}

function upsertSession(envId, id, patch) {
  const config = load();
  const env = config.environments[envId];
  if (!env) throw new Error('Entorno inválido');
  env.sessions[id] = { ...(env.sessions[id] || defaultSession()), ...patch };
  save(config);
  return env.sessions[id];
}

function removeSession(envId, id) {
  const config = load();
  const env = config.environments[envId];
  if (!env) return;
  delete env.sessions[id];
  save(config);
}

function defaultSession() {
  return {
    label: '',
    autoReplyEnabled: true,
    rules: [{ keyword: null, response: '¡Hola! Recibimos tu mensaje, te respondemos a la brevedad.' }],
    forwardTo: [],
    aiEnabled: false,
    aiContext: '',
    excludedContacts: [],
    groups: {}, // groupJid -> { name, enabled, rules: [{keyword, response} | menu] }
  };
}

// --- Conversaciones (tablero tipo Trello) dentro de un entorno ---

function getConversation(envId, id) {
  const env = getEnvironment(envId);
  return env?.conversations?.[id];
}

function listConversations(envId) {
  const env = getEnvironment(envId);
  if (!env) return [];
  return Object.entries(env.conversations || {}).map(([id, data]) => ({ id, ...data }));
}

function defaultConversation() {
  return {
    sessionId: '',
    jid: '',
    phone: '',
    name: '',
    status: 'nuevo', // 'nuevo' | 'proceso' | 'resuelto'
    lastMessage: '',
    lastAt: Date.now(),
    messages: [],
  };
}

function upsertConversation(envId, id, patch) {
  const config = load();
  const env = config.environments[envId];
  if (!env) throw new Error('Entorno inválido');
  env.conversations[id] = { ...(env.conversations[id] || defaultConversation()), ...patch };
  save(config);
  return env.conversations[id];
}

function appendConversationMessage(envId, id, entry) {
  const config = load();
  const env = config.environments[envId];
  if (!env) throw new Error('Entorno inválido');
  const conversation = env.conversations[id] || defaultConversation();
  conversation.messages = [...(conversation.messages || []), entry].slice(-MAX_MESSAGES_PER_CONVERSATION);
  env.conversations[id] = conversation;
  save(config);
  return conversation;
}

module.exports = {
  load,
  save,
  syncFromRemote,
  hashPassword,
  verifyPassword,
  listEnvironments,
  getEnvironment,
  findEnvironmentByUsername,
  findEnvironmentByGoogleEmail,
  createEnvironment,
  updateEnvironmentGoogleEmail,
  deleteEnvironment,
  getSession,
  upsertSession,
  removeSession,
  defaultSession,
  getConversation,
  listConversations,
  defaultConversation,
  upsertConversation,
  appendConversationMessage,
};
