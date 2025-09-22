// Script para probar el backend en Render
// Ejecutar: node test_render_backend.js

const https = require('https');

// ⚠️ CAMBIAR POR TU URL DE RENDER
const RENDER_URL = 'https://listadeprecios-backend.onrender.com';

console.log('🧪 Probando backend en Render...');
console.log('📍 URL:', RENDER_URL);

// Función para hacer peticiones HTTP
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });
    
    req.on('error', reject);
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

// Pruebas
async function runTests() {
  console.log('\n🔍 1. Probando conectividad básica...');
  try {
    const response = await makeRequest(RENDER_URL);
    console.log('✅ Servidor responde:', response.status);
    console.log('📄 Respuesta:', response.data);
  } catch (error) {
    console.log('❌ Error de conectividad:', error.message);
    return;
  }

  console.log('\n🔐 2. Probando login...');
  try {
    const loginData = JSON.stringify({
      username: 'cocinaty',
      password: '279323'
    });
    
    const response = await makeRequest(`${RENDER_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(loginData)
      },
      body: loginData
    });
    
    console.log('📊 Status:', response.status);
    console.log('📄 Respuesta:', response.data);
    
    if (response.data.success) {
      console.log('✅ Login exitoso!');
    } else {
      console.log('⚠️ Login falló:', response.data.message);
    }
  } catch (error) {
    console.log('❌ Error en login:', error.message);
  }

  console.log('\n👤 3. Probando perfil...');
  try {
    const response = await makeRequest(`${RENDER_URL}/api/profile/cocinaty`);
    console.log('📊 Status:', response.status);
    console.log('📄 Respuesta:', response.data);
    
    if (response.data.success) {
      console.log('✅ Perfil obtenido exitosamente!');
    } else {
      console.log('⚠️ Perfil no encontrado:', response.data.message);
    }
  } catch (error) {
    console.log('❌ Error en perfil:', error.message);
  }

  console.log('\n📊 4. Probando estadísticas...');
  try {
    const response = await makeRequest(`${RENDER_URL}/api/profile/cocinaty/stats`);
    console.log('📊 Status:', response.status);
    console.log('📄 Respuesta:', response.data);
    
    if (response.data.success) {
      console.log('✅ Estadísticas obtenidas exitosamente!');
    } else {
      console.log('⚠️ Estadísticas no encontradas:', response.data.message);
    }
  } catch (error) {
    console.log('❌ Error en estadísticas:', error.message);
  }

  console.log('\n🎯 Resumen de pruebas completado!');
  console.log('\n📝 Próximos pasos:');
  console.log('1. Si las pruebas fallan, verificar configuración en Render');
  console.log('2. Si funcionan, actualizar URL en src/config/api.js');
  console.log('3. Probar frontend con el nuevo backend');
  console.log('4. Remover login mock del frontend');
}

// Ejecutar pruebas
runTests().catch(console.error);
