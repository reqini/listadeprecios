# 📋 DOCUMENTACIÓN BACKEND - SISTEMA DE SUSCRIPCIONES MERCADO PAGO

## 🎯 **RESUMEN**
Documentación completa para implementar en el backend (Node.js/Express) el sistema de suscripciones mensuales con Mercado Pago por $10.000 ARS.

---

## 📦 **1. MODELO DE DATOS - BASE DE DATOS**

### 1.1. Campos a agregar a la tabla `users` (o tabla equivalente):

```sql
ALTER TABLE users ADD COLUMN subscription_status VARCHAR(20) DEFAULT 'none';
ALTER TABLE users ADD COLUMN subscription_provider VARCHAR(50) DEFAULT NULL;
ALTER TABLE users ADD COLUMN subscription_preapproval_id VARCHAR(255) DEFAULT NULL;
ALTER TABLE users ADD COLUMN subscription_plan_id VARCHAR(255) DEFAULT NULL;
ALTER TABLE users ADD COLUMN subscription_last_payment_date TIMESTAMP DEFAULT NULL;
ALTER TABLE users ADD COLUMN subscription_next_charge_date TIMESTAMP DEFAULT NULL;
ALTER TABLE users ADD COLUMN access_code VARCHAR(50) DEFAULT NULL;

-- Índices para mejor performance
CREATE INDEX idx_subscription_status ON users(subscription_status);
CREATE INDEX idx_subscription_preapproval ON users(subscription_preapproval_id);
CREATE INDEX idx_access_code ON users(access_code);
```

### 1.2. Valores posibles para `subscription_status`:
- `'active'` - Suscripción activa y pagada
- `'past_due'` - Suscripción vencida/no pagada
- `'canceled'` - Suscripción cancelada
- `'none'` - Sin suscripción

### 1.3. Formato del `access_code`:
- Debe ser único
- Formato: `CAT-XXXX-XXXX-XXXX` (ejemplo: `CAT-A3F2-B9K1-M7N4`)
- Se genera una sola vez cuando se activa la primera suscripción
- No debe ser adivinable (usar valores aleatorios)

---

## 🔗 **2. ENDPOINTS DEL BACKEND**

### 2.1. **POST /auth/login** (MODIFICAR EXISTENTE)

**Modificar** el endpoint de login para validar suscripción y retornar estado:

```javascript
// En el controlador de login, después de validar usuario/contraseña:

// Obtener estado de suscripción del usuario
const userSubscription = await getUserSubscription(user.id);

// Validar suscripción activa
if (!['active'].includes(userSubscription.subscription_status)) {
  return res.status(403).json({
    success: false,
    code: 'SUBSCRIPTION_INACTIVE',
    message: 'Tu suscripción está vencida o inactiva. Volvé a suscribirte para acceder.',
    subscription_status: userSubscription.subscription_status
  });
}

// Si está activa, retornar token + datos de suscripción
res.json({
  success: true,
  token: jwtToken,
  username: user.username,
  tipo_usuario: user.tipo_usuario,
  subscription_status: userSubscription.subscription_status,
  access_code: userSubscription.access_code || null
});
```

---

### 2.2. **POST /api/subscriptions/mercadopago/webhook** (NUEVO)

**Endpoint para recibir notificaciones de Mercado Pago**

```javascript
router.post('/api/subscriptions/mercadopago/webhook', async (req, res) => {
  try {
    // Mercado Pago envía datos en req.body
    const { type, data } = req.body;
    
    // Verificar autenticación de Mercado Pago (si aplica)
    // Puedes usar headers o tokens según la configuración de MP
    
    if (type === 'subscription_preapproval') {
      // Evento de preapproval (suscripción)
      const preapprovalId = data.id;
      const status = data.status; // authorized, paused, cancelled
      
      // Obtener usuario por external_reference o email
      const externalRef = data.external_reference;
      const payerEmail = data.payer_email;
      
      let user = null;
      if (externalRef) {
        user = await getUserByUsername(externalRef);
      } else if (payerEmail) {
        user = await getUserByEmail(payerEmail);
      }
      
      if (!user) {
        console.error('Usuario no encontrado para preapproval:', preapprovalId);
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }
      
      // Procesar según el estado
      if (status === 'authorized') {
        // Suscripción autorizada/activa
        const accessCode = user.access_code || generateAccessCode();
        const now = new Date();
        const nextChargeDate = new Date(now);
        nextChargeDate.setMonth(nextChargeDate.getMonth() + 1);
        
        await updateUserSubscription(user.id, {
          subscription_status: 'active',
          subscription_provider: 'mercadopago',
          subscription_preapproval_id: preapprovalId,
          subscription_plan_id: '2c93808494f9e81b01952fe6e9e01a76',
          subscription_last_payment_date: now,
          subscription_next_charge_date: nextChargeDate,
          access_code: accessCode
        });
        
        console.log(`✅ Suscripción activada para usuario ${user.username}`);
        
      } else if (status === 'paused' || status === 'cancelled') {
        // Suscripción pausada o cancelada
        await updateUserSubscription(user.id, {
          subscription_status: 'canceled'
        });
        
      } else if (status === 'pending') {
        // Pago pendiente
        // No cambiar estado aún
      }
    }
    
    // Siempre retornar 200 a Mercado Pago
    res.status(200).json({ received: true });
    
  } catch (error) {
    console.error('Error en webhook de Mercado Pago:', error);
    res.status(500).json({ error: 'Error procesando webhook' });
  }
});
```

**Funciones auxiliares necesarias:**

```javascript
// Generar código de acceso único
function generateAccessCode() {
  const segment1 = Math.random().toString(36).substring(2, 6).toUpperCase();
  const segment2 = Math.random().toString(36).substring(2, 6).toUpperCase();
  const segment3 = Math.random().toString(36).substring(2, 6).toUpperCase();
  const code = `CAT-${segment1}-${segment2}-${segment3}`;
  
  // Verificar que no exista
  // (implementar verificación en la base de datos)
  return code;
}

// Actualizar suscripción del usuario
async function updateUserSubscription(userId, subscriptionData) {
  // Implementar según tu ORM/Base de datos
  // Ejemplo con SQL:
  await db.query(`
    UPDATE users 
    SET 
      subscription_status = ?,
      subscription_provider = ?,
      subscription_preapproval_id = ?,
      subscription_plan_id = ?,
      subscription_last_payment_date = ?,
      subscription_next_charge_date = ?,
      access_code = ?
    WHERE id = ?
  `, [
    subscriptionData.subscription_status,
    subscriptionData.subscription_provider,
    subscriptionData.subscription_preapproval_id,
    subscriptionData.subscription_plan_id,
    subscriptionData.subscription_last_payment_date,
    subscriptionData.subscription_next_charge_date,
    subscriptionData.access_code,
    userId
  ]);
}
```

---

### 2.3. **GET /api/subscriptions/me** (NUEVO)

**Obtener estado de suscripción del usuario autenticado**

```javascript
router.get('/api/subscriptions/me', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id; // Del token JWT
    
    const user = await getUserById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    res.json({
      success: true,
      subscription_status: user.subscription_status || 'none',
      subscription_provider: user.subscription_provider,
      subscription_plan_id: user.subscription_plan_id,
      subscription_last_payment_date: user.subscription_last_payment_date,
      subscription_next_charge_date: user.subscription_next_charge_date,
      access_code: user.access_code
    });
    
  } catch (error) {
    console.error('Error al obtener suscripción:', error);
    res.status(500).json({ error: 'Error al obtener suscripción' });
  }
});
```

---

### 2.4. **GET /api/subscriptions/mercadopago/status/:preapprovalId** (NUEVO)

**Consultar estado de una suscripción en Mercado Pago**

```javascript
const mercadopago = require('mercadopago');

router.get('/api/subscriptions/mercadopago/status/:preapprovalId', async (req, res) => {
  try {
    const { preapprovalId } = req.params;
    
    // Consultar estado en Mercado Pago
    const preapproval = await mercadopago.preapproval.get(preapprovalId);
    
    res.json({
      success: true,
      status: preapproval.body.status,
      preapproval_id: preapprovalId,
      last_payment: preapproval.body.date_last_payment,
      next_payment: preapproval.body.date_next_payment
    });
    
  } catch (error) {
    console.error('Error al consultar estado en Mercado Pago:', error);
    res.status(500).json({ error: 'Error al consultar estado' });
  }
});
```

---

## ⏰ **3. CRON JOB / SCHEDULED TASK**

**Job diario para validar suscripciones vencidas**

Implementar un cron job que corra 1 vez al día (recomendado: 3 AM):

```javascript
const cron = require('node-cron');
const mercadopago = require('mercadopago');

// Configurar Mercado Pago SDK
mercadopago.configure({
  access_token: process.env.MERCADOPAGO_ACCESS_TOKEN
});

// Cron job que corre todos los días a las 3 AM
cron.schedule('0 3 * * *', async () => {
  console.log('🔄 Ejecutando validación diaria de suscripciones...');
  
  try {
    // Obtener todos los usuarios con suscripción activa
    const activeUsers = await db.query(`
      SELECT id, username, subscription_preapproval_id, subscription_next_charge_date
      FROM users
      WHERE subscription_status = 'active'
        AND subscription_preapproval_id IS NOT NULL
    `);
    
    for (const user of activeUsers) {
      try {
        // Consultar estado en Mercado Pago
        const preapproval = await mercadopago.preapproval.get(user.subscription_preapproval_id);
        const mpStatus = preapproval.body.status;
        
        // Si está pausada, cancelada o rechazada
        if (['paused', 'cancelled', 'rejected'].includes(mpStatus)) {
          await updateUserSubscription(user.id, {
            subscription_status: 'past_due'
          });
          
          console.log(`⚠️ Suscripción marcada como vencida para usuario ${user.username}`);
        }
        
        // Si la fecha de próximo cobro pasó y aún está activa, verificar
        const nextChargeDate = new Date(user.subscription_next_charge_date);
        const now = new Date();
        
        if (now > nextChargeDate && mpStatus !== 'authorized') {
          await updateUserSubscription(user.id, {
            subscription_status: 'past_due'
          });
          
          console.log(`⚠️ Suscripción vencida por fecha para usuario ${user.username}`);
        }
        
      } catch (error) {
        console.error(`Error validando suscripción de ${user.username}:`, error);
      }
    }
    
    console.log('✅ Validación de suscripciones completada');
    
  } catch (error) {
    console.error('Error en cron job de suscripciones:', error);
  }
});
```

**Configurar en el servidor:**
- Usar `node-cron` para Node.js
- O configurar un cron job del sistema operativo
- O usar servicios como Render Cron Jobs, AWS Lambda, etc.

---

## 🔐 **4. VARIABLES DE ENTORNO**

Agregar al `.env` del backend:

```env
# Mercado Pago
MERCADOPAGO_ACCESS_TOKEN=tu_access_token_de_mercadopago
MERCADOPAGO_PUBLIC_KEY=tu_public_key
MERCADOPAGO_PLAN_ID=2c93808494f9e81b01952fe6e9e01a76

# Webhook URL (configurar en Mercado Pago)
WEBHOOK_URL=https://tu-backend.onrender.com/api/subscriptions/mercadopago/webhook
```

---

## 📝 **5. CONFIGURACIÓN EN MERCADO PAGO**

### 5.1. Plan de Suscripción:
- El plan ya existe con ID: `2c93808494f9e81b01952fe6e9e01a76`
- Monto: $10.000 ARS
- Frecuencia: Mensual

### 5.2. Configurar Webhook:
1. Ir a la configuración del plan en Mercado Pago
2. Agregar URL de webhook: `https://tu-backend.onrender.com/api/subscriptions/mercadopago/webhook`
3. Eventos a escuchar:
   - `subscription_preapproval` (autorización/cancelación)
   - `payment` (pagos individuales)

### 5.3. Configurar back_url en checkout:
- La URL de retorno se pasa como parámetro `back_url` en el checkout
- Frontend envía: `${window.location.origin}/suscripcion/confirmacion`

---

## 🧪 **6. TESTS RECOMENDADOS**

```javascript
// Test de webhook
describe('POST /api/subscriptions/mercadopago/webhook', () => {
  it('debe activar suscripción cuando recibe authorized', async () => {
    // Mock de payload de Mercado Pago
    const payload = {
      type: 'subscription_preapproval',
      data: {
        id: 'preapproval_123',
        status: 'authorized',
        external_reference: 'testuser',
        payer_email: 'test@example.com'
      }
    };
    
    const res = await request(app)
      .post('/api/subscriptions/mercadopago/webhook')
      .send(payload);
    
    expect(res.status).toBe(200);
    
    // Verificar que el usuario tiene suscripción activa
    const user = await getUserByUsername('testuser');
    expect(user.subscription_status).toBe('active');
    expect(user.access_code).toMatch(/^CAT-/);
  });
});

// Test de validación en login
describe('POST /auth/login con suscripción inactiva', () => {
  it('debe rechazar login si suscripción está vencida', async () => {
    // Crear usuario con suscripción vencida
    await createUser({
      username: 'testuser',
      subscription_status: 'past_due'
    });
    
    const res = await request(app)
      .post('/auth/login')
      .send({
        username: 'testuser',
        password: 'password123'
      });
    
    expect(res.status).toBe(403);
    expect(res.body.code).toBe('SUBSCRIPTION_INACTIVE');
  });
});
```

---

## ✅ **CHECKLIST DE IMPLEMENTACIÓN**

- [ ] Agregar campos a la tabla `users` en la base de datos
- [ ] Modificar endpoint `/auth/login` para validar suscripción
- [ ] Crear endpoint `/api/subscriptions/mercadopago/webhook`
- [ ] Crear endpoint `/api/subscriptions/me`
- [ ] Implementar función `generateAccessCode()`
- [ ] Implementar función `updateUserSubscription()`
- [ ] Configurar cron job diario para validar suscripciones
- [ ] Agregar variables de entorno de Mercado Pago
- [ ] Configurar webhook en Mercado Pago
- [ ] Probar webhook con eventos de prueba
- [ ] Probar login con suscripción activa/inactiva
- [ ] Probar cron job manualmente

---

## 📞 **SOPORTE**

Para problemas o dudas:
1. Revisar logs del backend
2. Verificar configuración en Mercado Pago
3. Revisar estado de webhooks en dashboard de Mercado Pago
4. Verificar que el cron job esté ejecutándose

---

**Última actualización:** [Fecha]
**Versión:** 1.0.0

