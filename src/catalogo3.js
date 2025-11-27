import React, { useEffect, useState, useMemo } from "react";
import axios from "./utils/axios";
import Container from "@mui/material/Container";
import Skeleton from "@mui/material/Skeleton";
import LinearProgress from "@mui/material/LinearProgress";
import { Helmet } from "react-helmet";
import ModernProductCardAirbnb from "./components/ModernProductCardAirbnb";
import StickySearchBar from "./components/StickySearchBar";
import ModernCartBottomSheet from "./components/ModernCartBottomSheet";
import { Snackbar, Alert, Typography, Box } from "@mui/material";
import { trackCatalogView, trackCatalogSearch, trackAddToCart, trackToggleFavorite } from "./utils/analytics";


const Catalogo3 = () => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productos, setProductos] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [productosAgrupados, setProductosAgrupados] = useState({});
  const [isSticky, setIsSticky] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [showFavorites, setShowFavorites] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const sumarEnvio = localStorage.getItem("sumarEnvio") === "true";

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

  useEffect(() => {
    // GA: vista de catálogo
    trackCatalogView("Catálogo", "3 cuotas sin interés");
    
    const loadInitialData = async () => {
      setLoading(true);
      const productosData = await getData();
      const productosFiltrados = productosData.filter(
        (producto) => (producto?.vigencia || '').toLowerCase() !== "no"
      ); // cambio 1
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

  // Manejar el scroll para sticky header
  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      setIsSticky(offset > 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Filtrar productos según descripción, línea y cuota
  useEffect(() => {
    let productosFiltrados = productos.filter((producto) =>
      (producto?.descripcion || '').toLowerCase().includes(filtro.toLowerCase()) &&
      (producto?.linea || '').toLowerCase() !== 'repuestos'
    ); // cambio 2

    // GA: búsqueda
    trackCatalogSearch("Catálogo 3", filtro);

    if (cuotasMap["3 cuotas sin interés"]) {
      const cuotaKey = cuotasMap["3 cuotas sin interés"];
      productosFiltrados = productosFiltrados.filter(
        (producto) => producto[cuotaKey] && producto[cuotaKey] !== 'NO'
      );
    }

    agruparProductosPorLinea(productosFiltrados);
  }, [filtro, productos, cuotasMap]);

  // Añadir producto al carrito
  const addToCart = (product) => {
    setCart([...cart, product]);
    // GA: agregar al carrito
    trackAddToCart("Catálogo 3", product);
  };

  // Manejar favoritos
  const toggleFavorite = (product) => {
    let updatedFavorites;
    let message;

    if (favorites.some(fav => fav.id === product.id)) {
      updatedFavorites = favorites.filter(fav => fav.id !== product.id);
      message = `${product.descripcion} ha sido eliminado de tus favoritos`;
      setSnackbarSeverity('warning');
      trackToggleFavorite("Catálogo 3", product, false);
    } else {
      updatedFavorites = [...favorites, product];
      message = `${product.descripcion} ha sido agregado a tus favoritos`;
      setSnackbarSeverity('success');
      trackToggleFavorite("Catálogo 3", product, true);
    }

    setFavorites(updatedFavorites);
    localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
    setSnackbarMessage(message);
    setSnackbarOpen(true);

    if (updatedFavorites.length === 0) {
      setShowFavorites(false);
      agruparProductosPorLinea(productos);
    }
  };

  // Productos que se deben mostrar
  const productosAMostrar = showFavorites
    ? Object.keys(productosAgrupados).reduce((acc, linea) => {
        const productosFavoritos = productosAgrupados[linea].filter(product =>
          favorites.some(fav => fav.id === product.id)
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
      
      {/* Buscador sticky moderno */}
      <StickySearchBar
        value={filtro}
        onChange={(e) => {
          setFiltro(e.target.value);
          trackCatalogSearch("Catálogo 3", e.target.value);
        }}
        placeholder="Buscar Producto"
      />

      <Container 
        maxWidth="lg" 
        className="conteiner-list"
        sx={{
          paddingTop: { xs: 1, sm: 2 }, // Reducido porque el buscador ya tiene spacer
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
            {productosAMostrar[linea].map((product) => (
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
                // Badges opcionales (puedes agregar lógica para detectarlos desde product)
                isNew={false}
                isBestSeller={false}
                stockLow={false}
              />
            ))}
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
