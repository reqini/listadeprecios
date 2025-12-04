import React, { useEffect, useState } from "react";
import axios from "./utils/axios";
import Container from "@mui/material/Container";
import Skeleton from "@mui/material/Skeleton";
import LinearProgress from "@mui/material/LinearProgress";
import Typography from "@mui/material/Typography";
import { Helmet } from "react-helmet";
import ModernProductCardAirbnb from "./components/ModernProductCardAirbnb";
import logo from "./assets/logo.png";
import { Dialog, DialogTitle, DialogContent, Button, Alert, Box } from "@mui/material";
import ModernSearchBar from "./components/ModernSearchBar";
import { filterAllProducts } from "./utils/filterProducts";
import { normalizeString } from "./utils/searchUtils";
import LoadingFallbackCatalog from "./components/LoadingFallbackCatalog";
import { IS_CHRISTMAS_MODE } from "./config/christmasConfig";
import { useColumnLayout } from "./hooks/useColumnLayout";
import ColumnLayoutToggle from "./components/ColumnLayoutToggle";
import useMediaQuery from "@mui/material/useMediaQuery";

const Preferencial = () => {
  const isMobile = useMediaQuery('(max-width:600px)');
  const [loading, setLoading] = useState(true);
  const [productos, setProductos] = useState([]);
  const [productosOriginales, setProductosOriginales] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [error, setError] = useState(null);
  const [favorites, setFavorites] = useState([]);
  
  const { mobileColumns, toggleColumns } = useColumnLayout('preferencial', 2);

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
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(2, 1fr)',
                lg: 'repeat(3, 1fr)',
              },
              gap: { xs: 3, sm: 3, md: 4 },
            }}
          >
            {[...Array(6)].map((_, idx) => (
              <Skeleton
                key={idx}
                variant="rectangular"
                height={400}
                sx={{
                  borderRadius: 3,
                  animation: 'wave',
                }}
              />
            ))}
          </Box>
          <LoadingFallbackCatalog />
        </Box>
      )}

      {!loading && !error && productosFiltrados.length > 0 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: { xs: 2, sm: 3 } }}>
            <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
              <ColumnLayoutToggle
                mobileColumns={mobileColumns}
                onToggle={toggleColumns}
                variant="toggle"
                size="small"
              />
            </Box>
          </Box>
          
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: mobileColumns === 1 ? '1fr' : 'repeat(2, 1fr)',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(2, 1fr)',
                lg: 'repeat(3, 1fr)',
              },
              gap: { xs: mobileColumns === 1 ? 2.5 : 1.5, sm: 2.5, md: 3 },
            }}
          >
            {productosFiltrados.map((product) => (
              <ModernProductCardAirbnb
                key={product.id || product.codigo}
                product={product}
                onAddToCart={(prod) => {
                  console.log('Producto para agregar:', prod);
                }}
                onToggleFavorite={(prod) => {
                  console.log('Toggle favorite:', prod);
                }}
                selectedCuota={null}
                isContado={false}
                isNew={product.nuevo === 'si' || product.nuevo === true || product.nuevo === 'Sí'}
                isBestSeller={product.mas_vendida === 'si' || product.mas_vendida === true || product.mas_vendida === 'Sí'}
                stockLow={
                  product.stock_actual && product.stock_total &&
                  parseFloat(product.stock_actual) > 0 && parseFloat(product.stock_total) > 0 &&
                  (parseFloat(product.stock_actual) / parseFloat(product.stock_total)) < 0.2
                }
                isCompactMode={mobileColumns === 2}
              />
            ))}
          </Box>
        </Box>
      )}

      {!loading && !error && productosFiltrados.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 6, px: 2 }}>
          <Typography variant="h6" sx={{ color: '#717171', marginBottom: 1 }}>
            No se encontraron productos
          </Typography>
          <Typography variant="body2" sx={{ color: '#999' }}>
            {searchTerm && searchTerm.trim() !== '' 
              ? `No hay productos que coincidan con "${searchTerm}". Intenta con otro término de búsqueda.`
              : 'No hay productos con precio preferencial disponibles en este momento.'}
          </Typography>
        </Box>
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
