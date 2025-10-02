# 🔧 CONFIGURACIÓN CORS PARA RENDER

## ❌ PROBLEMA ACTUAL:
- Frontend en `localhost:3002` no puede conectarse a `https://backend-catalogosimple.onrender.com`
- Error: `Network Error` por CORS no configurado

## ✅ SOLUCIÓN:
Agregar configuración CORS en el backend de Render.

## 📋 CÓDIGO PARA AGREGAR AL BACKEND:

### 1. Instalar dependencia CORS:
```bash
npm install cors
```

### 2. Configurar CORS en el archivo principal del backend:
```javascript
const cors = require('cors');

// Configurar CORS para permitir localhost y dominio de producción
app.use(cors({
  origin: [
    'http://localhost:3002',  // Frontend local
    'http://localhost:3000',  // Frontend alternativo
    'https://catalogosimple.ar',  // Dominio de producción
    'https://www.catalogosimple.ar'  // Dominio con www
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### 3. Ubicación del código:
- Agregar después de `const express = require('express');`
- Antes de las rutas (`app.use('/api', ...)`)

## 🚀 PASOS PARA IMPLEMENTAR:

1. **Acceder al código del backend en Render**
2. **Agregar la configuración CORS**
3. **Hacer commit y push**
4. **Render hará deploy automático**

## ✅ VERIFICACIÓN:
Después del deploy, el frontend debería poder conectarse sin errores de CORS.

## 📝 NOTA:
Una vez configurado CORS, cambiar en el frontend:
```javascript
// En src/config/api.js
USE_PRODUCTION: true,
USE_RENDER: true,  // Volver a usar Render
```
