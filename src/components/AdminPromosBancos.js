import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  Button,
  Chip,
  TextField,
  Alert,
  CircularProgress,
  Grid,
} from '@mui/material';
import axios from '../utils/axios';

/**
 * Componente de administración de promos por catálogo y bancos
 * Permite seleccionar catálogos y asociar múltiples logos de bancos
 */
const AdminPromosBancos = () => {
  const [availableBanks, setAvailableBanks] = useState([]);
  const [loadingBanks, setLoadingBanks] = useState(true);
  const [selectedCatalogos, setSelectedCatalogos] = useState([]);
  const [selectedBancos, setSelectedBancos] = useState([]);
  const [descripcionPromo, setDescripcionPromo] = useState('');
  const [loadingPromos, setLoadingPromos] = useState(true);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Lista de catálogos disponibles
  const catalogosDisponibles = [
    { id: 'home', nombre: 'Home', ruta: '/home' },
    { id: 'catalogo3', nombre: 'Catálogo 3 Cuotas', ruta: '/catalogo3' },
    { id: 'catalogo6', nombre: 'Catálogo 6 Cuotas', ruta: '/catalogo6' },
    { id: 'catalogo9', nombre: 'Catálogo 9 Cuotas', ruta: '/catalogo9' },
    { id: 'catalogo10', nombre: 'Catálogo 10 Cuotas', ruta: '/catalogo10' },
    { id: 'catalogo12', nombre: 'Catálogo 12 Cuotas', ruta: '/catalogo12' },
    { id: 'catalogo14', nombre: 'Catálogo 14 Cuotas', ruta: '/catalogo14' },
    { id: 'catalogo15', nombre: 'Catálogo 15 Cuotas', ruta: '/catalogo15' },
    { id: 'catalogo18', nombre: 'Catálogo 18 Cuotas', ruta: '/catalogo18' },
    { id: 'catalogo20', nombre: 'Catálogo 20 Cuotas', ruta: '/catalogo20' },
    { id: 'catalogo24', nombre: 'Catálogo 24 Cuotas', ruta: '/catalogo24' },
    { id: 'preferencial', nombre: 'Preferencial', ruta: '/preferencial' },
    { id: 'contado', nombre: 'Contado', ruta: '/contado' },
  ];

  // Cargar bancos disponibles
  useEffect(() => {
    const loadBanks = async () => {
      try {
        setLoadingBanks(true);
        const response = await axios.get('/api/bancos');
        if (response.data && Array.isArray(response.data)) {
          // Mapear bancos a formato simplificado con logo
          const banks = response.data.map(banco => ({
            id: banco.codigo || banco.id || banco.banco,
            nombre: banco.banco || banco.nombre,
            logo_url: banco.logo_url || null,
          }));
          setAvailableBanks(banks);
        }
      } catch (error) {
        console.error('Error al cargar bancos:', error);
        // Fallback: bancos estándar
        setAvailableBanks([
          { id: 'nacion', nombre: 'Banco de la Nación', logo_url: '/logos-bancos/nacion.png' },
          { id: 'galicia', nombre: 'Banco de Galicia', logo_url: '/logos-bancos/galicia.png' },
          { id: 'santander', nombre: 'Santander', logo_url: '/logos-bancos/santander.png' },
          { id: 'bbva', nombre: 'BBVA', logo_url: '/logos-bancos/bbva.png' },
          { id: 'macro', nombre: 'Banco Macro', logo_url: '/logos-bancos/macro.png' },
        ]);
      } finally {
        setLoadingBanks(false);
      }
    };

    loadBanks();
  }, []);

  // Cargar promos existentes (para futuro uso)
  useEffect(() => {
    const loadPromos = async () => {
      try {
        setLoadingPromos(true);
        // Intentar cargar desde endpoint de promos por catálogo
        await axios.get('/api/catalogo-promos');
        // Promos se pueden usar en el futuro para mostrar lista de promos existentes
      } catch (error) {
        // Endpoint puede no existir aún, se ignora silenciosamente
      } finally {
        setLoadingPromos(false);
      }
    };

    loadPromos();
  }, []);

  const handleCatalogosChange = (event) => {
    const value = event.target.value;
    setSelectedCatalogos(typeof value === 'string' ? value.split(',') : value);
  };

  const handleBancosChange = (event) => {
    const value = event.target.value;
    setSelectedBancos(typeof value === 'string' ? value.split(',') : value);
  };

  const handleSave = async () => {
    if (selectedCatalogos.length === 0) {
      setSnackbar({
        open: true,
        message: 'Debes seleccionar al menos un catálogo',
        severity: 'error'
      });
      return;
    }

    if (selectedBancos.length === 0) {
      setSnackbar({
        open: true,
        message: 'Debes seleccionar al menos un banco',
        severity: 'error'
      });
      return;
    }

    try {
      setSaving(true);

      // Formato para Google Sheets: catalogos y bancos como strings separados por comas
      const catalogosString = selectedCatalogos.join(',');
      
      // Obtener IDs/nombres de bancos (sin los objetos completos para Google Sheets)
      const bancosIds = selectedBancos.map(bancoId => {
        const banco = availableBanks.find(b => b.id === bancoId || b.nombre === bancoId);
        return banco?.id || banco?.nombre || bancoId;
      });
      const bancosString = bancosIds.join(',');

      // Obtener datos completos de los bancos seleccionados (para respuesta del frontend)
      const bancosSeleccionados = selectedBancos.map(bancoId => {
        const banco = availableBanks.find(b => b.id === bancoId || b.nombre === bancoId);
        return banco || { id: bancoId, nombre: bancoId, logo_url: null };
      });

      // Formato para guardar en Google Sheets según especificación
      const promoToSave = {
        catalogos: catalogosString, // String separado por comas: "catalogo3,catalogo6"
        bancos: bancosString, // String separado por comas: "galicia,santander,nacion"
        descripcion: descripcionPromo || '', // Texto opcional
        activo: true, // Boolean
        fecha_creacion: new Date().toISOString().split('T')[0], // Fecha en formato YYYY-MM-DD
      };

      // Formato alternativo para el frontend (mantener compatibilidad)
      const promosToSave = selectedCatalogos.map(catalogoId => {
        const catalogo = catalogosDisponibles.find(c => c.id === catalogoId);
        return {
          catalogo_id: catalogoId,
          catalogo_ruta: catalogo?.ruta || catalogoId,
          catalogo_nombre: catalogo?.nombre || catalogoId,
          bancos: bancosSeleccionados,
          descripcion_promo: descripcionPromo || '',
          activa: true,
        };
      });

      // Guardar en backend (formato Google Sheets)
      try {
        const response = await axios.post('/api/catalogo-promos', promoToSave);
        if (response.data && (response.data.success || response.status === 200)) {
          setSnackbar({
            open: true,
            message: 'Promos guardadas correctamente en Google Sheets',
            severity: 'success'
          });
          
          // Disparar evento para actualizar otros componentes
          window.dispatchEvent(new CustomEvent('catalogoPromosUpdated', { 
            detail: { promoToSave, promosToSave } 
          }));
          
          // Recargar promos existentes (para futuro uso)
          await axios.get('/api/catalogo-promos');
          
          // Limpiar formulario
          setSelectedCatalogos([]);
          setSelectedBancos([]);
          setDescripcionPromo('');
        } else {
          throw new Error(response.data?.message || 'Error al guardar');
        }
      } catch (apiError) {
        // Fallback: guardar en localStorage
        console.warn('API no disponible, guardando en localStorage:', apiError);
        const existingPromos = JSON.parse(localStorage.getItem('catalogo_promos') || '[]');
        const updatedPromos = [...existingPromos, ...promosToSave];
        localStorage.setItem('catalogo_promos', JSON.stringify(updatedPromos));
        
        // Disparar evento para notificar a otros componentes
        window.dispatchEvent(new CustomEvent('catalogoPromosUpdated', { detail: updatedPromos }));

        setSnackbar({
          open: true,
          message: 'Promos guardadas localmente (backend no disponible)',
          severity: 'success'
        });
        setSelectedCatalogos([]);
        setSelectedBancos([]);
        setDescripcionPromo('');
      }
    } catch (error) {
      console.error('Error al guardar promos:', error);
      setSnackbar({
        open: true,
        message: 'Error al guardar promos. Intenta nuevamente.',
        severity: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loadingBanks || loadingPromos) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>💡 Nueva lógica:</strong> Selecciona uno o varios catálogos y asocia múltiples logos de bancos.
          Estos logos se mostrarán como miniaturas en las cards de producto del catálogo correspondiente.
        </Typography>
      </Alert>

      <Grid container spacing={3}>
        {/* Selector de Catálogos */}
        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel>Catálogos (puedes seleccionar múltiples)</InputLabel>
            <Select
              multiple
              value={selectedCatalogos}
              onChange={handleCatalogosChange}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => {
                    const catalogo = catalogosDisponibles.find(c => c.id === value);
                    return (
                      <Chip
                        key={value}
                        label={catalogo?.nombre || value}
                        size="small"
                      />
                    );
                  })}
                </Box>
              )}
            >
              {catalogosDisponibles.map((catalogo) => (
                <MenuItem key={catalogo.id} value={catalogo.id}>
                  <Checkbox checked={selectedCatalogos.indexOf(catalogo.id) > -1} />
                  <ListItemText primary={catalogo.nombre} secondary={catalogo.ruta} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Selector de Bancos */}
        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel>Bancos (puedes seleccionar múltiples)</InputLabel>
            <Select
              multiple
              value={selectedBancos}
              onChange={handleBancosChange}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => {
                    const banco = availableBanks.find(b => b.id === value || b.nombre === value);
                    return (
                      <Chip
                        key={value}
                        label={banco?.nombre || value}
                        size="small"
                        icon={
                          banco?.logo_url ? (
                            <Box
                              component="img"
                              src={banco.logo_url}
                              alt={banco.nombre}
                              sx={{ width: 20, height: 12, objectFit: 'contain' }}
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                          ) : null
                        }
                      />
                    );
                  })}
                </Box>
              )}
            >
              {availableBanks.map((banco) => (
                <MenuItem key={banco.id || banco.nombre} value={banco.id || banco.nombre}>
                  <Checkbox checked={selectedBancos.indexOf(banco.id || banco.nombre) > -1} />
                  <ListItemText
                    primary={banco.nombre}
                    secondary={banco.logo_url ? 'Logo disponible' : 'Sin logo'}
                  />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Descripción opcional */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Descripción de la promo (opcional)"
            placeholder="Ej: 12 cuotas sin interés"
            value={descripcionPromo}
            onChange={(e) => setDescripcionPromo(e.target.value)}
            helperText="Este texto puede aparecer junto a los logos"
          />
        </Grid>

        {/* Botón Guardar */}
        <Grid item xs={12}>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            onClick={handleSave}
            disabled={saving || selectedCatalogos.length === 0 || selectedBancos.length === 0}
            sx={{ minHeight: 48 }}
          >
            {saving ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                Guardando...
              </>
            ) : (
              '💾 Guardar Promos'
            )}
          </Button>
        </Grid>
      </Grid>

      {/* Snackbar para mensajes */}
      {snackbar.open && (
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          sx={{ mt: 2 }}
        >
          {snackbar.message}
        </Alert>
      )}
    </Box>
  );
};

export default AdminPromosBancos;

