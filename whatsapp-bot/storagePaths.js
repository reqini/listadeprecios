const path = require('path');

// Todo el estado del bot (config de empresas, credenciales de WhatsApp y archivos
// subidos) se guarda en disco. Por defecto se usa la carpeta del proyecto, pero se
// puede mover a un disco persistente con la variable DATA_DIR.
//
// IMPORTANTE: en hosts con disco EFÍMERO (ej: plan free de Render) todo esto se pierde
// en cada deploy o reinicio. Para que persista de verdad, montá un disco persistente y
// apuntá DATA_DIR a él (ej: en Render, disco en /data + DATA_DIR=/data).
const DATA_DIR = process.env.DATA_DIR || __dirname;

module.exports = {
  DATA_DIR,
  CONFIG_PATH: path.join(DATA_DIR, 'data', 'config.json'),
  SESSIONS_DIR: path.join(DATA_DIR, 'sessions'),
  UPLOADS_DIR: path.join(DATA_DIR, 'uploads'),
};
