# Configuración de Búsqueda IA

## Descripción
La funcionalidad de Búsqueda IA permite buscar material multimedia de productos Essen en toda la internet usando inteligencia artificial.

## Características
- 🔍 Búsqueda inteligente en web, imágenes, videos y PDFs
- 🎯 Resultados específicos para productos Essen
- 📱 Interfaz responsive y moderna
- 🎨 Cards diferenciadas por tipo de contenido
- 📥 Descarga directa de archivos
- 🔄 Búsqueda en tiempo real

## Configuración de APIs

### 1. Google Custom Search API (Recomendado)

#### Paso 1: Crear proyecto en Google Cloud Console
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la API "Custom Search API"

#### Paso 2: Crear credenciales
1. Ve a "Credenciales" en el menú lateral
2. Haz clic en "Crear credenciales" > "Clave de API"
3. Copia la clave generada

#### Paso 3: Crear Custom Search Engine
1. Ve a [Google Custom Search](https://cse.google.com/)
2. Haz clic en "Agregar"
3. Configura:
   - **Sitios a buscar**: `essen.com.ar`, `youtube.com`, `instagram.com`
   - **Idioma**: Español
   - **Región**: Argentina
4. Copia el ID del motor de búsqueda

#### Paso 4: Configurar variables de entorno
Crea un archivo `.env.local` en la raíz del proyecto:

```env
REACT_APP_GOOGLE_API_KEY=tu_google_api_key_aqui
REACT_APP_GOOGLE_CSE_ID=tu_google_custom_search_engine_id_aqui
```

### 2. Bing Search API (Opcional)

#### Paso 1: Obtener clave de API
1. Ve a [Azure Portal](https://portal.azure.com/)
2. Crea un recurso "Bing Search v7"
3. Copia la clave de API

#### Paso 2: Configurar variable de entorno
```env
REACT_APP_BING_API_KEY=tu_bing_api_key_aqui
```

### 3. SerpAPI (Opcional)

#### Paso 1: Registrarse en SerpAPI
1. Ve a [SerpAPI](https://serpapi.com/)
2. Crea una cuenta gratuita
3. Copia tu clave de API

#### Paso 2: Configurar variable de entorno
```env
REACT_APP_SERPAPI_KEY=tu_serpapi_key_aqui
```

## Uso

### Acceso
1. Inicia sesión en la aplicación
2. Ve al menú hamburguesa (☰)
3. Selecciona "Búsqueda IA" 🤖

### Búsqueda
1. Escribe el nombre del producto Essen (ej: "Sartén Express")
2. Haz clic en "Buscar" o presiona Enter
3. Explora los resultados organizados por tipo de contenido

### Tipos de contenido soportados
- **📄 PDF**: Manuales, catálogos, fichas técnicas
- **🎥 Video**: Tutoriales, recetas, demostraciones
- **🖼️ Imagen**: Fotos de productos, recetas visuales
- **🎞️ GIF**: Animaciones rápidas, procesos paso a paso
- **🌐 Web**: Páginas web, artículos, blogs

### Funcionalidades
- **Vista previa**: Haz clic en cualquier card para ver el contenido
- **Descarga**: Botón de descarga en cada resultado
- **Filtrado**: Resultados ordenados por relevancia
- **Responsive**: Funciona en móvil y desktop

## Límites y consideraciones

### Google Custom Search API
- **Gratuito**: 100 búsquedas por día
- **Pago**: $5 por 1000 búsquedas adicionales
- **Límite**: 10 resultados por búsqueda

### Bing Search API
- **Gratuito**: 1000 búsquedas por mes
- **Pago**: $5 por 1000 búsquedas adicionales

### SerpAPI
- **Gratuito**: 100 búsquedas por mes
- **Pago**: Desde $50/mes para más búsquedas

## Desarrollo

### Modo de desarrollo
Si no tienes configuradas las APIs, la aplicación usará datos simulados para desarrollo y testing.

### Estructura de archivos
```
src/
├── components/
│   └── BusquedaIA.js          # Componente principal
├── services/
│   └── searchAPI.js           # Servicio de búsqueda
└── ...
```

### Personalización
Puedes modificar el servicio `searchAPI.js` para:
- Agregar nuevas fuentes de búsqueda
- Cambiar la lógica de relevancia
- Personalizar los filtros
- Agregar nuevos tipos de contenido

## Troubleshooting

### Error: "API key not found"
- Verifica que las variables de entorno estén configuradas correctamente
- Reinicia el servidor de desarrollo después de agregar las variables

### Error: "Quota exceeded"
- Has alcanzado el límite de búsquedas de la API
- Considera actualizar a un plan de pago o esperar hasta el siguiente período

### Error: "No results found"
- Verifica que el Custom Search Engine esté configurado correctamente
- Asegúrate de que los sitios web estén incluidos en la configuración

### Resultados no relevantes
- Ajusta la configuración del Custom Search Engine
- Modifica los filtros en el código para mejorar la relevancia

## Soporte
Para problemas técnicos o preguntas sobre la configuración, contacta al equipo de desarrollo.
