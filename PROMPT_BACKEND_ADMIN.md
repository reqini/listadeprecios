# 🛠️ PROMPT PARA BACKEND - PANEL DE ADMINISTRACIÓN

## 📋 INSTRUCCIONES PARA LA IA DEL BACKEND

Necesito que implementes los siguientes endpoints para el panel de administración:

### 🔐 ENDPOINTS REQUERIDOS

#### 1. GET /api/admin/costos
**Descripción:** Obtener costos actuales del sistema
**Autenticación:** Requerida (solo usuario `cocinaty`)
**Respuesta esperada:**
```json
{
  "success": true,
  "data": {
    "costoEnvio": 21036,
    "costoPlanCanje": 0
  }
}
```

#### 2. PUT /api/admin/costos
**Descripción:** Actualizar costos del sistema
**Autenticación:** Requerida (solo usuario `cocinaty`)
**Body:**
```json
{
  "costoEnvio": 21036,
  "costoPlanCanje": 0
}
```
**Respuesta esperada:**
```json
{
  "success": true,
  "message": "Costos actualizados correctamente"
}
```

#### 3. GET /api/admin/stats (OPCIONAL)
**Descripción:** Obtener estadísticas del sistema
**Autenticación:** Requerida (solo usuario `cocinaty`)
**Respuesta esperada:**
```json
{
  "success": true,
  "data": {
    "totalUsuarios": 150,
    "totalProductos": 500,
    "ventasHoy": 25
  }
}
```

### 🔒 VALIDACIONES DE SEGURIDAD

1. **Verificar token JWT** en todos los endpoints
2. **Verificar que el usuario sea `cocinaty`** antes de permitir acceso
3. **Validar datos de entrada** (números positivos para costos)
4. **Manejar errores** apropiadamente

### 💾 ALMACENAMIENTO DE DATOS

**Opción 1: Google Sheets**
- Crear una hoja llamada `Configuracion_Sistema`
- Columnas: `parametro`, `valor`, `fecha_actualizacion`
- Filas: `costo_envio`, `costo_plan_canje`

**Opción 2: Variables de entorno**
- Usar variables de entorno para almacenar costos
- Actualizar en tiempo real

**Opción 3: Base de datos simple**
- Tabla `configuracion` con campos `parametro` y `valor`

### 📝 EJEMPLO DE IMPLEMENTACIÓN

```javascript
// Middleware de autenticación para admin
const adminAuth = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ success: false, message: 'Token requerido' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.username !== 'cocinaty') {
      return res.status(403).json({ success: false, message: 'Acceso denegado' });
    }
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Token inválido' });
  }
};

// GET /api/admin/costos
app.get('/api/admin/costos', adminAuth, async (req, res) => {
  try {
    // Obtener costos desde Google Sheets o base de datos
    const costos = await obtenerCostos();
    res.json({
      success: true,
      data: costos
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener costos'
    });
  }
});

// PUT /api/admin/costos
app.put('/api/admin/costos', adminAuth, async (req, res) => {
  try {
    const { costoEnvio, costoPlanCanje } = req.body;
    
    // Validar datos
    if (typeof costoEnvio !== 'number' || costoEnvio < 0) {
      return res.status(400).json({
        success: false,
        message: 'Costo de envío inválido'
      });
    }
    
    // Actualizar costos
    await actualizarCostos({ costoEnvio, costoPlanCanje });
    
    res.json({
      success: true,
      message: 'Costos actualizados correctamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al actualizar costos'
    });
  }
});
```

### 🧪 COMANDOS DE PRUEBA

```bash
# Obtener costos
curl -H "Authorization: Bearer TOKEN_JWT" \
  https://backend-catalogosimple.onrender.com/api/admin/costos

# Actualizar costos
curl -X PUT \
  -H "Authorization: Bearer TOKEN_JWT" \
  -H "Content-Type: application/json" \
  -d '{"costoEnvio": 20000, "costoPlanCanje": 5000}' \
  https://backend-catalogosimple.onrender.com/api/admin/costos
```

### ⚠️ IMPORTANTE

1. **Solo el usuario `cocinaty`** puede acceder a estos endpoints
2. **Los costos se deben actualizar en tiempo real** en toda la aplicación
3. **Manejar errores** apropiadamente
4. **Validar datos** antes de guardar
5. **Usar el mismo sistema de autenticación** que el resto de la API

### 🎯 OBJETIVO

El panel de administración debe permitir al usuario `cocinaty` modificar los costos de envío y plan de canje, y estos cambios deben reflejarse inmediatamente en toda la aplicación sin necesidad de recargar la página.

---

**¿Necesitas que implemente estos endpoints en el backend?** 🚀
