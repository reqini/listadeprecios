const axios = require('axios');

const createAdminUser = async () => {
  try {
    const response = await axios.post('http://localhost:3001/api/register', {
      username: 'benicio',
      email: 'benicio@admin.com',
      password: 'admin123',
      tipo_usuario: 'full'
    });
    console.log('✅ Usuario admin creado exitosamente:', response.data);
  } catch (error) {
    console.error('❌ Error al crear el usuario admin:', error.response ? error.response.data : error.message);
  }
};

createAdminUser();
