import React, { useEffect, useState, useMemo } from "react";
import axios from "./utils/axios";
import Container from "@mui/material/Container";
import Skeleton from "@mui/material/Skeleton";
import LinearProgress from "@mui/material/LinearProgress";
import Typography from "@mui/material/Typography";
import { Helmet } from "react-helmet";
import ProductCatalogoNegocio from "./components/productCalatogoNegocio";
import logo from "./assets/logo.png";
import { normalizeString } from "./utils/searchUtils";
import { filterAllProducts } from "./utils/filterProducts";
import LaunchProductsCarousel from "./components/LaunchProductsCarousel";
import ModernSearchBar from "./components/ModernSearchBar";
import { Alert, Box, Button } from "@mui/material";
import LoadingFallbackCatalog from "./components/LoadingFallbackCatalog";
import { IS_CHRISTMAS_MODE } from "./config/christmasConfig";


const Contado = () => {
  const [loading, setLoading] = useState(true);
  const [productos, setProductos] = useState([]);
  const [productosOriginales, setProductosOriginales] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);


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

      <Box className="catalog-search-sticky">
        <ModernSearchBar
          value={searchTerm}
          onChange={(value) => {
            setSearchTerm(value);
          }}
          placeholder="Buscar productos por nombre, categoría o banco..."
        />
      </Box>

      <Container maxWidth="lg" className="conteiner-list">
      <div className="w-100 flex justify-center items-center flex-direction mar-t10">
        <Typography fontSize={13} margin={'6px 0 12px 0'}>
          Desarrollado por: <b><a href="https://www.instagram.com/lrecchini/" rel="noreferrer">Luciano Recchini</a></b>
        </Typography>
        <img src={logo} alt="logo" width="200" className="mar-t10 mar-b20" />
      </div>

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
        <ul className="lista-prod-catalog w-100">
          {productosFiltrados.map((product) => (
            <li className="grid-item" key={product.id}>
              <ProductCatalogoNegocio product={product} costoEnvio={17362} />
            </li>
          ))}
        </ul>
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
