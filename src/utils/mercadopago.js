// Servicio de integración con Mercado Pago
// En producción, esto se conectaría con la API de Mercado Pago

export const mercadopagoService = {
  // Crear suscripción para el plan Full
  async createSubscription(userData, planId = 'full') {
    try {
      // Simular llamada a la API de Mercado Pago
      // En producción, esto haría una llamada real a tu backend que se conecta con MP
      
      const subscriptionData = {
        planId: planId,
        userId: userData.username,
        email: userData.email,
        amount: 2990, // $2.990 ARS
        currency: 'ARS',
        description: 'Suscripción Plan Full - Lista de Precios',
        frequency: 'monthly',
        status: 'pending'
      };

      // Usar el link real de Mercado Pago
      const mockResponse = {
        success: true,
        subscriptionId: `sub_${Date.now()}`,
        initPoint: `https://www.mercadopago.com.ar/subscriptions/checkout?preapproval_plan_id=2c93808494f9e81b01952fe6e9e01a76`,
        data: subscriptionData
      };

      return mockResponse;
    } catch (error) {
      console.error('Error al crear suscripción:', error);
      return {
        success: false,
        message: 'Error al procesar el pago'
      };
    }
  },

  // Verificar estado de la suscripción
  async checkSubscriptionStatus(subscriptionId) {
    try {
      // Simular verificación del estado
      // En producción, esto consultaría la API de Mercado Pago
      
      const mockStatus = {
        success: true,
        status: 'approved', // approved, pending, cancelled
        subscriptionId: subscriptionId,
        nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      };

      return mockStatus;
    } catch (error) {
      console.error('Error al verificar suscripción:', error);
      return {
        success: false,
        message: 'Error al verificar el estado de la suscripción'
      };
    }
  },

  // Cancelar suscripción
  async cancelSubscription(subscriptionId) {
    try {
      // Simular cancelación
      // En producción, esto cancelaría la suscripción en Mercado Pago
      
      const mockResponse = {
        success: true,
        message: 'Suscripción cancelada exitosamente',
        subscriptionId: subscriptionId
      };

      return mockResponse;
    } catch (error) {
      console.error('Error al cancelar suscripción:', error);
      return {
        success: false,
        message: 'Error al cancelar la suscripción'
      };
    }
  },

  // Obtener información del plan
  getPlanInfo(planId) {
    const plans = {
      limitado: {
        id: 'limitado',
        name: 'Plan Limitado',
        price: 0,
        currency: 'ARS',
        features: [
          'Acceso solo a la página principal',
          'Recuperación de contraseña',
          'Información básica de productos',
          'Soporte por email'
        ],
        limitations: [
          'Sin acceso a catálogos completos',
          'Sin generación de placas',
          'Sin gestión de clientes',
          'Sin estadísticas avanzadas'
        ]
      },
      full: {
        id: 'full',
        name: 'Plan Full',
        price: 2990,
        currency: 'ARS',
        features: [
          'Acceso completo a todos los catálogos',
          'Generación de placas con IA',
          'Gestión ilimitada de clientes',
          'Estadísticas avanzadas y reportes',
          'Soporte prioritario por WhatsApp',
          'Templates premium y personalización',
          'Exportación de datos',
          'Integración con redes sociales'
        ],
        limitations: []
      }
    };

    return plans[planId] || null;
  }
};

export default mercadopagoService;
