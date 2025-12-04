/**
 * Componente Unificado de Búsqueda
 * 
 * Combina búsqueda semántica con IA, filtros avanzados y contenido útil
 * Diseño moderno estilo Etsy/Notion, mobile-first
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  Typography,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Alert,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Button,
  Collapse,
  IconButton,
  Divider,
  Grid,
  useTheme,
  useMediaQuery,
  Autocomplete
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  Lightbulb as LightbulbIcon,
  FilterList as FilterIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  AutoAwesome as AIIcon,
  ShoppingBag as ProductsIcon,
  Article as ContentIcon
} from '@mui/icons-material';
import unifiedSearchService from '../services/unifiedSearchService';
import { useDebounce } from '../utils/useDebounce';

const UnifiedSearch = ({ onClose, fullScreen = false }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const inputRef = useRef(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    products: true,
    aiSuggestions: true,
    helpfulContent: true
  });

  // Filtros avanzados
  const [filters, setFilters] = useState({
    categoria: 'all',
    linea: 'all',
    precioMin: '',
    precioMax: '',
    material: 'all'
  });

  const debouncedSearch = useDebounce(searchTerm, 300);

  // Focus en input al montar
  useEffect(() => {
    if (inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, []);

  // Búsqueda automática con debounce
  useEffect(() => {
    if (debouncedSearch && debouncedSearch.trim().length >= 2) {
      performSearch(debouncedSearch);
      setShowSuggestions(false);
    } else if (debouncedSearch.length < 2) {
      setResults(null);
      setError(null);
    }
  }, [debouncedSearch]);

  // Autosuggest mientras escribe
  useEffect(() => {
    if (searchTerm && searchTerm.length >= 2) {
      const autosuggestions = unifiedSearchService.getSuggestions(searchTerm);
      setSuggestions(autosuggestions);
      setShowSuggestions(autosuggestions.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchTerm]);

  /**
   * Realizar búsqueda
   */
  const performSearch = useCallback(async (query) => {
    setLoading(true);
    setError(null);

    try {
      const searchResults = await unifiedSearchService.search(query, filters);
      setResults(searchResults);
    } catch (err) {
      console.error('Error en búsqueda:', err);
      setError('Error al realizar la búsqueda. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  /**
   * Manejar cambio de filtros
   */
  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  /**
   * Aplicar filtros y buscar
   */
  const applyFilters = () => {
    if (searchTerm.trim().length >= 2) {
      performSearch(searchTerm);
    }
    setShowFilters(false);
  };

  /**
   * Seleccionar sugerencia
   */
  const selectSuggestion = (suggestion) => {
    setSearchTerm(suggestion);
    setShowSuggestions(false);
  };

  /**
   * Limpiar búsqueda
   */
  const clearSearch = () => {
    setSearchTerm('');
    setResults(null);
    setError(null);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  /**
   * Toggle sección expandida
   */
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const categorias = ['all', 'Cocina', 'Cocción Rápida', 'Parrilla', 'Cocina Internacional'];
  const lineas = ['all', 'Terra Nova', 'Premium', 'Chef', 'Gourmet', 'Clásica'];
  const materiales = ['all', 'Aluminio', 'Aluminio reforzado', 'Hierro fundido', 'Acero inoxidable'];

  return (
    <Box
      sx={{
        width: '100%',
        height: fullScreen ? '100vh' : 'auto',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: theme.palette.background.default,
        ...(fullScreen && {
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 9999
        })
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: { xs: 2, sm: 3 },
          backgroundColor: 'white',
          boxShadow: 1,
          position: 'sticky',
          top: 0,
          zIndex: 100
        }}
      >
        {/* Barra de búsqueda */}
        <Box sx={{ position: 'relative' }}>
          <TextField
            inputRef={inputRef}
            fullWidth
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar productos, ideas de venta, contenido útil..."
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
                backgroundColor: theme.palette.background.paper,
                fontSize: { xs: '1rem', sm: '1.125rem' },
                paddingRight: 1
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={clearSearch}>
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              )
            }}
          />

          {/* Autosuggest dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <Paper
              sx={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                mt: 1,
                maxHeight: 300,
                overflow: 'auto',
                zIndex: 1000,
                boxShadow: 3
              }}
            >
              <List dense>
                {suggestions.map((suggestion, index) => (
                  <ListItem
                    key={index}
                    button
                    onClick={() => selectSuggestion(suggestion)}
                    sx={{
                      '&:hover': {
                        backgroundColor: theme.palette.action.hover
                      }
                    }}
                  >
                    <ListItemIcon>
                      <SearchIcon fontSize="small" color="action" />
                    </ListItemIcon>
                    <ListItemText primary={suggestion} />
                  </ListItem>
                ))}
              </List>
            </Paper>
          )}
        </Box>

        {/* Botón de filtros */}
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            startIcon={<FilterIcon />}
            onClick={() => setShowFilters(!showFilters)}
            variant="outlined"
            size="small"
            sx={{ borderRadius: 2 }}
          >
            Filtros
          </Button>
        </Box>

        {/* Panel de filtros */}
        <Collapse in={showFilters}>
          <Paper sx={{ mt: 2, p: 2, backgroundColor: theme.palette.grey[50] }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="caption" color="text.secondary">
                  Categoría
                </Typography>
                <Autocomplete
                  size="small"
                  options={categorias}
                  value={filters.categoria}
                  onChange={(e, value) => handleFilterChange('categoria', value || 'all')}
                  renderInput={(params) => <TextField {...params} variant="outlined" />}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="caption" color="text.secondary">
                  Línea
                </Typography>
                <Autocomplete
                  size="small"
                  options={lineas}
                  value={filters.linea}
                  onChange={(e, value) => handleFilterChange('linea', value || 'all')}
                  renderInput={(params) => <TextField {...params} variant="outlined" />}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="caption" color="text.secondary">
                  Material
                </Typography>
                <Autocomplete
                  size="small"
                  options={materiales}
                  value={filters.material}
                  onChange={(e, value) => handleFilterChange('material', value || 'all')}
                  renderInput={(params) => <TextField {...params} variant="outlined" />}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="caption" color="text.secondary">
                  Precio Mínimo
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  value={filters.precioMin}
                  onChange={(e) => handleFilterChange('precioMin', e.target.value)}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="caption" color="text.secondary">
                  Precio Máximo
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  value={filters.precioMax}
                  onChange={(e) => handleFilterChange('precioMax', e.target.value)}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={applyFilters}
                  sx={{ mt: 1 }}
                >
                  Aplicar Filtros
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Collapse>
      </Box>

      {/* Contenido */}
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          p: { xs: 2, sm: 3 }
        }}
      >
        {/* Loading */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
            <CircularProgress />
          </Box>
        )}

        {/* Error */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Resultados */}
        {!loading && results && (
          <>
            {/* Productos */}
            {results.products.length > 0 && (
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: 2,
                      cursor: 'pointer'
                    }}
                    onClick={() => toggleSection('products')}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <ProductsIcon color="primary" />
                      <Typography variant="h6">
                        Productos ({results.products.length})
                      </Typography>
                    </Box>
                    {expandedSections.products ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </Box>

                  <Collapse in={expandedSections.products}>
                    <Grid container spacing={2}>
                      {results.products.map((product, index) => (
                        <Grid item xs={12} sm={6} md={4} key={index}>
                          <Card variant="outlined">
                            <CardContent>
                              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                {product.title}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" paragraph>
                                {product.description}
                              </Typography>
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                                {product.tags.slice(0, 3).map((tag, i) => (
                                  <Chip key={i} label={tag} size="small" />
                                ))}
                              </Box>
                              <Typography variant="h6" color="primary">
                                ${product.precio?.toLocaleString('es-AR')}
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </Collapse>
                </CardContent>
              </Card>
            )}

            {/* Sugerencias de IA */}
            {results.aiSuggestions.length > 0 && (
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: 2,
                      cursor: 'pointer'
                    }}
                    onClick={() => toggleSection('aiSuggestions')}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AIIcon color="secondary" />
                      <Typography variant="h6">
                        Ideas Generadas por IA ({results.aiSuggestions.length})
                      </Typography>
                    </Box>
                    {expandedSections.aiSuggestions ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </Box>

                  <Collapse in={expandedSections.aiSuggestions}>
                    <List>
                      {results.aiSuggestions.map((suggestion, index) => (
                        <ListItem key={index}>
                          <ListItemIcon>
                            <LightbulbIcon color="warning" />
                          </ListItemIcon>
                          <ListItemText primary={suggestion} />
                        </ListItem>
                      ))}
                    </List>
                  </Collapse>
                </CardContent>
              </Card>
            )}

            {/* Contenido Útil */}
            {results.helpfulContent.length > 0 && (
              <Card>
                <CardContent>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: 2,
                      cursor: 'pointer'
                    }}
                    onClick={() => toggleSection('helpfulContent')}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <ContentIcon color="info" />
                      <Typography variant="h6">
                        Contenido Útil ({results.helpfulContent.length})
                      </Typography>
                    </Box>
                    {expandedSections.helpfulContent ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </Box>

                  <Collapse in={expandedSections.helpfulContent}>
                    {results.helpfulContent.map((content, index) => (
                      <Card key={index} variant="outlined" sx={{ mb: 2 }}>
                        <CardContent>
                          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                            {content.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {content.content}
                          </Typography>
                        </CardContent>
                      </Card>
                    ))}
                  </Collapse>
                </CardContent>
              </Card>
            )}

            {/* Sin resultados */}
            {results.products.length === 0 && 
             results.aiSuggestions.length === 0 && 
             results.helpfulContent.length === 0 && (
              <Alert severity="info">
                No se encontraron resultados. Intenta con otros términos de búsqueda.
              </Alert>
            )}
          </>
        )}

        {/* Estado inicial */}
        {!loading && !results && !error && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <SearchIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Buscador Inteligente
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Buscá productos, ideas de venta, contenido útil para emprendedoras...
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default UnifiedSearch;

