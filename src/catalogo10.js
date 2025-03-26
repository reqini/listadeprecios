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
import { formatPrice } from './utils/priceUtils';

const Catalogo10 = () => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);  // Carga inicial
  const [productos, setProductos] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [productosAgrupados, setProductosAgrupados] = useState({});
  const [isSticky, setIsSticky] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [showFavorites, setShowFavorites] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

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
      const productosFiltrados = productosData.filter(producto => producto.vigencia.toLowerCase() !== "no");  // Filtrar por vigencia
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
    "10 cuotas sin interés": 'diez_sin_interes',
  }), []);

  // Filtrar productos según el filtro de texto, cuotas seleccionadas y excluir los productos con línea "Repuestos"
  useEffect(() => {
    let productosFiltrados = productos.filter((producto) =>
      producto.descripcion.toLowerCase().includes(filtro.toLowerCase()) &&
      producto.linea.toLowerCase() !== 'repuestos'  // Excluir los productos con línea "Repuestos"
    );

    if (cuotasMap["10 cuotas sin interés"]) {
      const cuotaKey = cuotasMap["10 cuotas sin interés"];
      productosFiltrados = productosFiltrados.filter(
        (producto) => producto[cuotaKey] && producto[cuotaKey] !== 'NO'
      );
    }

    agruparProductosPorLinea(productosFiltrados);
  }, [filtro, productos, cuotasMap]);

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
                  selectedCuota={'10 cuotas sin interés'}
                  precio={formatPrice(product.precio || 0)}  // Se usa 0 como valor por defecto si el precio es undefined
                />
              </li>
            ))}
          </ul>
        </div>
      ))}

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

export default Catalogo10;
