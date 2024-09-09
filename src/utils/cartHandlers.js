export const handleCuotaChange = (codigo, cuota, setSelectedCuota, calculateTotalPrice) => {
    // Validar que 'codigo' y 'cuota' sean válidos antes de proceder
    if (!codigo || !cuota) {
      console.error('Error: código o cuota inválido');
      return;
    }
  
    // Validar que 'setSelectedCuota' sea una función antes de ejecutarla
    if (typeof setSelectedCuota === 'function') {
      setSelectedCuota(prev => {
        // Asegurar que 'prev' esté definido antes de modificarlo
        return prev ? { ...prev, [codigo]: cuota } : { [codigo]: cuota };
      });
    } else {
      console.error('Error: setSelectedCuota no es una función');
    }
  
    // Si tienes una función de cálculo de precio total, la llamas después
    if (typeof calculateTotalPrice === 'function') {
      calculateTotalPrice();
    } else {
      console.error('Error: calculateTotalPrice no es una función');
    }
  };
  