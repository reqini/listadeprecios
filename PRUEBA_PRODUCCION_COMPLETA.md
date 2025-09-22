# 🚀 PRUEBA DE PRODUCCIÓN COMPLETA

## 🎯 **OBJETIVO**
Verificar que toda la aplicación funciona correctamente en producción.

---

## 📋 **CHECKLIST DE PRUEBA**

### 1. **Backend - Endpoints** ✅
- [x] Login: `POST /auth/login` ✅ FUNCIONANDO
- [x] Perfil: `GET /api/profile/:username` ✅ FUNCIONANDO (con error menor en phone)
- [x] Estadísticas: `GET /api/profile/:username/stats` ✅ FUNCIONANDO PERFECTAMENTE
- [ ] Actualización: `PUT /api/profile/:username` ❌ Error interno del servidor
- [ ] Cambio contraseña: `POST /api/profile/:username/change-password` ⏳ Pendiente probar

### 2. **Frontend - Funcionalidades** ⏳
- [ ] Login con credenciales reales
- [ ] Navegación al perfil
- [ ] Carga de datos del perfil
- [ ] Visualización de estadísticas
- [ ] Edición de campos del perfil
- [ ] Guardado de cambios
- [ ] Cambio de contraseña

### 3. **Google Sheets - Datos** ⏳
- [ ] Hoja `Perfiles_Emprendedoras` creada
- [ ] Usuario `cocinaty` agregado
- [ ] Campo phone corregido (quitar #ERROR!)
- [ ] Permisos del service account verificados

---

## 🧪 **COMANDOS DE PRUEBA**

### Backend Tests:
```bash
# 1. Login
curl -X POST https://backend-catalogosimple.onrender.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"cocinaty","password":"279323"}'

# 2. Perfil (después de arreglar phone)
curl -X GET https://backend-catalogosimple.onrender.com/api/profile/cocinaty \
  -H "Authorization: Bearer <token>"

# 3. Estadísticas
curl -X GET https://backend-catalogosimple.onrender.com/api/profile/cocinaty/stats \
  -H "Authorization: Bearer <token>"

# 4. Actualización (después de arreglar error)
curl -X PUT https://backend-catalogosimple.onrender.com/api/profile/cocinaty \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@ejemplo.com"}'

# 5. Cambio de contraseña
curl -X POST https://backend-catalogosimple.onrender.com/api/profile/cocinaty/change-password \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"currentPassword":"279323","newPassword":"nueva123","confirmPassword":"nueva123"}'
```

### Frontend Tests:
1. Abrir http://localhost:3002
2. Login con: `cocinaty` / `279323`
3. Navegar a perfil
4. Verificar datos cargados
5. Editar campos
6. Guardar cambios
7. Probar cambio de contraseña

---

## 🔧 **PROBLEMAS A RESOLVER**

### 1. **Campo Phone (#ERROR!)**
**Solución**: En Google Sheets, celda C2, cambiar `#ERROR!` por `+54 9 11 1234-5678`

### 2. **Endpoint de Actualización (Error interno)**
**Posibles causas**:
- Permisos de escritura en Google Sheets
- Formato de datos incorrecto
- Error en el código del backend

**Solución**: Revisar logs en Render dashboard

### 3. **Endpoint de Cambio de Contraseña**
**Pendiente**: Probar si funciona

---

## 📊 **ESTADO ACTUAL**

### ✅ **FUNCIONANDO**:
- Backend conectado a Render
- Login real con Google Sheets
- Obtener perfil (con error menor)
- Obtener estadísticas
- Frontend corriendo
- Analytics instrumentado

### ⚠️ **PENDIENTE**:
- Arreglar campo phone
- Arreglar endpoint de actualización
- Probar cambio de contraseña
- Prueba completa del frontend

### 🎯 **RESULTADO ESPERADO**:
**Perfil 100% funcional con datos reales de Google Sheets**

---

## 🚀 **PRÓXIMOS PASOS**

1. **Arreglar campo phone** en Google Sheets
2. **Probar frontend** con datos actuales
3. **Revisar logs** del backend para error de actualización
4. **Probar cambio de contraseña**
5. **Prueba final completa**

---

*Checklist de producción - Actualizar según resultados*
