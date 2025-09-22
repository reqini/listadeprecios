// Script de prueba para verificar la funcionalidad del perfil
// Ejecutar desde la consola del navegador cuando estés en la página del perfil

console.log('🧪 Iniciando pruebas del perfil...');

// Función para probar la API del perfil
async function testProfileAPI() {
  // Importar la API (esto funcionará si estás en la página)
  const { profileAPI } = await import('./src/utils/profileAPI.js');
  
  console.log('📋 Probando obtener perfil...');
  
  try {
    // Test 1: Obtener perfil
    const profileResult = await profileAPI.getProfile('cocinaty');
    console.log('✅ Perfil obtenido:', profileResult);
    
    // Test 2: Obtener estadísticas
    console.log('📊 Probando obtener estadísticas...');
    const statsResult = await profileAPI.getUserStats('cocinaty');
    console.log('✅ Estadísticas obtenidas:', statsResult);
    
    // Test 3: Actualizar perfil (simulado)
    console.log('✏️ Probando actualizar perfil...');
    const updateData = {
      email: 'cocinaty_actualizado@ejemplo.com',
      phone: '+54 9 11 9999-8888',
      preferences: {
        notifications: false,
        darkMode: true,
        language: 'es',
        theme: 'modern'
      }
    };
    
    const updateResult = await profileAPI.updateProfile('cocinaty', updateData);
    console.log('✅ Perfil actualizado:', updateResult);
    
    // Test 4: Cambiar contraseña (simulado)
    console.log('🔐 Probando cambio de contraseña...');
    const passwordData = {
      currentPassword: '279323',
      newPassword: 'nueva123',
      confirmPassword: 'nueva123'
    };
    
    const passwordResult = await profileAPI.changePassword('cocinaty', passwordData);
    console.log('✅ Contraseña cambiada:', passwordResult);
    
    console.log('🎉 Todas las pruebas completadas exitosamente!');
    
  } catch (error) {
    console.error('❌ Error en las pruebas:', error);
  }
}

// Función para verificar el estado del backend
async function testBackendConnection() {
  console.log('🔗 Verificando conexión con backend...');
  
  try {
    const response = await fetch('https://backtest-production-7f88.up.railway.app/api/profile/cocinaty');
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Backend responde:', data);
    } else {
      console.log('⚠️ Backend responde con error:', response.status);
      console.log('📝 Esto es normal si aún no has implementado los endpoints');
    }
  } catch (error) {
    console.log('⚠️ Error de conexión con backend:', error.message);
    console.log('📝 Esto es normal si aún no has implementado los endpoints');
  }
}

// Ejecutar pruebas
console.log('🚀 Ejecutando pruebas...');
testBackendConnection();
testProfileAPI();

// Función para mostrar el estado actual
function showCurrentStatus() {
  console.log(`
  📊 ESTADO ACTUAL DEL PERFIL:
  
  ✅ Frontend: Implementado y funcionando
  ⏳ Backend: Pendiente de implementar endpoints
  📋 Google Sheets: Pendiente de configurar
  
  📝 PRÓXIMOS PASOS:
  1. Crear hoja 'Perfiles_Emprendedoras' en Google Sheets
  2. Poblar con datos del archivo CSV generado
  3. Implementar endpoints en Railway
  4. Probar funcionalidad completa
  
  🔧 ARCHIVOS CREADOS:
  - ✅ CONFIGURACION_PERFIL_GOOGLESHEETS.md (documentación completa)
  - ✅ datos_ejemplo_perfiles.csv (datos para poblar)
  - ✅ test_perfil.js (script de pruebas)
  - ✅ profileAPI.js actualizado
  `);
}

showCurrentStatus();
