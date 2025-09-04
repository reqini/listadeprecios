# Configuración de Autenticación - Lista de Precios

## Estado Actual
✅ **FUNCIONANDO** - Sistema de autenticación restaurado y operativo

## Configuración de API

### Archivo: `src/config/api.js`
```javascript
export const API_CONFIG = {
  USE_PRODUCTION: true, // ✅ CONFIGURADO PARA PRODUCCIÓN
  LOCAL: "http://localhost:3001",
  PRODUCTION: "https://backtest-production-7f88.up.railway.app",
  
  get baseURL() {
    return this.USE_PRODUCTION ? this.PRODUCTION : this.LOCAL;
  }
};
```

### Archivo: `src/utils/axios.js`
- Configurado para usar `API_CONFIG.baseURL`
- Incluye interceptores para manejo de tokens
- Manejo de errores de autenticación

## Credenciales de Acceso

### Usuario Activo en Google Sheets:
- **Usuario**: `cocinaty`
- **Contraseña**: `279323`
- **Tipo de Usuario**: `full`

### Verificación de API:
```bash
curl -X POST https://backtest-production-7f88.up.railway.app/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"cocinaty","password":"279323"}'
```

**Respuesta esperada:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "username": "cocinaty",
  "tipo_usuario": "full"
}
```

## Flujo de Autenticación

1. **Login**: Usuario ingresa credenciales en `/src/Login.js`
2. **API Call**: Se envía POST a `/auth/login` en Railway
3. **Validación**: Backend valida contra Google Sheets
4. **Token**: Se recibe JWT token si las credenciales son válidas
5. **Storage**: Token se guarda en localStorage
6. **Redirect**: Usuario es redirigido a `/home`

## Archivos Clave

### `src/Login.js`
- Maneja el formulario de login
- Envía credenciales a la API de Railway
- Maneja errores y sesiones múltiples
- **NO** contiene usuarios mock (removidos)

### `src/AuthContext.js`
- Contexto de autenticación global
- Maneja estado de usuario logueado
- Verifica tokens en localStorage

## Troubleshooting

### Si el login falla:
1. Verificar que `USE_PRODUCTION: true` en `src/config/api.js`
2. Verificar que la API de Railway esté respondiendo
3. Verificar credenciales en Google Sheets
4. Revisar consola del navegador para errores de red

### Si hay errores de conexión:
```bash
# Verificar estado de la API
curl https://backtest-production-7f88.up.railway.app/auth/login

# Debería devolver 401 (método no permitido para GET)
```

### Cambios Recientes
- ❌ Removido sistema de login mock
- ✅ Restaurado sistema original con Google Sheets
- ✅ Configurado para usar API de producción (Railway)
- ✅ Verificado funcionamiento con credenciales reales

## Notas Importantes
- **NUNCA** volver a implementar usuarios mock
- **SIEMPRE** usar la API de Railway para autenticación
- Las credenciales se validan contra Google Sheets
- El sistema soporta múltiples tipos de usuario (`full`, etc.)

---
*Documentación actualizada: $(date)*
*Estado: ✅ OPERATIVO*
