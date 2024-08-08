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
import Product from "./products";
import { Typography } from "@mui/material";
import banner from './assets/banner.jpg';
import LogoutIcon from '@mui/icons-material/Logout';
import ResponsiveDialog from "./dialog";

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
      const result = await axios.get(`${url}/api/productos`);
      setLoading(false);
      setProductos(result.data);
      setProductosFiltrados(result.data);
    };

    getData();
  }, []);

  useEffect(() => {
    const getData = async () => {
      const result = await axios.get(`${url}/api/bancos`);
      setBancos(result.data);
      setBancosFiltrados(result.data);
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
    // Filtrar productos por descripción y categoría
    const productosFiltrados = productos.filter(
      (producto) =>
        producto.descripcion.toLowerCase().includes(filtro.toLowerCase())
    );

    setProductosFiltrados(productosFiltrados);
  }, [filtro, productos]);

  useEffect(() => {
    const bancosFiltrados = bancos.filter((bancos) =>
      bancos.banco.toLowerCase().includes(filtro.toLowerCase()),
    );

    setBancosFiltrados(bancosFiltrados);
  }, [filtro, bancos]);

  const addToCart = (productos) => {
    setCart([...cart, productos]);
  };

  const clearCart = () => {
    setCart([]);
  };

  return (
    <Container maxWidth="lg" className="conteiner-list">
      <div className="flex-between-mobile" style={{ paddingTop: 30, display: 'flex', justifyContent: 'space-between' }}>
        <ResponsiveDialog />
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
      <Typography variant="h5" textAlign="center" width={"100%"} margin={'20px 0'}>
          Catalogo de Productos y precios
      </Typography>

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
          {/* Se oculta para luego trabajar sobre filtros de bancos y cuotas */}
          <Grid item sm={6} xs={12} style={{display: 'none'}}> 
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
                   {bancosFiltrados.map((bancos) => (
                      <MenuItem value={bancos.banco} key={bancos.id}>
                        {bancos.banco}
                      </MenuItem>
                   ),
                  )}
                </Select>
              </FormControl>
            </div>
          </Grid>
        </Grid>
      </div>
      <ul className="lista-prod w-100">
        {loading ? (
          <>
            <Skeleton
              sx={{ height: 300, margin: 1 }}
              animation="wave"
              variant="rectangular"
              className="grid-item"
            />
            <Skeleton
              sx={{ height: 300, margin: 1 }}
              animation="wave"
              variant="rectangular"
              className="grid-item"
            />
            <Skeleton
              sx={{ height: 300, margin: 1 }}
              animation="wave"
              variant="rectangular"
              className="grid-item"
            />
            <Skeleton
              sx={{ height: 300, margin: 1 }}
              animation="wave"
              variant="rectangular"
              className="grid-item"
            />
            <Skeleton
              sx={{ height: 300, margin: 1 }}
              animation="wave"
              variant="rectangular"
              className="grid-item"
            />
            <Skeleton
              sx={{ height: 300, margin: 1 }}
              animation="wave"
              variant="rectangular"
              className="grid-item"
            />
          </>
        ) : (
          productosFiltrados.map((product) =>
            product.vigencia === "SI" ? (
              <li className="grid-item" key={product.id}>
                <Product
                  key={product.codigo}
                  product={product}
                  off={product.discount !== '' ? product.discount : null}
                  bancos={bancos}
                  onAddToCart={addToCart}
                />
              </li>
            ) : null,
          )
        )}
      </ul>
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
