# 🔍 Diagnóstico: Carrusel de Entrega Inmediata No Visible

## ✅ Cambios Realizados

### 1. **Mejorado el componente FeaturedProductsCarousel**
- ✅ Agregado estado de error
- ✅ Agregado logs detallados en consola para debugging
- ✅ Mejorada la lógica de búsqueda de productos
- ✅ Agregado mensaje de carga
- ✅ Agregado mensaje de error en desarrollo

### 2. **Múltiples Estrategias de Búsqueda**

El componente ahora busca productos de las siguientes formas:

1. **Endpoint específico** (si existe): `/api/entrega-ya`
2. **Filtro por campo `hoja`**: Busca `hoja === 'entrega_ya'` o variantes
3. **Filtro por flags**: Busca productos con:
   - `entrega_ya === 'si'` o `'Sí'` o `'SI'` o `true`
   - `entrega_inmediata === 'si'` o `'Sí'` o `'SI'` o `true`
   - `envio_inmediato === 'si'` o `'Sí'` o `'SI'`

## 🔍 Cómo Diagnosticar el Problema

### Paso 1: Abrir la Consola del Navegador
1. Abrir cualquier catálogo (ej: `/catalogo3`)
2. Presionar `F12` para abrir DevTools
3. Ir a la pestaña **Console**
4. Buscar mensajes que empiecen con:
   - `✅ Productos cargados desde...`
   - `⚠️ Endpoint /api/entrega-ya no existe...`
   - `📦 Total de productos cargados...`
   - `✅ Productos filtrados con entrega inmediata...`
   - `⚠️ No se encontraron productos...`

### Paso 2: Verificar la Estructura de Google Sheets

El componente busca productos con estos campos:
- `precio_negocio` (o `precio_contado`)
- `foto` (o `imagen` o `imagen_banner`)
- `vigencia !== 'no'`

Y uno de estos flags de entrega:
- `entrega_ya`
- `entrega_inmediata`
- `envio_inmediato`
- Campo `hoja` o `sheet` que contenga "entrega_ya"

## 🛠️ Soluciones Posibles

### Solución 1: Agregar Flag en Google Sheets

Si tienes productos en Google Sheets, agrega una columna `entrega_ya` y marca con `si` los productos que quieres mostrar:

| codigo | descripcion | precio_negocio | foto | entrega_ya | vigencia |
|--------|-------------|----------------|------|------------|----------|
| 001    | Sartén...   | 45000          | url  | si         | SI       |

### Solución 2: Crear Endpoint en el Backend

Si tienes una hoja separada llamada "entrega_ya" en Google Sheets, el backend debe exponer un endpoint:

```javascript
// Backend: GET /api/entrega-ya
router.get('/entrega-ya', async (req, res) => {
  try {
    const doc = new GoogleSpreadsheet(SHEET_ID);
    await doc.useServiceAccountAuth(credentials);
    await doc.loadInfo();
    
    const sheet = doc.sheetsByTitle['entrega_ya']; // Nombre de la hoja
    const rows = await sheet.getRows();
    
    const productos = rows.map(row => ({
      codigo: row.codigo,
      descripcion: row.descripcion,
      precio_negocio: row.precio_negocio,
      foto: row.foto,
      linea: row.linea,
      stock: row.stock,
      vigencia: row.vigencia,
      // ... otros campos
    }));
    
    res.json(productos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### Solución 3: Verificar el Nombre de la Hoja

Si la hoja tiene un nombre diferente a "entrega_ya", puedes:
1. Renombrarla a "entrega_ya" en Google Sheets, o
2. Modificar el código del componente para buscar el nombre correcto

## 📋 Checklist de Verificación

- [ ] Abrir consola del navegador en un catálogo
- [ ] Verificar si aparece el mensaje "✅ Productos cargados desde..."
- [ ] Verificar cuántos productos se encontraron
- [ ] Si dice "0 productos", verificar:
  - [ ] Que los productos tengan `precio_negocio` o `precio_contado`
  - [ ] Que tengan `foto` o `imagen`
  - [ ] Que tengan `vigencia !== 'no'`
  - [ ] Que tengan el flag `entrega_ya === 'si'`
- [ ] Verificar el nombre exacto de la hoja en Google Sheets
- [ ] Verificar que el backend esté respondiendo en `/api/productos`

## 🔧 Próximos Pasos

1. **Ejecutar el diagnóstico**: Abrir la consola y ver qué mensajes aparecen
2. **Compartir los logs**: Enviar los mensajes de la consola para identificar el problema exacto
3. **Verificar Google Sheets**: Confirmar el nombre de la hoja y los campos disponibles
4. **Configurar el backend**: Si es necesario, crear el endpoint `/api/entrega-ya`

## 💡 Nota Importante

El componente ahora muestra mensajes informativos en **modo desarrollo** cuando no encuentra productos, para facilitar el debugging. En producción, simplemente no se mostrará el carrusel si no hay productos.



