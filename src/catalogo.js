import React, { useEffect, useState } from "react";
import axios from "axios";
import Container from "@mui/material/Container";
import TextField from "@mui/material/TextField";
import Skeleton from "@mui/material/Skeleton";
import ProductsCalatogo from "./productsCalatogo";
import { Typography, Button, Snackbar, Alert } from "@mui/material";

const Catalogo = () => {
  const url = "https://backtest-production-7f88.up.railway.app";

  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productos, setProductos] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [productosFiltrados, setProductosFiltrados] = useState([]);
  const [isSticky, setIsSticky] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [showFavorites, setShowFavorites] = useState(false); // Estado para controlar la vista de favoritos

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  // Cargar productos desde la API
  useEffect(() => {
    const getData = async () => {
      const result = await axios.get(`${url}/api/productos`);
      setLoading(false);
      setProductos(result.data);
      setProductosFiltrados(result.data);
    };

    getData();
  }, []);

  // Manejar scroll para hacer sticky el header
  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      setIsSticky(offset > 100);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Filtrar productos por descripción
  useEffect(() => {
    const productosFiltrados = productos.filter((producto) =>
      producto.descripcion.toLowerCase().includes(filtro.toLowerCase())
    );

    setProductosFiltrados(productosFiltrados);
  }, [filtro, productos]);

  // Cargar favoritos desde localStorage al montar el componente
  useEffect(() => {
    const storedFavorites = JSON.parse(localStorage.getItem('favorites')) || [];
    setFavorites(storedFavorites);
  }, []);

  // Añadir producto al carrito
  const addToCart = (product) => {
    setCart([...cart, product]);
  };

  // Manejar el agregado y eliminación de favoritos
  const toggleFavorite = (product) => {
    let updatedFavorites;
    let message;

    if (favorites.some(fav => fav.id === product.id)) {
      // Si el producto ya está en favoritos, lo eliminamos
      updatedFavorites = favorites.filter(fav => fav.id !== product.id);
      message = `${product.descripcion} ha sido eliminado de tus favoritos`;
      setSnackbarSeverity('warning');
    } else {
      // Si no está en favoritos, lo agregamos
      updatedFavorites = [...favorites, product];
      message = `${product.descripcion} ha sido agregado a tus favoritos`;
      setSnackbarSeverity('success');
    }

    setFavorites(updatedFavorites);
    localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
    
    // Mostrar el Snackbar con el mensaje
    setSnackbarMessage(message);
    setSnackbarOpen(true);
  };

  // Filtrar los productos que se deben mostrar
  const productosAMostrar = showFavorites 
    ? productosFiltrados.filter(product => favorites.some(fav => fav.id === product.id))
    : productosFiltrados;

  return (
    <Container maxWidth="lg" className="conteiner-list">
      <div className="flex-between-mobile" style={{ paddingTop: 30 }}>
        <Typography variant="h5" textAlign="center" width={"100%"} margin={'15px 0'}>
          Catálogo de Productos
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
      {favorites.length !== 0 && <Button 
        variant="contained" 
        color="primary" 
        onClick={() => setShowFavorites(!showFavorites)}
        style={{ marginBottom: '20px' }}
        className="btn-absolute-favorite"
        disabled={favorites.length === 0} // Deshabilitar si no hay favoritos
      >
        {showFavorites ? 'Mostrar Todos' : 'Mostrar Favoritos'}
      </Button>}
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
            {/* Renderiza más Skeletons mientras carga */}
          </>
        ) : (
          productosAMostrar.map((product) =>
            product.vigencia === "SI" ? (
              <li className="grid-item" key={product.id}>
                <ProductsCalatogo
                  key={product.codigo}
                  product={product}
                  onAddToCart={addToCart}
                  isFavorite={favorites.some(fav => fav.id === product.id)}
                  onToggleFavorite={() => toggleFavorite(product)}
                />
              </li>
            ) : null
          )
        )}
      </ul>

      {/* Snackbar para mostrar mensajes */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Catalogo;
