import React, { useEffect, useState, useMemo } from "react";
import axios from "./utils/axios";
import Container from "@mui/material/Container";
import TextField from "@mui/material/TextField";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";
import { Helmet } from "react-helmet";
import ProductCatalogoNegocio from "./components/productCalatogoNegocio";
import logo from "./assets/logo.png";
import { filterProducts, normalizeString } from "./utils/searchUtils";
import LaunchProductsCarousel from "./components/LaunchProductsCarousel";
// Switch y carrusel antiguo eliminados de catálogos comunes


const Contado = () => {
  const [loading, setLoading] = useState(true);
  const [productos, setProductos] = useState([]); // Lista ORIGINAL de productos - NUNCA modificar
  const [searchTerm, setSearchTerm] = useState(""); // Estado SOLO para el input - independiente


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
        (producto) => (producto?.vigencia || '').toLowerCase() !== "no"
      );
      const productosUnicos = eliminarDuplicados(productosFiltrados);
      setProductos(productosUnicos);
      setLoading(false);
    };

    loadInitialData();
  }, []);

  // Filtrado DIRECTO desde searchTerm - SIN estados intermedios
  // NO modifica productos original, solo filtra para render
  // Usa función optimizada con normalización de acentos y búsqueda robusta
  const productosFiltrados = useMemo(() => {
    // Si no hay productos, retornar vacío
    if (!productos || productos.length === 0) return [];
    
    // Filtrar usando la función optimizada de searchUtils
    // Esto incluye búsqueda por nombre, línea, categoría y código
    // Con normalización de acentos y case-insensitive
    let filtrados = filterProducts(productos, searchTerm, true);
    
    // Excluir repuestos (requerimiento específico de este catálogo)
    filtrados = filtrados.filter(
      (producto) => normalizeString(producto?.linea) !== 'repuestos'
    );
    
    return filtrados;
  }, [productos, searchTerm]); // Dependencias: productos original y searchTerm

  return (
    <Container maxWidth="lg" className="conteiner-list">
      <Helmet>
        <title>Catálogo Contado - Contado</title>
      </Helmet>



      <div className="w-100 flex justify-center items-center flex-direction mar-t10">
        <Typography fontSize={13} margin={'6px 0 12px 0'}>
          Desarrollado por: <b><a href="https://www.instagram.com/lrecchini/" rel="noreferrer">Luciano Recchini</a></b>
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
          value={searchTerm}
          onChange={(e) => {
            // SOLO actualizar el estado del input - NADA MÁS
            // El filtrado se hace automáticamente en useMemo
            setSearchTerm(e.target.value);
          }}
          autoComplete="off"
          inputProps={{
            autoCapitalize: 'off',
            autoCorrect: 'off',
            spellCheck: 'false',
          }}
        />
      </div>

      {/* Switch y carrusel antiguo eliminados de catálogos comunes */}

      {/* Carrousel de Lanzamientos / Entrega Inmediata */}
      {!loading && productos.length > 0 && (
        <LaunchProductsCarousel
          productos={productos}
          onAddToCart={(prod) => {
            // Opcional: implementar agregar al carrito si este catálogo lo requiere
            console.log('Producto para agregar:', prod);
          }}
          onProductClick={(prod) => {
            console.log('Producto clickeado:', prod);
          }}
        />
      )}

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
      ) : productosFiltrados.length > 0 ? (
        <ul className="lista-prod-catalog w-100">
          {productosFiltrados.map((product) => (
            <li className="grid-item" key={product.id}>
              <ProductCatalogoNegocio product={product} costoEnvio={17362} />
            </li>
          ))}
        </ul>
      ) : searchTerm && searchTerm.trim() !== '' ? (
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <Typography variant="h6" sx={{ color: '#717171', marginBottom: 1 }}>
            No se encontraron productos
          </Typography>
          <Typography variant="body2" sx={{ color: '#999' }}>
            No hay productos que coincidan con "{searchTerm}". Intenta con otro término de búsqueda.
          </Typography>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <Typography variant="body2" sx={{ color: '#999' }}>
            No hay productos disponibles en este momento.
          </Typography>
        </div>
      )}


    </Container>
  );
};

export default Contado;
