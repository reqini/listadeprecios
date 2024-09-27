import React, { useEffect, useState } from "react"
import axios from "axios"
import Container from "@mui/material/Container"
import TextField from "@mui/material/TextField"
import Skeleton from "@mui/material/Skeleton"
import ProductsCalatogo from "./components/productsCalatogo"
import logo from './assets/logo.png'
import { Button, Snackbar, Alert, FormControl, InputLabel, MenuItem, Select } from "@mui/material"

const Catalogo = () => {
  const url = "https://backtest-production-7f88.up.railway.app"
  const [cart, setCart] = useState([])
  const [loading, setLoading] = useState(true)
  const [productos, setProductos] = useState([])
  const [filtro, setFiltro] = useState("")
  const [productosFiltrados, setProductosFiltrados] = useState([])
  const [isSticky, setIsSticky] = useState(false)
  const [favorites, setFavorites] = useState([])
  const [showFavorites, setShowFavorites] = useState(false)
  const [selectedCuota, setSelectedCuota] = useState('12 cuotas sin interés') // Cuota por defecto
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [snackbarSeverity, setSnackbarSeverity] = useState('success')

  const cuotasMap = {
    "12 cuotas sin interés": 'doce_sin_interes',
    "10 cuotas sin interés": 'diez_sin_interes',
    "9 cuotas sin interés": 'nueve_sin_interes',
    "6 cuotas sin interés": 'seis_sin_interes',
    "3 cuotas sin interés": 'tres_sin_interes',
    "18 cuotas sin interés": 'dieciocho_sin_interes'
  };

  // Cargar productos desde la API
  useEffect(() => {
    const getData = async () => {
      const result = await axios.get(`${url}/api/productos`)
      setLoading(false)
      setProductos(result.data)
      setProductosFiltrados(result.data)
    }

    getData()
  }, [])

  // Manejar scroll para hacer sticky el header
  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY
      setIsSticky(offset > 100)
    }

    window.addEventListener("scroll", handleScroll)

    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  // Filtrar productos por descripción y por cuota seleccionada
  useEffect(() => {
    let productosFiltrados = productos.filter((producto) =>
      producto.descripcion.toLowerCase().includes(filtro.toLowerCase())
    )
  
    if (selectedCuota && cuotasMap[selectedCuota]) {
      const cuotaKey = cuotasMap[selectedCuota]
      productosFiltrados = productosFiltrados.filter(
        (producto) => producto[cuotaKey] && producto[cuotaKey] !== 'NO'
      )
    }
  
    setProductosFiltrados(productosFiltrados)
  }, [filtro, productos, selectedCuota, cuotasMap])

  // Cargar favoritos desde localStorage al montar el componente
  useEffect(() => {
    const storedFavorites = JSON.parse(localStorage.getItem('favorites')) || []
    setFavorites(storedFavorites)
  }, [])

  // Añadir producto al carrito
  const addToCart = (product) => {
    setCart([...cart, product])
  }

  // Manejar el agregado y eliminación de favoritos
  const toggleFavorite = (product) => {
    let updatedFavorites
    let message

    if (favorites.some(fav => fav.id === product.id)) {
      updatedFavorites = favorites.filter(fav => fav.id !== product.id)
      message = `${product.descripcion} ha sido eliminado de tus favoritos`
      setSnackbarSeverity('warning')
    } else {
      updatedFavorites = [...favorites, product]
      message = `${product.descripcion} ha sido agregado a tus favoritos`
      setSnackbarSeverity('success')
    }

    setFavorites(updatedFavorites)
    localStorage.setItem('favorites', JSON.stringify(updatedFavorites))
    setSnackbarMessage(message)
    setSnackbarOpen(true)
  }

  // Filtrar los productos que se deben mostrar
  const productosAMostrar = showFavorites 
    ? productosFiltrados.filter(product => favorites.some(fav => fav.id === product.id))
    : productosFiltrados

  return (
    <Container maxWidth="lg" className="conteiner-list">
      {/* <div className="flex-between-mobile" style={{ paddingTop: 30 }}>
        <Typography variant="h5" textAlign="center" width={"100%"} margin={'15px 0'}>
          Catálogo de Productos
        </Typography>
      </div> */}
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
        {favorites.length !== 0 && <Button 
          variant="contained" 
          size="large"
          color="primary" 
          onClick={() => setShowFavorites(!showFavorites)}
          className="btn-absolute-favorite"
          disabled={favorites.length === 0}
        >
          {showFavorites ? 'Mostrar Todos' : 'Mostrar Favoritos'}
        </Button>}

        {/* Selector de cuotas para el usuario */}
        <FormControl variant="outlined" sx={{ my: 2 }} style={{backgroundColor: 'white'}}>
          <InputLabel>Cuotas</InputLabel>
          <Select
            value={selectedCuota}
            onChange={(e) => setSelectedCuota(e.target.value)} // Actualizar la cuota seleccionada
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
                  key={product.codigo}
                  product={product}
                  onAddToCart={addToCart}
                  isFavorite={favorites.some(fav => fav.id === product.id)}
                  onToggleFavorite={() => toggleFavorite(product)}
                  selectedCuota={selectedCuota || '12 cuotas sin interés'} // Si no hay seleccionada, usa la por defecto
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
