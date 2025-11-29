# 🔧 PLAN DE ARREGLOS - CARRITO DE COMPRA

## 📋 PROBLEMAS IDENTIFICADOS

### 1. **Cierre del Carrito**
- ✅ Ya tiene lógica de cierre con ESC y overlay
- ⚠️ Necesita verificación de que funcione correctamente
- ⚠️ El overlay puede no estar funcionando correctamente

### 2. **Texto de Cuotas Siempre "3 cuotas"**
- ❌ **PROBLEMA PRINCIPAL**: Cuando se agrega producto desde catálogos, no se pasa información de cuota
- ❌ El componente usa `cuotasTexto` prop que es fijo por catálogo
- ✅ Ya existe función `getCuotaTexto` que intenta obtener cuota del producto
- ⚠️ Los productos agregados desde catálogos no tienen `selectedCuotaKey`, `selectedCuotaValue`, `selectedCuotaLabel`

### 3. **UI/UX**
- ✅ Ya tiene buena estructura
- ⚠️ Puede mejorarse la jerarquía visual
- ⚠️ Responsive puede optimizarse

## 🎯 SOLUCIONES

### Solución 1: Arreglar Cierre del Carrito
- Verificar que `onClose` del Drawer funcione con overlay
- Asegurar que ESC funcione
- Verificar botón X

### Solución 2: Arreglar Cuotas
- Cuando se agrega producto desde catálogo, incluir información de cuota
- Modificar `addToCart` en catálogos para pasar `selectedCuotaKey`, `selectedCuotaValue`, `selectedCuotaLabel`
- Mejorar `getCuotaTexto` para usar información del catálogo si no está en el producto

### Solución 3: Mejorar UI/UX
- Optimizar jerarquía visual
- Mejorar responsive
- Asegurar que acciones principales sean claras
