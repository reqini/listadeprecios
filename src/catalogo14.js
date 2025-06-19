import React, { useEffect, useState, useMemo } from "react";
import axios from "./utils/axios";
import Container from "@mui/material/Container";
import TextField from "@mui/material/TextField";
import Skeleton from "@mui/material/Skeleton";
import LinearProgress from "@mui/material/LinearProgress";
import { Helmet } from "react-helmet";
import ProductsCalatogo from "./components/productsCalatogo";
import logo from "./assets/logo.png";
import { Snackbar, Alert, Typography } from "@mui/material";
import ShoppingCartCatalogo from "./components/ShoppingCartCatalogo";

const Catalogo14 = () => {
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
    "14 cuotas sin interés": 'catorce_sin_interes',
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
    const loadInitialData = async () => {
      setLoading(true);
      const productosData = await getData();
      const productosFiltrados = productosData.filter(producto => producto.vigencia?.toLowerCase() !== "no");
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
    producto.descripcion?.toLowerCase().includes(filtro.toLowerCase()) &&
    producto.linea?.toLowerCase() !== 'repuestos'
  );

  if (cuotasMap["14 cuotas sin interés"]) {
    const cuotaKey = cuotasMap["14 cuotas sin interés"];
    productosFiltrados = productosFiltrados.filter(
      (producto) => {
        const cuotaValue = producto[cuotaKey]?.trim();
        return cuotaValue && cuotaValue !== 'NO' && cuotaValue !== '';
      }
    );
  }

  agruparProductosPorLinea(productosFiltrados);
}, [filtro, productos, cuotasMap]);

  // Añadir producto al carrito
  const addToCart = (product) => {
    setCart([...cart, product]);
  };

  // Manejar favoritos
  const toggleFavorite = (product) => {
    let updatedFavorites;
    let message;

    if (favorites.some(fav => fav.id === product.id)) {
      updatedFavorites = favorites.filter(fav => fav.id !== product.id);
      message = `${product.descripcion} ha sido eliminado de tus favoritos`;
      setSnackbarSeverity('warning');
    } else {
      updatedFavorites = [...favorites, product];
      message = `${product.descripcion} ha sido agregado a tus favoritos`;
      setSnackbarSeverity('success');
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
    <Container maxWidth="lg" className="conteiner-list">
      <Helmet>
        <title>Catálogo 14 Cuotas - Catálogo</title>
      </Helmet>
      <div className="w-100 flex justify-center items-center flex-direction mar-t10">
        <Typography fontSize={13} margin={'6px 0 12px 0'} style={{textAlign: 'center'}}>
            <b>Desarrollado por:</b><br></br>
            <b>
              <a href="https://www.instagram.com/lrecchini/" rel="noreferrer"> Luciano Recchini</a>
            </b>
          </Typography>
        <img src={logo} alt="logo" width="200" className="mar-t10 mar-b20" />
      </div>

      <div className={`header-catalogo flex-center pad10 ${isSticky ? "sticky" : ""}`}>
        <TextField
          style={{ maxWidth: 450 }}
          fullWidth
          className="search"
          id="outlined-basic"
          label="Buscar Producto"
          variant="outlined"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
        />
      </div>

      {loading && (
        <>
          <LinearProgress />
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
        </>
      )}

      {Object.keys(productosAMostrar).map((linea) => (
        <div key={linea} className="linea-section">
          <Typography variant="h5" gutterBottom margin="20px 0">
            Línea: <b>{linea}</b>
          </Typography>
          <ul className="lista-prod-catalog w-100">
            {productosAMostrar[linea].map((product) => (
              <li className="grid-item" key={product.id}>
                <ProductsCalatogo
                  product={product}
                  onAddToCart={addToCart}
                  isFavorite={favorites.some(fav => fav.id === product.id)}
                  onToggleFavorite={() => toggleFavorite(product)}
                  selectedCuota={'14 cuotas sin interés'}
                  sumarEnvio={sumarEnvio}
                  costoEnvio={17362}
                />
              </li>
            ))}
          </ul>
        </div>
      ))}
      <ShoppingCartCatalogo cart={cart} setCart={setCart} cuotaKey="catorce_sin_interes" cuotasTexto="14 cuotas" />
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Catalogo14;
