import React, { useEffect, useState, useMemo } from "react";
import { normalizeString } from "./utils/searchUtils";
import axios from "./utils/axios";
import Container from "@mui/material/Container";
import Skeleton from "@mui/material/Skeleton";
import LinearProgress from "@mui/material/LinearProgress";
import { Helmet } from "react-helmet";
import ModernProductCardAirbnb from "./components/ModernProductCardAirbnb";
import ModernCartBottomSheet from "./components/ModernCartBottomSheet";
import FeaturedProductsBanner from "./components/FeaturedProductsBanner";
import { Snackbar, Alert, Typography, Box, Button } from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import { trackCatalogView, trackCatalogSearch, trackAddToCart, trackToggleFavorite } from "./utils/analytics";
import { parsePrice } from "./utils/priceUtils";
import { useIsIndividualCatalog } from "./utils/useCatalogContext";
import ModernSearchBar from "./components/ModernSearchBar";
import { filterAllProducts } from "./utils/filterProducts";
import { useColumnLayout } from "./hooks/useColumnLayout";
import ColumnLayoutToggle from "./components/ColumnLayoutToggle";
import LoadingFallbackCatalog from "./components/LoadingFallbackCatalog";
import { IS_CHRISTMAS_MODE } from "./config/christmasConfig";

const Catalogo9 = () => {
  // Detectar si estamos en una ruta dinámica (catálogo individual)
  const isIndividualCatalog = useIsIndividualCatalog();
  const isMobile = useMediaQuery('(max-width:600px)');
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productos, setProductos] = useState([]);
  const [productosOriginales, setProductosOriginales] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [productosAgrupados, setProductosAgrupados] = useState({});
  const [favorites, setFavorites] = useState([]);
  const [showFavorites, setShowFavorites] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [bankPromos] = useState([]);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [error, setError] = useState(null);
  
  // Hook para manejar el layout de columnas en mobile
  const { mobileColumns, toggleColumns } = useColumnLayout('catalogo9', 2);

  // Mapeo correcto de cuotas
  const cuotasMap = useMemo(() => ({
    "9 cuotas sin interés": 'nueve_sin_interes',
  }), []);

  // Eliminar duplicados por código
  const eliminarDuplicados = (productos) => {
    return productos.reduce((acc, producto) => {
      if (!acc.some(item => item.codigo === producto.codigo)) {
        acc.push(producto);
      }
      return acc;
    }, []);
  };

  // Cargar productos desde la API
  const getData = async () => {
    try {
      const result = await axios.get(`/api/productos`);
      return { success: true, data: result.data };
    } catch (error) {
      console.error("Error cargando productos:", error);
      return { success: false, error: error.message || 'Error al cargar productos', data: [] };
    }
  };

  // Cargar favoritos desde localStorage al montar
  useEffect(() => {
    try {
      const savedFavorites = localStorage.getItem('favorites');
      if (savedFavorites) {
        let favorites = JSON.parse(savedFavorites);
        favorites = favorites.filter((fav, index, self) =>
          index === self.findIndex(f => {
            if (fav.id && f.id) {
              return String(f.id) === String(fav.id);
            }
            if (fav.codigo && f.codigo) {
              return String(f.codigo) === String(fav.codigo);
            }
            return false;
          })
        );
        setFavorites(favorites);
        if (favorites.length !== JSON.parse(savedFavorites).length) {
          localStorage.setItem('favorites', JSON.stringify(favorites));
        }
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  }, []);

  // Sincronizar favoritos cuando cambian desde otros componentes
  useEffect(() => {
    const handleFavoritesUpdate = (e) => {
      if (e.detail && Array.isArray(e.detail)) {
        setFavorites(e.detail);
      }
    };
    
    window.addEventListener('favoritesUpdated', handleFavoritesUpdate);
    return () => window.removeEventListener('favoritesUpdated', handleFavoritesUpdate);
  }, []);

  // Cargar logos de bancos por catálogo
  const [bankLogos, setBankLogos] = useState([]);

  // Detectar scroll para mostrar botón "volver arriba"
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      setShowScrollTop(scrollTop > 300);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  
  useEffect(() => {
    const loadBankLogos = async () => {
      try {
        const { getBankLogosForCatalogo } = await import('./utils/catalogoPromosAPI');
        const logos = await getBankLogosForCatalogo('/catalogo9');
        setBankLogos(logos);
      } catch (error) {
        console.warn('No se pudieron cargar logos de bancos para catalogo9:', error);
        setBankLogos([]);
      }
    };
    
    loadBankLogos();
    
    const handlePromosUpdate = () => {
      loadBankLogos();
    };
    window.addEventListener('catalogoPromosUpdated', handlePromosUpdate);
    return () => window.removeEventListener('catalogoPromosUpdated', handlePromosUpdate);
  }, []);

  useEffect(() => {
    trackCatalogView("Catálogo", "9 cuotas sin interés");
    
    const loadInitialData = async () => {
      setLoading(true);
      setError(null);
      const result = await getData();
      
      if (!result.success) {
        setError(result.error || 'Error al cargar productos. Por favor, intenta recargar la página.');
        setProductos([]);
        setProductosOriginales([]);
        setProductosAgrupados({});
        setLoading(false);
        return;
      }
      
      const productosData = result.data || [];
      const productosFiltrados = productosData.filter(
        (producto) => (producto?.vigencia || '').toLowerCase() !== "no"
      );
      const productosUnicos = eliminarDuplicados(productosFiltrados);
      setProductos(productosUnicos);
      setProductosOriginales(productosUnicos);
      agruparProductosPorLinea(productosUnicos);
      setLoading(false);
    };

    loadInitialData();
  }, []);

  // Agrupar productos por línea
  const agruparProductosPorLinea = (productos) => {
    const productosPorLinea = productos.reduce((acc, producto) => {
      const { linea } = producto;
      if (!acc[linea]) acc[linea] = [];
      acc[linea].push(producto);
      return acc;
    }, {});
    setProductosAgrupados(productosPorLinea);
  };

  // Filtrar productos según descripción, línea, categoría y cuota
  useEffect(() => {
    const productosBase = productosOriginales.length > 0 ? productosOriginales : productos;
    
    let productosFiltrados = searchTerm 
      ? filterAllProducts(productosBase, searchTerm)
      : productosBase;
    
    productosFiltrados = productosFiltrados.filter(
      (producto) => normalizeString(producto?.linea) !== 'repuestos'
    );

    if (searchTerm && searchTerm.trim()) {
      trackCatalogSearch("Catálogo 9", searchTerm);
    }

    if (cuotasMap["9 cuotas sin interés"]) {
      const cuotaKey = cuotasMap["9 cuotas sin interés"];
      productosFiltrados = productosFiltrados.filter(
        (producto) => producto[cuotaKey] && producto[cuotaKey] !== 'NO'
      );
    }

    agruparProductosPorLinea(productosFiltrados);
  }, [searchTerm, productos, productosOriginales, cuotasMap]);

  // Añadir producto al carrito
  const addToCart = (product) => {
    const cuotaKeyCatalogo = cuotasMap["9 cuotas sin interés"];
    const cuotaValueRaw = product[cuotaKeyCatalogo] && product[cuotaKeyCatalogo] !== 'NO' 
      ? product[cuotaKeyCatalogo] 
      : null;
    const cuotaValue = cuotaValueRaw ? parsePrice(cuotaValueRaw) : null;
    
    const productWithCuota = {
      ...product,
      selectedCuotaKey: product.selectedCuotaKey || cuotaKeyCatalogo,
      selectedCuotaValue: product.selectedCuotaValue || cuotaValue,
      selectedCuotaLabel: product.selectedCuotaLabel || "9 cuotas sin interés",
    };

    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex(
        (item) => item.codigo === product.codigo
      );
      
      if (existingIndex >= 0) {
        const updatedCart = [...prevCart];
        updatedCart[existingIndex] = {
          ...updatedCart[existingIndex],
          cantidad: (updatedCart[existingIndex].cantidad || 1) + 1,
          selectedCuotaKey: updatedCart[existingIndex].selectedCuotaKey || productWithCuota.selectedCuotaKey,
          selectedCuotaValue: updatedCart[existingIndex].selectedCuotaValue || productWithCuota.selectedCuotaValue,
          selectedCuotaLabel: updatedCart[existingIndex].selectedCuotaLabel || productWithCuota.selectedCuotaLabel,
        };
        return updatedCart;
      } else {
        return [...prevCart, { ...productWithCuota, cantidad: 1 }];
      }
    });
    trackAddToCart("Catálogo 9", product);
  };

  // Manejar favoritos
  const toggleFavorite = (product) => {
    try {
      const savedFavorites = localStorage.getItem('favorites');
      let currentFavorites = savedFavorites ? JSON.parse(savedFavorites) : [];
      
      currentFavorites = currentFavorites.filter((fav, index, self) =>
        index === self.findIndex(f => {
          if (fav.id && f.id) {
            return String(f.id) === String(fav.id);
          }
          if (fav.codigo && f.codigo) {
            return String(f.codigo) === String(fav.codigo);
          }
          return false;
        })
      );
      
      const isCurrentlyFavorite = currentFavorites.some(fav => {
        if (product.id && fav.id) {
          return String(fav.id) === String(product.id);
        }
        if (product.codigo && fav.codigo) {
          return String(fav.codigo) === String(product.codigo);
        }
        return false;
      });
      
      let updatedFavorites;
      let message;

      if (isCurrentlyFavorite) {
        updatedFavorites = currentFavorites.filter(fav => {
          if (product.id && fav.id) {
            return String(fav.id) !== String(product.id);
          }
          if (product.codigo && fav.codigo) {
            return String(fav.codigo) !== String(product.codigo);
          }
          return true;
        });
        message = `${product.descripcion} ha sido eliminado de tus favoritos`;
        setSnackbarSeverity('warning');
        trackToggleFavorite("Catálogo 9", product, false);
      } else {
        updatedFavorites = [...currentFavorites, product];
        message = `${product.descripcion} ha sido agregado a tus favoritos`;
        setSnackbarSeverity('success');
        trackToggleFavorite("Catálogo 9", product, true);
      }

      setFavorites(updatedFavorites);
      localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
      window.dispatchEvent(new CustomEvent('favoritesUpdated', { detail: updatedFavorites }));
      
      setSnackbarMessage(message);
      setSnackbarOpen(true);

      if (updatedFavorites.length === 0) {
        setShowFavorites(false);
        agruparProductosPorLinea(productos);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      setSnackbarMessage('Error al actualizar favoritos');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const getBankPromoForProduct = (product) => {
    if (!bankPromos || bankPromos.length === 0) return null;
    
    if (product.banco) {
      const promo = bankPromos.find(p => 
        p.banco && product.banco && 
        (p.banco.toUpperCase().includes(product.banco.toUpperCase()) ||
         product.banco.toUpperCase().includes(p.banco.toUpperCase()))
      );
      if (promo) return promo;
    }
    
    if (product.banco_codigo) {
      const promo = bankPromos.find(p => 
        p.banco_codigo === product.banco_codigo
      );
      if (promo) return promo;
    }
    
    return null;
  };

  const productosAMostrar = showFavorites
    ? Object.keys(productosAgrupados).reduce((acc, linea) => {
        const productosFavoritos = productosAgrupados[linea].filter(product =>
          favorites.some(fav => 
            (fav.id && product.id && String(fav.id) === String(product.id)) ||
            (fav.codigo && product.codigo && String(fav.codigo) === String(product.codigo))
          )
        );
        if (productosFavoritos.length) {
          acc[linea] = productosFavoritos;
        }
        return acc;
      }, {})
    : productosAgrupados;

  return (
    <>
      <Helmet>
        <title>Catálogo 9 Cuotas - Catálogo</title>
      </Helmet>
      
      {/* Banner Navideño Superior */}
      {IS_CHRISTMAS_MODE && (
         <Alert
          severity="info"
          icon={false}
          sx={{
            backgroundColor: '#C62828',
            display: 'none',
            color: '#FFFFFF',
            textAlign: 'center',
            py: 0.5,
            fontSize: { xs: '0.75rem', sm: '0.875rem' },
            fontWeight: 600,
            borderRadius: 0,
            '& .MuiAlert-message': {
              width: '100%',
            },
          }}
        >
          🎄 Especial Navidad: promociones y cuotas
        </Alert>
      )}
      
      {/* Buscador oculto en catálogos individuales */}
      {!isIndividualCatalog && (
        <Box className="catalog-search-sticky">
          <ModernSearchBar
            value={searchTerm}
            onChange={(value) => {
              setSearchTerm(value);
            }}
            placeholder="Buscar productos por nombre, categoría o banco..."
          />
        </Box>
      )}

      <Container 
        maxWidth="lg" 
        className="conteiner-list"
        sx={{
          paddingTop: { xs: 1, sm: 2 },
          paddingBottom: { xs: 4, sm: 5 },
        }}
      >
      {/* Banner de productos destacados */}
      {!loading && productos.length > 0 && (
        <FeaturedProductsBanner
          productos={productos}
          onAddToCart={(prod) => {
            addToCart(prod);
            trackAddToCart("Catálogo 9", prod);
          }}
          onToggleFavorite={(prod) => toggleFavorite(prod)}
          selectedCuota={'9 cuotas sin interés'}
          isContado={false}
          cuotaKey="nueve_sin_interes"
          cuotasTexto="9 cuotas"
          bankLogos={bankLogos}
        />
      )}

      {/* Error state */}
      {error && !loading && (
        <Box sx={{ textAlign: 'center', py: 6, px: 2 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Error al cargar productos
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              {error}
            </Typography>
            <Button
              variant="contained"
              onClick={() => {
                setError(null);
                setLoading(true);
                const loadInitialData = async () => {
                  const result = await getData();
                  if (!result.success) {
                    setError(result.error || 'Error al cargar productos. Por favor, intenta recargar la página.');
                    setProductos([]);
                    setProductosOriginales([]);
                    setProductosAgrupados({});
                    setLoading(false);
                    return;
                  }
                  const productosData = result.data || [];
                  const productosFiltrados = productosData.filter(
                    (producto) => (producto?.vigencia || '').toLowerCase() !== "no"
                  );
                  const productosUnicos = eliminarDuplicados(productosFiltrados);
                  setProductos(productosUnicos);
                  setProductosOriginales(productosUnicos);
                  agruparProductosPorLinea(productosUnicos);
                  setLoading(false);
                };
                loadInitialData();
              }}
            >
              Reintentar
            </Button>
          </Alert>
        </Box>
      )}

      {/* Loading state */}
      {loading && (
        <Box>
          <LinearProgress sx={{ marginBottom: 3 }} />
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(2, 1fr)',
                lg: 'repeat(3, 1fr)',
              },
              gap: { xs: 3, sm: 3, md: 4 },
            }}
          >
            {[...Array(6)].map((_, idx) => (
              <Skeleton
                key={idx}
                variant="rectangular"
                height={400}
                sx={{
                  borderRadius: 3,
                  animation: 'wave',
                }}
              />
            ))}
          </Box>
          <LoadingFallbackCatalog />
        </Box>
      )}

      {/* Toggle de columnas - Solo una vez, fuera del map de categorías */}
      {!loading && Object.keys(productosAMostrar).length > 0 && (
        <Box sx={{ display: { xs: 'flex', sm: 'none' }, justifyContent: 'flex-end', mb: 2 }}>
          <ColumnLayoutToggle
            mobileColumns={mobileColumns}
            onToggle={toggleColumns}
            variant="icons"
            size="small"
          />
        </Box>
      )}

      {/* Productos */}
      {!loading && Object.keys(productosAMostrar).map((linea) => (
        <Box key={linea} sx={{ marginBottom: { xs: 4, sm: 5 } }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: { xs: 2, sm: 3 } }}>
            <Typography 
              variant="h5" 
              sx={{
                fontSize: { xs: '1.25rem', sm: '1.5rem' },
                fontWeight: 600,
                color: '#222222',
              }}
            >
              Línea: <Box component="span" sx={{ fontWeight: 700 }}>{linea}</Box>
            </Typography>
          </Box>
          
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: mobileColumns === 1 ? '1fr' : 'repeat(2, 1fr)',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(2, 1fr)',
                lg: 'repeat(3, 1fr)',
              },
              gap: { xs: mobileColumns === 1 ? 2.5 : 1.5, sm: 2.5, md: 3 },
            }}
          >
            {productosAMostrar[linea].map((product) => {
              const bankPromo = getBankPromoForProduct(product);
              
              return (
                <ModernProductCardAirbnb
                  key={product.id || product.codigo}
                  product={product}
                  onAddToCart={(prod) => {
                    addToCart(prod);
                    trackAddToCart("Catálogo 9", prod);
                  }}
                  onToggleFavorite={(prod, isFavorite) => {
                    toggleFavorite(prod);
                  }}
                  selectedCuota={'9 cuotas sin interés'}
                  isContado={false}
                  isNew={product.nuevo === 'si' || product.nuevo === true || product.nuevo === 'Sí'}
                  isBestSeller={product.mas_vendida === 'si' || product.mas_vendida === true || product.mas_vendida === 'Sí'}
                  stockLow={
                    product.stock_actual && product.stock_total &&
                    parseFloat(product.stock_actual) > 0 && parseFloat(product.stock_total) > 0 &&
                    (parseFloat(product.stock_actual) / parseFloat(product.stock_total)) < 0.2
                  }
                  bankLogos={bankLogos}
                  bankPromo={bankPromo}
                  isCompactMode={mobileColumns === 2}
                />
              );
            })}
          </Box>
        </Box>
      ))}

      {/* Carrito moderno */}
      <ModernCartBottomSheet 
        cart={cart} 
        setCart={setCart} 
        cuotaKey="nueve_sin_interes" 
        cuotasTexto="9 cuotas" 
      />
      </Container>

      {/* Botón volver arriba */}
      {showScrollTop && (
        <Button
          variant="contained"
          color="primary"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          sx={{
            position: "fixed",
            bottom: isMobile ? 90 : 90,
            left: 24,
            zIndex: 999,
            backgroundColor: theme => theme.palette.primary.main,
            borderRadius: "50%",
            minWidth: 0,
            width: 48,
            height: 48,
            boxShadow: 3,
            fontSize: 24,
            '&:hover': {
              backgroundColor: theme => theme.palette.primary.dark,
            },
          }}
        >
          ↑
        </Button>
      )}

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default Catalogo9;
