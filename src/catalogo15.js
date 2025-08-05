/* eslint-disable */
import React, { useEffect, useState, useMemo } from "react";
import axios from "./utils/axios";
import Container from "@mui/material/Container";
import TextField from "@mui/material/TextField";
import Skeleton from "@mui/material/Skeleton";
import Dialog from "@mui/material/Dialog";
import { Helmet } from "react-helmet";
import ProductsCalatogo from "./components/productsCalatogo";
import logo from './assets/logo.png';
import { Snackbar, Alert, Typography, Button, DialogTitle, DialogContent } from "@mui/material";
import ShoppingCartCatalogo from "./components/ShoppingCartCatalogo";

const Catalogo15 = () => {
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
  const [openModal, setOpenModal] = useState(false);

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
    "15 cuotas sin interés": 'quince_sin_interes',
  }), []);

  useEffect(() => {
    let productosFiltrados = productos.filter((producto) =>
      (producto?.descripcion || '').toLowerCase().includes(filtro.toLowerCase()) &&
      (producto?.linea || '').toLowerCase() !== 'repuestos'
    );
    if (cuotasMap["15 cuotas sin interés"]) {
      productosFiltrados = productosFiltrados.filter(
        (producto) => producto[cuotasMap["15 cuotas sin interés"]] !== 'NO'
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

      {/* BOTÓN DONAR */}
      <div className="mar-t10 mar-b20 flex justify-center">
        <Button
          variant="contained"
          color="secondary"
          onClick={() => setOpenModal(true)}
        >
          Donar 💖
        </Button>
      </div>

      {/* INFO DE DESARROLLADOR */}
      <div className="w-100 flex justify-center items-center flex-direction mar-t10">
        <Typography fontSize={13} margin={'6px 0 12px 0'} style={{textAlign: 'center'}}>
            <b>Desarrollado por:</b><br></br>
            <b>
              <a href="https://www.instagram.com/lrecchini/" rel="noreferrer"> Luciano Recchini</a>
            </b>
          </Typography>
        <img src={logo} alt="logo" width="200" className="mar-t10 mar-b20" />
      </div>

      {/* BUSCADOR */}
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

      {/* LOADING */}
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

      {/* PRODUCTOS */}
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
                  selectedCuota={'15 cuotas sin interés'}
                  sumarEnvio={sumarEnvio}
                  costoEnvio={17362}
                />
              </li>
            ))}
          </ul>
        </div>
      ))}

      <ShoppingCartCatalogo cart={cart} setCart={setCart} cuotaKey="quince_sin_interes" cuotasTexto="15 cuotas" />

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

      {/* MODAL DONACIÓN */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)}>
        <DialogTitle>¡Gracias por tu apoyo!</DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph>
            Este desarrollo ayuda a muchas emprendedoras a realizar su trabajo de forma más simple y rápida.
            Los clientes ven de manera clara, simple y transparente lo que quieren comprar.
          </Typography>
          <Typography variant="body2" paragraph>
            Todos los datos se cargan a pulmón, gracias a una líder inspiradora 💪.
          </Typography>
          <a
            href="https://link.mercadopago.com.ar/empalejandra"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-block',
              marginTop: '12px',
              backgroundColor: '#00c853',
              color: 'white',
              padding: '10px 15px',
              textDecoration: 'none',
              borderRadius: '5px',
              fontWeight: 'bold'
            }}
          >
            Donar ahora
          </a>
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default Catalogo15;
