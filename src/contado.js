import React, { useEffect, useState, useMemo, useRef } from "react";
import axios from "./utils/axios";
import Container from "@mui/material/Container";
import Skeleton from "@mui/material/Skeleton";
import LinearProgress from "@mui/material/LinearProgress";
import Typography from "@mui/material/Typography";
import { Helmet } from "react-helmet";
import ModernProductCardAirbnb from "./components/ModernProductCardAirbnb";
import { normalizeString } from "./utils/searchUtils";
import { filterAllProducts } from "./utils/filterProducts";
import LaunchProductsCarousel from "./components/LaunchProductsCarousel";
import ModernSearchBar from "./components/ModernSearchBar";
import { Alert, Box, Button } from "@mui/material";
import LoadingFallbackCatalog from "./components/LoadingFallbackCatalog";
import { IS_CHRISTMAS_MODE } from "./config/christmasConfig";
import { useColumnLayout } from "./hooks/useColumnLayout";
import ColumnLayoutToggle from "./components/ColumnLayoutToggle";
import useMediaQuery from "@mui/material/useMediaQuery";


const Contado = () => {
  const isMobile = useMediaQuery('(max-width:600px)');
  const [loading, setLoading] = useState(true);
  const [productos, setProductos] = useState([]);
  const [productosOriginales, setProductosOriginales] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [isSearchSticky, setIsSearchSticky] = useState(false);
  const searchBarRef = useRef(null);
  
  const { mobileColumns, toggleColumns } = useColumnLayout('contado', 2);


  const eliminarDuplicados = (productos) => {
    return productos.reduce((acc, producto) => {
      if (!acc.some((item) => item.codigo === producto.codigo)) {
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
    const loadInitialData = async () => {
      setLoading(true);
      setError(null);
      const result = await getData();
      
      if (!result.success) {
        setError(result.error || 'Error al cargar productos. Por favor, intenta recargar la página.');
        setProductos([]);
        setProductosOriginales([]);
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
      setLoading(false);
    };

    loadInitialData();
  }, []);

  // Hacer search bar sticky al hacer scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      
      if (searchBarRef.current) {
        const searchBarTop = searchBarRef.current.offsetTop;
        setIsSearchSticky(scrollTop > searchBarTop);
      }
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const productosFiltrados = useMemo(() => {
    if (!productos || productos.length === 0) return [];
    
    const productosBase = productosOriginales.length > 0 ? productosOriginales : productos;
    let filtrados = searchTerm 
      ? filterAllProducts(productosBase, searchTerm)
      : productosBase;
    
    filtrados = filtrados.filter(
      (producto) => normalizeString(producto?.linea) !== 'repuestos'
    );
    
    return filtrados;
  }, [productos, productosOriginales, searchTerm]);

  return (
    <>
      <Helmet>
        <title>Catálogo Contado - Contado</title>
      </Helmet>

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

      {/* Search Bar - Fixed al hacer scroll */}
      <Box
        ref={searchBarRef}
        sx={{
          position: isSearchSticky ? 'fixed' : 'relative',
          top: isSearchSticky ? 0 : 'auto',
          left: 0,
          right: 0,
          zIndex: isSearchSticky ? 1100 : 'auto',
          backgroundColor: isSearchSticky ? 'rgba(255, 255, 255, 0.95)' : 'transparent',
          backdropFilter: isSearchSticky ? 'blur(10px)' : 'none',
          boxShadow: isSearchSticky ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
          transition: 'all 0.3s ease',
        }}
      >
        <ModernSearchBar
          value={searchTerm}
          onChange={(value) => {
            setSearchTerm(value);
          }}
          placeholder="Buscar productos por nombre, categoría o banco..."
          sx={{
            paddingX: { xs: 2, sm: 3 },
            paddingY: isSearchSticky ? { xs: 1.5, sm: 2 } : { xs: 2, sm: 2.5 },
            marginBottom: 0,
          }}
        />
      </Box>
      {/* Spacer para compensar el espacio cuando está fixed */}
      {isSearchSticky && (
        <Box sx={{ height: { xs: '88px', sm: '96px' } }} />
      )}

      <Container maxWidth="lg" className="conteiner-list">

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

      {/* Switch y carrusel antiguo eliminados de catálogos comunes */}

      {/* Carrousel de Lanzamientos / Entrega Inmediata */}
      {!loading && productos.length > 0 && (
        <LaunchProductsCarousel
          productos={productos}
          onAddToCart={(prod) => {
            // Opcional: implementar agregar al carrito si este catálogo lo requiere
            console.log('Producto para agregar:', prod);
          }}
          onProductClick={(prod) => {
            console.log('Producto clickeado:', prod);
          }}
        />
      )}

      {loading && (
        <Box>
          <LinearProgress sx={{ marginBottom: 3 }} />
          <ul className="lista-prod-catalog w-100">
            {[...Array(8)].map((_, idx) => (
              <Skeleton
                key={idx}
                sx={{ height: 300, margin: 1 }}
                animation="wave"
                variant="rectangular"
                className="grid-item"
              />
            ))}
          </ul>
          <LoadingFallbackCatalog />
        </Box>
      )}

      {!loading && !error && productosFiltrados.length > 0 ? (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: { xs: 2, sm: 3 } }}>
            <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
              <ColumnLayoutToggle
                mobileColumns={mobileColumns}
                onToggle={toggleColumns}
                variant="toggle"
                size="small"
              />
            </Box>
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
            {productosFiltrados.map((product) => (
              <ModernProductCardAirbnb
                key={product.id || product.codigo}
                product={product}
                onAddToCart={(prod) => {
                  console.log('Producto para agregar:', prod);
                }}
                onToggleFavorite={(prod) => {
                  // Manejar favoritos si es necesario
                  console.log('Toggle favorite:', prod);
                }}
                selectedCuota={null}
                isContado={true}
                isNew={product.nuevo === 'si' || product.nuevo === true || product.nuevo === 'Sí'}
                isBestSeller={product.mas_vendida === 'si' || product.mas_vendida === true || product.mas_vendida === 'Sí'}
                stockLow={
                  product.stock_actual && product.stock_total &&
                  parseFloat(product.stock_actual) > 0 && parseFloat(product.stock_total) > 0 &&
                  (parseFloat(product.stock_actual) / parseFloat(product.stock_total)) < 0.2
                }
                isCompactMode={mobileColumns === 2}
              />
            ))}
          </Box>
        </Box>
      ) : searchTerm && searchTerm.trim() !== '' ? (
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <Typography variant="h6" sx={{ color: '#717171', marginBottom: 1 }}>
            No se encontraron productos
          </Typography>
          <Typography variant="body2" sx={{ color: '#999' }}>
            No hay productos que coincidan con "{searchTerm}". Intenta con otro término de búsqueda.
          </Typography>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <Typography variant="body2" sx={{ color: '#999' }}>
            No hay productos disponibles en este momento.
          </Typography>
        </div>
      )}
      </Container>
    </>
  );
};

export default Contado;
