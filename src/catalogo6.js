/* eslint-disable */
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
import { Snackbar, Alert, Typography, Box } from "@mui/material";
import { trackCatalogView, trackCatalogSearch, trackAddToCart, trackToggleFavorite } from "./utils/analytics";
import { useAuth } from "./AuthContext";

const Catalogo6 = () => {
  const { logout } = useAuth();
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
  const [bankLogos, setBankLogos] = useState([]); // Logos de bancos para promociones

  const sumarEnvio = localStorage.getItem("sumarEnvio") === "true";

  const cuotasMap = useMemo(() => ({
    "6 cuotas sin interés": 'seis_sin_interes',
  }), []);

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
      return result.data;
    } catch (error) {
      console.error("Error cargando productos:", error);
      return [];
    }
  };

  useEffect(() => {
    // GA: vista de catálogo
    trackCatalogView("Catálogo", "6 cuotas sin interés");

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
    const handleScroll = () => setIsSticky(window.scrollY > 100);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Cargar logos de bancos por catálogo (nueva lógica)
  useEffect(() => {
    const loadBankLogos = async () => {
      try {
        const { getBankLogosForCatalogo } = await import('./utils/catalogoPromosAPI');
        const logos = await getBankLogosForCatalogo('/catalogo6');
        setBankLogos(logos);
      } catch (error) {
        console.warn('No se pudieron cargar logos de bancos para catálogo6:', error);
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
    // Filtrar por búsqueda y vigencia (excluyendo repuestos)
    let productosFiltrados = filterProducts(productos, filtro, true).filter(
      (producto) => normalizeString(producto?.linea) !== 'repuestos'
    );

    // GA: búsqueda
    if (filtro) {
      trackCatalogSearch("Catálogo 6", filtro);
    }

    // Filtrar por cuotas disponibles
    if (cuotasMap["6 cuotas sin interés"]) {
      const cuotaKey = cuotasMap["6 cuotas sin interés"];
      productosFiltrados = productosFiltrados.filter(
        (producto) => producto[cuotaKey] && producto[cuotaKey] !== 'NO'
      );
    }

    agruparProductosPorLinea(productosFiltrados);
  }, [filtro, productos, cuotasMap]);

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
    trackAddToCart("Catálogo 6", product);
  };

  const toggleFavorite = (product) => {
    let updatedFavorites;
    let message;

    if (favorites.some(fav => fav.id === product.id)) {
      updatedFavorites = favorites.filter(fav => fav.id !== product.id);
      message = `${product.descripcion} ha sido eliminado de tus favoritos`;
      setSnackbarSeverity('warning');
      trackToggleFavorite("Catálogo 6", product, false);
    } else {
      updatedFavorites = [...favorites, product];
      message = `${product.descripcion} ha sido agregado a tus favoritos`;
      setSnackbarSeverity('success');
      trackToggleFavorite("Catálogo 6", product, true);
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
        <title>Catálogo 6 Cuotas - Catálogo</title>
      </Helmet>

      {/* Header siempre visible */}
      <Navbar
        title="Catálogo 6 Cuotas"
        onLogout={logout}
        user={{ username: localStorage.getItem("activeSession") || "" }}
      />

      {/* Buscador sticky moderno fixed top: 0 */}
      <StickySearchBar
          value={filtro}
        onChange={(e) => {
          setFiltro(e.target.value);
          trackCatalogSearch("Catálogo 6", e.target.value);
        }}
        placeholder="Buscar Producto"
      />

      <Container 
        maxWidth="lg" 
        className="conteiner-list"
        sx={{
          paddingTop: { xs: 12, sm: 13 }, // Espacio para header (~64px) + search bar fixed (~80px)
          paddingBottom: { xs: 4, sm: 5 },
        }}
      >
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
          
          {/* Grid responsive estilo Airbnb */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr', // Mobile: 1 card por fila
                sm: 'repeat(2, 1fr)', // Tablet: 2 columnas
                md: 'repeat(2, 1fr)', // Desktop: 2 columnas
                lg: 'repeat(3, 1fr)', // Large: 3 columnas
              },
              gap: { xs: 3, sm: 3, md: 4 },
            }}
          >
            {productosAMostrar[linea].map((product) => (
              <ModernProductCardAirbnb
                key={product.id || product.codigo}
                product={product}
                bankLogos={bankLogos}
                onAddToCart={(prod) => {
                  addToCart(prod);
                  trackAddToCart("Catálogo 6", prod);
                }}
                onToggleFavorite={(prod, isFavorite) => {
                  toggleFavorite(prod);
                }}
                  selectedCuota={'6 cuotas sin interés'}
                isContado={false}
                // Badges opcionales
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
        cuotaKey="seis_sin_interes" 
        cuotasTexto="6 cuotas" 
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

export default Catalogo6;
