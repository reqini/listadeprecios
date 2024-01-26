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

const Home = ({ onLogout }) => {
  const url = "https://backtest-production.up.railway.app";

  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productos, setProductos] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [productosFiltrados, setProductosFiltrados] = useState([]);

  const [isSticky, setIsSticky] = useState(false);

  const [selectedBank3, setSelectedBank3] = useState("");
  const [selectedBank6, setSelectedBank6] = useState("");

  useEffect(() => {
    const getData = async () => {
      const result = await axios.get(`${url}/api/productos`);
      setProductos(result.data);
      setProductosFiltrados(result.data);
    };

    getData();
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
    setLoading(false);
  }, [filtro, productos]);

  const addToCart = (productos) => {
    setCart([...cart, productos]);
  };

  const clearCart = () => {
    setCart([]);
  };
  return (
    <Container maxWidth="lg" className="conteiner-list">
      <div className="flex-between-mobile" style={{paddingTop: 30}}>
        <Button variant="contained" onClick={onLogout}>
          Cerrar Sesion
        </Button>
        <h2>Catalogo de Productos y precios</h2>
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
          <Grid item sm={6} xs={12}>
            <div className="w-100">
              <FormControl fullWidth>
                <InputLabel id="demo-simple-select-label">3 cuotas</InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  fullWidth
                  style={{ background: "white" }}
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
      <ul className="lista-prod">
        {loading ? (
          <Skeleton
            sx={{ height: 190 }}
            animation="wave"
            variant="rectangular"
          />
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
        banco3={bancos.find((bank) => bank.codigo === selectedBank3)}
        banco6={bancos.find((bank) => bank.codigo === selectedBank6)}
      />
    </Container>
  );
};
export default Home;
