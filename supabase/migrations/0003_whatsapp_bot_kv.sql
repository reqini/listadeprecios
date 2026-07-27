-- Persistencia del bot de WhatsApp (whatsapp-bot/).
-- Tabla clave-valor donde el bot guarda su estado para sobrevivir a deploys en
-- hosts con disco efímero (plan free de Render):
--   k = 'config'                      -> empresas, reglas y conversaciones
--   k = 'session:<env>:<id>:<file>'   -> credenciales del WhatsApp vinculado
--   k = 'token:<token>'               -> sesiones de login del dashboard
-- El bot accede SOLO con la service key (server-side). RLS queda activado sin
-- políticas: la anon key del frontend no puede leer ni escribir nada acá.

create table if not exists public.bot_kv (
  k text primary key,
  v jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.bot_kv enable row level security;

comment on table public.bot_kv is
  'Estado del bot de WhatsApp (whatsapp-bot/). Acceso solo via service key.';
