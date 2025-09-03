/* eslint-disable */
import React, { useEffect, useState, useMemo } from "react";
import axios from "./utils/axios";
import Container from "@mui/material/Container";
import TextField from "@mui/material/TextField";
import Skeleton from "@mui/material/Skeleton";
import { Helmet } from "react-helmet";
import ProductsCalatogo from "./components/productsCalatogo";
import logo from './assets/logo.png';
import { Snackbar, Alert, Typography, Dialog, DialogTitle, DialogContent, Button } from "@mui/material";
import ShoppingCartCatalogo from "./components/ShoppingCartCatalogo";

const Catalogo18 = () => {
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

  const eliminarDuplicados = (productos) => {
    return productos.reduce((acc, producto) => {
      if (!acc.some(item => item.codigo === producto.codigo)) {
        acc.push(producto);
      }
      return acc;
    }, []);
  };

  const getData = async () => {
    const result = await axios.get(`/api/productos`);
    return result.data;
  };

  useEffect(() => {
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
    const handleScroll = () => {
      setIsSticky(window.scrollY > 100);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const cuotasMap = useMemo(() => ({
    "18 cuotas sin interés": 'dieciocho_sin_interes',
  }), []);

  useEffect(() => {
    let productosFiltrados = productos.filter((producto) =>
      (producto?.descripcion || '').toLowerCase().includes(filtro.toLowerCase()) &&
      (producto?.linea || '').toLowerCase() !== 'repuestos'
    );
    if (cuotasMap["18 cuotas sin interés"]) {
      const cuotaKey = cuotasMap["18 cuotas sin interés"];
      productosFiltrados = productosFiltrados.filter(
        (producto) => producto[cuotaKey] && producto[cuotaKey] !== 'NO'
      );
    }

    agruparProductosPorLinea(productosFiltrados);
  }, [filtro, productos, cuotasMap]);

  const addToCart = (product) => setCart([...cart, product]);

  const toggleFavorite = (product) => {
    const exists = favorites.some(fav => fav.id === product.id);
    const updatedFavorites = exists
      ? favorites.filter(fav => fav.id !== product.id)
      : [...favorites, product];
    const message = exists
      ? `${product.descripcion} ha sido eliminado de tus favoritos`
      : `${product.descripcion} ha sido agregado a tus favoritos`;
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
    <Container maxWidth="lg" className="conteiner-list">
      <Helmet>
        <title>Catalogo Simple - Catálogo</title>
      </Helmet>



      <div className="w-100 flex justify-center items-center flex-direction mar-t10">
        <Typography fontSize={13} margin={'6px 0 12px 0'} style={{ textAlign: 'center' }}>
          <b>Desarrollado por:</b><br />
          <b>
            <a href="https://www.instagram.com/lrecchini/" rel="noreferrer">
              Luciano Recchini
            </a>
          </b>
        </Typography>
        <img src={logo} alt="logo" width="200" className="mar-t10 mar-b20" />
      </div>

      <div className={`header-catalogo flex-center pad10 ${isSticky ? "sticky" : ""}`}>
        <TextField
          style={{ maxWidth: 450 }}
          fullWidth
          className="search"
          label="Buscar Producto"
          variant="outlined"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
        />
      </div>

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
                  selectedCuota={'18 cuotas sin interés'}
                  sumarEnvio={sumarEnvio}
                  costoEnvio={17362}
                />
              </li>
            ))}
          </ul>
        </div>
      ))}

      <ShoppingCartCatalogo
        cart={cart}
        setCart={setCart}
        cuotaKey="dieciocho_sin_interes"
        cuotasTexto="18 cuotas"
      />

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

export default Catalogo18;
