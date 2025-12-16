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
import axios from './axios';
import fallbackEntregaya from '../data/entregaya_fallback.json';
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
        const resp = await axios.get(url, { responseType: 'text' });
        let text = resp.data;

        // El endpoint devuelve un callback JS, quitar prefijo/sufijo
        const jsonText = text.replace(/^.*?google\.visualization\.Query\.setResponse\(|\);?\s*$/g, '');
        const data = JSON.parse(jsonText);

        // Construir array de filas con keys desde labels
        const cols = data.table.cols.map(c => (c.label || c.id || '').toString().trim());
        const rows = (data.table.rows || []).map(r => {
          const obj = {};
          (r.c || []).forEach((cell, i) => {
            const key = cols[i] || `col_${i}`;
            obj[key] = cell && cell.v !== null && cell.v !== undefined ? cell.v : '';
          });
          return obj;
        });

        console.log('✅ Google Sheets: filas obtenidas:', rows.length);
        if (rows.length === 0) return null;

        // Mapear usando el mapeador existente
        const mapped = rows.map(mapEntregaYaRowToProduct);
        return mapped;
      } catch (err) {
        console.warn('⚠️ Falló carga directa desde Google Sheets:', err.message || err);
        return null;
      }
    };

    const fromSheet = await fetchFromGoogleSheet(SHEET_ID, GID);
    if (Array.isArray(fromSheet) && fromSheet.length > 0) {
      console.log('✅ Productos cargados directamente desde Google Sheets:', fromSheet.length);
      return fromSheet;
    }

    // Si no se pudo cargar la sheet remota, usar JSON local de fallback
    try {
      if (Array.isArray(fallbackEntregaya) && fallbackEntregaya.length > 0) {
        console.log('🔁 Usando fallback local `entregaya_fallback.json` con', fallbackEntregaya.length, 'productos');
        const mappedFallback = fallbackEntregaya.map(mapEntregaYaRowToProduct);
        return mappedFallback;
      }
    } catch (err) {
      console.warn('⚠️ Error mapeando fallback local:', err.message || err);
    }
    // Intentar endpoint específico primero
    try {
      console.log('📡 Intentando cargar desde /api/entrega-ya...');
      const response = await axios.get('/api/entrega-ya');
      console.log('📥 Respuesta recibida de /api/entrega-ya:', {
        status: response.status,
        hasData: !!response.data,
        isArray: Array.isArray(response.data),
        length: Array.isArray(response.data) ? response.data.length : 'N/A',
        firstItem: Array.isArray(response.data) && response.data.length > 0 ? response.data[0] : null,
      });
      
      if (response.data && Array.isArray(response.data)) {
        console.log('✅ Productos cargados desde /api/entrega-ya:', response.data.length);
        console.log('📋 Primeros 3 productos sin mapear:', response.data.slice(0, 3));
        const productosMapeados = response.data.map(mapEntregaYaRowToProduct);
        console.log('✅ Productos mapeados:', productosMapeados.length);
        console.log('📋 Primeros 3 productos mapeados:', productosMapeados.slice(0, 3));
        return productosMapeados;
      }
      
      // Si la respuesta tiene formato { success: true, data: [...] }
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        console.log('✅ Productos cargados desde /api/entrega-ya (formato success):', response.data.data.length);
        console.log('📋 Primeros 3 productos sin mapear:', response.data.data.slice(0, 3));
        const productosMapeados = response.data.data.map(mapEntregaYaRowToProduct);
        console.log('✅ Productos mapeados:', productosMapeados.length);
        return productosMapeados;
      }
    } catch (apiError) {
      console.log('⚠️ Endpoint /api/entrega-ya no existe o falló:', apiError.message);
      console.log('🔄 Intentando fallback desde /api/productos...');
      
      // Fallback: cargar desde productos generales y filtrar SOLO por hoja "entregas-ya"
      console.log('📡 Cargando desde /api/productos...');
      const productosResponse = await axios.get('/api/productos');
      const todosProductos = productosResponse.data || [];
      console.log('📦 Total de productos cargados desde /api/productos:', todosProductos.length);
      
      // Debug: Ver estructura de algunos productos para entender campos disponibles
      if (todosProductos.length > 0) {
        console.log('🔍 Analizando estructura de productos para encontrar hoja "entregas-ya"...');
        const primerosProductos = todosProductos.slice(0, 10);
        console.log('📋 Analizando primeros 10 productos:');
        primerosProductos.forEach((producto, idx) => {
          const hojaEncontrada = String(producto.hoja || producto.sheet || producto.HOJA || producto.SHEET || producto.hoja_nombre || producto.sheet_name || '').toLowerCase().trim();
          console.log(`  ${idx + 1}. Código: ${producto.codigo || producto.id || 'N/A'} | Hoja: "${hojaEncontrada}" | Nombre: ${(producto.descripcion || producto.nombre || '').substring(0, 40)}`);
        });
      }
      
      // FILTRAR SOLO PRODUCTOS DE LA HOJA "entregas-ya"
      // Buscar por campo "hoja" o "sheet" con variantes del nombre
      const productosEntregasYa = [];
      const variantesHoja = [
        'entregas-ya',
        'entregas_ya',
        'entregas ya',
        'entregasya',
        'entrega-ya',
        'entrega_ya',
        'entrega ya',
      ];
      
      console.log('🔍 Filtrando productos de la hoja "entregas-ya"...');
      console.log('📋 Variantes buscadas:', variantesHoja);
      
      // También buscar productos por códigos específicos de la hoja entregas-ya
      const codigosEntregasYa = [
        '38252866', // SARTEN 28CM TERRA
        '38653166', // SARTEN 31CM TERRA (aunque vigencia NO)
        '38351866', // CACEROLA 18CM TERRA
        '38452466', // CACEROLA 24CM TERRA
        '38452866', // CACEROLA 28CM TERRA
        '38752966', // CACEROLA CUADRADA 29CM TERRA
      ];
      
      todosProductos.forEach((producto, index) => {
        // Buscar en TODOS los campos posibles que puedan contener el nombre de la hoja
        const hoja = String(producto.hoja || producto.sheet || producto.HOJA || producto.SHEET || producto.hoja_nombre || producto.sheet_name || '').toLowerCase().trim();
        
        // Verificar si está en la hoja "entregas-ya" (variantes exactas)
        const enHojaEntregasYa = variantesHoja.some(variante => hoja === variante);
        
        // También verificar por código (fallback si no viene el campo hoja)
        const codigo = String(producto.codigo || producto.id || '').trim();
        const esCodigoEntregasYa = codigosEntregasYa.includes(codigo);
        
        // Excluir repuestos y productos no vigentes
        const linea = String(producto?.linea || producto?.LINEA || '').toLowerCase();
        const vigencia = String(producto?.vigencia || producto?.VIGENCIA || 'si').toLowerCase();
        const esRepuesto = linea === 'repuestos';
        const noVigente = vigencia === 'no' || vigencia === false;
        
        const cumpleCriterio = (enHojaEntregasYa || esCodigoEntregasYa) && !esRepuesto && !noVigente;
        
        if (cumpleCriterio) {
          productosEntregasYa.push(producto);
          console.log(`✅ Producto ${productosEntregasYa.length} de entregas-ya encontrado:`, {
            codigo: producto.codigo || producto.id,
            nombre: (producto.descripcion || producto.nombre || '').substring(0, 60),
            hoja: producto.hoja || producto.sheet || 'N/A',
            precio_negocio: producto.precio_negocio || producto.precio || producto.precio_contado,
            vigencia: producto.vigencia,
            linea: producto.linea,
            encontradoPor: enHojaEntregasYa ? 'campo hoja' : 'código',
          });
        }
      });
      
      console.log(`✅ Total de productos encontrados en hoja "entregas-ya": ${productosEntregasYa.length}`);
      
      // Si no encuentra productos, mostrar información detallada de debug
      if (productosEntregasYa.length === 0) {
        console.error('❌ No se encontraron productos en la hoja "entregas-ya"');
        console.log('🔍 Buscando hojas únicas en TODOS los productos...');
        const hojasUnicas = new Map();
        todosProductos.forEach(p => {
          const hoja = String(p.hoja || p.sheet || p.HOJA || p.SHEET || p.hoja_nombre || p.sheet_name || '').toLowerCase().trim();
          if (hoja) {
            hojasUnicas.set(hoja, (hojasUnicas.get(hoja) || 0) + 1);
          }
        });
        const hojasOrdenadas = Array.from(hojasUnicas.entries()).sort((a, b) => b[1] - a[1]);
        console.log('📋 Hojas encontradas (con cantidad de productos):');
        hojasOrdenadas.forEach(([hoja, cantidad]) => {
          console.log(`  - "${hoja}": ${cantidad} productos`);
        });
        console.warn('💡 Verificar que la hoja se llame exactamente "entregas-ya" en Google Sheets');
      }
      
      // Mapear SOLO los productos de la hoja "entregas-ya"
      console.log('🔄 Mapeando productos...');
      const productosMapeados = productosEntregasYa.map((p, idx) => {
        const mapeado = mapEntregaYaRowToProduct(p);
        if (idx < 3) {
          console.log(`  ${idx + 1}. Producto mapeado:`, {
            codigo: mapeado.codigo,
            nombre: mapeado.nombre,
            precio: mapeado.precio,
            imagen: mapeado.imagen ? 'Sí' : 'No',
          });
        }
        return mapeado;
      });
      console.log(`✅ ${productosMapeados.length} productos mapeados correctamente`);
      return productosMapeados;
    }
    
    return [];
  } catch (error) {
    console.error('❌ Error al obtener productos de entrega-ya:', error);
    throw error;
  }
}

