import React, { useEffect, useState, useMemo } from "react";
import { filterProducts, normalizeString } from "./utils/searchUtils";
import axios from "./utils/axios";
import Container from "@mui/material/Container";
import Skeleton from "@mui/material/Skeleton";
import LinearProgress from "@mui/material/LinearProgress";
import { Helmet } from "react-helmet";
import ModernProductCardAirbnb from "./components/ModernProductCardAirbnb";
import StickySearchBar from "./components/StickySearchBar";
import ModernCartBottomSheet from "./components/ModernCartBottomSheet";
import Navbar from "./components/Navbar";
import FeaturedProductsBanner from "./components/FeaturedProductsBanner";
import { Snackbar, Alert, Typography, Box, Button } from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import { trackCatalogView, trackCatalogSearch, trackAddToCart, trackToggleFavorite } from "./utils/analytics";
import { useAuth } from "./AuthContext";


const Catalogo3 = () => {
  const { logout } = useAuth();
  const isMobile = useMediaQuery('(max-width:600px)');
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productos, setProductos] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // Estado SOLO para el input - independiente
  const [productosAgrupados, setProductosAgrupados] = useState({});
  const [favorites, setFavorites] = useState([]);
  const [showFavorites, setShowFavorites] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [bankPromos] = useState([]); // Promos de bancos (legacy, usar bankLogos)
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Mapeo correcto de cuotas
  const cuotasMap = useMemo(() => ({
    "3 cuotas sin interés": 'tres_sin_interes',
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
      return result.data;
    } catch (error) {
      console.error("Error cargando productos:", error);
      return [];
    }
  };

  // Cargar favoritos desde localStorage al montar
  useEffect(() => {
    try {
      const savedFavorites = localStorage.getItem('favorites');
      if (savedFavorites) {
        let favorites = JSON.parse(savedFavorites);
        // Eliminar duplicados
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

  // Cargar logos de bancos por catálogo (nueva lógica)
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
        // Cargar desde API de promos por catálogo
        const { getBankLogosForCatalogo } = await import('./utils/catalogoPromosAPI');
        const logos = await getBankLogosForCatalogo('/catalogo3');
        setBankLogos(logos);
      } catch (error) {
        console.warn('No se pudieron cargar logos de bancos para catálogo3:', error);
        setBankLogos([]);
      }
    };
    
    loadBankLogos();
    
    // Escuchar actualizaciones de promos
    const handlePromosUpdate = () => {
      loadBankLogos();
    };
    window.addEventListener('catalogoPromosUpdated', handlePromosUpdate);
    return () => window.removeEventListener('catalogoPromosUpdated', handlePromosUpdate);
  }, []);

  useEffect(() => {
    // GA: vista de catálogo
    trackCatalogView("Catálogo", "3 cuotas sin interés");
    
    const loadInitialData = async () => {
      setLoading(true);
      const productosData = await getData();
      const productosFiltrados = productosData.filter(
        (producto) => (producto?.vigencia || '').toLowerCase() !== "no"
      );
      const productosUnicos = eliminarDuplicados(productosFiltrados);
      setProductos(productosUnicos);
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

  // StickySearchBar está siempre fixed, no necesita manejo de scroll

  // Filtrar productos según descripción, línea, categoría y cuota
  // Usa función mejorada con normalización de acentos
  // Optimizado con useMemo para evitar re-renders innecesarios
  // NO modifica productos original, solo filtra para render
  useEffect(() => {
    // Filtrar por búsqueda y vigencia (excluyendo repuestos)
    let productosFiltrados = filterProducts(productos, searchTerm, true).filter(
      (producto) => normalizeString(producto?.linea) !== 'repuestos'
    );

    // GA: búsqueda (solo si hay término)
    if (searchTerm && searchTerm.trim()) {
      trackCatalogSearch("Catálogo 3", searchTerm);
    }

    // Filtrar por cuotas disponibles
    if (cuotasMap["3 cuotas sin interés"]) {
      const cuotaKey = cuotasMap["3 cuotas sin interés"];
      productosFiltrados = productosFiltrados.filter(
        (producto) => producto[cuotaKey] && producto[cuotaKey] !== 'NO'
      );
    }

    agruparProductosPorLinea(productosFiltrados);
  }, [searchTerm, productos, cuotasMap]);

  // Añadir producto al carrito
  const addToCart = (product) => {
    setCart((prevCart) => {
      // Buscar si el producto ya existe en el carrito (por código)
      const existingIndex = prevCart.findIndex(
        (item) => item.codigo === product.codigo
      );
      
      if (existingIndex >= 0) {
        // Si existe, incrementar la cantidad
        const updatedCart = [...prevCart];
        updatedCart[existingIndex] = {
          ...updatedCart[existingIndex],
          cantidad: (updatedCart[existingIndex].cantidad || 1) + 1,
        };
        return updatedCart;
      } else {
        // Si no existe, agregarlo con cantidad 1
        return [...prevCart, { ...product, cantidad: 1 }];
      }
    });
    // GA: agregar al carrito
    trackAddToCart("Catálogo 3", product);
  };

  // Manejar favoritos - CORREGIDO para evitar duplicados
  const toggleFavorite = (product) => {
    try {
      // Obtener favoritos actuales desde localStorage (fuente de verdad)
      const savedFavorites = localStorage.getItem('favorites');
      let currentFavorites = savedFavorites ? JSON.parse(savedFavorites) : [];
      
      // Eliminar duplicados
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
      
      // Verificar si el producto ya está en favoritos
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
        // Eliminar de favoritos
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
        trackToggleFavorite("Catálogo 3", product, false);
      } else {
        // Agregar a favoritos
        updatedFavorites = [...currentFavorites, product];
        message = `${product.descripcion} ha sido agregado a tus favoritos`;
        setSnackbarSeverity('success');
        trackToggleFavorite("Catálogo 3", product, true);
      }

      // Actualizar estado y localStorage
      setFavorites(updatedFavorites);
      localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
      
      // Disparar evento para sincronizar otros componentes
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

  // Función helper para obtener promo de banco asociada a un producto
  const getBankPromoForProduct = (product) => {
    if (!bankPromos || bankPromos.length === 0) return null;
    
    // Buscar promo según banco del producto (si existe campo banco)
    if (product.banco) {
      const promo = bankPromos.find(p => 
        p.banco && product.banco && 
        (p.banco.toUpperCase().includes(product.banco.toUpperCase()) ||
         product.banco.toUpperCase().includes(p.banco.toUpperCase()))
      );
      if (promo) return promo;
    }
    
    // Buscar por código de banco si existe
    if (product.banco_codigo) {
      const promo = bankPromos.find(p => 
        p.banco_codigo === product.banco_codigo
      );
      if (promo) return promo;
    }
    
    // Retornar primera promo activa como fallback (opcional)
    // return bankPromos[0] || null;
    return null;
  };

  // Productos que se deben mostrar
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
        <title>Catálogo 3 Cuotas - Catálogo</title>
      </Helmet>
      
      {/* Header oculto */}
      {/* <Navbar
        title="Catálogo 3 Cuotas"
        onLogout={logout}
        user={{ username: localStorage.getItem("activeSession") || "" }}
      /> */}
      
      {/* Buscador oculto */}
      {/* <StickySearchBar
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value); // Actualizar inmediatamente el input (sin debounce)
        }}
        placeholder="Buscar Producto"
      /> */}

      <Container 
        maxWidth="lg" 
        className="conteiner-list"
        sx={{
          paddingTop: { xs: 2, sm: 3 }, // Espacio reducido ya que header y search están ocultos
          paddingBottom: { xs: 4, sm: 5 },
        }}
      >
      {/* <div>
        <Button
          onClick={handleExportarPDF}
          variant="contained"
          color="primary"
          style={{ margin: '12px 0' }}
        >
          Exportar catálogo a PDF (tabla)
        </Button>
      </div> */}

      {/* Banner de productos destacados */}
      {!loading && productos.length > 0 && (
        <FeaturedProductsBanner
          productos={productos}
          onAddToCart={(prod) => {
            addToCart(prod);
            trackAddToCart("Catálogo 3", prod);
          }}
          onToggleFavorite={(prod) => toggleFavorite(prod)}
          selectedCuota={'3 cuotas sin interés'}
          isContado={false}
          cuotaKey="tres_sin_interes"
          cuotasTexto="3 cuotas"
          bankLogos={bankLogos}
        />
      )}

      {/* Loading state - Skeleton moderno */}
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
        </Box>
      )}

      {/* Productos - Layout moderno mobile-first */}
      {!loading && Object.keys(productosAMostrar).map((linea) => (
        <Box key={linea} sx={{ marginBottom: { xs: 4, sm: 5 } }}>
          <Typography 
            variant="h5" 
            sx={{
              fontSize: { xs: '1.25rem', sm: '1.5rem' },
              fontWeight: 600,
              marginBottom: { xs: 2, sm: 3 },
              color: '#222222',
            }}
          >
            Línea: <Box component="span" sx={{ fontWeight: 700 }}>{linea}</Box>
          </Typography>
          
          {/* Grid responsive estilo Airbnb - Cards más compactas */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr', // Mobile: 1 card por fila
                sm: 'repeat(2, 1fr)', // Tablet: 2 columnas
                md: 'repeat(2, 1fr)', // Desktop: 2 columnas
                lg: 'repeat(3, 1fr)', // Large: 3 columnas
              },
              gap: { xs: 2.5, sm: 2.5, md: 3 }, // Gaps más compactos
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
                    trackAddToCart("Catálogo 3", prod);
                  }}
                  onToggleFavorite={(prod, isFavorite) => {
                    toggleFavorite(prod);
                  }}
                  selectedCuota={'3 cuotas sin interés'}
                  isContado={false}
                  // Badges desde datos del producto - Administrables
                  isNew={product.nuevo === 'si' || product.nuevo === true || product.nuevo === 'Sí'}
                  isBestSeller={product.mas_vendida === 'si' || product.mas_vendida === true || product.mas_vendida === 'Sí'}
                  stockLow={
                    product.stock_actual && product.stock_total &&
                    parseFloat(product.stock_actual) > 0 && parseFloat(product.stock_total) > 0 &&
                    (parseFloat(product.stock_actual) / parseFloat(product.stock_total)) < 0.2
                  }
                  bankLogos={bankLogos}
                  bankPromo={bankPromo}
                />
              );
            })}
          </Box>
        </Box>
      ))}

      {/* Carrito moderno con bottom sheet */}
      <ModernCartBottomSheet 
        cart={cart} 
        setCart={setCart} 
        cuotaKey="tres_sin_interes" 
        cuotasTexto="3 cuotas" 
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

export default Catalogo3;
