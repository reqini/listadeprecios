import React, { useEffect, useState } from "react";
import axios from "./utils/axios";
import Container from "@mui/material/Container";
import Skeleton from "@mui/material/Skeleton";
import LinearProgress from "@mui/material/LinearProgress";
import Typography from "@mui/material/Typography";
import { Helmet } from "react-helmet";
import ProductCatalogoPreferencial from "./components/ProductCatalogoPreferencial";
import logo from "./assets/logo.png";
import { Dialog, DialogTitle, DialogContent, Button, Alert, Box } from "@mui/material";
import ModernSearchBar from "./components/ModernSearchBar";
import { filterAllProducts } from "./utils/filterProducts";
import { normalizeString } from "./utils/searchUtils";
import LoadingFallbackCatalog from "./components/LoadingFallbackCatalog";
import { IS_CHRISTMAS_MODE } from "./config/christmasConfig";

const Preferencial = () => {
  const [loading, setLoading] = useState(true);
  const [productos, setProductos] = useState([]);
  const [productosOriginales, setProductosOriginales] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [error, setError] = useState(null);

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
      return { success: true, data: result.data };
    } catch (error) {
      console.error("Error cargando productos:", error);
      return { success: false, error: error.message || 'Error al cargar productos', data: [] };
    }
  };

  const productHasPreferencial = (producto) => {
    return producto?.precio_preferencial && producto.precio_preferencial.trim() !== "";
  };

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      setError(null);
      const result = await getData();
      
      if (!result.success) {
        setError(result.error || 'Error al cargar productos. Por favor, intenta recargar la página.');
        setProductos([]);
        setProductosOriginales([]);
        setLoading(false);
        return;
      }
      
      const productosData = result.data || [];
      const productosFiltrados = productosData.filter(
        (producto) =>
          (producto?.vigencia || "").toLowerCase() !== "no" &&
          productHasPreferencial(producto)
      );
      const productosUnicos = eliminarDuplicados(productosFiltrados);
      setProductos(productosUnicos);
      setProductosOriginales(productosUnicos);
      setLoading(false);
    };

    loadInitialData();
  }, []);

  const productosFiltrados = searchTerm 
    ? filterAllProducts(productosOriginales.length > 0 ? productosOriginales : productos, searchTerm).filter(
        (producto) => normalizeString(producto?.linea) !== 'repuestos'
      )
    : productos.filter(
        (producto) => normalizeString(producto?.linea) !== 'repuestos'
      );

  return (
    <>
      <Helmet>
        <title>Catálogo Precio Preferencial</title>
      </Helmet>

      {IS_CHRISTMAS_MODE && (
        <Alert
          severity="info"
          icon={false}
          sx={{
            backgroundColor: '#C62828',
            color: '#FFFFFF',
            textAlign: 'center',
            py: 0.5,
            fontSize: { xs: '0.75rem', sm: '0.875rem' },
            fontWeight: 600,
            borderRadius: 0,
            '& .MuiAlert-message': {
              width: '100%',
            },
          }}
        >
          🎄 Especial Navidad: promociones y cuotas
        </Alert>
      )}

      <Box className="catalog-search-sticky">
        <ModernSearchBar
          value={searchTerm}
          onChange={(value) => {
            setSearchTerm(value);
          }}
          placeholder="Buscar productos por nombre, categoría o banco..."
        />
      </Box>

      <Container maxWidth="lg" className="conteiner-list">
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

      {error && !loading && (
        <Box sx={{ textAlign: 'center', py: 6, px: 2 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Error al cargar productos
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              {error}
            </Typography>
            <Button
              variant="contained"
              onClick={() => {
                setError(null);
                setLoading(true);
                const loadInitialData = async () => {
                  const result = await getData();
                  if (!result.success) {
                    setError(result.error || 'Error al cargar productos. Por favor, intenta recargar la página.');
                    setProductos([]);
                    setProductosOriginales([]);
                    setLoading(false);
                    return;
                  }
                  const productosData = result.data || [];
                  const productosFiltrados = productosData.filter(
                    (producto) =>
                      (producto?.vigencia || "").toLowerCase() !== "no" &&
                      productHasPreferencial(producto)
                  );
                  const productosUnicos = eliminarDuplicados(productosFiltrados);
                  setProductos(productosUnicos);
                  setProductosOriginales(productosUnicos);
                  setLoading(false);
                };
                loadInitialData();
              }}
            >
              Reintentar
            </Button>
          </Alert>
        </Box>
      )}

      {loading && (
        <Box>
          <LinearProgress sx={{ marginBottom: 3 }} />
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
          <LoadingFallbackCatalog />
        </Box>
      )}

      {!loading && !error && (
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
    </>
  );
};

export default Preferencial;
