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
import { handleCuotaChange } from './utils/cartHandlers';  // Usamos la misma función en Home

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
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  // Obtener el momento del día para el saludo
  const getTimeOfDay = useCallback(() => {
    const currentHour = new Date().getHours();
    if (currentHour >= 0 && currentHour < 5) return "¿Trabajando de madrugada? :)";
    if (currentHour < 12) return "Buen día";
    if (currentHour < 20) return "Buenas tardes";
    return "Buenas noches";
  }, []);

  // Manejo de la carga inicial y saludo
  useEffect(() => {
    const storedUsername = localStorage.getItem('activeSession');
    if (storedUsername) setUsername(storedUsername);

    setTimeOfDay(getTimeOfDay());

    const interval = setInterval(() => setTimeOfDay(getTimeOfDay()), 3600000);

    return () => clearInterval(interval); // Limpiar intervalo al desmontar
  }, [getTimeOfDay]);

  // Manejo del agregar al carrito
  const handleAddToCart = useCallback((product) => {
    // Verificar si el producto ya está en el carrito y evitar duplicados
    setCart((prevCart) => {
      const existingProduct = prevCart.find(item => item.codigo === product.codigo);
      if (existingProduct) {
        return prevCart.map(item => 
          item.codigo === product.codigo 
          ? { ...item, cantidad: item.cantidad + 1 } 
          : item
        );
      }
      return [...prevCart, { ...product, cantidad: 1 }];
    });
    setSnackbarOpen(true);
  }, []);

  // Manejo de la eliminación del carrito
  const handleRemoveFromCart = useCallback((codigo) => {
    setCart((prevCart) => {
      const product = prevCart.find(item => item.codigo === codigo);
      if (product && product.cantidad > 1) {
        return prevCart.map(item =>
          item.codigo === codigo ? { ...item, cantidad: item.cantidad - 1 } : item
        );
      }
      return prevCart.filter(item => item.codigo !== codigo);
    });
  }, []);

  // Usamos el handler refactorizado para manejar el cambio de cuota
  const handleCuotaChangeWrapper = useCallback((codigo, cuota) => {
    handleCuotaChange(codigo, cuota, setCart);
  }, [setCart]);

  // **Definir fetchData dentro del componente**
  const fetchData = useCallback(async (endpoint, setState) => {
    try {
      const { data } = await axios.get(`${url}/api/${endpoint}`);
      setState(data);
      setTimeout(() => {
        setLoading(false);  // Mantener el skeleton visible al menos por un breve periodo
      }, 500); // Garantizar que el Skeleton se muestre al menos 500ms
    } catch (error) {
      console.error(`Error al obtener ${endpoint}:`, error);
      setLoading(false);
    }
  }, [url]);

  // Llamar a fetchData para obtener los productos
  useEffect(() => {
    fetchData('productos', setProductos);
  }, [fetchData]);

  // Manejo del scroll para el botón de navegación
  const manejarScroll = useCallback(() => {
    const scrollPos = window.scrollY;
    setMostrarBoton(scrollPos > 100);
    setIsSticky(scrollPos > 100);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", manejarScroll);
    return () => window.removeEventListener("scroll", manejarScroll);
  }, [manejarScroll]);

  // Volver al inicio de la página
  const volverArriba = () => window.scrollTo({ top: 0, behavior: "smooth" });

  // Filtrado de productos basado en la búsqueda
  const productosFiltrados = productos.filter(producto =>
    producto.descripcion.toLowerCase().includes(filtro.toLowerCase()) && producto.vigencia === "SI"
  );

  // Limpiar el carrito
  const clearCart = () => setCart([]);

  // Cierre del Snackbar
  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
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
          className="search"
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
                onCuotaChange={handleCuotaChangeWrapper}
              />
            </li>
          ))
        )}
      </ul>

      {productosFiltrados.length === 0 && !loading && (
        <Typography variant="body1" color="textSecondary">No se encontraron productos.</Typography>
      )}

      <div className="absolute-btn">
        <ResponsiveDialog />
      </div>

      <Fab onClick={volverArriba} className={`${mostrarBoton ? "visible" : "oculto"}`} variant="extended" size="small" color="primary">
        <NavigationIcon sx={{ mr: 1 }} />
      </Fab>

      <ShoppingCart
        cart={cart}
        setCart={setCart}  // Pasamos setCart como prop
        onClearCart={clearCart}
        onRemoveFromCart={handleRemoveFromCart}
      />

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
