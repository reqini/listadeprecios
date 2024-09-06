import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import {
  Button,
  Container,
  TextField,
  Grid,
  Skeleton,
  Fab,
  Typography,
  Snackbar,
  Alert,
} from "@mui/material";
import { Navigation as NavigationIcon, Logout as LogoutIcon } from '@mui/icons-material';
import ShoppingCart from "./components/cart";
import Product from "./components/products";
import ResponsiveDialog from "./components/dialog";
import banner from './assets/banner.jpg';
import logo from './assets/logo.png';

const Home = ({ onLogout }) => {
  const url = "https://backtest-production-7f88.up.railway.app";
  
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productos, setProductos] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [mostrarBoton, setMostrarBoton] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const [username, setUsername] = useState('');
  const [timeOfDay, setTimeOfDay] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false); // Estado para el Snackbar

  // Función para determinar el saludo basado en la hora
  const getTimeOfDay = useCallback(() => {
    const currentHour = new Date().getHours();
    if (currentHour >= 0 && currentHour < 5) return "¿Trabajando de madrugada? :)";
    if (currentHour < 12) return "Buen día";
    if (currentHour < 20) return "Buenas tardes";
    return "Buenas noches";
  }, []);

  useEffect(() => {
    const storedUsername = localStorage.getItem('activeSession');
    if (storedUsername) setUsername(storedUsername);

    setTimeOfDay(getTimeOfDay());

    const interval = setInterval(() => setTimeOfDay(getTimeOfDay()), 3600000);
    return () => clearInterval(interval);
  }, [getTimeOfDay]);

  const handleAddToCart = useCallback((product) => {
    setCart((prevCart) => [...prevCart, product]);
    setSnackbarOpen(true); // Abre el Snackbar al agregar al carrito
  }, []);

  const handleRemoveFromCart = useCallback((codigo) => {
    setCart((prevCart) => prevCart.filter(item => item.codigo !== codigo));
  }, []);

  const handleCuotaChange = useCallback((codigo, cuota) => {
    setCart((prevCart) =>
      prevCart.map(item =>
        item.codigo === codigo ? { ...item, cuotaSeleccionada: cuota } : item
      )
    );
  }, []);

  const fetchData = useCallback(async (endpoint, setState) => {
    try {
      const result = await axios.get(`${url}/api/${endpoint}`);
      setState(result.data);
    } catch (error) {
      console.error(`Error al obtener ${endpoint}:`, error);
    }
  }, [url]);

  useEffect(() => {
    fetchData('productos', setProductos);
    setLoading(false);
  }, [fetchData]);

  const manejarScroll = useCallback(() => {
    setMostrarBoton(window.scrollY > 100);
    setIsSticky(window.scrollY > 100);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", manejarScroll);
    return () => window.removeEventListener("scroll", manejarScroll);
  }, [manejarScroll]);

  const volverArriba = () => window.scrollTo({ top: 0, behavior: "smooth" });

  // Filtrado dinámico basado en el estado de `filtro`
  const productosFiltrados = productos.filter(producto =>
    producto.descripcion.toLowerCase().includes(filtro.toLowerCase()) && producto.vigencia === "SI"
  );

  const clearCart = () => setCart([]);

  // Función para cerrar el Snackbar
  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  return (
    <Container maxWidth="lg" className="conteiner-list">
      <div className="flex-between-mobile" style={{ paddingTop: 30, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <Typography variant="body1" color="primary" fontSize={20}>
          {timeOfDay} <b>{username === 'lety' ? 'Cara de Paty' : username}</b>, Bienvenid@
        </Typography>
        <Button
          variant="contained"
          onClick={onLogout}
          color="error"
          style={{ width: "100%", maxWidth: 200 }}
          startIcon={<LogoutIcon />}
        >
          Cerrar Sesion
        </Button>
      </div>

      <div className="w-100 flex justify-center">
        <img src={logo} alt="logo" height="100" className='mar-t30 mar-b20' />
      </div>

      <div className={`header flex-center pad20 ${isSticky ? "sticky" : ""}`}>
        <TextField
          style={{ maxWidth: 450 }}
          fullWidth
          label="Buscar Producto"
          variant="outlined"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
        />
      </div>

      <div className="flex-center" style={{ padding: "20px 0" }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <div className="w-100">
              <img src={banner} alt="red sin limites essen" width='100%' />
            </div>
          </Grid>
        </Grid>
      </div>

      <ul className="lista-prod w-100">
        {loading ? (
          [...Array(6)].map((_, index) => (
            <Skeleton key={index} sx={{ height: 300, margin: 1 }} animation="wave" variant="rectangular" className="grid-item" />
          ))
        ) : (
          productosFiltrados.map(product => (
            <li className="grid-item" key={product.id}>
              <Product
                product={product}
                onAddToCart={handleAddToCart}
                onCuotaChange={handleCuotaChange}
              />
            </li>
          ))
        )}
      </ul>

      <div className="absolute-btn">
        <ResponsiveDialog />
      </div>

      <Fab onClick={volverArriba} className={`${mostrarBoton ? "visible" : "oculto"}`} variant="extended" size="small" color="primary">
        <NavigationIcon sx={{ mr: 1 }} />
      </Fab>

      <ShoppingCart
        cart={cart}
        onClearCart={clearCart}
        onRemoveFromCart={handleRemoveFromCart}  // Pasamos la función para eliminar
        className={`${mostrarBoton ? "visible" : "oculto"}`}
        onClick={volverArriba}
      />

      {/* Snackbar para mostrar el mensaje cuando se agrega un producto */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
      >
        <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
          Producto agregado al carrito
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Home;
