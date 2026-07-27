# Bot de WhatsApp

Bot multi-número con respuestas automáticas y redirección de mensajes. Se conecta como
"dispositivo vinculado" de WhatsApp (igual que WhatsApp Web), escaneando un QR — no usa la
API oficial de Meta.

⚠️ **Importante:** esto usa una librería no oficial (`@whiskeysockets/baileys`). Funciona muy
bien para uso personal o de un negocio chico, pero viola los Términos de Servicio de WhatsApp.
Hay riesgo de que el número sea baneado si se manda mucho volumen o se abusa de mensajes
automáticos. No lo uses para spam ni para números que no puedas perder.

## Uso local

```bash
cd whatsapp-bot
npm install
cp .env.example .env   # editá DASHBOARD_USER / DASHBOARD_PASSWORD
npm start
```

Abrí `http://localhost:3000` — te va a pedir usuario/clave.

### Empresas (entornos)

El usuario/clave del `.env` (`DASHBOARD_USER` / `DASHBOARD_PASSWORD`) es el
**administrador**: no ve números ni mensajes de nadie, solo sirve para crear una
**empresa** (entorno) por cada cliente que quieras manejar con este bot. Cada empresa
tiene su propio usuario y clave, elegidos por vos al crearla, y sus números/reglas/
conversaciones quedan completamente separados de las demás — una empresa no puede ver
nada de otra.

1. Entrá con el usuario/clave del `.env` → vas a caer en el **panel de administrador**.
2. Creá una empresa: nombre, usuario y clave (esos son los datos que le vas a dar a ese
   cliente para que entre a SU panel).
3. Cerrá sesión y entrá con el usuario/clave de esa empresa → ahí ya se ve el panel normal
   (números, reglas, tablero) para armar el bot de ese cliente en particular.

Si ya tenías el bot armado de antes (antes de esta versión), la primera vez que arranca el
server migra automáticamente todo a una empresa llamada "Mi negocio" — mirá el mensaje en la
consola al iniciar para ver con qué usuario entrar (la clave es la misma de siempre).

### Iniciar sesión con Google (opcional, por empresa)

Además de usuario/clave, una empresa puede entrar con su cuenta de Google. Para habilitarlo:

1. Necesitás un cliente OAuth en [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
   (tipo "Aplicación web"), con estas variables en el `.env`: `GOOGLE_CLIENT_ID`,
   `GOOGLE_CLIENT_SECRET` y `GOOGLE_REDIRECT_URI` (debe coincidir exacto con un "URI de
   redireccionamiento autorizado" del cliente — ej. `http://localhost:3000/auth/google/callback`
   en local, o tu dominio real en producción).
2. Desde el panel de administrador, al crear (o editar) una empresa, cargá el email de Google
   de ese cliente.
3. **Mientras el proyecto de Google esté en modo "Prueba"** (el default hasta que lo publiques),
   ese mismo email también hay que agregarlo como "usuario de prueba" en
   [Público → Usuarios de prueba](https://console.cloud.google.com/auth/audience) del proyecto
   de Google Cloud — si no, Google rechaza el login aunque esté bien cargado en el bot.

Solo entra con Google el email que vos autorizaste para esa empresa puntual — cualquier otra
cuenta de Google (aunque exista) se rechaza con un aviso claro.

### Agregar un número (dentro de una empresa)

1. Escribí un nombre (ej. "Ventas") y tocá **Agregar número**.
2. Va a aparecer un código QR. Abrí WhatsApp en el celular → **Ajustes → Dispositivos
   vinculados → Vincular un dispositivo** → escaneá el QR.
3. Cuando el estado pase a "Conectado", ese número ya responde solo.
4. Repetí para agregar más números — cada uno es independiente. El panel tiene una guía
   paso a paso (botón "¿Cómo funciona?" arriba a la derecha) con este mismo resumen.

### Reglas de respuesta automática

Por cada número podés cargar reglas `palabra clave → respuesta`. Si dejás la palabra clave
vacía, esa respuesta se usa como **respuesta por defecto** (cuando no matchea ninguna
keyword). Se evalúan de arriba hacia abajo.

#### Reglas con menú de opciones

Al cargar una regla podés tildar "Es un menú de opciones" en vez de escribir una respuesta
única. Por ejemplo, para la palabra clave `lista de precios`:

```
Pregunta: ¿Qué lista necesitás?
Opciones:
  Lista 1 → Te paso la lista 1 (mayoristas): [link]
  Lista 2 → Te paso la lista 2 (minoristas): [link]
  Las 2   → Te paso las dos listas: ...
```

Cuando alguien escribe algo que contiene "lista de precios", el bot responde con la pregunta
y las opciones numeradas, y espera la respuesta. Si contestan `1`, `2`, `3` (o escriben el
nombre de la opción, ej. "las 2"), el bot responde con el texto de esa opción específica. Si
no elige nada en 10 minutos, el menú queda sin efecto y el próximo mensaje se procesa normal.
Esto mismo se puede usar en las reglas de FAQ de grupos (más abajo).

Además del texto numerado, el bot intenta mandar las primeras 3 opciones como **botones
tocables nativos** de WhatsApp. ⚠️ Con esta conexión no oficial (Baileys) WhatsApp bloquea o
ignora esos botones muy seguido, así que **no hay que confiar en que aparezcan** — por eso el
mensaje siempre incluye el menú numerado completo en el cuerpo: si los botones no se ven, la
persona igual elige escribiendo el número. Cuando sí aparecen y la persona los toca, el bot lo
interpreta igual que si hubiera escrito ese número.

#### Reglas que envían un archivo (PDF, imagen, etc.)

Al cargar una regla podés tildar "Enviar un archivo" en vez de escribir una respuesta. Subís
el PDF/imagen una vez desde el dashboard (hasta 16 MB) y opcionalmente un mensaje que lo
acompañe. Cuando alguien escribe algo que contiene la palabra clave (ej. `lista de precios`),
el bot manda ese archivo automáticamente. Sirve para "¿me pueden enviar la lista de precios?"
→ el bot responde con el PDF al toque. Los archivos se guardan por empresa en la carpeta
`uploads/` del servicio (misma persistencia que las sesiones: sobreviven reinicios, pero un
deploy que limpie el disco los borra y habría que volver a subirlos).

### Redirigir mensajes

En "Redirigir mensajes a" podés cargar uno o más números. Cualquier mensaje que le llegue a
ese número del bot se reenvía también a los números configurados ahí (por ejemplo, para que
un mensaje que entra al WhatsApp de "Ventas" también le llegue a tu celular personal).

### Contactos excluidos

Podés cargar números que el bot debe ignorar por completo — nunca les responde (ni por regla
ni por IA) y esos mensajes tampoco aparecen en el tablero de consultas. Pensado para tus
propios contactos personales, un socio, etc. que hablan con ese número pero no son "clientes".

### Grupos — respuestas tipo FAQ

Además de números individuales, el bot puede responder dentro de grupos de WhatsApp — pero
**solo por palabra clave exacta**, nunca con una respuesta "por defecto" ni con IA libre (para
no contestarle a cada mensaje de un grupo lleno de gente). Para activarlo:

1. Con el número ya conectado, tocá **Actualizar lista de grupos** — trae los grupos de los
   que ese WhatsApp ya es miembro.
2. Activá el grupo que quieras y cargá preguntas frecuentes (`palabra clave → respuesta`), por
   ejemplo `horario → Abrimos de 9 a 20hs de lunes a sábado`.
3. Cuando alguien escriba en ese grupo un mensaje que contenga esa palabra, el bot responde
   solo esa vez — el resto de la conversación del grupo la ignora.

### Respuestas con IA

Si un mensaje no matchea ninguna regla de palabra clave, en vez de (o antes de) usar la
respuesta por defecto, podés activar "Respuestas con IA" para ese número y cargar un texto
contándole a la IA sobre el negocio (productos, precios, horarios, preguntas frecuentes). La
IA responde el mensaje del cliente de forma natural, basándose solo en lo que le contaste ahí.

Necesita la variable `ANTHROPIC_API_KEY` en el `.env` (conseguila en
[console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys)). Por
defecto usa `claude-opus-4-8`; si el volumen de mensajes es alto y el costo importa, se puede
bajar a un modelo más chico con la variable `ANTHROPIC_MODEL` (ej. `claude-haiku-4-5`).

### Tablero de consultas ("Consultas")

Cada conversación entrante aparece como una tarjeta en un tablero con 3 columnas: **Nuevo**,
**En proceso** y **Resuelto**. Sirve para no perder de vista qué clientes ya fueron atendidos:

- Arrastrá la tarjeta a otra columna (o usá los botones "→") a medida que la vas atendiendo.
- Tocá "Ver conversación" para ver el historial y responder directamente desde ahí — al
  responder manualmente, la tarjeta pasa sola a "En proceso".
- Si un cliente que ya estaba "Resuelto" escribe de nuevo, la tarjeta vuelve a "Nuevo"
  automáticamente.

## Deploy (para que corra 24/7)

Esto necesita un proceso siempre corriendo — **no funciona en Vercel** (son funciones
serverless que no sostienen la conexión persistente con WhatsApp). La opción más simple es
usar Render (donde ya tenés el backend de la app principal):

1. En Render: **New → Web Service**, apuntá al repo, con **Root Directory** = `whatsapp-bot`.
2. Build command: `npm install` — Start command: `npm start`.
3. Variables de entorno: `DASHBOARD_USER`, `DASHBOARD_PASSWORD` (y opcional `PORT`,
   `ANTHROPIC_API_KEY` si vas a usar respuestas con IA).
4. Deploy. Entrá a la URL que te da Render y repetí los pasos de "Uso local" para vincular
   los números.
5. Si usás login con Google: agregá `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` y
   `GOOGLE_REDIRECT_URI` apuntando a tu dominio real de Render (ej.
   `https://tu-servicio.onrender.com/auth/google/callback`), y sumá esa misma URL como "URI de
   redireccionamiento autorizado" en el cliente OAuth de Google Cloud Console.

### Que no se duerma (plan free de Render)

El plan free de Render duerme el servicio a los 15 min sin tráfico — si se duerme, el bot no
recibe mensajes hasta que algo lo despierte. Para evitarlo, sin pagar nada:

- Andá a [cron-job.org](https://cron-job.org) (gratis) y creá un job que haga `GET` a
  `https://tu-servicio.onrender.com/health` cada 5-10 minutos. Eso mantiene el servicio
  despierto y el bot respondiendo todo el tiempo.

Si más adelante querés algo más confiable, el plan pago más chico de Render (~USD 7/mes)
elimina el sleep por completo.

### Persistencia de los datos (IMPORTANTE en el plan free)

Todo el estado del bot vive en disco: las empresas y reglas (`data/config.json`), las
credenciales de cada WhatsApp vinculado (`sessions/`) y los archivos subidos (`uploads/`).

⚠️ **El plan free de Render usa un disco EFÍMERO: se borra en cada deploy y en cada
reinicio del servicio.** Sin persistencia externa se pierden las empresas, los números
vinculados (habría que re-escanear el QR) y los archivos subidos. Soluciones:

1. **Supabase (GRATIS, recomendada).** El bot replica todo su estado (config, sesiones de
   WhatsApp, archivos subidos y logins del dashboard) a Supabase y lo restaura solo al
   arrancar. Para habilitarlo:
   - Corré la migración `supabase/migrations/0003_whatsapp_bot_kv.sql` en el SQL Editor
     del proyecto de Supabase (crea la tabla `bot_kv`).
   - En las variables de entorno del servicio: `SUPABASE_URL` (la URL del proyecto) y
     `SUPABASE_SERVICE_KEY` (Project Settings → API keys → `service_role` — **nunca** la
     anon key, y nunca la pongas en un frontend).
   - El bucket privado `bot-uploads` se crea solo al arrancar.
   Después de cada deploy, el bot arranca, baja su estado desde Supabase y sigue como si
   nada: sin re-escanear QRs, sin perder empresas ni archivos, sin desloguear a nadie.
2. **Disco persistente de Render** (~USD 7/mes): montás un disco en `/data` y seteás
   `DATA_DIR=/data`. Igual de efectivo, pero pago.

Si no configurás ninguna, el bot funciona igual pero el estado es descartable (útil solo
para pruebas).
