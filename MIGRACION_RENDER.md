# 🚀 MIGRACIÓN A RENDER - Guía Completa

## 🎯 **OBJETIVO**
Migrar el backend de Railway a Render y actualizar el frontend para usar el nuevo servidor.

---

## 📋 **PASOS PARA LA MIGRACIÓN**

### 1. **Crear Servicio en Render** ⚠️

#### A. Ir a Render.com
- Crear cuenta o iniciar sesión
- Hacer clic en "New +" → "Web Service"

#### B. Conectar Repositorio
- Conectar con tu repositorio de GitHub
- Seleccionar el repositorio del backend
- Configurar rama: `main`

#### C. Configuración del Servicio
```
Name: listadeprecios-backend
Environment: Node
Build Command: npm install
Start Command: npm start
```

#### D. Variables de Entorno (CRÍTICO)
```
NODE_ENV=production
PORT=10000
GOOGLE_SHEETS_ID=tu_sheet_id_aqui
GOOGLE_SERVICE_ACCOUNT_EMAIL=tu_service_account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\ntu_private_key_aqui\n-----END PRIVATE KEY-----
JWT_SECRET=tu_jwt_secret_super_seguro
```

---

### 2. **Actualizar Frontend** ✅

#### A. Cambiar URL en `src/config/api.js`
```javascript
RENDER: "https://TU-SERVICIO.onrender.com", // ⚠️ CAMBIAR POR TU URL
```

#### B. Verificar Configuración
```javascript
USE_RENDER: true, // ✅ Usar Render
USE_PRODUCTION: true, // ✅ Usar producción
```

---

### 3. **Endpoints Necesarios en el Backend**

#### A. Endpoints Existentes (deben funcionar)
- `POST /auth/login` - Login de usuarios
- `GET /api/productos` - Lista de productos

#### B. Endpoints del Perfil (NUEVOS - implementar)
- `GET /api/profile/:username` - Obtener perfil
- `PUT /api/profile/:username` - Actualizar perfil
- `GET /api/profile/:username/stats` - Obtener estadísticas
- `POST /api/profile/:username/change-password` - Cambiar contraseña

---

### 4. **Estructura de Google Sheets**

#### Hoja: `Perfiles_Emprendedoras`
| A | B | C | D | E | F | G | H |
|---|---|---|---|---|---|---|---|
| username | email | phone | address | businessName | businessType | avatar | rango |
| I | J | K | L | M | N | O | P |
| fechaRegistro | totalVentas | clientesActivos | placasGeneradas | rating | notifications | darkMode | language |
| Q |
| theme |

---

## 🔧 **CÓDIGO DEL BACKEND PARA RENDER**

### Archivo: `routes/profile.js`
```javascript
const express = require('express');
const router = express.Router();
const { GoogleSpreadsheet } = require('google-spreadsheet');

// GET /api/profile/:username
router.get('/:username', async (req, res) => {
  try {
    const { username } = req.params;
    
    // Conectar con Google Sheets
    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEETS_ID);
    await doc.useServiceAccountAuth({
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    });
    await doc.loadInfo();
    
    const sheet = doc.sheetsByTitle['Perfiles_Emprendedoras'];
    const rows = await sheet.getRows();
    
    // Buscar usuario
    const userRow = rows.find(row => row.username === username);
    
    if (!userRow) {
      return res.json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    // Formatear datos
    const profileData = {
      username: userRow.username,
      email: userRow.email,
      phone: userRow.phone,
      address: userRow.address,
      businessName: userRow.businessName,
      businessType: userRow.businessType,
      avatar: userRow.avatar,
      rango: userRow.rango,
      fechaRegistro: userRow.fechaRegistro,
      preferences: {
        notifications: userRow.notifications === 'true',
        darkMode: userRow.darkMode === 'true',
        language: userRow.language,
        theme: userRow.theme
      }
    };
    
    res.json({
      success: true,
      data: profileData
    });
    
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// PUT /api/profile/:username
router.put('/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const updateData = req.body;
    
    // Conectar con Google Sheets
    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEETS_ID);
    await doc.useServiceAccountAuth({
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    });
    await doc.loadInfo();
    
    const sheet = doc.sheetsByTitle['Perfiles_Emprendedoras'];
    const rows = await sheet.getRows();
    
    // Buscar usuario
    const userRow = rows.find(row => row.username === username);
    
    if (!userRow) {
      return res.json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    // Actualizar datos
    if (updateData.email) userRow.email = updateData.email;
    if (updateData.phone) userRow.phone = updateData.phone;
    if (updateData.address) userRow.address = updateData.address;
    if (updateData.businessName) userRow.businessName = updateData.businessName;
    if (updateData.businessType) userRow.businessType = updateData.businessType;
    
    // Actualizar preferencias
    if (updateData.preferences) {
      if (updateData.preferences.notifications !== undefined) {
        userRow.notifications = updateData.preferences.notifications.toString();
      }
      if (updateData.preferences.darkMode !== undefined) {
        userRow.darkMode = updateData.preferences.darkMode.toString();
      }
      if (updateData.preferences.language) {
        userRow.language = updateData.preferences.language;
      }
      if (updateData.preferences.theme) {
        userRow.theme = updateData.preferences.theme;
      }
    }
    
    await userRow.save();
    
    res.json({
      success: true,
      message: 'Perfil actualizado exitosamente'
    });
    
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    res.json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// GET /api/profile/:username/stats
router.get('/:username/stats', async (req, res) => {
  try {
    const { username } = req.params;
    
    // Conectar con Google Sheets
    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEETS_ID);
    await doc.useServiceAccountAuth({
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    });
    await doc.loadInfo();
    
    const sheet = doc.sheetsByTitle['Perfiles_Emprendedoras'];
    const rows = await sheet.getRows();
    
    // Buscar usuario
    const userRow = rows.find(row => row.username === username);
    
    if (!userRow) {
      return res.json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    res.json({
      success: true,
      data: {
        totalVentas: parseInt(userRow.totalVentas) || 0,
        clientesActivos: parseInt(userRow.clientesActivos) || 0,
        placasGeneradas: parseInt(userRow.placasGeneradas) || 0,
        rating: parseFloat(userRow.rating) || 0
      }
    });
    
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

module.exports = router;
```

---

## 🧪 **PRUEBAS DESPUÉS DE LA MIGRACIÓN**

### 1. **Probar Login**
```bash
curl -X POST https://TU-SERVICIO.onrender.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"cocinaty","password":"279323"}'
```

### 2. **Probar Perfil**
```bash
curl -X GET https://TU-SERVICIO.onrender.com/api/profile/cocinaty
```

### 3. **Probar Frontend**
- Cambiar URL en `src/config/api.js`
- Probar login en http://localhost:3002
- Verificar que el perfil funciona

---

## ⚠️ **IMPORTANTE**

### Después de que funcione el backend:
1. **REMOVER** el login mock de `src/Login.js`
2. **VERIFICAR** que todos los endpoints funcionan
3. **PROBAR** con datos reales de Google Sheets

---

## 📞 **SOPORTE**

Si necesitas ayuda:
1. Verificar logs en Render dashboard
2. Probar endpoints con curl
3. Revisar variables de entorno
4. Verificar permisos de Google Sheets

---

*Guía de migración a Render - Actualizar con tu URL específica*
