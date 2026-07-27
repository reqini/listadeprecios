// Corre una sola vez al arrancar el server: convierte el formato viejo (todo
// suelto en la raíz de config.json, un solo login) al nuevo formato de
// "entornos" (una empresa = un entorno, con su propio usuario/clave). Si ya
// está migrado, no hace nada.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { CONFIG_PATH, SESSIONS_DIR } = require('./storagePaths');

const LEGACY_ENV_ID = 'default';

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return { salt, hash };
}

function run() {
  if (!fs.existsSync(CONFIG_PATH)) return;
  const raw = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
  if (raw.environments) return; // ya migrado

  // El usuario/clave del .env (DASHBOARD_USER) pasa a ser el ADMINISTRADOR (crea
  // empresas, no ve números). El entorno migrado necesita un usuario DISTINTO —
  // si usara el mismo, nunca se podría entrar a él (el chequeo de admin gana
  // siempre primero). La clave se mantiene igual para no romper el acceso.
  const adminUsername = process.env.DASHBOARD_USER || 'admin';
  const password = process.env.DASHBOARD_PASSWORD || 'changeme';
  const legacyUsername = process.env.LEGACY_ENV_USER || 'negocio';
  const { hash, salt } = hashPassword(password);

  const migrated = {
    environments: {
      [LEGACY_ENV_ID]: {
        name: 'Mi negocio',
        username: legacyUsername,
        passwordHash: hash,
        passwordSalt: salt,
        createdAt: Date.now(),
        sessions: raw.sessions || {},
        conversations: raw.conversations || {},
      },
    },
  };
  fs.mkdirSync(path.dirname(CONFIG_PATH), { recursive: true });
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(migrated, null, 2));

  if (fs.existsSync(SESSIONS_DIR)) {
    const entries = fs.readdirSync(SESSIONS_DIR, { withFileTypes: true });
    const alreadyScoped = entries.some((e) => e.isDirectory() && e.name === LEGACY_ENV_ID);
    if (!alreadyScoped) {
      const targetDir = path.join(SESSIONS_DIR, LEGACY_ENV_ID);
      fs.mkdirSync(targetDir, { recursive: true });
      for (const entry of entries) {
        if (!entry.isDirectory()) continue;
        fs.renameSync(path.join(SESSIONS_DIR, entry.name), path.join(targetDir, entry.name));
      }
    }
  }

  console.log(
    `[migración] Tus números y reglas quedaron en el entorno "Mi negocio".\n` +
      `  Para verlos: usuario "${legacyUsername}", misma clave de antes.\n` +
      `  El usuario "${adminUsername}" ahora es el ADMINISTRADOR (solo crea/borra empresas, no ve números).`
  );
}

module.exports = { run };
