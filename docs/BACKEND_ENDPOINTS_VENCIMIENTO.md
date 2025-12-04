# 📋 DOCUMENTACIÓN BACKEND - ENDPOINTS DE VENCIMIENTO Y SUSCRIPCIÓN

## 🎯 **RESUMEN**
Documentación completa para implementar en el backend los endpoints necesarios para el sistema de control de vencimientos, cancelación y eliminación de cuenta.

---

## 🔗 **ENDPOINTS NECESARIOS**

### **1. DELETE /api/subscriptions/cancel**

**Descripción:** Cancela/pausa la suscripción del usuario en Mercado Pago y actualiza el estado en la base de datos.

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Proceso:**
1. Validar token JWT y obtener usuario
2. Obtener `subscription_preapproval_id` del usuario
3. Pausar/cancelar el preapproval en Mercado Pago
4. Actualizar en DB: `subscription_status = 'canceled'`
5. Retornar confirmación

**Respuesta exitosa:**
```json
{
  "success": true,
  "message": "Suscripción cancelada correctamente"
}
```

**Código de ejemplo (Node.js):**
```javascript
router.delete('/api/subscriptions/cancel', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Obtener usuario y preapproval_id
    const user = await getUserById(userId);
    
    if (!user || !user.subscription_preapproval_id) {
      return res.status(404).json({
        success: false,
        message: 'No se encontró suscripción activa'
      });
    }

    // Pausar/cancelar en Mercado Pago
    const mercadopago = require('mercadopago');
    mercadopago.configure({
      access_token: process.env.MERCADOPAGO_ACCESS_TOKEN
    });

    try {
      await mercadopago.preapproval.update(user.subscription_preapproval_id, {
        status: 'paused'
      });
    } catch (mpError) {
      console.error('Error al pausar en Mercado Pago:', mpError);
      // Continuar igual para actualizar en DB
    }

    // Actualizar en base de datos
    await db.query(`
      UPDATE users 
      SET subscription_status = 'canceled'
      WHERE id = ?
    `, [userId]);

    res.json({
      success: true,
      message: 'Suscripción cancelada correctamente'
    });
  } catch (error) {
    console.error('Error al cancelar suscripción:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cancelar la suscripción'
    });
  }
});
```

---

### **2. DELETE /api/users/delete**

**Descripción:** Elimina completamente la cuenta del usuario, incluyendo datos personales y suscripción.

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Proceso:**
1. Validar token JWT y obtener usuario
2. Si tiene suscripción activa, cancelarla primero
3. Eliminar tokens/sesiones del usuario
4. Eliminar datos asociados (si aplica)
5. Eliminar usuario de la base de datos
6. Retornar confirmación

**Respuesta exitosa:**
```json
{
  "success": true,
  "message": "Cuenta eliminada definitivamente"
}
```

**Código de ejemplo (Node.js):**
```javascript
router.delete('/api/users/delete', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Obtener usuario
    const user = await getUserById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Si tiene suscripción activa, cancelarla
    if (user.subscription_preapproval_id && user.subscription_status === 'active') {
      try {
        const mercadopago = require('mercadopago');
        mercadopago.configure({
          access_token: process.env.MERCADOPAGO_ACCESS_TOKEN
        });
        
        await mercadopago.preapproval.update(user.subscription_preapproval_id, {
          status: 'paused'
        });
      } catch (mpError) {
        console.error('Error al cancelar suscripción antes de eliminar:', mpError);
      }
    }

    // Eliminar sesiones/tokens del usuario (si tienes tabla de sesiones)
    await db.query(`DELETE FROM sessions WHERE user_id = ?`, [userId]);

    // Eliminar datos asociados (ajustar según tu modelo de datos)
    // Ejemplo: productos favoritos, historial, etc.
    // await db.query(`DELETE FROM user_favorites WHERE user_id = ?`, [userId]);

    // Eliminar usuario de la base de datos
    await db.query(`DELETE FROM users WHERE id = ?`, [userId]);

    res.json({
      success: true,
      message: 'Cuenta eliminada definitivamente'
    });
  } catch (error) {
    console.error('Error al eliminar cuenta:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar la cuenta'
    });
  }
});
```

---

### **3. GET /api/subscriptions/me (MEJORAR EXISTENTE)**

**Descripción:** Obtiene el estado actual de la suscripción incluyendo verificación de vencimiento.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Mejoras necesarias:**
- Calcular días restantes hasta `subscription_next_charge_date`
- Verificar estado en Mercado Pago si aplica
- Actualizar `subscription_status` si está próximo a vencer o vencido

**Respuesta mejorada:**
```json
{
  "success": true,
  "subscription_status": "active",
  "subscription_provider": "mercadopago",
  "subscription_preapproval_id": "preapproval_123",
  "subscription_plan_id": "2c93808494f9e81b01952fe6e9e01a76",
  "subscription_last_payment_date": "2024-01-15T00:00:00Z",
  "subscription_next_charge_date": "2024-02-15T00:00:00Z",
  "access_code": "CAT-XXXX-XXXX-XXXX",
  "days_remaining": 5,
  "expiring_soon": false
}
```

**Código de ejemplo mejorado:**
```javascript
router.get('/api/subscriptions/me', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await getUserById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    const nextChargeDate = user.subscription_next_charge_date;
    let daysRemaining = null;
    let expiringSoon = false;
    let finalStatus = user.subscription_status;
    
    // Calcular días restantes si hay fecha
    if (nextChargeDate) {
      const nextDate = new Date(nextChargeDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      nextDate.setHours(0, 0, 0, 0);
      
      const diffTime = nextDate - today;
      daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      // Verificar si está próximo a vencer o vencido
      if (daysRemaining <= 0 && finalStatus === 'active') {
        finalStatus = 'expired';
        // Actualizar en DB
        await db.query(`
          UPDATE users 
          SET subscription_status = 'expired'
          WHERE id = ?
        `, [userId]);
      } else if (daysRemaining <= 3 && daysRemaining > 0 && finalStatus === 'active') {
        finalStatus = 'expiring_soon';
        expiringSoon = true;
        // Actualizar en DB
        await db.query(`
          UPDATE users 
          SET subscription_status = 'expiring_soon'
          WHERE id = ?
        `, [userId]);
      }
    }
    
    res.json({
      success: true,
      subscription_status: finalStatus,
      subscription_provider: user.subscription_provider,
      subscription_preapproval_id: user.subscription_preapproval_id,
      subscription_plan_id: user.subscription_plan_id,
      subscription_last_payment_date: user.subscription_last_payment_date,
      subscription_next_charge_date: user.subscription_next_charge_date,
      access_code: user.access_code,
      days_remaining: daysRemaining,
      expiring_soon: expiringSoon
    });
  } catch (error) {
    console.error('Error al obtener suscripción:', error);
    res.status(500).json({ error: 'Error al obtener suscripción' });
  }
});
```

---

## ⏰ **CRON JOB DIARIO**

**Descripción:** Job que se ejecuta una vez al día para validar vencimientos y actualizar estados.

**Funcionalidad:**
1. Obtener todos los usuarios con `subscription_status = 'active'`
2. Para cada usuario:
   - Calcular días restantes hasta `subscription_next_charge_date`
   - Si `daysRemaining <= 0` → Actualizar a `'expired'`
   - Si `daysRemaining <= 3` → Actualizar a `'expiring_soon'`
   - Verificar estado en Mercado Pago (si aplica)

**Código de ejemplo:**
```javascript
const cron = require('node-cron');

// Ejecutar todos los días a las 3 AM
cron.schedule('0 3 * * *', async () => {
  console.log('🔄 Ejecutando validación diaria de vencimientos...');
  
  try {
    // Obtener usuarios con suscripción activa
    const activeUsers = await db.query(`
      SELECT id, subscription_next_charge_date, subscription_preapproval_id
      FROM users
      WHERE subscription_status IN ('active', 'expiring_soon')
        AND subscription_next_charge_date IS NOT NULL
    `);
    
    for (const user of activeUsers) {
      const nextChargeDate = new Date(user.subscription_next_charge_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      nextChargeDate.setHours(0, 0, 0, 0);
      
      const diffTime = nextChargeDate - today;
      const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      let newStatus = user.subscription_status;
      
      if (daysRemaining <= 0) {
        newStatus = 'expired';
      } else if (daysRemaining <= 3) {
        newStatus = 'expiring_soon';
      }
      
      // Verificar también en Mercado Pago
      if (user.subscription_preapproval_id) {
        try {
          const preapproval = await mercadopago.preapproval.get(user.subscription_preapproval_id);
          const mpStatus = preapproval.body.status;
          
          if (['paused', 'cancelled', 'rejected'].includes(mpStatus)) {
            newStatus = 'expired';
          }
        } catch (mpError) {
          console.error(`Error verificando MP para usuario ${user.id}:`, mpError);
        }
      }
      
      // Actualizar si cambió el estado
      if (newStatus !== user.subscription_status) {
        await db.query(`
          UPDATE users 
          SET subscription_status = ?
          WHERE id = ?
        `, [newStatus, user.id]);
        
        console.log(`✅ Usuario ${user.id} actualizado a ${newStatus}`);
      }
    }
    
    console.log('✅ Validación de vencimientos completada');
  } catch (error) {
    console.error('Error en cron job de vencimientos:', error);
  }
});
```

---

## 🔐 **VALIDACIÓN EN LOGIN**

**Modificar el endpoint `/auth/login` para incluir verificación de vencimiento:**

```javascript
// En el controlador de login, después de validar credenciales:

const user = await getUserByUsername(username);

// Verificar vencimiento
if (user.subscription_status === 'active' && user.subscription_next_charge_date) {
  const nextChargeDate = new Date(user.subscription_next_charge_date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  nextChargeDate.setHours(0, 0, 0, 0);
  
  const diffTime = nextChargeDate - today;
  const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (daysRemaining <= 0) {
    await updateUserSubscription(user.id, { subscription_status: 'expired' });
    user.subscription_status = 'expired';
  } else if (daysRemaining <= 3) {
    await updateUserSubscription(user.id, { subscription_status: 'expiring_soon' });
    user.subscription_status = 'expiring_soon';
  }
}

// Continuar con el flujo de login normal...
```

---

## ✅ **CHECKLIST DE IMPLEMENTACIÓN**

- [ ] Crear endpoint `DELETE /api/subscriptions/cancel`
- [ ] Crear endpoint `DELETE /api/users/delete`
- [ ] Mejorar endpoint `GET /api/subscriptions/me` con cálculo de días restantes
- [ ] Implementar cron job diario para validar vencimientos
- [ ] Agregar verificación de vencimiento en `/auth/login`
- [ ] Agregar verificación de vencimiento cuando carga `/home`
- [ ] Probar cancelación de suscripción
- [ ] Probar eliminación de cuenta
- [ ] Probar detección de vencimiento próximo
- [ ] Probar detección de vencimiento expirado

---

**Última actualización:** [Fecha]
**Versión:** 1.0.0

