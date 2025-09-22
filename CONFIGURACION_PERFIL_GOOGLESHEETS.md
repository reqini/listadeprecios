# 👤 Configuración de Perfil con Google Sheets

## 🎯 Estado del Proyecto
✅ **Frontend actualizado** - Conexión con Google Sheets implementada
⏳ **Backend pendiente** - Necesita implementar endpoints del perfil

---

## 📊 Estructura de Google Sheets Requerida

### Hoja: `Perfiles_Emprendedoras`

| Columna A | Columna B | Columna C | Columna D | Columna E | Columna F | Columna G | Columna H |
|-----------|-----------|-----------|-----------|-----------|-----------|-----------|-----------|
| username | email | phone | address | businessName | businessType | avatar | rango |

| Columna I | Columna J | Columna K | Columna L | Columna M | Columna N | Columna O | Columna P |
|-----------|-----------|-----------|-----------|-----------|-----------|-----------|-----------|
| fechaRegistro | totalVentas | clientesActivos | placasGeneradas | rating | notifications | darkMode | language |

| Columna Q |
|-----------|
| theme |

### Ejemplo de Datos:
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

---

## 🔗 Endpoints Necesarios en el Backend (Railway)

### 1. **GET** `/api/profile/:username`
**Descripción:** Obtener datos completos del perfil de una emprendedora

**Respuesta Exitosa:**
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

### 2. **PUT** `/api/profile/:username`
**Descripción:** Actualizar datos del perfil

**Body de la Petición:**
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

**Respuesta Exitosa:**
```json
{
  "success": true,
  "message": "Perfil actualizado exitosamente"
}
```

### 3. **GET** `/api/profile/:username/stats`
**Descripción:** Obtener estadísticas del usuario

**Respuesta Exitosa:**
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

### 4. **POST** `/api/profile/:username/change-password`
**Descripción:** Cambiar contraseña del usuario

**Body de la Petición:**
```json
{
  "currentPassword": "contraseña_actual",
  "newPassword": "nueva_contraseña",
  "confirmPassword": "nueva_contraseña"
}
```

**Respuesta Exitosa:**
```json
{
  "success": true,
  "message": "Contraseña actualizada exitosamente"
}
```

---

## 🛠️ Implementación en el Backend

### Ejemplo de código para Node.js/Express:

```javascript
// routes/profile.js
const express = require('express');
const router = express.Router();
const { GoogleSpreadsheet } = require('google-spreadsheet');

// GET /api/profile/:username
router.get('/:username', async (req, res) => {
  try {
    const { username } = req.params;
    
    // Conectar con Google Sheets
    const doc = new GoogleSpreadsheet(SPREADSHEET_ID);
    await doc.useServiceAccountAuth(credentials);
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
    const doc = new GoogleSpreadsheet(SPREADSHEET_ID);
    await doc.useServiceAccountAuth(credentials);
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
    const doc = new GoogleSpreadsheet(SPREADSHEET_ID);
    await doc.useServiceAccountAuth(credentials);
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

## 📋 Checklist de Implementación

### ✅ Frontend (Completado)
- [x] Actualizado `profileAPI.js` para usar endpoints reales
- [x] Implementado fallback a datos mock
- [x] Manejo de errores mejorado
- [x] Documentación creada

### ⏳ Backend (Pendiente)
- [ ] Crear hoja `Perfiles_Emprendedoras` en Google Sheets
- [ ] Implementar endpoints en Railway:
  - [ ] `GET /api/profile/:username`
  - [ ] `PUT /api/profile/:username`  
  - [ ] `GET /api/profile/:username/stats`
  - [ ] `POST /api/profile/:username/change-password`
- [ ] Configurar permisos de Google Sheets
- [ ] Poblar datos iniciales

### 🧪 Testing (Pendiente)
- [ ] Probar obtención de perfil
- [ ] Probar actualización de datos
- [ ] Probar estadísticas
- [ ] Probar cambio de contraseña
- [ ] Verificar fallbacks

---

## 🚀 Pasos Siguientes

1. **Crear la hoja de Google Sheets** con las columnas especificadas
2. **Poblar datos iniciales** para el usuario `cocinaty`
3. **Implementar endpoints** en el backend de Railway
4. **Probar funcionalidad** completa
5. **Documentar cualquier ajuste** necesario

---

## 📞 Soporte

Si necesitas ayuda con algún paso específico, puedes:
- Revisar los logs del frontend en la consola del navegador
- Verificar los logs del backend en Railway
- Usar los datos mock como fallback mientras se implementa

---

*Documentación creada: $(date)*  
*Estado: ✅ Frontend listo, ⏳ Backend pendiente*
