import { useState, useEffect } from 'react';

// Hook para manejar permisos según el plan del usuario
export const usePlanPermissions = () => {
  const [userPlan, setUserPlan] = useState('limitado');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Obtener el plan del usuario desde localStorage o del token
    const tipoUsuario = localStorage.getItem('tipoUsuario');
    
    if (tipoUsuario === 'full') {
      setUserPlan('full');
    } else {
      setUserPlan('limitado');
    }
    
    setIsLoading(false);
  }, []);

  // Definir permisos por plan
  const permissions = {
    limitado: {
      // Plan gratuito - Solo acceso al perfil
      canAccessProfile: true,
      canAccessHome: false,
      canAccessCatalogs: false,
      canGeneratePlacas: false,
      canManageClients: false,
      canViewStats: false,
      canAccessCapacitaciones: false,
      canAccessEmprendedoras: false,
      canAccessVentas: false,
      canAccessFaqs: false,
      canRecoverPassword: true,
      canViewBasicProducts: false,
      canContactSupport: true
    },
    full: {
      // Plan premium - Acceso completo
      canAccessProfile: true,
      canAccessHome: true,
      canAccessCatalogs: true,
      canGeneratePlacas: true,
      canManageClients: true,
      canViewStats: true,
      canAccessCapacitaciones: true,
      canAccessEmprendedoras: true,
      canAccessVentas: true,
      canAccessFaqs: true,
      canRecoverPassword: true,
      canViewBasicProducts: true,
      canContactSupport: true
    }
  };

  const currentPermissions = permissions[userPlan] || permissions.limitado;

  // Función para verificar si el usuario puede acceder a una funcionalidad
  const canAccess = (feature) => {
    return currentPermissions[feature] || false;
  };

  // Función para obtener el mensaje de restricción
  const getRestrictionMessage = (feature) => {
    const messages = {
      canAccessHome: 'Acceso al panel principal disponible solo en Plan Premium',
      canAccessCatalogs: 'Acceso a catálogos completos disponible solo en Plan Premium',
      canGeneratePlacas: 'Generación de placas disponible solo en Plan Premium',
      canManageClients: 'Gestión de clientes disponible solo en Plan Premium',
      canViewStats: 'Estadísticas avanzadas disponibles solo en Plan Premium',
      canAccessCapacitaciones: 'Capacitaciones disponibles solo en Plan Premium',
      canAccessEmprendedoras: 'Panel de emprendedoras disponible solo en Plan Premium',
      canAccessVentas: 'Panel de ventas disponible solo en Plan Premium',
      canAccessFaqs: 'Preguntas frecuentes disponibles solo en Plan Premium'
    };
    
    return messages[feature] || 'Esta funcionalidad requiere Plan Premium';
  };

  // Función para redirigir a la suscripción
  const redirectToSubscription = () => {
    window.location.href = '/registro?plan=full';
  };

  return {
    userPlan,
    isLoading,
    permissions: currentPermissions,
    canAccess,
    getRestrictionMessage,
    redirectToSubscription
  };
};

export default usePlanPermissions;
