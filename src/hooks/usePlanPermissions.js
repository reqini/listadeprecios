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
      // Plan gratuito - SIN ACCESO (solo para usuarios no registrados)
      canAccessProfile: false,
      canAccessHome: false,
      canAccessCatalogs: false,
      canGeneratePlacas: false,
      canManageClients: false,
      canViewStats: false,
      canAccessCapacitaciones: false,
      canAccessEmprendedoras: false,
      canAccessVentas: false,
      canAccessFaqs: false,
      canRecoverPassword: false,
      canViewBasicProducts: false,
      canContactSupport: false,
      canAccessHomeCatalogs: false
    },
    full: {
      // Plan premium - ACCESO COMPLETO A TODO
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
      canContactSupport: true,
      canAccessHomeCatalogs: true
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
      canAccessProfile: 'Acceso al perfil requiere Plan Premium ($25.000/mes)',
      canAccessHome: 'Acceso al panel principal requiere Plan Premium ($25.000/mes)',
      canAccessCatalogs: 'Acceso a catálogos requiere Plan Premium ($25.000/mes)',
      canAccessHomeCatalogs: 'Selección de catálogos requiere Plan Premium ($25.000/mes)',
      canGeneratePlacas: 'Generación de placas requiere Plan Premium ($25.000/mes)',
      canManageClients: 'Gestión de clientes requiere Plan Premium ($25.000/mes)',
      canViewStats: 'Estadísticas avanzadas requieren Plan Premium ($25.000/mes)',
      canAccessCapacitaciones: 'Capacitaciones requieren Plan Premium ($25.000/mes)',
      canAccessEmprendedoras: 'Panel de emprendedoras requiere Plan Premium ($25.000/mes)',
      canAccessVentas: 'Panel de ventas requiere Plan Premium ($25.000/mes)',
      canAccessFaqs: 'Preguntas frecuentes requieren Plan Premium ($25.000/mes)'
    };
    
    return messages[feature] || 'Esta funcionalidad requiere Plan Premium ($25.000/mes)';
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
