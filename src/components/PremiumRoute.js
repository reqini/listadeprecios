import React from 'react';
import { usePlanPermissions } from '../hooks/usePlanPermissions';
import PlanRestriction from './PlanRestriction';

const PremiumRoute = ({ 
  children, 
  requiredPermission, 
  fallbackMessage,
  showUpgradeDialog = false 
}) => {
  const { canAccess, getRestrictionMessage, redirectToSubscription, isLoading } = usePlanPermissions();

  // Mostrar loading mientras se cargan los permisos
  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh' 
      }}>
        <div>Cargando...</div>
      </div>
    );
  }

  // Si el usuario tiene permisos, mostrar el contenido
  if (canAccess(requiredPermission)) {
    return children;
  }

  // Si no tiene permisos, mostrar la restricción
  return (
    <PlanRestriction
      feature={requiredPermission}
      message={fallbackMessage || getRestrictionMessage(requiredPermission)}
      onUpgrade={redirectToSubscription}
      showDialog={showUpgradeDialog}
    />
  );
};

export default PremiumRoute;
