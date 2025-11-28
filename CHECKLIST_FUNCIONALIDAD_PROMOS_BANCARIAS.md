# ✅ CHECKLIST - FUNCIONALIDAD COMPLETA PROMOS BANCARIAS

**Fecha:** 2025-01-27  
**Objetivo:** Verificar que todo esté funcional para mostrar logos de bancos en las cards

---

## 🔍 ESTADO ACTUAL

### 1. **Componente Admin Panel** ✅

- ✅ `AdminPromosBancos` implementado
- ✅ Selector múltiple de catálogos
- ✅ Selector múltiple de bancos
- ✅ Guardado en Google Sheets vía backend
- ✅ Formato: `catalogos` y `bancos` como strings separados por comas

**Archivo:** `src/components/AdminPromosBancos.js`

### 2. **Carga de Logos en Catálogos** ✅

- ✅ `catalogo6.js`: Carga logos con `getBankLogosForCatalogo('/catalogo6')`
- ✅ `catalogo12.js`: Carga logos con `getBankLogosForCatalogo('/catalogo12')`
- ✅ `catalogo3.js`: Carga logos con `getBankLogosForCatalogo('/catalogo3')`
- ✅ `home.js`: Carga logos con `getBankLogosForCatalogo('/home')`

**Archivos:**
- `src/catalogo6.js` (líneas 85-105)
- `src/catalogo12.js` (líneas 85-105)
- `src/catalogo3.js` (similar)
- `src/home.js` (similar)

### 3. **Pasar Logos a las Cards** ✅

- ✅ `catalogo6.js`: Pasa `bankLogos={bankLogos}` a `ModernProductCardAirbnb`
- ✅ `catalogo12.js`: Pasa `bankLogos={bankLogos}` a `ModernProductCardAirbnb`
- ✅ `catalogo3.js`: Pasa `bankLogos={bankLogos}` a `ModernProductCardAirbnb`
- ✅ `home.js`: Pasa `bankLogos={bankLogos}` a `ModernProductCardAirbnb`

**Verificado en:**
- `src/catalogo6.js` (línea 304)
- `src/catalogo12.js` (línea 306)
- `src/catalogo3.js` (línea 485)
- `src/home.js` (línea 513)

### 4. **Renderizado de Logos** ✅

- ✅ `ModernProductCardAirbnb` recibe prop `bankLogos`
- ✅ Renderiza `BankLogosRow` si hay logos
- ✅ Se muestra texto "Tenés cuotas con —" + logos circulares

**Archivo:** `src/components/ModernProductCardAirbnb.js` (líneas 674-679)

### 5. **Componente BankLogosRow** ✅

- ✅ Muestra logos circulares (border-radius: 50%)
- ✅ Tamaño 28x28px
- ✅ Box-shadow: 0 2px 4px rgba(0,0,0,0.18)
- ✅ Texto: "Tenés cuotas con —"
- ✅ Mapeo de nombres de bancos a logos locales

**Archivo:** `src/components/BankLogosRow.js`

### 6. **Carrusel de Lanzamientos** ✅

- ✅ `LaunchProductsCarousel` integrado en catálogos
- ✅ Se muestra solo si hay productos con `lanzamiento="si"` o `entrega_inmediata="si"`
- ✅ Requiere `imagen_banner` válida

**Archivos:**
- `src/catalogo6.js` (no tiene carrusel aún)
- `src/catalogo12.js` (líneas 220-228)
- `src/home.js` (líneas 375-384)

---

## 🔧 LO QUE FALTA

### 1. **Carrusel en catalogo6.js** ⚠️

**Estado:** No tiene carrusel integrado todavía

**Acción necesaria:**
- Agregar `LaunchProductsCarousel` después del banner/buscador
- Similar a como está en `catalogo12.js`

### 2. **Verificar que los logos se carguen correctamente** ⚠️

**Estado:** El código está listo, pero hay que verificar:

1. Que el backend esté funcionando (`/api/catalogo-promos`)
2. Que haya promos activas en Google Sheets
3. Que los bancos tengan logos configurados

**Cómo verificar:**
```javascript
// En la consola del navegador, revisar:
localStorage.getItem('catalogo_promos') // Debería tener promos
// Y en Network tab, verificar que /api/catalogo-promos responda
```

### 3. **Asegurar que el formato de datos sea correcto** ⚠️

**Requisitos en Google Sheets:**

| Campo | Formato | Ejemplo |
|-------|---------|---------|
| `catalogos` | String separado por comas | "catalogo12, catalogo6" |
| `bancos` | String separado por comas | "NACION, GALICIA, SANTANDER" |
| `activo` | "si" o true | "si" |

---

## 📋 PASOS PARA ACTIVAR COMPLETAMENTE

### Paso 1: Crear una Promo en Admin Panel

1. Ir a `/administrador`
2. En "Panel de Administración" → "Promos de Bancos"
3. Seleccionar catálogos (ej: "Catálogo 12 Cuotas", "Catálogo 6 Cuotas")
4. Seleccionar bancos (ej: "Nación", "Galicia", "Santander")
5. Click en "GUARDAR PROMOS"

### Paso 2: Verificar en Google Sheets

1. Ir a la hoja `promos_bancarias`
2. Verificar que la nueva promo tenga:
   - `activo = "si"`
   - `catalogos = "catalogo12, catalogo6"` (o las rutas correspondientes)
   - `bancos = "NACION, GALICIA"` (nombres de bancos)

### Paso 3: Verificar Logos de Bancos

1. Ir a la hoja `bancos`
2. Verificar que cada banco tenga:
   - `nombre` (ej: "NACION", "GALICIA")
   - `logo_url` (URL o nombre de archivo)

### Paso 4: Verificar Visualmente

1. Ir a `/catalogo12`
2. Verificar que las cards muestren:
   - Texto "Tenés cuotas con —"
   - Logos circulares de los bancos
   - Se muestren solo en productos del catálogo correcto

---

## 🐛 PROBLEMAS POSIBLES Y SOLUCIONES

### Problema 1: No se muestran los logos

**Causas posibles:**
- ❌ No hay promos activas para ese catálogo
- ❌ Los bancos no tienen `logo_url` configurado
- ❌ El formato de `catalogos` o `bancos` en Sheets es incorrecto

**Solución:**
1. Verificar en Admin Panel que haya promos guardadas
2. Verificar en Google Sheets el formato
3. Revisar consola del navegador para errores

### Problema 2: Los logos no se cargan

**Causas posibles:**
- ❌ Error en el backend `/api/catalogo-promos`
- ❌ Error en `/api/bancos`
- ❌ Problemas de CORS

**Solución:**
1. Revisar Network tab en DevTools
2. Verificar que los endpoints respondan
3. Revisar errores en consola

### Problema 3: Los logos se muestran pero están rotos

**Causas posibles:**
- ❌ Las URLs de logos son incorrectas
- ❌ Los archivos de logos no existen en `/public/logos-bancos/`

**Solución:**
1. Verificar que los logos existan en `public/logos-bancos/`
2. Verificar el formato de `logo_url` en Google Sheets
3. Revisar el mapeo en `BankLogosRow.js`

---

## ✅ VERIFICACIÓN FINAL

### Checklist de Funcionalidad:

- [ ] Admin Panel permite crear promos
- [ ] Promos se guardan en Google Sheets
- [ ] Logos se cargan correctamente en catálogos
- [ ] Logos se muestran en las cards
- [ ] Logos son circulares y con el estilo correcto
- [ ] Texto "Tenés cuotas con —" se muestra
- [ ] Solo se muestran en catálogos correctos
- [ ] Carrusel funciona en catálogos que lo tienen

---

**Estado:** ✅ Código completo, falta verificar datos en Google Sheets y backend

