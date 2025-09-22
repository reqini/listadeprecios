# ✅ CHECKLIST DE QA - Lista de Precios

## 🎯 **ESTADO ACTUAL**
- ✅ Login temporal implementado (modo QA)
- ✅ Backend diagnosticado (caído, necesita arreglo)
- ✅ Perfil preparado para Google Sheets
- ⏳ Aplicación iniciando para pruebas...

---

## 🔐 **1. PRUEBAS DE AUTENTICACIÓN**

### Credenciales de QA Disponibles:
- `cocinaty` / `279323` (usuario principal)
- `lucho` / `123456` (usuario secundario)
- `admin` / `admin123` (administrador)
- `test` / `test` (usuario de prueba)

### Checklist Login:
- [ ] ✅ Login exitoso con `cocinaty/279323`
- [ ] ✅ Login exitoso con `lucho/123456`  
- [ ] ✅ Login exitoso con `admin/admin123`
- [ ] ✅ Login exitoso con `test/test`
- [ ] ❌ Login falla con credenciales incorrectas
- [ ] 🔄 Redirección a `/home` funciona
- [ ] 💾 Token se guarda en localStorage
- [ ] 🔍 Consola muestra logs de QA

---

## 👤 **2. PRUEBAS DEL PERFIL**

### Navegación al Perfil:
- [ ] 📱 Botón de perfil visible en navbar
- [ ] 🔄 Redirección a `/perfil` funciona
- [ ] 📊 Página del perfil carga completamente

### Información Personal (Tab 1):
- [ ] 📝 Campo `username` muestra valor correcto
- [ ] 📝 Campo `username` está deshabilitado (correcto)
- [ ] ✉️ Campo `email` editable
- [ ] 📞 Campo `phone` editable
- [ ] 📍 Campo `address` editable
- [ ] 🏢 Campo `businessName` editable
- [ ] 🏷️ Campo `businessType` editable
- [ ] 💾 Botón "Editar Perfil" funciona
- [ ] 💾 Botón "Guardar" funciona
- [ ] ✅ Datos se actualizan correctamente

### Estadísticas (Header y Tab 4):
- [ ] 💰 `totalVentas` se muestra correctamente
- [ ] 👥 `clientesActivos` se muestra correctamente
- [ ] 🎨 `placasGeneradas` se muestra correctamente
- [ ] ⭐ `rating` se muestra correctamente
- [ ] 📈 Gráficos de progreso funcionan
- [ ] 🏆 Badges de verificación visibles

### Seguridad (Tab 2):
- [ ] 🔐 Botón "Cambiar Contraseña" abre modal
- [ ] 👁️ Botones de mostrar/ocultar contraseña funcionan
- [ ] ✅ Validación de contraseñas coincidentes
- [ ] 💾 Cambio de contraseña (simulado) funciona
- [ ] 🔒 Switches de seguridad funcionan

### Preferencias (Tab 3):
- [ ] 🔔 Switch de notificaciones funciona
- [ ] 🌙 Switch de modo oscuro funciona
- [ ] 🌍 Configuración de idioma visible
- [ ] 💾 Preferencias se guardan correctamente

---

## 📱 **3. PRUEBAS DE DISEÑO RESPONSIVE**

### Desktop (>1200px):
- [ ] 🖥️ Layout se ve correctamente
- [ ] 📊 Estadísticas en 4 columnas
- [ ] 🔄 Tabs horizontales funcionan
- [ ] 📝 Formularios bien espaciados

### Tablet (768px - 1200px):
- [ ] 📱 Layout se adapta correctamente
- [ ] 📊 Estadísticas en 2 columnas
- [ ] 🔄 Tabs siguen funcionando
- [ ] 📝 Formularios responsive

### Mobile (<768px):
- [ ] 📱 Layout móvil funciona
- [ ] 📊 Estadísticas en 1 columna
- [ ] 🔄 Tabs scroll horizontal
- [ ] 📝 Formularios apilados
- [ ] 👆 Botones táctiles accesibles

---

## 🔗 **4. PRUEBAS DE NAVEGACIÓN**

### Navbar:
- [ ] 🏠 Botón "Home" funciona
- [ ] 👤 Botón "Perfil" funciona
- [ ] 🚪 Botón "Logout" funciona
- [ ] 📱 Navbar responsive en móvil

### Rutas:
- [ ] 🔄 `/login` → `/home` funciona
- [ ] 🔄 `/home` → `/perfil` funciona
- [ ] 🔄 `/perfil` → `/home` funciona
- [ ] 🚪 Logout → `/login` funciona

---

## ⚠️ **5. PRUEBAS DE MANEJO DE ERRORES**

### Conexión de Red:
- [ ] 📡 Fallback a datos mock funciona
- [ ] ⚠️ Mensajes de error claros
- [ ] 🔄 Retry automático cuando sea apropiado
- [ ] 📱 Notificaciones (Snackbar) funcionan

### Validaciones:
- [ ] ❌ Campos requeridos validados
- [ ] ✉️ Email válido requerido
- [ ] 📞 Teléfono formato correcto
- [ ] 🔐 Contraseñas coincidentes

---

## 🚀 **6. PREPARACIÓN PARA PRODUCCIÓN**

### Limpieza de Código:
- [ ] 🧹 Remover logs de console.log innecesarios
- [ ] 🧹 Remover código comentado
- [ ] 🧹 Remover imports no utilizados
- [ ] ⚠️ **CRÍTICO**: Remover login mock antes de producción

### Configuración:
- [ ] 🔧 `USE_PRODUCTION: true` en `api.js`
- [ ] 🔧 URLs de producción correctas
- [ ] 🔧 Variables de entorno configuradas
- [ ] 🔧 Build de producción funciona

### Backend (Pendiente):
- [ ] 🔧 Arreglar Railway backend
- [ ] 📊 Implementar endpoints del perfil
- [ ] 🔗 Conectar con Google Sheets
- [ ] ✅ Probar todos los endpoints

---

## 📋 **RESUMEN DE ESTADO**

### ✅ **FUNCIONANDO**:
- Login temporal para QA
- Interfaz completa del perfil
- Navegación y diseño responsive
- Manejo de errores frontend

### ⚠️ **PENDIENTE**:
- Backend de Railway caído
- Conexión real con Google Sheets
- Endpoints del perfil sin implementar
- Datos reales de emprendedoras

### 🚨 **ANTES DE PRODUCCIÓN**:
1. **REMOVER** login mock del código
2. **ARREGLAR** backend de Railway
3. **PROBAR** todos los endpoints reales
4. **VERIFICAR** datos en Google Sheets

---

## 🧪 **INSTRUCCIONES DE PRUEBA**

1. **Abrir** `http://localhost:3000`
2. **Usar** credenciales: `cocinaty` / `279323`
3. **Navegar** por toda la aplicación
4. **Probar** cada función del perfil
5. **Verificar** responsive en diferentes tamaños
6. **Documentar** cualquier problema encontrado

---

*Checklist creado para QA completo - Actualizar según resultados*
