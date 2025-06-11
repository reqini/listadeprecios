import React, { useEffect, useState } from "react";
import axios from "./utils/axios";
import Container from "@mui/material/Container";
import TextField from "@mui/material/TextField";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";
import { Helmet } from "react-helmet";
import ProductCatalogoPreferencial from "./components/ProductCatalogoPreferencial";
import logo from "./assets/logo.png";

const Preferencial = () => {
  const [loading, setLoading] = useState(true);
  const [productos, setProductos] = useState([]);
  const [filtro, setFiltro] = useState("");

  const eliminarDuplicados = (productos) => {
    return productos.reduce((acc, producto) => {
      if (!acc.some((item) => item.codigo === producto.codigo)) {
        acc.push(producto);
      }
      return acc;
    }, []);
  };

  const getData = async () => {
    try {
      const result = await axios.get(`/api/productos`);
      return result.data;
    } catch (error) {
      console.error("Error cargando productos:", error.message);
      return [];
    }
  };

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      const productosData = await getData();
      const productosFiltrados = productosData.filter(
        (producto) =>
          (producto?.vigencia || "").toLowerCase() !== "no" &&
          productHasPreferencial(producto)
      ); // ✅ Filtra solo productos con precio preferencial
      const productosUnicos = eliminarDuplicados(productosFiltrados);
      setProductos(productosUnicos);
      setLoading(false);
    };

    loadInitialData();
  }, []);

  const productHasPreferencial = (producto) => {
    return producto?.precio_preferencial && producto.precio_preferencial.trim() !== "";
  };

  const productosFiltrados = productos.filter(
    (producto) =>
      (producto?.descripcion || "").toLowerCase().includes(filtro.toLowerCase()) &&
      (producto?.linea || "").toLowerCase() !== "repuestos"
  );

  return (
    <Container maxWidth="lg" className="conteiner-list">
      <Helmet>
        <title>Catálogo Precio Preferencial</title>
      </Helmet>
      <div className="w-100 flex justify-center items-center flex-direction mar-t10">
        <Typography fontSize={13} margin={"6px 0 12px 0"}>
          Desarrollado por:{" "}
          <b>
            <a
              href="https://www.instagram.com/lrecchini/"
              rel="noreferrer"
              target="_blank"
            >
              Luciano Recchini
            </a>
          </b>
        </Typography>
        <img src={logo} alt="logo" width="200" className="mar-t10 mar-b20" />
      </div>

      <div className={`header-catalogo flex-center pad10`}>
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

      {loading ? (
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
      ) : (
        <ul className="lista-prod-catalog w-100">
          {productosFiltrados.map((product) => (
            <li className="grid-item" key={product.id}>
              <ProductCatalogoPreferencial product={product} costoEnvio={17362} />
            </li>
          ))}
        </ul>
      )}
    </Container>
  );
};

export default Preferencial;
