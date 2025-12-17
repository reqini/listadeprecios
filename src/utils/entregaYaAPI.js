/**
 * API para obtener productos de la hoja "entregas-ya" de Google Sheets
 * 
 * Este servicio conecta con el backend que expone la hoja "entregas-ya"
 * y mapea los datos a un formato consistente para el catálogo.
 * 
 * IMPORTANTE: Solo trae productos de la hoja "entregas-ya", no de otras hojas.
 * 
 * Columnas esperadas en Google Sheets:
 * - codigo / id: Identificador único
 * - nombre / titulo: Nombre del producto
 * - descripcion: Descripción del producto
 * - precio / precio_negocio / precio_lista: Precio del producto
 * - foto / imagen / imagen_url: URL de la imagen
 * - categoria / rubro: Categoría del producto
 * - stock / unidades_disponibles: Stock disponible
 * - vigencia: Vigencia del producto (SI/NO)
 * - linea: Línea del producto
 * - hoja / sheet: Nombre de la hoja (debe ser "entregas-ya")
 * - tags: Tags adicionales (última unidad, nuevo, etc.)
 * - cuotas: Información de cuotas si aplica
 * 
 * El backend debe exponer:
 * - GET /api/entrega-ya (endpoint específico, recomendado)
 * - O alternativamente, filtrar desde GET /api/productos por campo "hoja" = "entregas-ya"
 */
// REMOVIDO: fallbackEntregaya - forzamos carga directa desde Google Sheet
import { parsePrice } from './priceUtils';

/**
 * Normaliza un precio desde diferentes formatos a número
 * @param {string|number} precio - Precio en cualquier formato
 * @returns {number} - Precio normalizado
 */
function normalizarPrecio(precio) {
  if (!precio) return 0;
  
  // Si ya es un número, retornarlo
  if (typeof precio === 'number') {
    return precio;
  }
  
  // Si es string, intentar parsearlo
  if (typeof precio === 'string') {
    // Remover símbolos comunes ($, espacios, comas)
    const cleaned = precio.replace(/[$,\s]/g, '').trim();
    const parsed = parseFloat(cleaned);
    
    // Si es un número válido, retornarlo
    if (!isNaN(parsed)) {
      return parsed;
    }
    
    // Intentar usar parsePrice del utils existente
    try {
      return parsePrice(precio);
    } catch (e) {
      console.warn('No se pudo parsear el precio:', precio);
      return 0;
    }
  }
  
  return 0;
}

/**
 * Mapea una fila de Google Sheets a un objeto de producto consistente
 * @param {Object} row - Fila de datos desde Google Sheets
 * @returns {Object} - Producto mapeado con estructura consistente
 */
export function mapEntregaYaRowToProduct(row) {
  // Normalizar valores de stock
  const stockValue = row.stock || row.unidades_disponibles || row.stock_actual || '0';
  const stock = parseInt(String(stockValue), 10) || 0;
  
  // Determinar si tiene entrega inmediata
  const entregaValue = String(row.entrega_inmediata || row.entrega_ya || row.entrega || '').toUpperCase();
  const entregaInmediata = entregaValue === 'SI' || entregaValue === 'YES' || entregaValue === 'TRUE' || entregaValue === '1';
  
  // Normalizar precio (priorizar precio_negocio, luego precio_preferencial, luego precio, luego precio_lista)
  const precio = normalizarPrecio(
    row.precio_negocio || 
    row.precio_preferencial ||
    row.precio || 
    row.precio_lista || 
    row.precio_contado || 
    row.psvp_lista || 
    0
  );
  
  // Normalizar imagen (buscar en múltiples campos)
  const imagen = row.imagen_url || row.imagen || row.foto || row.fotos || row.imagen_banner || '';
  
  // Normalizar nombre (priorizar descripcion, luego nombre)
  const nombre = row.descripcion || row.nombre || row.titulo || 'Producto sin nombre';
  
  // Normalizar descripción
  const descripcion = row.descripcion || row.detalle || '';
  
  // Normalizar categoría
  const categoria = row.categoria || row.rubro || row.linea || '';
  
  // Normalizar tags
  const tags = row.tags || row.tag || '';
  
  // Determinar si es última unidad
  const esUltimaUnidad = stock === 1 || 
                         String(row.ultima_unidad || row.solo_queda_uno || '').toUpperCase() === 'SI';
  
  // Normalizar vigencia
  const vigenciaValue = String(row.vigencia || 'SI').toUpperCase();
  const vigente = vigenciaValue === 'SI' || vigenciaValue === 'YES' || vigenciaValue === 'TRUE';
  
  // Normalizar campo 'vendido' (si la fila indica que está vendido)
  const vendidoValue = String(row.vendido || row.VENDIDO || row.vendido_flag || '').toUpperCase();
  const vendido = vendidoValue === 'SI' || vendidoValue === 'YES' || vendidoValue === 'TRUE' || vendidoValue === '1';
  
  return {
    id: row.id || row.ID || row.codigo || row._id || null,
    codigo: row.codigo || row.id || row.ID || '',
    nombre: nombre,
    descripcion: descripcion || nombre,
    precio: precio,
    precio_negocio: normalizarPrecio(row.precio_negocio || precio),
    precio_preferencial: normalizarPrecio(row.precio_preferencial || 0),
    // Precio de contado real (traido del campo precio_contado si existe)
    precio_contado: normalizarPrecio(row.precio_contado || row.precio_contado_lista || row.precio || precio),
    // Precio anterior / sugerido proveniente de la hoja (psvp_lista)
    precio_psvp_lista: normalizarPrecio(row.psvp_lista || row.pvsp_lista || row.precio_lista_anterior || 0),
    imagen: imagen,
    foto: imagen, // Mantener compatibilidad
    vendido: vendido,
    vendido_raw: row.vendido || row.VENDIDO || '',
    categoria: categoria,
    linea: row.linea || categoria,
    stock: stock,
    entregaInmediata: entregaInmediata,
    tags: tags,
    cuotas: row.cuotas || '',
    vigente: vigente,
    vigencia: row.vigencia || 'SI',
    esUltimaUnidad: esUltimaUnidad,
    // Campos adicionales de la hoja entregas-ya
    puntos: row.puntos || 0,
    // Mantener datos raw para referencia
    raw: row,
  };
}

/**
 * Obtiene todos los productos de la hoja "entregas-ya"
 * IMPORTANTE: Solo trae productos de esta hoja específica, no de otras hojas.
 * @returns {Promise<Array>} - Array de productos mapeados
 */
export async function getEntregaYaProducts() {
  console.log('🚀 INICIANDO: getEntregaYaProducts()');
  try {
    // Intentar cargar directamente desde Google Sheets (gviz) - prioridad alta
    const SHEET_ID = '1ATl5Avm6NjoiaPrVOG8xw8fLAZeBfuf5HG-sGBMCGQw';
    const GID = '10927216'; // nuevo gid solicitado

    const fetchFromGoogleSheet = async (sheetId, gid) => {
      try {
        console.log(`📡 Intentando cargar desde Google Sheets (id=${sheetId} gid=${gid})`);
        const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json&gid=${gid}`;
        console.log('🔗 URL:', url);
        
        // Usar fetch nativa en lugar de axios para evitar problemas CORS
        const resp = await fetch(url);
        console.log('✅ Respuesta recibida, status:', resp.status);
        
        if (!resp.ok) {
          throw new Error(`HTTP ${resp.status}: ${resp.statusText}`);
        }
        
        const text = await resp.text();
        console.log('📊 Tamaño de respuesta:', text.length, 'caracteres');
        console.log('📋 Primeros 500 caracteres de respuesta:', text.substring(0, 500));
        
        // El endpoint devuelve un callback JS, quitar prefijo/sufijo
        // USAR EL MISMO MÉTODO QUE FUNCIONA EN check_entregaya.js
        const marker = 'google.visualization.Query.setResponse(';
        const startIdx = text.indexOf(marker);
        if (startIdx === -1) {
          console.error('❌ No se encontró el callback de Google Visualization');
          return null;
        }
        const openIdx = startIdx + marker.length;
        const endIdx = text.lastIndexOf(');');
        if (endIdx === -1) {
          console.error('❌ No se encontró el cierre del callback');
          return null;
        }
        const jsonText = text.substring(openIdx, endIdx);
        console.log('🔍 Después de extraer JSON, primeros 300 caracteres:', jsonText.substring(0, 300));
        
        let data;
        try {
          data = JSON.parse(jsonText);
          console.log('✅ JSON parseado correctamente');
        } catch (parseErr) {
          console.error('❌ Error al parsear JSON:', parseErr.message);
          console.log('🔍 JSON inválido recibido:', jsonText.substring(0, 500));
          return null;
        }

        // Construir array de filas con keys desde labels
        const cols = data.table.cols.map(c => (c.label || c.id || '').toString().trim());
        console.log('📋 Columnas encontradas:', cols);
        
        const rows = (data.table.rows || []).map(r => {
          const obj = {};
          (r.c || []).forEach((cell, i) => {
            const key = cols[i] || `col_${i}`;
            obj[key] = cell && cell.v !== null && cell.v !== undefined ? cell.v : '';
          });
          return obj;
        });

        console.log('✅ Google Sheets: filas obtenidas:', rows.length);
        if (rows.length === 0) {
          console.warn('⚠️ Google Sheets devolvió 0 filas');
          return null;
        }
        
        console.log('📋 Primera fila raw:', JSON.stringify(rows[0]));

        // Mapear usando el mapeador existente
        const mapped = rows.map(mapEntregaYaRowToProduct);

        console.log(`✅ Google Sheets: productos mapeados: ${mapped.length}`);
        console.log('📋 Primera fila mapeada:', JSON.stringify(mapped[0]));
        
        // NO FILTRAR - devolver TODOS los productos de la sheet (la sheet gid=10927216 es la de entrega-ya)
        return mapped;
      } catch (err) {
        console.error('❌ Error en fetchFromGoogleSheet:', {
          message: err.message,
          name: err.name,
          code: err.code,
          response: err.response?.status,
        });
        console.warn('⚠️ Falló carga directa desde Google Sheets:', err.message || err);
        return null;
      }
    };

    console.log('⏳ Antes de llamar fetchFromGoogleSheet...');
    const fromSheet = await fetchFromGoogleSheet(SHEET_ID, GID);
    console.log('⏳ Después de fetchFromGoogleSheet, resultado:', fromSheet?.length);
    if (Array.isArray(fromSheet) && fromSheet.length > 0) {
      console.log('✅ Productos cargados directamente desde Google Sheets:', fromSheet.length);
      console.log('✅ Códigos desde Google Sheets:', fromSheet.map(p => p.codigo).join(', '));
      try {
        if (typeof window !== 'undefined') window.__ENTREGAYA_SOURCE = 'google_sheet';
      } catch (e) {
        // no-op
      }
      return fromSheet;
    }

    // Si Google Sheets no devuelve datos, NO usar fallback al backend
    // porque el backend devuelve 5 productos de un filtro diferente
    console.error('❌ CRÍTICO: No se pudieron cargar productos de Google Sheets (id=' + SHEET_ID + ', gid=' + GID + ')');
    console.log('⚠️ Retornando array vacío para forzar que se vea el error al usuario');
    return [];
  } catch (error) {
    console.error('❌ Error al obtener productos de entrega-ya:', error);
    return [];
  }
}

