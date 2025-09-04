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
      canAccessCatalogs: false,
      canGeneratePlacas: false,
      canManageClients: false,
      canViewStats: false,
      canAccessHome: true,
      canRecoverPassword: true,
      canViewBasicProducts: true,
      canContactSupport: true
    },
    full: {
      canAccessCatalogs: true,
      canGeneratePlacas: true,
      canManageClients: true,
      canViewStats: true,
      canAccessHome: true,
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
      canAccessCatalogs: 'Acceso a catálogos completos disponible solo en Plan Full',
      canGeneratePlacas: 'Generación de placas disponible solo en Plan Full',
      canManageClients: 'Gestión de clientes disponible solo en Plan Full',
      canViewStats: 'Estadísticas avanzadas disponibles solo en Plan Full'
    };
    
    return messages[feature] || 'Esta funcionalidad requiere Plan Full';
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
