/* eslint-disable */
import React, { useEffect, useState, useMemo } from "react";
import axios from "./utils/axios";
import Container from "@mui/material/Container";
import TextField from "@mui/material/TextField";
import Skeleton from "@mui/material/Skeleton";
import { Helmet } from "react-helmet";
import ProductsCalatogo from "./components/productsCalatogo";
import logo from './assets/logo.png';
import { Snackbar, Alert, Typography } from "@mui/material";
import ShoppingCartCatalogo from "./components/ShoppingCartCatalogo";
import { filterProducts, normalizeString } from "./utils/searchUtils";
import LaunchProductsCarousel from "./components/LaunchProductsCarousel";

const Catalogo9 = () => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);  // Carga inicial
  const [productos, setProductos] = useState([]); // Lista ORIGINAL de productos - NUNCA modificar
  const [searchTerm, setSearchTerm] = useState(""); // Estado SOLO para el input - independiente
  const [productosAgrupados, setProductosAgrupados] = useState({});
  const [isSticky, setIsSticky] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [showFavorites, setShowFavorites] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
    const sumarEnvio = localStorage.getItem("sumarEnvio") === "true";

  // Eliminar productos duplicados por código o ID
  const eliminarDuplicados = (productos) => {
    const productosUnicos = productos.reduce((acc, producto) => {
      if (!acc.some(item => item.codigo === producto.codigo)) {
        acc.push(producto);
      }
      return acc;
    }, []);
    return productosUnicos;
  };

  // Cargar productos desde la API (sin carga incremental)
  const getData = async () => {
    const result = await axios.get(`/api/productos`);
    return result.data;
  };

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      const productosData = await getData();  // Cargar todos los productos de una vez
const productosFiltrados = productosData.filter(
  (producto) => (producto?.vigencia || '').toLowerCase() !== "no"
);

      const productosUnicos = eliminarDuplicados(productosFiltrados);  // Eliminar duplicados
      setProductos(productosUnicos);
      agruparProductosPorLinea(productosUnicos);
      setLoading(false);  // Detener el estado de carga cuando los productos se hayan cargado completamente
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

  // Manejar scroll para hacer sticky el header
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

  // Uso de useMemo para mantener cuotasMap sin cambios en cada render
  const cuotasMap = useMemo(() => ({
    "9 cuotas sin interés": 'doce_sin_interes',
  }), []);

  // Filtrado DIRECTO desde searchTerm usando useMemo - SIN useEffect que cause loops
  // NO modifica productos original, solo filtra para render
  // Usa función optimizada con normalización de acentos y búsqueda robusta
  const productosFiltrados = useMemo(() => {
    // Si no hay productos, retornar vacío
    if (!productos || productos.length === 0) return [];
    
    // Filtrar usando la función optimizada de searchUtils
    let filtrados = filterProducts(productos, searchTerm, true);
    
    // Excluir repuestos
    filtrados = filtrados.filter(
      (producto) => normalizeString(producto?.linea) !== 'repuestos'
    );
    
    // Filtrar por cuotas disponibles
    if (cuotasMap["9 cuotas sin interés"]) {
      const cuotaKey = cuotasMap["9 cuotas sin interés"];
      filtrados = filtrados.filter(
        (producto) => producto[cuotaKey] && producto[cuotaKey] !== 'NO'
      );
    }
    
    return filtrados;
  }, [productos, searchTerm, cuotasMap]); // Dependencias: productos original, searchTerm y cuotasMap

  // Agrupar productos por línea cuando cambian los productos filtrados
  useEffect(() => {
    agruparProductosPorLinea(productosFiltrados);
  }, [productosFiltrados]);

  // Añadir producto al carrito
  const addToCart = (product) => {
    setCart([...cart, product]);
  };

  // Manejar el agregado y eliminación de favoritos
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

    // Si no quedan favoritos, volver a mostrar todos los productos
    if (updatedFavorites.length === 0) {
      setShowFavorites(false);
      agruparProductosPorLinea(productos);
    }
  };

  // Filtrar los productos que se deben mostrar (favoritos o todos)
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
      <title>Catalogo Simple - Catálogo</title>
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

      {/* Header y buscador ocultos */}
      {/* <div className={`header-catalogo flex-center pad10 ${isSticky ? "sticky" : ""}`}>
        <TextField
          style={{ maxWidth: 450 }}
          fullWidth
          className="search"
          id="outlined-basic"
          label="Buscar Producto"
          variant="outlined"
          value={searchTerm}
          onChange={(e) => {
            // SOLO actualizar el estado del input - NADA MÁS
            // El filtrado se hace automáticamente en useMemo
            setSearchTerm(e.target.value);
          }}
          autoComplete="off"
          inputProps={{
            autoCapitalize: 'off',
            autoCorrect: 'off',
            spellCheck: 'false',
          }}
        />
      </div> */}

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

      {/* Skeleton para la carga inicial */}
      {loading && (
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
      )}

      {/* Productos cargados */}
      {Object.keys(productosAMostrar).map((linea) => (
        <div key={linea} className="linea-section">
          <Typography variant="h5" gutterBottom margin="20px 0">
            Linea: <b>{linea}</b>
          </Typography>
          <ul className="lista-prod-catalog w-100">
            {productosAMostrar[linea].map((product) => (
              <li className="grid-item" key={product.id}>
                <ProductsCalatogo
                  product={product}
                  onAddToCart={addToCart}
                  isFavorite={favorites.some(fav => fav.id === product.id)}
                  onToggleFavorite={() => toggleFavorite(product)}
                  selectedCuota={'9 cuotas sin interés'}
                  sumarEnvio={sumarEnvio}
                  costoEnvio={17362}
                />
              </li>
            ))}
          </ul>
        </div>
      ))}
      <ShoppingCartCatalogo cart={cart} setCart={setCart} cuotaKey="nueve_sin_interes" cuotasTexto="9 cuotas" />
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

export default Catalogo9;
