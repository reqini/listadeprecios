import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  Grid,
} from '@mui/material';
import {
  Search as SearchIcon,
  Close as CloseIcon,
  Star as StarIcon,
  ShoppingCart as ShoppingCartIcon,
  Language as LanguageIcon,
  Store as StoreIcon,
  TrendingDown as TrendingDownIcon,
  Compare as CompareIcon,
  PictureAsPdf as PdfIcon,
  TableChart as ExcelIcon,
} from '@mui/icons-material';
import axios from '../utils/axios';
import { useDebounce } from '../utils/useDebounce';
import { filterAllProducts } from '../utils/filterProducts';
import { searchAllSources } from '../services/webSearchAPI';
import { mergeSearchResults } from '../utils/mergeSearchResults';
import { formatPrice } from '../utils/priceUtils';
import { exportSearchResults } from '../utils/exportSearchResults';

/**
 * Buscador Global de Productos
 * 
 * Características:
 * - Búsqueda local en catálogo
 * - Búsqueda web (MercadoLibre, Google, Bing)
 * - Fusión inteligente de resultados
 * - Exportación PDF/Excel/CSV
 * - Mobile-first
 * - Debounce 400ms
 * - Cache en sessionStorage
 */
const GlobalProductSearch = ({ onProductClick, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [localProducts, setLocalProducts] = useState([]);
  const [mergedResults, setMergedResults] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [retryCount, setRetryCount] = useState(0);
  
  const debouncedSearch = useDebounce(searchTerm, 400);
  const abortControllerRef = useRef(null);
  const inputRef = useRef(null);
  // Cache interno no usado de momento; se mantiene la estrategia con sessionStorage

  // Cargar productos locales al montar
  useEffect(() => {
    loadLocalProducts();
  }, [loadLocalProducts]);

  // Búsqueda automática con debounce
  useEffect(() => {
    if (debouncedSearch && debouncedSearch.trim().length >= 2) {
      performSearch(debouncedSearch);
    } else {
      setMergedResults(null);
      setError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  // Focus en input al abrir
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  /**
   * Carga productos locales desde la API
   */
  const loadLocalProducts = useCallback(async () => {
    try {
      const response = await axios.get('/api/productos');
      const productos = Array.isArray(response.data) ? response.data : [];
      setLocalProducts(productos);
    } catch (err) {
      console.error('Error cargando productos locales:', err);
      setLocalProducts([]);
    }
  }, []);

  /**
   * Realiza búsqueda local y web simultáneamente
   */
  const performSearch = useCallback(async (query) => {
    // Cancelar búsqueda anterior si existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Crear nuevo AbortController
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    // Verificar cache
    const cacheKey = `search_${query.toLowerCase()}`;
    const cached = sessionStorage.getItem(cacheKey);
    if (cached && !signal.aborted) {
      try {
        const cachedData = JSON.parse(cached);
        setMergedResults(cachedData);
        setLoading(false);
        return;
      } catch (e) {
        // Cache inválido, continuar con búsqueda
      }
    }

    setLoading(true);
    setError(null);
    setRetryCount(0);

    try {
      // Búsqueda local (rápida)
      const localResults = filterAllProducts(localProducts, query);

      // Búsqueda web (puede tardar)
      const webResults = await searchAllSources(query);

      if (signal.aborted) return;

      // Fusionar resultados
      const merged = mergeSearchResults(localResults, webResults, query);

      // Guardar en cache
      try {
        sessionStorage.setItem(cacheKey, JSON.stringify(merged));
      } catch (e) {
        console.warn('No se pudo guardar en cache:', e);
      }

      setMergedResults(merged);
      setLoading(false);
    } catch (err) {
      if (signal.aborted) return;
      
      console.error('Error en búsqueda:', err);
      setError('Error al buscar. Intenta nuevamente.');
      setLoading(false);

      // Retry automático (máximo 2 veces)
      if (retryCount < 2) {
        setRetryCount(prev => prev + 1);
        setTimeout(() => {
          if (!signal.aborted) {
            performSearch(query);
          }
        }, 1000);
      }
    }
  }, [localProducts, retryCount]);

  /**
   * Cierra el buscador
   */
  const handleCloseDialog = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsOpen(false);
    if (onClose) onClose();
  }, [onClose]);

  /**
   * Maneja teclas especiales
   */
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      handleCloseDialog();
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      if (searchTerm.trim().length >= 2) {
        performSearch(searchTerm);
      }
    }
  }, [searchTerm, performSearch, handleCloseDialog]);

  /**
   * Limpia la búsqueda
   */
  const handleClear = useCallback(() => {
    setSearchTerm('');
    setMergedResults(null);
    setError(null);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  /**
   * Maneja exportación de resultados
   */
  const handleExport = useCallback(async (format) => {
    if (!mergedResults) return;

    try {
      await exportSearchResults(mergedResults, format, searchTerm);
    } catch (err) {
      console.error('Error exportando:', err);
      setError('Error al exportar resultados');
    }
  }, [mergedResults, searchTerm]);

  // Renderizar resultados locales
  const renderLocalResults = () => {
    if (!mergedResults || mergedResults.local.length === 0) {
      return (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography color="text.secondary">
            No se encontraron productos en el catálogo interno
          </Typography>
        </Box>
      );
    }

    return (
      <Grid container spacing={2} sx={{ mt: 1 }}>
        {mergedResults.local.map((product) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={product.id || product.codigo}>
            <ProductCard
              product={product}
              isLocal={true}
              onClick={() => onProductClick?.(product)}
            />
          </Grid>
        ))}
      </Grid>
    );
  };

  // Renderizar resultados web
  const renderWebResults = () => {
    if (!mergedResults || mergedResults.web.length === 0) {
      return (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography color="text.secondary">
            No se encontraron resultados en la web
          </Typography>
        </Box>
      );
    }

    return (
      <Box sx={{ mt: 1 }}>
        {mergedResults.cheapest && (
          <Alert 
            severity="success" 
            icon={<TrendingDownIcon />}
            sx={{ mb: 2 }}
          >
            <Typography variant="subtitle2" fontWeight="bold">
              💰 Mejor Precio Encontrado
            </Typography>
            <Typography variant="body2">
              {mergedResults.cheapest.nombre} - {formatPrice(mergedResults.cheapest.precio)} en {mergedResults.cheapest.tienda}
            </Typography>
          </Alert>
        )}

        <Grid container spacing={2}>
          {mergedResults.web.map((product) => (
            <Grid item xs={12} sm={6} md={4} key={product.id}>
              <WebProductCard
                product={product}
                onClick={() => window.open(product.url, '_blank')}
              />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  };

  // Renderizar comparaciones
  const renderComparisons = () => {
    if (!mergedResults || !mergedResults.comparisons || mergedResults.comparisons.length === 0) {
      return (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography color="text.secondary">
            No se encontraron comparaciones de precios
          </Typography>
        </Box>
      );
    }

    return (
      <Box sx={{ mt: 1 }}>
        {mergedResults.comparisons.map((comparison, idx) => (
          <Card key={idx} sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {comparison.productos[0].nombre}
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 2 }}>
                {comparison.productos.map((prod, pIdx) => (
                  <Chip
                    key={pIdx}
                    label={`${prod.tienda || prod.fuente}: ${formatPrice(prod.precio)}`}
                    color={prod.id === comparison.mejorPrecio?.id ? 'success' : 'default'}
                    icon={prod.id === comparison.mejorPrecio?.id ? <TrendingDownIcon /> : null}
                  />
                ))}
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Precio promedio: {formatPrice(comparison.precioPromedio)} | 
                Rango: {formatPrice(comparison.precioMin)} - {formatPrice(comparison.precioMax)}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>
    );
  };

  return (
    <Dialog
      open={isOpen}
      onClose={handleCloseDialog}
      maxWidth="lg"
      fullWidth
      fullScreen={window.innerWidth < 600}
      PaperProps={{
        sx: {
          maxHeight: '90vh',
          m: { xs: 0, sm: 2 },
          borderRadius: { xs: 0, sm: 2 },
        },
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h5" component="div">
            🔍 Búsqueda Global de Productos
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {mergedResults && (
              <Tooltip title="Descargar resultados">
                <IconButton onClick={() => handleExport('pdf')} color="primary">
                  <PdfIcon />
                </IconButton>
              </Tooltip>
            )}
            <IconButton onClick={handleCloseDialog}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {/* Input de búsqueda */}
        <TextField
          inputRef={inputRef}
          fullWidth
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Buscar productos... (min. 2 caracteres)"
          variant="outlined"
          autoFocus
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: searchTerm && (
              <InputAdornment position="end">
                <IconButton onClick={handleClear} size="small">
                  <CloseIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{
            mb: 3,
            '& .MuiOutlinedInput-root': {
              fontSize: { xs: '1rem', sm: '1.125rem' },
              py: { xs: 1, sm: 1.5 },
            },
          }}
        />

        {/* Error */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
            {retryCount > 0 && (
              <Button size="small" onClick={() => performSearch(debouncedSearch)} sx={{ ml: 2 }}>
                Reintentar
              </Button>
            )}
          </Alert>
        )}

        {/* Loading */}
        {loading && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CircularProgress />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Buscando en catálogo y web...
            </Typography>
          </Box>
        )}

        {/* Resultados */}
        {!loading && mergedResults && (
          <Box>
            {/* Tabs */}
            <Tabs
              value={activeTab}
              onChange={(e, newValue) => setActiveTab(newValue)}
              sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab 
                label={`Catálogo (${mergedResults.local.length})`} 
                icon={<StoreIcon />}
                iconPosition="start"
              />
              <Tab 
                label={`Web (${mergedResults.web.length})`} 
                icon={<LanguageIcon />}
                iconPosition="start"
              />
              {mergedResults.comparisons && mergedResults.comparisons.length > 0 && (
                <Tab 
                  label={`Comparaciones (${mergedResults.comparisons.length})`} 
                  icon={<CompareIcon />}
                  iconPosition="start"
                />
              )}
            </Tabs>

            {/* Contenido de tabs */}
            {activeTab === 0 && renderLocalResults()}
            {activeTab === 1 && renderWebResults()}
            {activeTab === 2 && mergedResults.comparisons && renderComparisons()}
          </Box>
        )}

        {/* Estado inicial */}
        {!loading && !mergedResults && !error && searchTerm.length < 2 && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <SearchIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              Busca cualquier producto
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Buscamos en tu catálogo y en la web automáticamente
            </Typography>
          </Box>
        )}
      </DialogContent>

      {/* Footer con acciones */}
      {mergedResults && (
        <DialogActions sx={{ px: 3, py: 2, justifyContent: 'space-between' }}>
          <Typography variant="body2" color="text.secondary">
            {mergedResults.stats.totalLocal + mergedResults.stats.totalWeb} resultados encontrados
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              startIcon={<ExcelIcon />}
              onClick={() => handleExport('excel')}
              variant="outlined"
            >
              Excel
            </Button>
            <Button
              startIcon={<PdfIcon />}
              onClick={() => handleExport('pdf')}
              variant="contained"
            >
              PDF
            </Button>
          </Box>
        </DialogActions>
      )}
    </Dialog>
  );
};

/**
 * Card de producto local
 */
const ProductCard = ({ product, isLocal, onClick }) => {
  return (
    <Card
      sx={{
        height: '100%',
        cursor: 'pointer',
        transition: 'all 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        },
      }}
      onClick={onClick}
    >
      {product.imagen && (
        <CardMedia
          component="img"
          height="200"
          image={product.imagen}
          alt={product.descripcion || product.nombre}
          sx={{ objectFit: 'contain', bgcolor: 'grey.100' }}
        />
      )}
      <CardContent>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          {product.linea || product.categoria}
        </Typography>
        <Typography variant="h6" component="div" noWrap>
          {product.descripcion || product.nombre}
        </Typography>
        {product.precio > 0 && (
          <Typography variant="h6" color="primary" sx={{ mt: 1, fontWeight: 'bold' }}>
            {formatPrice(product.precio)}
          </Typography>
        )}
        {isLocal && (
          <Chip label="Catálogo interno" size="small" color="primary" sx={{ mt: 1 }} />
        )}
      </CardContent>
    </Card>
  );
};

/**
 * Card de producto web
 */
const WebProductCard = ({ product, onClick }) => {
  return (
    <Card
      sx={{
        height: '100%',
        cursor: 'pointer',
        transition: 'all 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        },
      }}
      onClick={onClick}
    >
      {product.imagen && (
        <CardMedia
          component="img"
          height="180"
          image={product.imagen}
          alt={product.nombre}
          sx={{ objectFit: 'contain', bgcolor: 'grey.100' }}
        />
      )}
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
          <Chip label={product.tienda || product.fuente} size="small" variant="outlined" />
          {product.calificacion && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <StarIcon sx={{ fontSize: 16, color: 'warning.main' }} />
              <Typography variant="caption">{product.calificacion.toFixed(1)}</Typography>
            </Box>
          )}
        </Box>
        <Typography variant="subtitle2" component="div" sx={{ mb: 1 }}>
          {product.nombre}
        </Typography>
        {product.precio > 0 && (
          <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
            {formatPrice(product.precio)}
          </Typography>
        )}
        {product.envioGratis && (
          <Chip label="Envío gratis" size="small" color="success" sx={{ mt: 1 }} />
        )}
        {product.vendidos > 0 && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
            {product.vendidos} vendidos
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default GlobalProductSearch;

