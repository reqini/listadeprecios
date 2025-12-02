# 🔍 Documentación: Buscador Global de Productos

## 📋 Descripción

Herramienta de búsqueda global que permite buscar productos en el catálogo interno y simultáneamente en la web (MercadoLibre, Google, Bing) para comparar precios, encontrar referencias y reseñas.

## 🎯 Características Principales

### ✅ Búsqueda Dual
- **Búsqueda Local**: Busca en el catálogo interno (Google Sheets)
- **Búsqueda Web**: Busca en MercadoLibre, Google Search, Bing simultáneamente
- **Fusión Inteligente**: Combina y rankea resultados por relevancia

### ✅ UI/UX Moderna
- Input con debounce de 400ms
- Búsqueda automática (no requiere botón)
- Loading states con skeleton
- Tabs para organizar resultados
- Mobile-first responsive

### ✅ Exportación
- Exportar a PDF (listado comparativo)
- Exportar a Excel (datos crudos para análisis)
- Exportar a CSV (compatible con hojas de cálculo)

### ✅ Optimizaciones
- Cache en sessionStorage
- Retry automático (2 intentos)
- Cancelación de requests al cambiar búsqueda
- Máximo 20 resultados por fuente
- Performance < 1 segundo en búsqueda local

## 🚀 Uso

### Abrir el Buscador Global

El buscador puede abrirse desde:

1. **Botón en Navbar** (si está implementado)
2. **Ruta directa**: `/busqueda-global`
3. **Desde código**: Importar y usar el componente

```jsx
import GlobalProductSearch from './components/GlobalProductSearch';

// En tu componente
const [showGlobalSearch, setShowGlobalSearch] = useState(false);

{showGlobalSearch && (
  <GlobalProductSearch
    onClose={() => setShowGlobalSearch(false)}
    onProductClick={(product) => {
      // Manejar click en producto
    }}
  />
)}
```

### Usar el Buscador

1. Escribe al menos 2 caracteres en el input
2. La búsqueda se ejecuta automáticamente después de 400ms
3. Los resultados se muestran en tabs:
   - **Catálogo**: Resultados del catálogo interno
   - **Web**: Resultados de MercadoLibre, Google, Bing
   - **Comparaciones**: Productos similares encontrados en múltiples fuentes

### Exportar Resultados

1. Busca productos
2. Haz click en el botón de exportación (PDF/Excel)
3. Se descargará un archivo con todos los resultados

## 🔧 Configuración

### Variables de Entorno

Para habilitar búsquedas web, configurar en `.env`:

```env
# Google Custom Search API (opcional)
REACT_APP_GOOGLE_SEARCH_API_KEY=your_google_api_key
REACT_APP_GOOGLE_SEARCH_ENGINE_ID=your_search_engine_id

# Bing Search API (opcional)
REACT_APP_BING_SEARCH_API_KEY=your_bing_api_key
```

**Nota**: MercadoLibre no requiere API key (es pública).

### Obtener API Keys

#### Google Custom Search API
1. Ir a [Google Cloud Console](https://console.cloud.google.com/)
2. Crear proyecto o seleccionar existente
3. Habilitar "Custom Search API"
4. Crear credenciales (API Key)
5. Crear Custom Search Engine en [cse.google.com](https://cse.google.com/)

#### Bing Search API
1. Ir a [Azure Portal](https://portal.azure.com/)
2. Crear recurso "Bing Search v7"
3. Obtener la Subscription Key

## 📁 Estructura de Archivos

```
src/
├── components/
│   └── GlobalProductSearch.js       # Componente principal
├── services/
│   └── webSearchAPI.js              # APIs de búsqueda web
├── utils/
│   ├── mergeSearchResults.js        # Fusión y ranking de resultados
│   └── exportSearchResults.js       # Exportación PDF/Excel/CSV
└── docs/
    └── BUSCADOR_GLOBAL.md           # Esta documentación
```

## 🧩 Componentes

### GlobalProductSearch

Componente principal del buscador.

**Props:**
- `onProductClick?: (product) => void` - Callback cuando se hace click en un producto
- `onClose?: () => void` - Callback cuando se cierra el modal

**Estado interno:**
- `searchTerm`: Término de búsqueda
- `loading`: Estado de carga
- `error`: Errores de búsqueda
- `mergedResults`: Resultados fusionados

### ProductCard

Card para mostrar productos locales.

### WebProductCard

Card para mostrar productos de la web.

## 🔍 Servicios de Búsqueda

### searchMercadoLibre(query)

Busca productos en MercadoLibre Argentina.

**Parámetros:**
- `query` (string): Término de búsqueda

**Retorna:**
- Array de productos con: nombre, precio, imagen, tienda, URL, calificación, etc.

**Limitaciones:**
- Máximo 20 resultados
- Solo productos de Argentina (MLA)

### searchGoogle(query)

Busca en Google usando Custom Search API.

**Requisitos:**
- API Key configurada
- Search Engine ID configurado

**Retorna:**
- Array de resultados web con precios extraídos del texto

### searchBing(query)

Busca en Bing Web Search API.

**Requisitos:**
- API Key configurada

**Retorna:**
- Array de resultados web

### searchAllSources(query)

Ejecuta todas las búsquedas en paralelo.

**Retorna:**
```javascript
{
  mercadolibre: [...],
  google: [...],
  bing: [...],
  error: null
}
```

## 🔄 Fusión de Resultados

### mergeSearchResults(localResults, webResults, query)

Fusiona y rankea resultados de múltiples fuentes.

**Algoritmo de Ranking:**

**Local:**
- Coincidencia exacta en nombre: +100
- Coincidencia parcial en nombre: +50
- Coincidencia en descripción: +30
- Producto vigente: +5
- Stock disponible: +3

**Web:**
- Coincidencia exacta: +100
- Coincidencia parcial: +50
- Precio disponible: +10
- Calificación alta (≥4.5): +15
- Envío gratis: +5
- Priorizar MercadoLibre: +10

**Retorna:**
```javascript
{
  local: [...],           // Resultados locales rankeados
  web: [...],            // Resultados web rankeados
  comparisons: [...],    // Comparaciones de precios
  cheapest: {...},       // Producto más barato
  stats: {
    totalLocal: number,
    totalWeb: number,
    totalComparisons: number,
    query: string,
    timestamp: string
  }
}
```

## 📤 Exportación

### Formatos Soportados

#### PDF
- Listado visual con tablas
- Separado por secciones (Local, Web, Comparaciones)
- Incluye fecha y término de búsqueda
- Formato tipo comparador de precios

#### Excel
- Múltiples hojas:
  - Resumen
  - Catálogo Interno
  - Resultados Web
  - Comparaciones
- Datos estructurados para análisis

#### CSV
- Todos los resultados en un solo archivo
- Campos: Tipo, Producto, Precio, Tienda, URL, etc.
- Compatible con Google Sheets, Excel

### Uso

```javascript
import { exportSearchResults } from '../utils/exportSearchResults';

// Exportar PDF
await exportSearchResults(results, 'pdf', query);

// Exportar Excel
await exportSearchResults(results, 'excel', query);

// Exportar CSV
await exportSearchResults(results, 'csv', query);
```

## 🐛 Manejo de Errores

### Errores Comunes

1. **Sin conexión**: Muestra error amigable, permite retry
2. **API no configurada**: Omite esa fuente, continúa con otras
3. **Timeout**: 5 segundos por fuente, continúa con resultados parciales
4. **Sin resultados**: Mensaje claro, no rompe la UI

### Retry Automático

- Máximo 2 reintentos automáticos
- Delay de 1 segundo entre reintentos
- Solo si falla la búsqueda general

## ⚡ Performance

### Optimizaciones Implementadas

1. **Debounce**: 400ms para evitar búsquedas excesivas
2. **Cache**: sessionStorage para evitar búsquedas repetidas
3. **AbortController**: Cancela requests al cambiar búsqueda
4. **Parallelización**: Búsquedas web en paralelo
5. **Límites**: Máximo 20 resultados por fuente
6. **Memoización**: Resultados memoizados

### Métricas Objetivo

- Búsqueda local: < 500ms
- Búsqueda web: < 3 segundos (total)
- Renderizado: < 100ms

## 🧪 Tests

### Tests Unitarios

```javascript
// Tests para mergeSearchResults
- Debe rankear correctamente por relevancia
- Debe encontrar comparaciones
- Debe identificar el más barato

// Tests para webSearchAPI
- Debe manejar errores de API
- Debe parsear resultados correctamente
- Debe extraer precios del texto
```

### Tests de Integración

```javascript
// Tests para GlobalProductSearch
- Debe buscar al escribir
- Debe mostrar loading state
- Debe exportar correctamente
- Debe manejar errores sin romper UI
```

## 📝 Agregar Más APIs

### Paso 1: Crear función de búsqueda

En `src/services/webSearchAPI.js`:

```javascript
export async function searchNuevaAPI(query) {
  try {
    const apiKey = process.env.REACT_APP_NUEVA_API_KEY;
    const response = await fetch(`...`);
    const data = await response.json();
    
    // Mapear a formato estándar
    return data.results.map(item => ({
      id: item.id,
      nombre: item.title,
      precio: item.price,
      tienda: 'Nueva Tienda',
      url: item.link,
      fuente: 'nuevaapi',
      // ... otros campos
    }));
  } catch (error) {
    console.error('Error:', error);
    return [];
  }
}
```

### Paso 2: Agregar a searchAllSources

```javascript
export async function searchAllSources(query) {
  // ...
  const [mercadolibre, google, bing, nuevaapi] = await Promise.allSettled([
    // ... existentes
    searchNuevaAPI(searchTerm),
  ]);
  
  return {
    mercadolibre: ...,
    google: ...,
    bing: ...,
    nuevaapi: nuevaapi.status === 'fulfilled' ? nuevaapi.value : [],
  };
}
```

### Paso 3: Actualizar mergeSearchResults

Agregar `nuevaapi` al array de resultados web:

```javascript
const allWebResults = [
  ...(webResults.mercadolibre || []),
  ...(webResults.google || []),
  ...(webResults.bing || []),
  ...(webResults.nuevaapi || []), // Nueva fuente
];
```

## 🎨 Personalización

### Cambiar Ranking de Relevancia

Editar `src/utils/mergeSearchResults.js`:

```javascript
function rankLocalResults(results, query) {
  return results.map(result => {
    let score = 0;
    // Ajustar pesos aquí
    if (nombre.includes(query)) score += 50; // Cambiar este valor
    // ...
  });
}
```

### Cambiar Debounce

En `GlobalProductSearch.js`:

```javascript
const debouncedSearch = useDebounce(searchTerm, 400); // Cambiar 400ms
```

### Cambiar Límite de Resultados

En `mergeSearchResults.js`:

```javascript
local: rankedLocal.slice(0, 20), // Cambiar 20
web: rankedWeb.slice(0, 60),     // Cambiar 60
```

## 🚨 Troubleshooting

### Problema: No aparecen resultados web

**Solución:**
1. Verificar que las API keys estén configuradas
2. Revisar console para errores de API
3. MercadoLibre debería funcionar sin configuración

### Problema: Exportación no funciona

**Solución:**
1. Verificar que jspdf y xlsx estén instalados
2. Revisar permisos del navegador para descargas
3. Verificar que haya resultados para exportar

### Problema: Búsqueda muy lenta

**Solución:**
1. Verificar conexión a internet
2. Revisar timeout de APIs (actualmente 5 segundos)
3. Considerar reducir límite de resultados

## 📊 Estadísticas de Búsqueda

Cada búsqueda guarda estadísticas:

```javascript
{
  totalLocal: number,
  totalWeb: number,
  totalComparisons: number,
  query: string,
  timestamp: string
}
```

Estas se incluyen en las exportaciones.

## 🔐 Seguridad

- API keys solo en variables de entorno (nunca en código)
- No se exponen keys al cliente (solo keys públicas como MercadoLibre)
- Validación de input (mínimo 2 caracteres)
- Timeout en requests para evitar esperas infinitas

## 🎯 Próximas Mejoras

- [ ] Autocompletado de búsquedas
- [ ] Filtros avanzados (precio, tienda, calificación)
- [ ] Guardar búsquedas favoritas
- [ ] Notificaciones de cambios de precio
- [ ] Integración con más marketplaces
- [ ] Gráficos de comparación de precios

## 📞 Soporte

Para problemas o preguntas:
1. Revisar esta documentación
2. Revisar logs en consola
3. Verificar configuración de APIs
4. Consultar tests para ejemplos de uso

