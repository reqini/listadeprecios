// Persistencia opcional en Supabase (plan free). Si están las variables
// SUPABASE_URL y SUPABASE_SERVICE_KEY, todo el estado del bot (empresas, reglas,
// conversaciones, sesiones de WhatsApp, archivos y tokens de login) se guarda en
// Supabase y sobrevive a deploys/reinicios. Si NO están, el bot cae a disco local
// (que en hosts efímeros como el free de Render se borra en cada deploy).
//
// Se usa la SERVICE key (no la anon) porque corre solo server-side y necesita
// escribir sin RLS. NUNCA se expone en el frontend.
const { createClient } = require('@supabase/supabase-js');

const url = process.env.SUPABASE_URL || '';
const serviceKey = process.env.SUPABASE_SERVICE_KEY || '';
const enabled = !!(url && serviceKey);

const BUCKET = 'bot-uploads';
const KV_TABLE = 'bot_kv';

// transport ws: en Node < 22 no hay WebSocket nativo y supabase-js lanza al crear el
// cliente si no le pasamos uno (aunque no usemos realtime para nada).
const client = enabled
  ? createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
      realtime: { transport: require('ws') },
    })
  : null;

// --- Key-Value sobre una tabla simple (bot_kv: k text PK, v jsonb) ---
async function kvGet(k) {
  const { data, error } = await client.from(KV_TABLE).select('v').eq('k', k).maybeSingle();
  if (error) throw new Error(`Supabase kvGet(${k}): ${error.message}`);
  return data ? data.v : null;
}

async function kvSet(k, v) {
  const { error } = await client
    .from(KV_TABLE)
    .upsert({ k, v, updated_at: new Date().toISOString() }, { onConflict: 'k' });
  if (error) throw new Error(`Supabase kvSet(${k}): ${error.message}`);
}

async function kvDelete(k) {
  const { error } = await client.from(KV_TABLE).delete().eq('k', k);
  if (error) throw new Error(`Supabase kvDelete(${k}): ${error.message}`);
}

async function kvDeletePrefix(prefix) {
  const { error } = await client.from(KV_TABLE).delete().like('k', `${prefix}%`);
  if (error) throw new Error(`Supabase kvDeletePrefix(${prefix}): ${error.message}`);
}

async function kvListPrefix(prefix) {
  const { data, error } = await client.from(KV_TABLE).select('k, v').like('k', `${prefix}%`);
  if (error) throw new Error(`Supabase kvListPrefix(${prefix}): ${error.message}`);
  return data || [];
}

// --- Storage (archivos subidos) ---
async function ensureBucket() {
  const { data } = await client.storage.getBucket(BUCKET);
  if (!data) {
    await client.storage.createBucket(BUCKET, { public: false }).catch(() => {});
  }
}

async function storagePut(path, buffer, contentType) {
  const { error } = await client.storage
    .from(BUCKET)
    .upload(path, buffer, { contentType: contentType || 'application/octet-stream', upsert: true });
  if (error) throw new Error(`Supabase storagePut(${path}): ${error.message}`);
}

async function storageGet(path) {
  const { data, error } = await client.storage.from(BUCKET).download(path);
  if (error) return null; // no existe / se perdió
  return Buffer.from(await data.arrayBuffer());
}

async function storageDelete(path) {
  await client.storage.from(BUCKET).remove([path]).catch(() => {});
}

async function storageDeletePrefix(prefix) {
  // list + remove (Supabase no borra por prefijo directo)
  const dir = prefix.replace(/\/$/, '');
  const { data } = await client.storage.from(BUCKET).list(dir);
  if (data && data.length) {
    await client.storage
      .from(BUCKET)
      .remove(data.map((f) => `${dir}/${f.name}`))
      .catch(() => {});
  }
}

module.exports = {
  enabled,
  BUCKET,
  ensureBucket,
  kvGet,
  kvSet,
  kvDelete,
  kvDeletePrefix,
  kvListPrefix,
  storagePut,
  storageGet,
  storageDelete,
  storageDeletePrefix,
};
