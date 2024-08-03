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
import bancos from "./bancos";
import Product from "./products";
import { Typography } from "@mui/material";

const Home = ({ onLogout }) => {
  const url = "https://backtest-production-7f88.up.railway.app";

  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productos, setProductos] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [productosFiltrados, setProductosFiltrados] = useState([]);
  const [mostrarBoton, setMostrarBoton] = useState(false);
  const [isSticky, setIsSticky] = useState(false);

  const [selectedBank3, setSelectedBank3] = useState("");
  const [selectedBank6, setSelectedBank6] = useState("");

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
    const productosFiltrados = productos.filter((producto) =>
      producto.descripcion.toLowerCase().includes(filtro.toLowerCase()),
    );

    setProductosFiltrados(productosFiltrados);
  }, [filtro, productos]);

  const addToCart = (productos) => {
    setCart([...cart, productos]);
  };

  const clearCart = () => {
    setCart([]);
  };
  return (
    <Container maxWidth="lg" className="conteiner-list">
      <div className="flex-between-mobile" style={{ paddingTop: 30 }}>
        <Typography variant="h5" textAlign="center" width={"100%"}>
          Catalogo de Productos y precios
        </Typography>
        <Button
          variant="contained"
          onClick={onLogout}
          color="error"
          style={{ width: "100%", maxWidth: 200 }}
        >
          Cerrar Sesion
        </Button>
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
              <Typography variant="h5">Promociones con Bancos</Typography>
            </div>
          </Grid>
          <Grid item sm={6} xs={12}>
            <div className="w-100">
              <FormControl fullWidth>
                <InputLabel id="demo-simple-select-label">3 cuotas</InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  className="select"
                  fullWidth
                  style={{ background: "white" }}
                  label="Bancos"
                  value={selectedBank3}
                  onChange={(e, child) => {
                    e.preventDefault();
                    setSelectedBank3(e.target.value);
                  }}
                >
                  {bancos.map((bank, i) =>
                    bank.ahora3 === true ? (
                      <MenuItem value={bank.codigo} key={i}>
                        {bank.banco}
                      </MenuItem>
                    ) : null,
                  )}
                </Select>
              </FormControl>
            </div>
          </Grid>
          <Grid item sm={6} xs={12}>
            <div className="w-100">
              <FormControl fullWidth>
                <InputLabel id="demo-simple-select-label">6 cuotas</InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  className="select"
                  fullWidth
                  style={{ background: "white" }}
                  value={selectedBank6}
                  onChange={(e, child) => {
                    e.preventDefault();
                    setSelectedBank6(e.target.value);
                  }}
                >
                  {bancos.map((bank, i) =>
                    bank.ahora6 === true ? (
                      <MenuItem value={bank.codigo} key={i}>
                        {bank.banco}
                      </MenuItem>
                    ) : null,
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
        banco3={bancos.find((bank) => bank.codigo === selectedBank3)}
        banco6={bancos.find((bank) => bank.codigo === selectedBank6)}
      />
    </Container>
  );
};
export default Home;
