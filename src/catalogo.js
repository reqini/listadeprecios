/* eslint-disable */
import React, { useEffect, useState } from "react";
import axios from "./utils/axios";
import Container from "@mui/material/Container";
import TextField from "@mui/material/TextField";
import Skeleton from "@mui/material/Skeleton";
import ProductsCalatogo from "./components/productsCalatogo";
import logo from './assets/logo.png';
import { Button, Snackbar, Alert, FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { formatPrice } from './utils/priceUtils';
import introJs from 'intro.js'; 
import 'intro.js/introjs.css';

const Catalogo = () => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productos, setProductos] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [productosFiltrados, setProductosFiltrados] = useState([]);
  const [isSticky, setIsSticky] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [showFavorites, setShowFavorites] = useState(false);
  const [selectedCuota, setSelectedCuota] = useState('12 cuotas sin interés'); // Cuota por defecto
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [isMobile, setIsMobile] = useState(false);

  const cuotasMap = {
    "24 cuotas sin interés": 'veinticuatro_sin_interes',
    "18 cuotas sin interés": 'dieciocho_sin_interes',
    "12 cuotas sin interés": 'doce_sin_interes',
    "9 cuotas sin interés": 'nueve_sin_interes',
    "6 cuotas sin interés": 'seis_sin_interes',
    "3 cuotas sin interés": 'tres_sin_interes'
  };

  const startTour = () => {
    introJs().setOptions({
      steps: [
        {
          element: '.search',
          intro: 'Aquí puedes buscar productos en el catálogo.',
        },
        {
          element: '.btn-absolute-favorite',
          intro: 'Este botón te permite ver tus favoritos.',
        },
        {
          element: '.cuotas',
          intro: 'Aquí puedes seleccionar las cuotas para pagar.',
        },
      ],
      showProgress: true,
      exitOnOverlayClick: false,
      nextLabel: 'Siguiente',
      prevLabel: 'Anterior',
      doneLabel: 'Hecho',
    }).start();
  };

  useEffect(() => {
    const getData = async () => {
      const result = await axios.get(`/api/productos`);
      setLoading(false);
      setProductos(result.data);
      setProductosFiltrados(result.data);
    };

    getData();
  }, []);

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

  useEffect(() => {
    let productosFiltrados = productos.filter((producto) =>
      producto.descripcion.toLowerCase().includes(filtro.toLowerCase()) &&
      producto.linea.toLowerCase() !== 'repuestos'
    );

    if (selectedCuota && cuotasMap[selectedCuota]) {
      const cuotaKey = cuotasMap[selectedCuota];
      productosFiltrados = productosFiltrados.filter(
        (producto) => producto[cuotaKey] && producto[cuotaKey] !== 'NO'
      );
    }

    setProductosFiltrados(productosFiltrados);
  }, [filtro, productos, selectedCuota, cuotasMap]);

  useEffect(() => {
    const storedFavorites = JSON.parse(localStorage.getItem('favorites')) || [];
    setFavorites(storedFavorites);
  }, []);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);

    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  const addToCart = (product) => {
    setCart([...cart, product]);
  };

  const toggleFavorite = (product) => {
    let updatedFavorites;
    let message;

    if (favorites.some(fav => fav.id === product.id)) {
      updatedFavorites = favorites.filter(fav => fav.id !== product.id);
      message = `${product.descripcion} ha sido eliminado de tus favoritos`;
      setSnackbarSeverity('warning');
    } else {
      updatedFavorites = [...favorites, product];
      message = `${product.descripcion} ha sido agregado a tus favoritos`;
      setSnackbarSeverity('success');
    }

    setFavorites(updatedFavorites);
    localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
    setSnackbarMessage(message);
    setSnackbarOpen(true);

    if (updatedFavorites.length === 0) {
      setShowFavorites(false);
      setProductosFiltrados(productos);
    }
  };

  const productosAMostrar = showFavorites
    ? productosFiltrados.filter(product => favorites.some(fav => fav.id === product.id))
    : productosFiltrados;

  return (
    <Container maxWidth="lg" className="conteiner-list">
      <div className="w-100 flex justify-center">
        <img src={logo} alt="logo" height="100" className='mar-t30 mar-b20' />
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
      <div className="flex justify-between items-center">
        <Button
          variant="contained"
          size="large"
          color="primary"
          onClick={() => setShowFavorites(!showFavorites)}
          className="btn-absolute-favorite"
          style={{display: 'none'}}
          disabled={favorites.length === 0}
        >
          {showFavorites ? 'Todos' : 'Favoritos'}
        </Button>

        <Button 
          variant="contained" 
          color="secondary" 
          size="large" 
          className="btn-absolute-tour"
          style={{display: 'none'}}
          onClick={startTour}
        >
          {isMobile ? "Guía tutorial" : "¿Cómo utilizar el catálogo?"}
        </Button>

        <FormControl variant="outlined" sx={{ my: 2 }} style={{ backgroundColor: 'white' }} className="cuotas">
          <InputLabel>Cuotas</InputLabel>
          <Select
            value={selectedCuota}
            onChange={(e) => setSelectedCuota(e.target.value)}
            label="Cuotas"
          >
            {Object.keys(cuotasMap).map((cuota, idx) => (
              <MenuItem key={idx} value={cuota}>
                {cuota}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>

      <ul className="lista-prod-catalog w-100">
        {loading ? (
          <>
            {[...Array(8)].map((_, idx) => (
              <Skeleton
                key={idx}
                sx={{ height: 300, margin: 1 }}
                animation="wave"
                variant="rectangular"
                className="grid-item"
              />
            ))}
          </>
        ) : (
          productosAMostrar.map((product) =>
            product.vigencia === "SI" ? (
              <li className="grid-item" key={product.id}>
                <ProductsCalatogo
                  product={product}
                  onAddToCart={addToCart}
                  isFavorite={favorites.some(fav => fav.id === product.id)}
                  onToggleFavorite={() => toggleFavorite(product)}
                  selectedCuota={selectedCuota || '12 cuotas sin interés'}
                  precio={formatPrice(product.precio || 0)}  // Se usa 0 como valor por defecto si el precio es undefined
                />
              </li>
            ) : null
          )
        )}
      </ul>

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
