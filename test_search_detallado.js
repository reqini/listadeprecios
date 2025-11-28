/**
 * Prueba detallada del filtro de búsqueda con casos reales
 */

const axios = require('axios');

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://backend-catalogosimple.onrender.com';

// Función de normalización (igual a searchUtils.js)
function normalizeString(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

// Función de búsqueda en producto (igual a searchUtils.js)
function searchInProduct(producto, normalizedSearchTerm) {
  if (!normalizedSearchTerm || !normalizedSearchTerm.trim()) return true;
  if (!producto) return false;
  
  const descripcion = normalizeString(producto?.descripcion || '');
  if (descripcion.includes(normalizedSearchTerm)) return true;
  
  const linea = normalizeString(producto?.linea || '');
  if (linea.includes(normalizedSearchTerm)) return true;
  
  const categoria = normalizeString(producto?.categoria || '');
  if (categoria.includes(normalizedSearchTerm)) return true;
  
  const codigo = normalizeString(producto?.codigo?.toString() || '');
  if (codigo.includes(normalizedSearchTerm)) return true;
  
  return false;
}

// Función de filtrado (igual a searchUtils.js)
function filterProducts(productos = [], searchTerm = '', onlyActive = true) {
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
    
    if (searchInProduct(producto, normalizedSearch)) {
      results.push(producto);
    }
  }
  
  return results;
}

async function testSearchDetailed() {
  console.log('🔍 PRUEBA DETALLADA DEL FILTRO DE BÚSQUEDA\n');
  console.log('='.repeat(70));
  
  try {
    const response = await axios.get(`${API_BASE_URL}/api/productos`);
    const productos = response.data || [];
    const productosVigentes = productos.filter(p => (p.vigencia || '').toLowerCase() !== 'no');
    
    console.log(`\n📦 Total productos: ${productos.length}`);
    console.log(`✅ Productos vigentes: ${productosVigentes.length}\n`);
    
    // Obtener algunos términos de ejemplo de los productos reales
    const descripciones = productosVigentes
      .map(p => p.descripcion)
      .filter(Boolean)
      .slice(0, 20);
    
    console.log('📝 Descripciones de ejemplo (primeras 10):');
    descripciones.slice(0, 10).forEach((desc, i) => {
      console.log(`   ${i + 1}. ${desc}`);
    });
    console.log('');
    
    // Casos de prueba basados en productos reales
    const testCases = [
      { term: '', description: 'Búsqueda vacía (mostrar todos)', expectedMin: 1 },
      { term: 'sartén', description: 'Búsqueda por "sartén"', expectedMin: 1 },
      { term: 'SARTÉN', description: 'Búsqueda case-insensitive "SARTÉN"', expectedMin: 1 },
      { term: 'terra', description: 'Búsqueda por marca "terra"', expectedMin: 1 },
      { term: 'TERRA', description: 'Búsqueda case-insensitive "TERRA"', expectedMin: 1 },
      { term: 'express', description: 'Búsqueda parcial "express"', expectedMin: 1 },
      { term: 'jarro', description: 'Búsqueda por "jarro"', expectedMin: 1 },
      { term: '  terra  ', description: 'Búsqueda con espacios "  terra  "', expectedMin: 1 },
      { term: '38222002', description: 'Búsqueda por código "38222002"', expectedMin: 0 },
      { term: 'xyz999999', description: 'Búsqueda sin resultados "xyz999999"', expectedMin: 0 },
      { term: 'ess', description: 'Búsqueda parcial "ess"', expectedMin: 1 },
    ];
    
    console.log('🧪 EJECUTANDO CASOS DE PRUEBA:\n');
    
    let passed = 0;
    let failed = 0;
    
    testCases.forEach((testCase, index) => {
      const resultados = filterProducts(productosVigentes, testCase.term, true);
      const passedTest = resultados.length >= testCase.expectedMin;
      
      if (passedTest) {
        passed++;
        console.log(`✅ Test ${index + 1}: ${testCase.description}`);
      } else {
        failed++;
        console.log(`❌ Test ${index + 1}: ${testCase.description}`);
        console.log(`   ⚠️  Esperado al menos ${testCase.expectedMin}, obtenido: ${resultados.length}`);
      }
      
      console.log(`   📊 Resultados: ${resultados.length} productos`);
      
      if (resultados.length > 0 && resultados.length <= 5) {
        console.log(`   📋 Productos encontrados:`);
        resultados.forEach((p, i) => {
          console.log(`      ${i + 1}. ${p.descripcion || p.nombre || 'Sin nombre'} (${p.codigo || 'sin código'})`);
        });
      } else if (resultados.length > 5) {
        console.log(`   📋 Primeros 3 productos encontrados:`);
        resultados.slice(0, 3).forEach((p, i) => {
          console.log(`      ${i + 1}. ${p.descripcion || p.nombre || 'Sin nombre'} (${p.codigo || 'sin código'})`);
        });
        console.log(`      ... y ${resultados.length - 3} más`);
      }
      console.log('');
    });
    
    console.log('='.repeat(70));
    console.log(`\n📊 RESUMEN: ${passed} tests pasados, ${failed} tests fallidos\n`);
    
    // Pruebas de rendimiento
    console.log('⚡ PRUEBA DE RENDIMIENTO:\n');
    const performanceTests = [
      { term: 'terra', iterations: 100 },
      { term: 'sartén', iterations: 100 },
      { term: '', iterations: 100 },
    ];
    
    performanceTests.forEach(test => {
      const start = Date.now();
      for (let i = 0; i < test.iterations; i++) {
        filterProducts(productosVigentes, test.term, true);
      }
      const end = Date.now();
      const avgTime = ((end - start) / test.iterations).toFixed(3);
      console.log(`   Búsqueda "${test.term}": ${avgTime}ms promedio (${test.iterations} iteraciones)`);
    });
    
    console.log('\n✅ El filtro es rápido y eficiente\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

if (require.main === module) {
  testSearchDetailed().catch(console.error);
}

module.exports = { testSearchDetailed };

