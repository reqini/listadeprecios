// Script para crear usuario lucho con plan full
// Ejecutar con: node create_user_lucho.js

const axios = require('axios');

const userData = {
  username: 'lucho',
  email: 'reqini@gmail.com',
  password: '12345678',
  plan: 'full',
  status: 'active'
};

async function createUser() {
  try {
    console.log('🚀 Creando usuario lucho con plan full...');
    
    // Si tienes un endpoint para crear usuarios directamente
    const response = await axios.post('/api/users/create', userData);
    
    console.log('✅ Usuario creado exitosamente:');
    console.log('👤 Username:', userData.username);
    console.log('📧 Email:', userData.email);
    console.log('💎 Plan:', userData.plan);
    console.log('🔑 Password:', userData.password);
    
  } catch (error) {
    console.error('❌ Error al crear usuario:', error.message);
    
    // Datos para crear manualmente
    console.log('\n📋 Datos para crear manualmente:');
    console.log('Username:', userData.username);
    console.log('Email:', userData.email);
    console.log('Password:', userData.password);
    console.log('Plan:', userData.plan);
    console.log('Status:', userData.status);
  }
}

createUser();
