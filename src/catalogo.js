import React, { useEffect, useState } from "react";
import axios from "axios";
import Container from "@mui/material/Container";
import TextField from "@mui/material/TextField";
import Skeleton from "@mui/material/Skeleton";
import ProductsCalatogo from "./productsCalatogo";
import { Typography } from "@mui/material";

const Catalogo = () => {
  const url = "https://backtest-production-7f88.up.railway.app";

  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productos, setProductos] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [productosFiltrados, setProductosFiltrados] = useState([]);
  const [isSticky, setIsSticky] = useState(false);

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
  

  return (
    <Container maxWidth="lg" className="conteiner-list">
      <div className="flex-between-mobile" style={{ paddingTop: 30 }}>
        <Typography variant="h5" textAlign="center" width={"100%"} margin={'15px 0'}>
          Catalogo de Productos
        </Typography>
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
                <ProductsCalatogo
                  key={product.codigo}
                  product={product}
                  catalog
                  onAddToCart={addToCart}
                />
              </li>
            ) : null,
          )
        )}
      </ul>
    </Container>
  );
};
export default Catalogo;
