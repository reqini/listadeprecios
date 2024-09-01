import React, { useEffect, useState } from "react";
import axios from "axios";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import TextField from "@mui/material/TextField";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import Grid from "@mui/material/Grid";
import Skeleton from "@mui/material/Skeleton";
import ShoppingCart from "./cart";
import Fab from '@mui/material/Fab';
import NavigationIcon from '@mui/icons-material/Navigation';
import Product from "./products";
import Typography from "@mui/material/Typography";
import banner from './assets/banner.jpg';
import LogoutIcon from '@mui/icons-material/Logout';
import ResponsiveDialog from "./dialog";
import logo from './logo.png';

const Home = ({ onLogout }) => {
  const url = "https://backtest-production-7f88.up.railway.app";

  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productos, setProductos] = useState([]);
  const [bancos, setBancos] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [productosFiltrados, setProductosFiltrados] = useState([]);
  const [bancosFiltrados, setBancosFiltrados] = useState([]);
  const [mostrarBoton, setMostrarBoton] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const [username, setUsername] = useState(''); // Estado para almacenar el nombre de usuario
  const [timeOfDay, setTimeOfDay] = useState(""); // Estado para el saludo personalizado

  // Función para determinar el momento del día
  const getTimeOfDay = () => {
    const currentHour = new Date().getHours();
    if (currentHour >= 0 && currentHour < 5) {
      return "¿Trabajando de madrugada? :)";
    } else if (currentHour < 12) {
      return "Buen día";
    } else if (currentHour < 18) {
      return "Buenas tardes";
    } else {
      return "Buenas noches";
    }
  };

  useEffect(() => {
    // Recuperar el nombre de usuario desde localStorage
    const storedUsername = localStorage.getItem('activeSession');
    if (storedUsername) {
      setUsername(storedUsername);
    }

    // Establecer el saludo personalizado
    setTimeOfDay(getTimeOfDay());

    // Actualizar el saludo cada hora
    const interval = setInterval(() => {
      setTimeOfDay(getTimeOfDay());
    }, 3600000); // 3600000 ms = 1 hora

    return () => clearInterval(interval); // Limpiar el intervalo al desmontar el componente
  }, []);

  const handleAddToCart = (product) => {
    setCart([...cart, product]);
  };

  const handleCuotaChange = (codigo, cuota) => {
    setCart(prevCart =>
      prevCart.map(item =>
        item.codigo === codigo ? { ...item, cuotaSeleccionada: cuota } : item
      )
    );
  };

  const manejarScroll = () => {
    // Muestra el botón si el usuario ha hecho scroll hacia abajo, ocúltalo si está en la parte superior
    setMostrarBoton(window.scrollY > 100);
  };

  const volverArriba = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    const getData = async () => {
      try {
        const result = await axios.get(`${url}/api/productos`);
        setProductos(result.data);
        setProductosFiltrados(result.data);
      } catch (error) {
        console.error("Error al obtener productos:", error);
      } finally {
        setLoading(false);
      }
    };

    getData();
  }, []);

  useEffect(() => {
    const getData = async () => {
      try {
        const result = await axios.get(`${url}/api/bancos`);
        setBancos(result.data);
        setBancosFiltrados(result.data);
      } catch (error) {
        console.error("Error al obtener bancos:", error);
      }
    };

    getData();
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", manejarScroll);

    // Limpia el listener del evento al desmontar el componente
    return () => {
      window.removeEventListener("scroll", manejarScroll);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      if (offset > 100) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    // Filtrar productos por descripción
    const productosFiltrados = productos.filter(
      (producto) =>
        producto.descripcion.toLowerCase().includes(filtro.toLowerCase())
    );

    setProductosFiltrados(productosFiltrados);
  }, [filtro, productos]);

  useEffect(() => {
    // Filtrar bancos por nombre
    const bancosFiltrados = bancos.filter((banco) =>
      banco.banco.toLowerCase().includes(filtro.toLowerCase()),
    );

    setBancosFiltrados(bancosFiltrados);
  }, [filtro, bancos]);

  const clearCart = () => {
    setCart([]);
  };

  return (
    <Container maxWidth="lg" className="conteiner-list">
      <div className="flex-between-mobile" style={{ paddingTop: 30, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <Typography className="margin-mobile-top" variant="body1" color="primary" fontSize={20}>
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
          id="outlined-basic"
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
          <Grid item sm={6} xs={12} style={{ display: 'none' }}> 
            <div className="w-100">
              <FormControl fullWidth>
                <InputLabel id="demo-simple-select-label">Listado de bancos</InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  className="select"
                  fullWidth
                  style={{ background: "white" }}
                  value={bancosFiltrados}
                  onChange={(e, child) => {
                    e.preventDefault();
                  }}
                >
                  {bancosFiltrados.map((banco) => (
                    <MenuItem value={banco.banco} key={banco.id}>
                      {banco.banco}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
          </Grid>
        </Grid>
      </div>
      <ul className="lista-prod w-100">
        {loading ? (
          <>
            {[...Array(6)].map((_, index) => (
              <Skeleton
                key={index}
                sx={{ height: 300, margin: 1 }}
                animation="wave"
                variant="rectangular"
                className="grid-item"
              />
            ))}
          </>
        ) : (
          productosFiltrados.map((product) =>
            product.vigencia === "SI" ? (
              <li className="grid-item" key={product.id}>
                <Product
                  key={product.codigo}
                  product={product}
                  onAddToCart={handleAddToCart}
                  onCuotaChange={handleCuotaChange}
                />
              </li>
            ) : null,
          )
        )}
      </ul>
      <div className="absolute-btn"><ResponsiveDialog /></div>
      <Fab onClick={volverArriba} className={`${mostrarBoton ? "visible" : "oculto"}`} variant="extended" size="small" color="primary">
        <NavigationIcon sx={{ mr: 1 }} />
      </Fab>
      <ShoppingCart
        cart={cart}
        onClearCart={clearCart}
        className={`${mostrarBoton ? "visible" : "oculto"}`}
        onClick={volverArriba}
      />
    </Container>
  );
};

export default Home;
