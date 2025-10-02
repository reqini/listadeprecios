// Script de prueba para el panel de administración
const axios = require('axios');

const BASE_URL = 'https://backend-catalogosimple.onrender.com';

// Función para hacer login y obtener token
async function login() {
  try {
    console.log('🔐 Iniciando sesión como cocinaty...');
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      username: 'cocinaty',
      password: '279323'
    });
    
    if (response.data.success) {
      console.log('✅ Login exitoso');
      return response.data.token;
    } else {
      throw new Error('Login falló');
    }
  } catch (error) {
    console.error('❌ Error en login:', error.response?.data || error.message);
    return null;
  }
}

// Función para probar endpoint de costos
async function testCostos(token) {
  try {
    console.log('\n📊 Probando GET /api/admin/costos...');
    const response = await axios.get(`${BASE_URL}/api/admin/costos`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ GET costos exitoso:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error en GET costos:', error.response?.data || error.message);
    return null;
  }
}

// Función para probar actualización de costos
async function testUpdateCostos(token) {
  try {
    console.log('\n💾 Probando PUT /api/admin/costos...');
    const newCostos = {
      costoEnvio: 20000,
      costoPlanCanje: 5000
    };
    
    const response = await axios.put(`${BASE_URL}/api/admin/costos`, newCostos, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ PUT costos exitoso:', response.data);
    
    // Verificar que se actualizó
    console.log('\n🔄 Verificando actualización...');
    const verifyResponse = await axios.get(`${BASE_URL}/api/admin/costos`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Verificación exitosa:', verifyResponse.data);
    
    // Restaurar valores originales
    console.log('\n🔄 Restaurando valores originales...');
    await axios.put(`${BASE_URL}/api/admin/costos`, {
      costoEnvio: 21036,
      costoPlanCanje: 0
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Valores restaurados');
    
  } catch (error) {
    console.error('❌ Error en PUT costos:', error.response?.data || error.message);
  }
}

// Función para probar acceso no autorizado
async function testUnauthorizedAccess() {
  try {
    console.log('\n🚫 Probando acceso no autorizado...');
    const response = await axios.get(`${BASE_URL}/api/admin/costos`);
    console.log('❌ ERROR: Debería haber fallado:', response.data);
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ Correcto: Acceso denegado sin token');
    } else {
      console.error('❌ Error inesperado:', error.response?.data || error.message);
    }
  }
}

// Función principal
async function runTests() {
  console.log('🧪 INICIANDO PRUEBAS DEL PANEL DE ADMINISTRACIÓN\n');
  
  // 1. Probar acceso no autorizado
  await testUnauthorizedAccess();
  
  // 2. Hacer login
  const token = await login();
  if (!token) {
    console.log('❌ No se pudo obtener token. Abortando pruebas.');
    return;
  }
  
  // 3. Probar GET costos
  await testCostos(token);
  
  // 4. Probar PUT costos
  await testUpdateCostos(token);
  
  console.log('\n🎉 PRUEBAS COMPLETADAS');
}

// Ejecutar pruebas
runTests().catch(console.error);
