# 🔐 VARIABLES DE ENTORNO PARA NETLIFY

## 📋 Variables Requeridas para Google Sheets

### 1. `REACT_APP_GOOGLE_SHEET_ID`
**Descripción**: ID de tu hoja de cálculo de Google Sheets  
**Dónde encontrarlo**:
- Abrí tu Google Sheet
- En la URL verás algo como: `https://docs.google.com/spreadsheets/d/1ABC123...XYZ789/edit`
- El ID es la parte entre `/d/` y `/edit`: `1ABC123...XYZ789`

**Ejemplo**: `1ABC123def456GHI789jkl012MNO345pqr678STU901vwx234YZA567bcd890`

---

### 2. `REACT_APP_GOOGLE_API_KEY`
**Descripción**: API Key de Google Cloud Platform para acceder a Google Sheets API  
**Cómo obtenerla**:

1. **Crear proyecto en Google Cloud Console**:
   - Ve a: https://console.cloud.google.com/
   - Crea un nuevo proyecto o selecciona uno existente

2. **Habilitar Google Sheets API**:
   - En el menú lateral, ve a "APIs y servicios" > "Biblioteca"
   - Busca "Google Sheets API"
   - Haz clic en "Habilitar"

3. **Crear API Key**:
   - Ve a "APIs y servicios" > "Credenciales"
   - Haz clic en "Crear credenciales" > "Clave de API"
   - Copia la clave generada
   - (Opcional pero recomendado) Restringe la clave a Google Sheets API y a tu dominio de Netlify

**Ejemplo**: `AIzaSyAbCdEfGhIjKlMnOpQrStUvWxYz1234567`

---

## 📋 Variables Opcionales (si usas Firebase)

### 3. `REACT_APP_FIREBASE_API_KEY`
**Descripción**: API Key de Firebase  
**Dónde encontrarlo**:
- Firebase Console > Configuración del proyecto > Tus apps > Configuración
- Busca "apiKey" en el objeto de configuración

### 4. `REACT_APP_FIREBASE_AUTH_DOMAIN`
**Descripción**: Dominio de autenticación de Firebase  
**Ejemplo**: `tu-proyecto.firebaseapp.com`

### 5. `REACT_APP_FIREBASE_PROJECT_ID`
**Descripción**: ID del proyecto de Firebase  
**Ejemplo**: `tu-proyecto-id`

### 6. `REACT_APP_FIREBASE_STORAGE_BUCKET`
**Descripción**: Bucket de almacenamiento de Firebase  
**Ejemplo**: `tu-proyecto.appspot.com`

### 7. `REACT_APP_FIREBASE_MESSAGING_SENDER_ID`
**Descripción**: Sender ID de Firebase Messaging  
**Ejemplo**: `123456789012`

### 8. `REACT_APP_FIREBASE_APP_ID`
**Descripción**: App ID de Firebase  
**Ejemplo**: `1:123456789012:web:abcdef123456`

---

## 🚀 Cómo Configurar en Netlify

### Pasos:

1. **Ve a tu sitio en Netlify**
   - Entra a: https://app.netlify.com/
   - Selecciona tu sitio (`cocinaty-catalogos` o el nombre que tengas)

2. **Configuración de Variables de Entorno**:
   - En el menú lateral, ve a: **"Site configuration"** > **"Environment variables"**
   - O directamente: `https://app.netlify.com/sites/TU-SITIO/configuration/env`

3. **Agregar Variables**:
   - Haz clic en **"Add variable"**
   - Ingresa el **nombre** (ej: `REACT_APP_GOOGLE_SHEET_ID`)
   - Ingresa el **valor** (tu ID o API Key)
   - Haz clic en **"Save"**

4. **Repite para todas las variables necesarias**

5. **Redesplegar**:
   - Ve a "Deploys"
   - Haz clic en "Trigger deploy" > "Clear cache and deploy site"
   - O haz un commit nuevo para que se redesplegue automáticamente

---

## ✅ Lista de Verificación

### Variables Mínimas Requeridas (Google Sheets):
- [ ] `REACT_APP_GOOGLE_SHEET_ID` = `TU_SHEET_ID_AQUI`
- [ ] `REACT_APP_GOOGLE_API_KEY` = `TU_API_KEY_AQUI`

### Variables Opcionales (Firebase):
- [ ] `REACT_APP_FIREBASE_API_KEY`
- [ ] `REACT_APP_FIREBASE_AUTH_DOMAIN`
- [ ] `REACT_APP_FIREBASE_PROJECT_ID`
- [ ] `REACT_APP_FIREBASE_STORAGE_BUCKET`
- [ ] `REACT_APP_FIREBASE_MESSAGING_SENDER_ID`
- [ ] `REACT_APP_FIREBASE_APP_ID`

---

## 🔒 Seguridad

**⚠️ IMPORTANTE**:
- ✅ Las variables de entorno en Netlify son **seguras** y no se exponen públicamente
- ✅ No subas archivos `.env` con estas variables al repositorio
- ✅ Usa siempre `REACT_APP_` como prefijo para variables de React
- ✅ Restringe tu API Key de Google a tu dominio de Netlify si es posible

---

## 📝 Ejemplo de Configuración Completa en Netlify

```
Variable Name: REACT_APP_GOOGLE_SHEET_ID
Value: 1ABC123def456GHI789jkl012MNO345pqr678STU901vwx234YZA567bcd890

Variable Name: REACT_APP_GOOGLE_API_KEY
Value: AIzaSyAbCdEfGhIjKlMnOpQrStUvWxYz1234567
```

---

## 🧪 Verificar que Funciona

Después de configurar las variables y redesplegar:

1. Abrí la consola del navegador (F12)
2. Ve a la pestaña "Network"
3. Busca llamadas a `sheets.googleapis.com`
4. Si ves respuestas exitosas (200), las variables están funcionando ✅
5. Si ves errores 403 o 400, revisa tus API Keys

---

**Última actualización**: 2024-12-20

