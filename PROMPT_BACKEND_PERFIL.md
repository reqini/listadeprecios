# 🚀 PROMPT COMPLETO PARA BACKEND - ENDPOINTS DEL PERFIL

## 📋 **CONTEXTO**
Necesito implementar los endpoints del perfil de usuario en mi backend de Node.js/Express que está corriendo en Render. El backend ya tiene:
- ✅ Login funcionando con Google Sheets
- ✅ Autenticación JWT
- ✅ Conexión con Google Sheets API
- ✅ Endpoint `/auth/login` funcionando

## 🎯 **ENDPOINTS A IMPLEMENTAR**

### 1. **GET /api/profile/:username**
**Descripción**: Obtener datos completos del perfil de una emprendedora

**Headers requeridos**:
```
Authorization: Bearer <jwt_token>
```

**Respuesta exitosa**:
```json
{
  "success": true,
  "data": {
    "username": "cocinaty",
    "email": "cocinaty@ejemplo.com",
    "phone": "+54 9 11 1234-5678",
    "address": "Buenos Aires, Argentina",
    "businessName": "Cocina TY - Productos de Cocina",
    "businessType": "Venta de productos de cocina",
    "avatar": "",
    "rango": "Demostrador/a",
    "fechaRegistro": "2024-01-15",
    "preferences": {
      "notifications": true,
      "darkMode": false,
      "language": "es",
      "theme": "default"
    }
  }
}
```

### 2. **PUT /api/profile/:username**
**Descripción**: Actualizar datos del perfil

**Headers requeridos**:
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Body de la petición**:
```json
{
  "email": "nuevo@email.com",
  "phone": "+54 9 11 5678-1234",
  "address": "Nueva dirección",
  "businessName": "Nuevo nombre de negocio",
  "businessType": "Nuevo tipo",
  "preferences": {
    "notifications": false,
    "darkMode": true,
    "language": "es",
    "theme": "default"
  }
}
```

**Respuesta exitosa**:
```json
{
  "success": true,
  "message": "Perfil actualizado exitosamente"
}
```

### 3. **GET /api/profile/:username/stats**
**Descripción**: Obtener estadísticas del usuario

**Headers requeridos**:
```
Authorization: Bearer <jwt_token>
```

**Respuesta exitosa**:
```json
{
  "success": true,
  "data": {
    "totalVentas": 1247,
    "clientesActivos": 89,
    "placasGeneradas": 156,
    "rating": 4.8
  }
}
```

### 4. **POST /api/profile/:username/change-password**
**Descripción**: Cambiar contraseña del usuario

**Headers requeridos**:
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Body de la petición**:
```json
{
  "currentPassword": "contraseña_actual",
  "newPassword": "nueva_contraseña",
  "confirmPassword": "nueva_contraseña"
}
```

**Respuesta exitosa**:
```json
{
  "success": true,
  "message": "Contraseña actualizada exitosamente"
}
```

## 📊 **ESTRUCTURA DE GOOGLE SHEETS**

### Hoja: `Perfiles_Emprendedoras`
| A | B | C | D | E | F | G | H |
|---|---|---|---|---|---|---|---|
| username | email | phone | address | businessName | businessType | avatar | rango |
| I | J | K | L | M | N | O | P |
| fechaRegistro | totalVentas | clientesActivos | placasGeneradas | rating | notifications | darkMode | language |
| Q |
| theme |

### Ejemplo de datos:
```
username: cocinaty
email: cocinaty@ejemplo.com
phone: +54 9 11 1234-5678
address: Buenos Aires, Argentina
businessName: Cocina TY - Productos de Cocina
businessType: Venta de productos de cocina
avatar: https://example.com/avatar.jpg
rango: Demostrador/a
fechaRegistro: 2024-01-15
totalVentas: 1247
clientesActivos: 89
placasGeneradas: 156
rating: 4.8
notifications: true
darkMode: false
language: es
theme: default
```

## 💻 **CÓDIGO DE EJEMPLO**

### Archivo: `routes/profile.js`
```javascript
const express = require('express');
const router = express.Router();
const { GoogleSpreadsheet } = require('google-spreadsheet');

// Middleware de autenticación
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Token requerido' });
  }

  // Verificar JWT token (usar tu lógica existente)
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Token inválido' });
    }
    req.user = user;
    next();
  });
};

// GET /api/profile/:username
router.get('/:username', authenticateToken, async (req, res) => {
  try {
    const { username } = req.params;
    
    // Verificar que el usuario solo acceda a su propio perfil
    if (req.user.username !== username) {
      return res.status(403).json({ 
        success: false, 
        message: 'No tienes permisos para acceder a este perfil' 
      });
    }
    
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
router.put('/:username', authenticateToken, async (req, res) => {
  try {
    const { username } = req.params;
    const updateData = req.body;
    
    // Verificar que el usuario solo actualice su propio perfil
    if (req.user.username !== username) {
      return res.status(403).json({ 
        success: false, 
        message: 'No tienes permisos para actualizar este perfil' 
      });
    }
    
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
router.get('/:username/stats', authenticateToken, async (req, res) => {
  try {
    const { username } = req.params;
    
    // Verificar que el usuario solo acceda a sus propias estadísticas
    if (req.user.username !== username) {
      return res.status(403).json({ 
        success: false, 
        message: 'No tienes permisos para acceder a estas estadísticas' 
      });
    }
    
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

// POST /api/profile/:username/change-password
router.post('/:username/change-password', authenticateToken, async (req, res) => {
  try {
    const { username } = req.params;
    const { currentPassword, newPassword, confirmPassword } = req.body;
    
    // Verificar que el usuario solo cambie su propia contraseña
    if (req.user.username !== username) {
      return res.status(403).json({ 
        success: false, 
        message: 'No tienes permisos para cambiar esta contraseña' 
      });
    }
    
    // Validaciones
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.json({
        success: false,
        message: 'Todos los campos son requeridos'
      });
    }
    
    if (newPassword !== confirmPassword) {
      return res.json({
        success: false,
        message: 'Las contraseñas no coinciden'
      });
    }
    
    // Conectar con Google Sheets para verificar contraseña actual
    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEETS_ID);
    await doc.useServiceAccountAuth({
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    });
    await doc.loadInfo();
    
    // Buscar en la hoja de usuarios (donde tienes el login)
    const usersSheet = doc.sheetsByTitle['usuarios']; // Ajustar nombre de hoja
    const userRows = await usersSheet.getRows();
    
    const userRow = userRows.find(row => row.username === username);
    
    if (!userRow) {
      return res.json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    // Verificar contraseña actual (usar tu lógica de verificación)
    if (userRow.password !== currentPassword) {
      return res.json({
        success: false,
        message: 'Contraseña actual incorrecta'
      });
    }
    
    // Actualizar contraseña
    userRow.password = newPassword;
    await userRow.save();
    
    res.json({
      success: true,
      message: 'Contraseña actualizada exitosamente'
    });
    
  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    res.json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

module.exports = router;
```

### Archivo: `app.js` o `server.js` (agregar ruta)
```javascript
const profileRoutes = require('./routes/profile');

// Usar las rutas del perfil
app.use('/api/profile', profileRoutes);
```

## 🔧 **VARIABLES DE ENTORNO NECESARIAS**

Asegúrate de tener estas variables en Render:
```
GOOGLE_SHEETS_ID=tu_sheet_id
GOOGLE_SERVICE_ACCOUNT_EMAIL=tu_service_account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\ntu_private_key\n-----END PRIVATE KEY-----
JWT_SECRET=tu_jwt_secret
```

## 🧪 **PRUEBAS**

Después de implementar, prueba con:
```bash
# Obtener perfil
curl -X GET https://backend-catalogosimple.onrender.com/api/profile/cocinaty \
  -H "Authorization: Bearer <token>"

# Actualizar perfil
curl -X PUT https://backend-catalogosimple.onrender.com/api/profile/cocinaty \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"email":"nuevo@email.com"}'

# Obtener estadísticas
curl -X GET https://backend-catalogosimple.onrender.com/api/profile/cocinaty/stats \
  -H "Authorization: Bearer <token>"

# Cambiar contraseña
curl -X POST https://backend-catalogosimple.onrender.com/api/profile/cocinaty/change-password \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"currentPassword":"279323","newPassword":"nueva123","confirmPassword":"nueva123"}'
```

## ⚠️ **NOTAS IMPORTANTES**

1. **Ajustar nombres de hojas**: Cambia `'Perfiles_Emprendedoras'` y `'usuarios'` por los nombres reales de tus hojas
2. **Autenticación**: Usa tu middleware de autenticación existente
3. **Validaciones**: Agrega validaciones adicionales según necesites
4. **Errores**: Maneja errores específicos de Google Sheets
5. **Seguridad**: Verifica que los usuarios solo accedan a sus propios datos

---

*Prompt completo para implementar endpoints del perfil en el backend*
