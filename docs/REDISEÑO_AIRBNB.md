# 🎨 REDISEÑO UI/UX CATÁLOGO SIMPLE - Estilo Airbnb

## 📋 Resumen del Proyecto

Rediseño completo de la interfaz de Catálogo Simple aplicando una estética minimalista tipo Airbnb, manteniendo TODA la funcionalidad existente intacta.

## ✅ Componentes Creados/Mejorados

### 1. ModernProductCardAirbnb
**Archivo**: `src/components/ModernProductCardAirbnb.js`

**Características**:
- ✅ Mobile-first con imagen protagonista (ratio 1:1 en mobile, 4:3 en desktop)
- ✅ Estilo minimalista tipo Airbnb (bordes redondeados, sombras sutiles)
- ✅ Modal fullscreen para imágenes con zoom
- ✅ Pinch-to-zoom en mobile (gestos táctiles)
- ✅ Badges minimalistas opcionales (Nuevo, Más vendido, Últimas unidades)
- ✅ Mantiene TODA la lógica original de:
  - Cálculo de cuotas
  - Costo de envío dinámico
  - Precio de negocio
  - Ficha técnica
  - WhatsApp

**Props**:
```javascript
{
  product,           // Objeto producto (igual que ProductsCalatogo)
  selectedCuota,     // String: "3 cuotas sin interés"
  isContado,         // Boolean
  onAddToCart,       // Función callback
  isNew,             // Boolean opcional - Badge "Nuevo"
  isBestSeller,      // Boolean opcional - Badge "Más vendido"
  stockLow,          // Boolean opcional - Badge "Últimas unidades"
}
```

### 2. StickySearchBar
**Archivo**: `src/components/StickySearchBar.js`

**Características**:
- ✅ Se fija en la parte superior al hacer scroll (> 100px)
- ✅ Animación suave tipo Airbnb
- ✅ Backdrop blur cuando está sticky
- ✅ Bordes redondeados y sombra suave
- ✅ Responsive

**Props**:
```javascript
{
  value,           // String - valor del input
  onChange,        // Function - handler onChange
  placeholder      // String - placeholder text
}
```

### 3. ModernCartBottomSheet
**Archivo**: `src/components/ModernCartBottomSheet.js`

**Características**:
- ✅ Bottom sheet en mobile (desde abajo)
- ✅ Drawer lateral en desktop
- ✅ Botón flotante cuando hay productos
- ✅ Lista limpia con imagen, nombre, cuotas, precio
- ✅ Botón eliminar por item
- ✅ Botón CTA principal destacado
- ✅ Mantiene TODA la lógica del carrito original

**Props**:
```javascript
{
  cart,           // Array de productos
  setCart,        // Function - setter del carrito
  cuotaKey,       // String: "tres_sin_interes"
  cuotasTexto     // String: "3 cuotas"
}
```

## 🎨 Estilo Visual Tipo Airbnb

### Paleta de Colores
- **Fondo principal**: `#FFFFFF`
- **Texto principal**: `#222222`
- **Texto secundario**: `#717171`
- **Bordes**: `rgba(0,0,0,0.08)`
- **Acentos**: Color primario del tema
- **Rojo (descuentos/badges)**: `#FF385C`

### Tipografía
- **Títulos**: 600-700 weight, tamaño responsive
- **Texto**: 400-500 weight
- **Caption**: 500 weight, uppercase con letter-spacing

### Espaciado
- **Cards gap**: `3` en mobile, `4` en desktop
- **Padding interno**: `16px` mobile, `20px` desktop
- **Margin entre secciones**: `4-5` rem

### Sombras y Bordes
- **Cards**: `0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)`
- **Hover**: `0 4px 12px rgba(0,0,0,0.15), 0 2px 4px rgba(0,0,0,0.1)`
- **Bordes**: `1px solid rgba(0,0,0,0.08)`
- **Border radius**: `2` mobile, `3` desktop

## 📱 Layout Mobile-First

### Grid Responsive
```javascript
gridTemplateColumns: {
  xs: '1fr',              // Mobile: 1 card por fila
  sm: 'repeat(2, 1fr)',   // Tablet: 2 columnas
  md: 'repeat(2, 1fr)',   // Desktop pequeño: 2 columnas
  lg: 'repeat(3, 1fr)',   // Desktop grande: 3 columnas
}
```

### Imagen Protagonista
- **Mobile**: Aspect ratio 1:1 (paddingTop: '100%')
- **Desktop**: Aspect ratio 4:3 (paddingTop: '75%')
- **Hover**: Scale 1.05 con transición suave
- **Click**: Abre modal fullscreen

## 🔍 Modal Fullscreen de Imagen

### Características
- ✅ Fondo negro semi-transparente (`rgba(0,0,0,0.95)`)
- ✅ Imagen centrada con object-fit contain
- ✅ Botón cerrar en esquina superior derecha
- ✅ Zoom con click (1x → 2x → 1x)
- ✅ Zoom con rueda del mouse (1x → 3x)
- ✅ **Pinch-to-zoom en mobile** (1x → 5x)
- ✅ Arrastrar cuando está zoomed

### Implementación Touch
```javascript
handleTouchStart: Detecta dos dedos, calcula distancia inicial
handleTouchMove: Calcula escala relativa, actualiza zoom
handleTouchEnd: Resetea estado de toque
```

## 🛒 Carrito Mejorado

### Mobile (Bottom Sheet)
- Se abre desde abajo
- Ocupa hasta 90vh
- Bordes superiores redondeados (16px)
- Header fijo con total
- Scroll interno para productos

### Desktop (Drawer)
- Drawer lateral o modal centrado
- Max width 600px
- Mismo diseño limpio

### Items del Carrito
- Imagen 80x80px con border-radius
- Nombre truncado a 2 líneas
- Cuotas y precio destacados
- Botón eliminar discreto

## 📂 Archivos Modificados

### Componentes Nuevos
- ✅ `src/components/ModernProductCardAirbnb.js` - Card moderna
- ✅ `src/components/StickySearchBar.js` - Buscador sticky
- ✅ `src/components/ModernCartBottomSheet.js` - Carrito moderno

### Catálogos Actualizados
- ✅ `src/catalogo3.js` - Ya usa componentes modernos
- ✅ `src/catalogo6.js` - Actualizado

### Pendientes
- ⏳ `src/catalogo9.js`
- ⏳ `src/catalogo10.js`
- ⏳ `src/catalogo12.js`
- ⏳ `src/catalogo14.js`
- ⏳ `src/catalogo15.js`
- ⏳ `src/catalogo18.js`
- ⏳ `src/catalogo20.js`
- ⏳ `src/catalogo24.js`
- ⏳ `src/home.js` (catálogo principal)

## 🔧 Funcionalidad Mantenida

### Lógica de Negocio Intacta
- ✅ Cálculo de cuotas desde Google Sheets
- ✅ Precio de negocio vs precio lista
- ✅ Costo de envío dinámico desde localStorage
- ✅ Lógica de `sumarEnvio` y `aplicaEnvio`
- ✅ Filtrado por línea (excluir repuestos)
- ✅ Sistema de favoritos
- ✅ Tracking de analytics (GA)

### Props Compatibles
- ✅ Misma estructura de `product`
- ✅ Mismo formato de `selectedCuota`
- ✅ Mismo callback `onAddToCart`
- ✅ Compatible con `isContado`

## 📝 Próximos Pasos

1. ⏳ Actualizar todos los catálogos restantes (9, 10, 12, 14, 15, 18, 20, 24)
2. ⏳ Actualizar home.js para usar componentes modernos
3. ⏳ Agregar lógica para detectar badges desde datos (mas_vendida, stock bajo, etc.)
4. ⏳ Testing en dispositivos móviles reales
5. ⏳ Optimización de performance

## 🎯 Objetivos Logrados

- ✅ Estética minimalista tipo Airbnb
- ✅ Mobile-first real
- ✅ Imagen protagonista
- ✅ Buscador sticky elegante
- ✅ Modal fullscreen con pinch-to-zoom
- ✅ Carrito mejorado con bottom sheet
- ✅ **Funcionalidad 100% preservada**

---

**Fecha**: ${new Date().toLocaleDateString('es-AR')}
**Estado**: ✅ En progreso - Catalogo3 y Catalogo6 completados

