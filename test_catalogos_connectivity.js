// Script para probar conectividad de catálogos
const axios = require('axios');

const BACKENDS = {
  local: 'http://localhost:3001',
  railway: 'https://backtest-production-7f88.up.railway.app',
  render: 'https://backend-catalogosimple.onrender.com'
};

async function testBackend(name, url) {
  console.log(`\n🔍 Probando ${name.toUpperCase()}: ${url}`);
  
  try {
    const response = await axios.get(`${url}/api/productos`, {
      timeout: 10000,
      headers: {
        'Accept': 'application/json'
      }
    });
    
    console.log(`✅ ${name}: OK`);
    console.log(`   Status: ${response.status}`);
    console.log(`   Content-Type: ${response.headers['content-type']}`);
    console.log(`   Productos: ${Array.isArray(response.data) ? response.data.length : 'No es array'}`);
    
    // Verificar productos específicos
    if (Array.isArray(response.data)) {
      const missingProducts = ['90050509', '90050510', '9005011', '9005012'];
      const foundProducts = response.data.filter(p => missingProducts.includes(p.codigo));
      console.log(`   Productos faltantes encontrados: ${foundProducts.length}/4`);
    }
    
    return true;
  } catch (error) {
    console.log(`❌ ${name}: ERROR`);
    console.log(`   Error: ${error.message}`);
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Data: ${error.response.data}`);
    }
    return false;
  }
}

async function testAllBackends() {
  console.log('🚀 INICIANDO PRUEBAS DE CONECTIVIDAD\n');
  
  const results = {};
  
  for (const [name, url] of Object.entries(BACKENDS)) {
    results[name] = await testBackend(name, url);
  }
  
  console.log('\n📊 RESUMEN:');
  console.log('='.repeat(50));
  
  for (const [name, success] of Object.entries(results)) {
    console.log(`${success ? '✅' : '❌'} ${name.toUpperCase()}: ${success ? 'FUNCIONANDO' : 'FALLO'}`);
  }
  
  // Recomendación
  console.log('\n💡 RECOMENDACIÓN:');
  if (results.render) {
    console.log('✅ Usar RENDER (necesita configurar CORS)');
  } else if (results.local) {
    console.log('✅ Usar LOCAL (temporal)');
  } else if (results.railway) {
    console.log('✅ Usar RAILWAY');
  } else {
    console.log('❌ Ningún backend funcionando');
  }
}

// Ejecutar pruebas
testAllBackends().catch(console.error);
