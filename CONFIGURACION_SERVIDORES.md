# ⚙️ CONFIGURACIÓN DE SERVIDORES

## 🎯 **ESTADO ACTUAL**
- ✅ Frontend configurado para usar Render
- ⏳ Backend pendiente de migrar a Render
- ⚠️ URL de Render pendiente de actualizar

---

## 🔧 **CONFIGURACIÓN ACTUAL**

### Archivo: `src/config/api.js`
```javascript
export const API_CONFIG = {
  USE_PRODUCTION: true,     // ✅ Usar servidor de producción
  USE_RENDER: true,         // ✅ Usar Render (en lugar de Railway)
  
  LOCAL: "http://localhost:3001",
  RAILWAY: "https://backtest-production-7f88.up.railway.app",
  RENDER: "https://listadeprecios-backend.onrender.com", // ⚠️ CAMBIAR POR TU URL
  
  get baseURL() {
    if (!this.USE_PRODUCTION) return this.LOCAL;
    return this.USE_RENDER ? this.RENDER : this.RAILWAY;
  }
};
```

---

## 📋 **PASOS PARA COMPLETAR LA MIGRACIÓN**

### 1. **Crear Servicio en Render** ⚠️
- [ ] Ir a render.com
- [ ] Crear nuevo Web Service
- [ ] Conectar con repositorio del backend
- [ ] Configurar variables de entorno
- [ ] Obtener URL del servicio

### 2. **Actualizar Frontend** ✅
- [x] Configuración preparada en `src/config/api.js`
- [ ] **CAMBIAR** URL de Render por la real
- [ ] Probar conectividad

### 3. **Probar Backend** 🧪
- [ ] Ejecutar `node test_render_backend.js`
- [ ] Verificar que todos los endpoints funcionan
- [ ] Probar login con credenciales reales

### 4. **Remover Login Mock** 🧹
- [ ] Una vez que el backend funcione
- [ ] Remover código mock de `src/Login.js`
- [ ] Probar login real

---

## 🔄 **CAMBIAR ENTRE SERVIDORES**

### Para usar Railway (temporal):
```javascript
USE_RENDER: false,  // Usar Railway
```

### Para usar Render (nuevo):
```javascript
USE_RENDER: true,   // Usar Render
```

### Para desarrollo local:
```javascript
USE_PRODUCTION: false,  // Usar localhost
```

---

## 🧪 **PRUEBAS**

### Script de Prueba:
```bash
node test_render_backend.js
```

### Prueba Manual:
```bash
curl -X POST https://TU-URL.onrender.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"cocinaty","password":"279323"}'
```

---

## ⚠️ **IMPORTANTE**

1. **CAMBIAR** la URL de Render por la real
2. **VERIFICAR** que el backend tenga todos los endpoints
3. **PROBAR** antes de remover el login mock
4. **DOCUMENTAR** cualquier problema encontrado

---

*Configuración actualizada para migración a Render*
