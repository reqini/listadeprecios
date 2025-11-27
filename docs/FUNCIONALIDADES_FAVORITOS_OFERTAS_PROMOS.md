# 🎯 Funcionalidades: Favoritos + Ofertas Relámpago + Promos por Bancos

## 📋 Resumen de Implementación

Se implementaron tres funcionalidades principales para mejorar la experiencia del usuario y el marketing del catálogo:

1. ✅ **Sistema de Favoritos Mejorado**
2. ✅ **Tag Administrable de Oferta Relámpago**
3. ✅ **Sistema de Promociones por Bancos**

---

## 1️⃣ Sistema de Favoritos Mejorado

### Características Implementadas

- **Sin duplicados**: Se corrigió la lógica para evitar productos duplicados en la lista de favoritos
- **Persistencia entre recargas**: Los favoritos se guardan en `localStorage` y persisten entre recargas de página
- **Sincronización entre vistas**: Los favoritos se sincronizan entre diferentes vistas del catálogo usando eventos personalizados
- **Visual feedback**: Icono de corazón que cambia de estado (relleno/vacío) según si el producto está en favoritos
- **Comparación robusta**: Se compara por `id` o `codigo` (el que exista) con conversión a string para evitar errores

### Archivos Modificados

- `src/components/ModernProductCardAirbnb.js`
  - Lógica mejorada de favoritos con eliminación de duplicados
  - Eventos personalizados para sincronización
  - Botón de corazón posicionado sobre la imagen

- `src/catalogo3.js`
  - Carga inicial de favoritos desde localStorage
  - Sincronización con eventos `favoritesUpdated`
  - Función `toggleFavorite` corregida para evitar duplicados

### Uso

```javascript
// El componente ModernProductCardAirbnb recibe:
onToggleFavorite={(product, isFavorite) => {
  toggleFavorite(product);
}}
```

### Campos en localStorage

Los favoritos se guardan en `localStorage` con la clave `favorites` como un array JSON de productos.

---

## 2️⃣ Tag Administrable de Oferta Relámpago

### Características Implementadas

- **Tag visual**: Badge "⚡ Oferta relámpago" que aparece sobre la imagen del producto
- **Administrable desde datos**: Se controla mediante el campo `oferta_relampago` en el producto
- **Visual destacado**: Color naranja (#FF6B35) con sombra para destacar

### Campo en Google Sheets/Backend

| Campo | Tipo | Valores | Descripción |
|-------|------|---------|-------------|
| `oferta_relampago` | String/Boolean | `"si"`, `"Sí"`, `true` | Indica si el producto está en oferta relámpago |

### Archivos Modificados

- `src/components/ModernProductCardAirbnb.js`
  - Lógica para mostrar badge cuando `product.oferta_relampago === 'si'` o `true`
  - Posicionado en la esquina superior izquierda junto a otros badges

### Ejemplo de Uso

```javascript
// En los datos del producto:
{
  "id": 1,
  "descripcion": "Producto Ejemplo",
  "oferta_relampago": "si" // o true
}
```

---

## 3️⃣ Sistema de Promociones por Bancos

### Características Implementadas

### Parte A - Modelo de Datos

- **Endpoint API**: `/api/bancos-promos` (si existe) o fallback a `/api/bancos`
- **Estructura de Promo**:
  ```javascript
  {
    banco: "BANCO DE LA NACION ARGENTINA",
    descripcion_promo: "12 cuotas sin interés",
    logo_url: "https://...", // Opcional
    activa: true, // o "si"
    banco_codigo: 11 // Opcional
  }
  ```

### Parte B - Asociación Producto ↔ Promo

- **Asociación por banco**: Si el producto tiene campo `banco`, se busca promo coincidente
- **Asociación por código**: Si el producto tiene `banco_codigo`, se busca por código
- **Fallback automático**: Si no existe endpoint de promos, se generan desde `/api/bancos`

### Parte C - Visualización

- **Componente `BankPromoBadge`**: Badge minimalista que muestra logo y texto de la promo
- **Logos de bancos**: Soporte para URLs externas o logos locales en `/public/logos-bancos/`
- **Posición**: Se muestra después del precio y antes de los botones de acción

### Archivos Creados

- `src/components/BankPromoBadge.js`
  - Componente minimalista para mostrar promos de bancos
  - Soporte para logos desde URL o assets locales
  - Manejo de errores si no carga el logo

- `src/utils/bankPromosAPI.js`
  - Utilidades para obtener promos de bancos
  - Funciones helper para obtener logos

### Archivos Modificados

- `src/components/ModernProductCardAirbnb.js`
  - Prop `bankPromo` agregada
  - Integración de `BankPromoBadge` en el layout

- `src/catalogo3.js`
  - Carga de promos de bancos en `useEffect`
  - Función `getBankPromoForProduct` para asociar promos con productos
  - Paso de `bankPromo` como prop a las cards

### Estructura de Datos Recomendada para Google Sheets

#### Hoja: `Promos_Bancos` (o similar)

| Columna | Tipo | Ejemplo | Descripción |
|---------|------|---------|-------------|
| `banco` | String | "BANCO DE LA NACION ARGENTINA" | Nombre del banco |
| `logo_url` | String | "https://..." | URL del logo (opcional) |
| `descripcion_promo` | String | "12 cuotas sin interés" | Texto de la promoción |
| `activa` | String | "si" | Si está activa |
| `desde` | Date | "2024-01-01" | Fecha inicio (opcional) |
| `hasta` | Date | "2024-12-31" | Fecha fin (opcional) |
| `banco_codigo` | Number | 11 | Código del banco (opcional) |

### Uso

```javascript
// En el catálogo:
const bankPromo = getBankPromoForProduct(product);

<ModernProductCardAirbnb
  product={product}
  bankPromo={bankPromo}
  // ... otros props
/>
```

---

## 🎨 Badges Administrables desde Datos

Los siguientes badges se pueden administrar desde los datos del producto:

| Badge | Campo | Valores | Visual |
|-------|-------|---------|--------|
| **Oferta relámpago** | `oferta_relampago` | `"si"`, `"Sí"`, `true` | Naranja con ⚡ |
| **Nuevo** | `nuevo` | `"si"`, `"Sí"`, `true` | Negro |
| **Más vendido** | `mas_vendida` | `"si"`, `"Sí"`, `true` | Negro |
| **Últimas unidades** | `stock_actual` + `stock_total` | Calculado automáticamente (< 20%) | Rojo |

---

## 🧪 QA y Testing

### Tests Manuales Recomendados

1. **Favoritos**:
   - ✅ Marcar y desmarcar varios productos
   - ✅ Recargar la página y verificar que se mantienen
   - ✅ Navegar entre catálogos y verificar sincronización
   - ✅ Eliminar todos los favoritos y verificar

2. **Oferta Relámpago**:
   - ✅ Ver producto con `oferta_relampago: "si"` y verificar badge
   - ✅ Ver producto sin oferta y verificar que no aparece badge

3. **Promos por Bancos**:
   - ✅ Ver producto con banco asociado y verificar que muestra promo
   - ✅ Verificar que el logo se carga correctamente
   - ✅ Verificar en mobile y desktop

---

## 📝 Notas Técnicas

- **Sincronización de favoritos**: Se usa `CustomEvent` con nombre `favoritesUpdated` para sincronizar entre componentes
- **Logos de bancos**: Se intenta cargar desde URL primero, luego desde assets locales, y si falla se oculta el logo
- **Compatibilidad**: Todos los cambios son compatibles con la funcionalidad existente (carrito, cuotas, plan canje, envío, WhatsApp)

---

## 🚀 Próximos Pasos (Opcional)

1. Crear panel de administración para promos de bancos
2. Agregar sistema de fechas para promos (desde/hasta)
3. Agregar múltiples promos por producto
4. Crear vista de "Favoritos" separada
5. Agregar exportación de favoritos

---

## 📦 Archivos Creados/Modificados

### Nuevos
- `src/components/BankPromoBadge.js`
- `src/utils/bankPromosAPI.js`
- `docs/FUNCIONALIDADES_FAVORITOS_OFERTAS_PROMOS.md`

### Modificados
- `src/components/ModernProductCardAirbnb.js`
- `src/catalogo3.js`

---

**Fecha de implementación**: Diciembre 2024
**Estado**: ✅ Completado y funcional

