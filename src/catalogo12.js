/* eslint-disable */
import React, { useEffect, useState, useMemo } from "react";
import axios from "./utils/axios";
import Container from "@mui/material/Container";
import Skeleton from "@mui/material/Skeleton";
import LinearProgress from "@mui/material/LinearProgress";
import { Helmet } from "react-helmet";
import ModernProductCardAirbnb from "./components/ModernProductCardAirbnb";
import ModernSearchBar from "./components/ModernSearchBar";
import ModernCartBottomSheet from "./components/ModernCartBottomSheet";
import Navbar from "./components/Navbar";
import LaunchProductsCarousel from "./components/LaunchProductsCarousel";
// Switch y carrusel antiguo eliminados de catálogos comunes
import { Snackbar, Alert, Typography, Box, Button } from "@mui/material";
import { trackCatalogView, trackCatalogSearch, trackAddToCart, trackToggleFavorite } from "./utils/analytics";
import { useAuth } from "./AuthContext";
import { parsePrice } from "./utils/priceUtils";
import { useIsIndividualCatalog } from "./utils/useCatalogContext";
import { filterAllProducts } from "./utils/filterProducts";
import { useColumnLayout } from "./hooks/useColumnLayout";
import ColumnLayoutToggle from "./components/ColumnLayoutToggle";

const Catalogo12 = () => {
  // Detectar si estamos en una ruta dinámica (catálogo individual)
  const isIndividualCatalog = useIsIndividualCatalog();
  const { logout } = useAuth();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productos, setProductos] = useState([]);
  const [productosOriginales, setProductosOriginales] = useState([]); // Productos originales sin filtrar
  const [searchTerm, setSearchTerm] = useState(""); // Nuevo estado para búsqueda
  const [productosAgrupados, setProductosAgrupados] = useState({});
  const [isSticky, setIsSticky] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [showFavorites, setShowFavorites] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [bankLogos, setBankLogos] = useState([]); // Logos de bancos para promociones
  const [error, setError] = useState(null); // Estado para manejar errores de carga
  const sumarEnvio = localStorage.getItem("sumarEnvio") === "true";
  
  // Hook para manejar el layout de columnas en mobile
  const { mobileColumns, toggleColumns } = useColumnLayout('catalogo12', 1);


  const eliminarDuplicados = (productos) => {
    return productos.reduce((acc, producto) => {
      if (!acc.some(item => item.codigo === producto.codigo)) {
        acc.push(producto);
      }
      return acc;
    }, []);
  };

  const getData = async () => {
    try {
      const result = await axios.get(`/api/productos`);
      return { success: true, data: result.data };
    } catch (error) {
      console.error("Error cargando productos:", error);
      return { success: false, error: error.message || 'Error al cargar productos', data: [] };
    }
  };

  useEffect(() => {
    // GA: vista de catálogo
    trackCatalogView("Catálogo", "12 cuotas sin interés");
    
    const loadInitialData = async () => {
      setLoading(true);
      setError(null); // Limpiar error anterior
      const result = await getData();
      
      if (!result.success) {
        // Si hay error, mostrar mensaje pero no quedarse en loading
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
      setProductosOriginales(productosUnicos); // Guardar productos originales
      setProductos(productosUnicos);
      agruparProductosPorLinea(productosUnicos);
      setLoading(false);
    };
    loadInitialData();
  }, []);

  const agruparProductosPorLinea = (productos) => {
    const productosPorLinea = productos.reduce((acc, producto) => {
      const { linea } = producto;
      if (!acc[linea]) acc[linea] = [];
      acc[linea].push(producto);
      return acc;
    }, {});
    setProductosAgrupados(productosPorLinea);
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 100);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Cargar logos de bancos por catálogo (nueva lógica)
  useEffect(() => {
    const loadBankLogos = async () => {
      try {
        const { getBankLogosForCatalogo } = await import('./utils/catalogoPromosAPI');
        const logos = await getBankLogosForCatalogo('/catalogo12');
        setBankLogos(logos);
      } catch (error) {
        console.warn('No se pudieron cargar logos de bancos para catálogo12:', error);
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

  const cuotasMap = useMemo(() => ({
    "12 cuotas sin interés": 'doce_sin_interes',
  }), []);

  // Filtrar productos usando useMemo para mejor performance
  const productosFiltrados = useMemo(() => {
    // Primero filtrar por búsqueda
    let productosConBusqueda = filterAllProducts(productosOriginales, searchTerm);

    // GA: búsqueda (solo si hay término)
    if (searchTerm && searchTerm.trim()) {
      trackCatalogSearch("Catálogo 12", searchTerm);
    }

    // Filtrar por cuotas disponibles
    if (cuotasMap["12 cuotas sin interés"]) {
      const cuotaKey = cuotasMap["12 cuotas sin interés"];
      productosConBusqueda = productosConBusqueda.filter(
        (producto) => producto[cuotaKey] && producto[cuotaKey] !== 'NO'
      );
    }

    return productosConBusqueda;
  }, [searchTerm, productosOriginales, cuotasMap]);

  // Agrupar productos filtrados cuando cambian
  useEffect(() => {
    if (productosFiltrados && productosFiltrados.length >= 0) {
      agruparProductosPorLinea(productosFiltrados);
      setProductos(productosFiltrados); // Actualizar productos mostrados
    }
  }, [productosFiltrados]);

  const addToCart = (product) => {
    // Obtener información de cuota del catálogo actual
    const cuotaKeyCatalogo = cuotasMap["12 cuotas sin interés"]; // 'doce_sin_interes'
    const cuotaValueRaw = product[cuotaKeyCatalogo] && product[cuotaKeyCatalogo] !== 'NO' 
      ? product[cuotaKeyCatalogo] 
      : null;
    const cuotaValue = cuotaValueRaw ? parsePrice(cuotaValueRaw) : null;
    
    // Preparar producto con información de cuota
    const productWithCuota = {
      ...product,
      // Si el producto ya tiene información de cuota (desde Home), mantenerla
      // Si no, usar la del catálogo actual
      selectedCuotaKey: product.selectedCuotaKey || cuotaKeyCatalogo,
      selectedCuotaValue: product.selectedCuotaValue || cuotaValue,
      selectedCuotaLabel: product.selectedCuotaLabel || "12 cuotas sin interés",
    };

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
          // Actualizar información de cuota si no tenía
          selectedCuotaKey: updatedCart[existingIndex].selectedCuotaKey || productWithCuota.selectedCuotaKey,
          selectedCuotaValue: updatedCart[existingIndex].selectedCuotaValue || productWithCuota.selectedCuotaValue,
          selectedCuotaLabel: updatedCart[existingIndex].selectedCuotaLabel || productWithCuota.selectedCuotaLabel,
        };
        return updatedCart;
      } else {
        // Si no existe, agregarlo con cantidad 1 y información de cuota
        return [...prevCart, { ...productWithCuota, cantidad: 1 }];
      }
    });
    // GA: agregar al carrito
    trackAddToCart("Catálogo 12", product);
  };

  const toggleFavorite = (product) => {
    const exists = favorites.some(fav => fav.id === product.id);
    const updatedFavorites = exists
      ? favorites.filter(fav => fav.id !== product.id)
      : [...favorites, product];
    const message = exists
      ? `${product.descripcion} ha sido eliminado de tus favoritos`
      : `${product.descripcion} ha sido agregado a tus favoritos`;
    
    trackToggleFavorite("Catálogo 12", product, !exists);
    
    setFavorites(updatedFavorites);
    localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
    setSnackbarMessage(message);
    setSnackbarSeverity(exists ? 'warning' : 'success');
    setSnackbarOpen(true);
    if (!updatedFavorites.length) {
      setShowFavorites(false);
      agruparProductosPorLinea(productos);
    }
  };

  const productosAMostrar = showFavorites
    ? Object.keys(productosAgrupados).reduce((acc, linea) => {
        const favoritos = productosAgrupados[linea].filter(product =>
          favorites.some(fav => fav.id === product.id)
        );
        if (favoritos.length) acc[linea] = favoritos;
        return acc;
      }, {})
    : productosAgrupados;

  return (
    <>
      <Helmet>
        <title>Catálogo 12 Cuotas - Catálogo</title>
      </Helmet>

      {/* Header oculto */}
      {/* <Navbar
        title="Catálogo 12 Cuotas"
        onLogout={logout}
        user={{ username: localStorage.getItem("activeSession") || "" }}
      /> */}
      
      {/* Buscador oculto en catálogos individuales */}
      {!isIndividualCatalog && (
        <ModernSearchBar
          value={searchTerm}
          onChange={(value) => {
            setSearchTerm(value); // Actualizar directamente el estado
          }}
          placeholder="Buscar productos por nombre, categoría o banco..."
        />
      )}

      <Container 
        maxWidth="lg" 
        className="conteiner-list"
        sx={{
          paddingTop: { xs: 1, sm: 2 }, // Espacio ajustado
          paddingBottom: { xs: 4, sm: 5 },
        }}
      >
      {/* Switch y carrusel antiguo eliminados de catálogos comunes */}
      
      {/* Carrousel de Lanzamientos / Entrega Inmediata */}
      {!loading && productos.length > 0 && (
        <LaunchProductsCarousel
          productos={productos}
          onAddToCart={(prod) => addToCart(prod)}
          onProductClick={(prod) => {
            console.log('Producto clickeado:', prod);
          }}
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
                  setProductosOriginales(productosUnicos);
                  setProductos(productosUnicos);
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
            
            {/* Toggle de columnas - Solo visible en mobile */}
            <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
              <ColumnLayoutToggle
                mobileColumns={mobileColumns}
                onToggle={toggleColumns}
                variant="icons"
                size="small"
              />
            </Box>
          </Box>
          
          {/* Grid responsive estilo Airbnb */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: mobileColumns === 1 ? '1fr' : 'repeat(2, 1fr)', // Mobile: 1 o 2 columnas según preferencia
                sm: 'repeat(2, 1fr)', // Tablet: 2 columnas
                md: 'repeat(2, 1fr)', // Desktop: 2 columnas
                lg: 'repeat(3, 1fr)', // Large: 3 columnas
              },
              gap: { xs: mobileColumns === 1 ? 3 : 1.5, sm: 3, md: 4 },
            }}
          >
            {productosAMostrar[linea].map((product) => (
              <ModernProductCardAirbnb
                key={product.id || product.codigo}
                product={product}
                onAddToCart={(prod) => {
                  addToCart(prod);
                  trackAddToCart("Catálogo 12", prod);
                }}
                onToggleFavorite={(prod, isFavorite) => {
                  toggleFavorite(prod);
                }}
                selectedCuota={'12 cuotas sin interés'}
                isContado={false}
                // Badges opcionales
                isNew={false}
                isBestSeller={false}
                stockLow={false}
                bankLogos={bankLogos}
                isCompactMode={mobileColumns === 2}
              />
            ))}
          </Box>
        </Box>
      ))}

      {/* Carrito moderno con bottom sheet */}
      <ModernCartBottomSheet 
        cart={cart} 
        setCart={setCart} 
        cuotaKey="doce_sin_interes" 
        cuotasTexto="12 cuotas" 
      />
      </Container>

      {/* SNACKBAR */}
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

export default Catalogo12;
