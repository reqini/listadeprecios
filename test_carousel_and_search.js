/**
 * Script de prueba para verificar:
 * 1. Si hay productos con lanzamiento/entrega_inmediata para el carrusel
 * 2. Si el filtro de búsqueda funciona correctamente
 */

const axios = require('axios');

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://backend-catalogosimple.onrender.com';

async function testCarouselProducts() {
  console.log('🔍 Probando productos para el carrusel...\n');
  
  try {
    const response = await axios.get(`${API_BASE_URL}/api/productos`);
    const productos = response.data || [];
    
    console.log(`📦 Total de productos cargados: ${productos.length}\n`);
    
    // Filtrar productos que cumplen condiciones para el carrusel
    const productosParaCarrousel = productos.filter((producto) => {
      // Debe estar vigente
      const vigente = (producto.vigencia || '').toLowerCase() !== 'no';
      if (!vigente) return false;

      // Debe tener lanzamiento o entrega_inmediata
      const esLanzamiento =
        producto.lanzamiento === 'si' ||
        producto.lanzamiento === 'Sí' ||
        producto.lanzamiento === true ||
        producto.lanzamiento === 'SI';
      
      const entregaInmediata =
        producto.entrega_inmediata === 'si' ||
        producto.entrega_inmediata === 'Sí' ||
        producto.entrega_inmediata === true ||
        producto.envio_inmediato === 'si' ||
        producto.envio_inmediato === 'Sí' ||
        producto.entrega_inmediato === 'si';

      if (!esLanzamiento && !entregaInmediata) return false;

      // DEBE tener imagen_banner válida
      const imagenBanner = producto.imagen_banner || producto.imagenBanner || producto.banner_imagen;
      if (!imagenBanner || !imagenBanner.trim()) return false;

      return true;
    });

    console.log(`✅ Productos que cumplen condiciones para carrusel: ${productosParaCarrousel.length}\n`);
    
    if (productosParaCarrousel.length > 0) {
      console.log('📋 Primeros 5 productos del carrusel:');
      productosParaCarrousel.slice(0, 5).forEach((p, i) => {
        console.log(`\n${i + 1}. ${p.descripcion || p.nombre || 'Sin nombre'}`);
        console.log(`   - Lanzamiento: ${p.lanzamiento}`);
        console.log(`   - Entrega Inmediata: ${p.entrega_inmediata || p.envio_inmediato || p.entrega_inmediato}`);
        console.log(`   - Imagen Banner: ${p.imagen_banner || p.imagenBanner || p.banner_imagen}`);
        console.log(`   - Código: ${p.codigo}`);
        console.log(`   - Vigencia: ${p.vigencia}`);
      });
    } else {
      console.log('⚠️  No hay productos que cumplan las condiciones para el carrusel.');
      console.log('\n💡 Para que aparezca el carrusel, los productos deben tener:');
      console.log('   - lanzamiento="si" O entrega_inmediata="si"');
      console.log('   - imagen_banner con URL válida');
      console.log('   - vigencia="SI"');
    }
    
    return productosParaCarrousel;
    
  } catch (error) {
    console.error('❌ Error al obtener productos:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
    return [];
  }
}

async function testSearchFilter() {
  console.log('\n\n🔍 Probando filtro de búsqueda...\n');
  
  try {
    const response = await axios.get(`${API_BASE_URL}/api/productos`);
    const productos = response.data || [];
    
    const productosVigentes = productos.filter(p => (p.vigencia || '').toLowerCase() !== 'no');
    console.log(`📦 Productos vigentes: ${productosVigentes.length}\n`);
    
    // Casos de prueba
    const testCases = [
      { term: 'cocina', description: 'Búsqueda por "cocina"' },
      { term: 'COCINA', description: 'Búsqueda case-insensitive "COCINA"' },
      { term: 'sartén', description: 'Búsqueda por "sartén"' },
      { term: 'marmita', description: 'Búsqueda por "marmita"' },
      { term: '  cocina  ', description: 'Búsqueda con espacios "  cocina  "' },
      { term: 'ess', description: 'Búsqueda parcial "ess"' },
      { term: 'xyz123', description: 'Búsqueda sin resultados "xyz123"' },
      { term: '', description: 'Búsqueda vacía (debe mostrar todos)' },
    ];
    
    // Función de filtrado simplificada (igual a la del frontend)
    function normalizeString(str) {
      if (!str) return '';
      return str
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim();
    }
    
    function filterProducts(productos, searchTerm, onlyActive = true) {
      if (!productos || productos.length === 0) return [];
      
      const searchTrimmed = searchTerm ? searchTerm.trim() : '';
      const normalizedSearch = searchTrimmed ? normalizeString(searchTrimmed) : '';
      
      if (!normalizedSearch) {
        if (onlyActive) {
          return productos.filter((p) => p?.vigencia === "SI");
        }
        return productos;
      }
      
      const results = [];
      for (let i = 0; i < productos.length; i++) {
        const producto = productos[i];
        
        if (onlyActive && producto?.vigencia !== "SI") {
          continue;
        }
        
        const descripcion = normalizeString(producto?.descripcion || '');
        const linea = normalizeString(producto?.linea || '');
        const categoria = normalizeString(producto?.categoria || '');
        const codigo = normalizeString(producto?.codigo?.toString() || '');
        
        if (
          descripcion.includes(normalizedSearch) ||
          linea.includes(normalizedSearch) ||
          categoria.includes(normalizedSearch) ||
          codigo.includes(normalizedSearch)
        ) {
          results.push(producto);
        }
      }
      
      return results;
    }
    
    console.log('🧪 Ejecutando casos de prueba:\n');
    
    testCases.forEach((testCase, index) => {
      const resultados = filterProducts(productosVigentes, testCase.term, true);
      
      const status = resultados.length > 0 || testCase.term === '' ? '✅' : '⚠️';
      console.log(`${status} Test ${index + 1}: ${testCase.description}`);
      console.log(`   Resultados: ${resultados.length} productos`);
      
      if (resultados.length > 0 && resultados.length <= 3) {
        console.log(`   Ejemplos:`);
        resultados.slice(0, 3).forEach(p => {
          console.log(`     - ${p.descripcion || p.nombre || 'Sin nombre'} (${p.codigo || 'sin código'})`);
        });
      } else if (resultados.length > 3) {
        console.log(`   Ejemplos (primeros 3):`);
        resultados.slice(0, 3).forEach(p => {
          console.log(`     - ${p.descripcion || p.nombre || 'Sin nombre'} (${p.codigo || 'sin código'})`);
        });
      }
      console.log('');
    });
    
    // Estadísticas
    console.log('\n📊 Estadísticas:');
    const productosConDescripcion = productosVigentes.filter(p => p.descripcion);
    const productosConLinea = productosVigentes.filter(p => p.linea);
    const productosConCategoria = productosVigentes.filter(p => p.categoria);
    
    console.log(`   - Productos con descripción: ${productosConDescripcion.length}`);
    console.log(`   - Productos con línea: ${productosConLinea.length}`);
    console.log(`   - Productos con categoría: ${productosConCategoria.length}`);
    
  } catch (error) {
    console.error('❌ Error al probar búsqueda:', error.message);
  }
}

async function runTests() {
  console.log('🚀 Iniciando pruebas de Carrousel y Search\n');
  console.log('='.repeat(60));
  
  await testCarouselProducts();
  await testSearchFilter();
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ Pruebas completadas\n');
}

// Ejecutar si se llama directamente
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { testCarouselProducts, testSearchFilter };

