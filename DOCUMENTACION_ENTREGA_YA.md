# 📚 Documentación: Catálogo "Entrega Ya"

## 🎯 Objetivo

Catálogo dedicado que muestra **exclusivamente** productos de la hoja "entrega-ya" de Google Sheets, con diseño moderno, mobile-first y funcionalidad completa.

---

## 📊 Estructura de Google Sheets

### Hoja: `entrega-ya`

**Columnas esperadas:**

| Columna | Alternativas | Tipo | Ejemplo | Descripción |
|---------|--------------|------|---------|-------------|
| `codigo` | `id`, `ID`, `_id` | String/Number | "PROD001" | Identificador único |
| `nombre` | `titulo` | String | "Sartén Essen" | Nombre del producto |
| `descripcion` | `detalle` | String | "Sartén de 24cm..." | Descripción |
| `precio` | `precio_negocio`, `precio_lista`, `precio_contado`, `psvp_lista` | Number/String | "15000" o 15000 | Precio del producto |
| `foto` | `imagen`, `imagen_url`, `imagen_banner`, `fotos` | String (URL) | "https://..." | URL de la imagen |
| `categoria` | `rubro`, `linea` | String | "Electrodomésticos" | Categoría |
| `stock` | `unidades_disponibles`, `stock_actual` | Number/String | "5" o 5 | Stock disponible |
| `entrega_ya` | `entrega_inmediata`, `entrega`, `envio_inmediato` | String/Boolean | "SI", "YES", true | Flag de entrega |
| `vigencia` | - | String | "SI" o "NO" | Producto vigente |
| `linea` | - | String | "Línea A" | Línea del producto |
| `tags` | `tag` | String | "nuevo,popular" | Tags adicionales |
| `cuotas` | - | String | "12 cuotas sin interés" | Info de cuotas |
| `ultima_unidad` | `solo_queda_uno` | String | "SI" | Última unidad disponible |
| `hoja` | `sheet` | String | "entrega-ya" | Nombre de la hoja |

### Ejemplo de fila en Google Sheets:

| codigo | nombre | descripcion | precio_negocio | foto | categoria | stock | entrega_ya | vigencia | ultima_unidad |
|--------|--------|-------------|----------------|------|-----------|-------|------------|----------|---------------|
| PROD001 | Sartén Essen 24cm | Sartén de acero inoxidable... | 15000 | https://... | Electrodomésticos | 5 | SI | SI | NO |
| PROD002 | Olla Essen 5L | Olla grande de acero... | 20000 | https://... | Electrodomésticos | 1 | SI | SI | SI |

---

## 🔌 Endpoints del Backend

### Opción 1: Endpoint específico (Recomendado)

```
GET /api/entrega-ya
```

**Respuesta esperada:**
```json
[
  {
    "codigo": "PROD001",
    "nombre": "Sartén Essen",
    "precio_negocio": "15000",
    "foto": "https://...",
    ...
  }
]
```

O con formato `{ success: true, data: [...] }`:
```json
{
  "success": true,
  "data": [...]
}
```

### Opción 2: Filtrado desde productos generales (Fallback)

Si no existe `/api/entrega-ya`, el sistema:
1. Obtiene todos los productos desde `/api/productos`
2. Filtra por:
   - Campo `hoja` o `sheet` igual a "entrega-ya" (o variantes)
   - Flags `entrega_ya`, `entrega_inmediata`, `envio_inmediato` igual a "SI"
3. Excluye repuestos y productos no vigentes

---

## 📁 Archivos del Sistema

### 1. Servicio de API
**Archivo:** `src/utils/entregaYaAPI.js`

**Funciones principales:**
- `mapEntregaYaRowToProduct(row)`: Mapea una fila de Google Sheets a objeto producto
- `getEntregaYaProducts()`: Obtiene todos los productos de entrega-ya

**Uso:**
```javascript
import { getEntregaYaProducts } from '../utils/entregaYaAPI';

const productos = await getEntregaYaProducts();
```

### 2. Componente de Card
**Archivo:** `src/components/EntregaYaCard.js`

**Props:**
```javascript
<EntregaYaCard
  product={producto}              // Objeto producto mapeado
  onAddToCart={handleAddToCart}   // Función callback
  onToggleFavorite={handleFav}    // Función callback (opcional)
  isFavorite={true}               // Boolean (opcional)
  onProductClick={handleClick}    // Función callback (opcional)
/>
```

**Características:**
- Imagen grande con overlay de badges
- Badge "Entrega YA" verde siempre visible
- Badge "Última unidad" rojo si `stock === 1`
- Botón de favoritos
- Precio destacado grande
- Botón WhatsApp para consultar
- Botón de agregar al carrito

### 3. Página del Catálogo
**Archivo:** `src/pages/Entregaya.js`

**Ruta:** `/entregaya`

**Características:**
- Carga productos usando `getEntregaYaProducts()`
- Estados de loading, error y vacío
- Grid responsive (1 columna mobile, 3-4 desktop)
- Integración con carrito y favoritos
- SEO optimizado

---

## 🎨 Diseño y UX

### Layout Responsive

**Desktop:**
- Grid de 4 columnas
- Cards con hover effect
- Espaciado generoso

**Tablet:**
- Grid de 3 columnas
- Mismo estilo que desktop

**Mobile:**
- 1 columna full-width
- Cards apiladas verticalmente
- Márgenes laterales para respiración

### Elementos Visuales

- **Badge "Entrega YA"**: Verde (#34a853), siempre visible
- **Badge "Última unidad"**: Rojo (#ea4335), solo si stock === 1
- **Precio**: Grande, color primary, formato `$123.456`
- **Imagen**: 240px altura, cover, placeholder si falta

---

## ✅ Tests Incluidos

### Tests Unitarios

**Archivo:** `src/utils/__tests__/entregaYaAPI.test.js`

- ✅ Mapeo de fila completa
- ✅ Manejo de campos faltantes
- ✅ Normalización de precios
- ✅ Detección de última unidad
- ✅ Diferentes nombres de campos

**Archivo:** `src/components/__tests__/EntregaYaCard.test.js`

- ✅ Renderizado de nombre y precio
- ✅ Badges visibles
- ✅ Callbacks funcionan
- ✅ Estados de favorito

---

## 🔧 Cómo Agregar Nuevos Campos

Si necesitas agregar un nuevo campo desde Google Sheets:

1. **Agregar la columna en Google Sheets**
2. **Actualizar `mapEntregaYaRowToProduct()` en `entregaYaAPI.js`:**
   ```javascript
   return {
     // ... campos existentes
     nuevoCampo: row.nuevo_campo || row.nuevoCampo || '',
   };
   ```
3. **Usar el campo en `EntregaYaCard.js` o `Entregaya.js`**

---

## 🚀 Criterios de Aceptación Cumplidos

✅ La página `/entregaya` carga SOLO productos de la hoja entrega-ya  
✅ Los datos se leen desde Google Sheets usando infraestructura existente  
✅ Cards modernas, lindas y claramente diferenciadas  
✅ Estado vacío con mensaje correcto  
✅ Estado de error amigable  
✅ Tests unitarios para mapeo y datos  
✅ Tests de render de la vista  
✅ No se rompe funcionalidad previa  

---

## 📝 Notas Importantes

- **Prioridad de precios**: `precio_negocio` > `precio` > `precio_lista`
- **Validación de productos**: Debe tener precio > 0, imagen válida y vigencia = "SI"
- **Exclusión automática**: Repuestos y productos no vigentes se excluyen
- **Fallback robusto**: Si no hay endpoint específico, filtra desde productos generales

---

## 🐛 Troubleshooting

### No se muestran productos

1. Verificar en consola los logs de debug
2. Verificar que los productos tengan:
   - Precio > 0
   - Imagen válida
   - Vigencia = "SI"
   - Campo `hoja` = "entrega-ya" o flag de entrega activo

### Imágenes no cargan

- Verificar que las URLs de imágenes sean accesibles
- El sistema mostrará placeholder si la imagen falla

### Precios no se muestran

- Verificar formato de precio en Google Sheets
- Debe ser número o string numérico (ej: "15000" o 15000)

