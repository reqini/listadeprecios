import React, { useEffect, useState } from "react";
import axios from "./utils/axios";
import Container from "@mui/material/Container";
import TextField from "@mui/material/TextField";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";
import { Helmet } from "react-helmet";
import ProductCatalogoPreferencial from "./components/ProductCatalogoPreferencial";
import logo from "./assets/logo.png";
import { Dialog, DialogTitle, DialogContent, Button } from "@mui/material";

const Preferencial = () => {
  const [loading, setLoading] = useState(true);
  const [productos, setProductos] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [openModal, setOpenModal] = useState(false);

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

  const productHasPreferencial = (producto) => {
    return producto?.precio_preferencial && producto.precio_preferencial.trim() !== "";
  };

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      const productosData = await getData();
      const productosFiltrados = productosData.filter(
        (producto) =>
          (producto?.vigencia || "").toLowerCase() !== "no" &&
          productHasPreferencial(producto)
      );
      const productosUnicos = eliminarDuplicados(productosFiltrados);
      setProductos(productosUnicos);
      setLoading(false);
    };

    loadInitialData();
  }, []);

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

      {/* Botón Donar */}
      <div className="mar-t10 mar-b20 flex justify-center">
        <Button
          variant="contained"
          color="secondary"
          onClick={() => setOpenModal(true)}
        >
          Donar 💖
        </Button>
      </div>

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

      {/* Modal Donar */}
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

export default Preferencial;
