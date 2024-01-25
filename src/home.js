import React, { useEffect, useState } from 'react';
import axios from "axios"

import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Grid from '@mui/material/Grid';

import ShoppingCart from './cart';
import bancos from './bancos';
// import productos from './listadeproductos';
import Product from './products';

const url = "https://backtest-production.up.railway.app"

const Home = () => {

    const [cart, setCart] = useState([]);

    const [productos, setProductos] = useState([])
    const [filtro, setFiltro] = useState('');
    const [productosFiltrados, setProductosFiltrados] = useState([]);
  
    const [isSticky, setIsSticky] = useState(false);

    useEffect(()=> {
        const getData = async() => {
            const result = await axios.get(`${url}/api/productos`) 

            setProductos(result.data)
            setProductosFiltrados(result.data)
        }

        getData()
    }, [])
  
    useEffect(() => {
      const handleScroll = () => {
        const offset = window.scrollY;
        if (offset > 100) {
          setIsSticky(true);
        } else {
          setIsSticky(false);
        }
      };
  
      window.addEventListener('scroll', handleScroll);
  
      return () => {
        window.removeEventListener('scroll', handleScroll);
      };
    }, []);
  
    useEffect(() => {
      const productosFiltrados = productos.filter(producto =>
        producto.descripcion.toLowerCase().includes(filtro.toLowerCase())
      );
  
      setProductosFiltrados(productosFiltrados);
    }, [filtro]);
  
    const addToCart = (productos) => {
      setCart([...cart, productos]);
    };
  
    const clearCart = () => {
      setCart([]);
    };
    return (
        <Container maxWidth="lg" className='conteiner-list'>
            <div className='flex-center'>
            <h2>Catalogo de Productos y precios</h2>
            </div>
            <div className={`header flex-center pad20 ${isSticky ? 'sticky' : ''}`}>
            <TextField 
                style={{maxWidth: 450}}
                fullWidth
                className='search'
                id="outlined-basic" 
                label="Buscar Producto" 
                variant="outlined" 
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)} 
            />
            </div>
            <div className='flex-center' style={{padding: '20px 0'}}>        
            <FormControl fullWidth>
                <Grid container spacing={2}>
                <Grid item sm={6} xs={12}>
                    <div className='w-100'>
                    <InputLabel id="demo-simple-select-label">3 cuotas</InputLabel>
                    <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        fullWidth
                        style={{background: 'white'}}
                        value={bancos.codigo}
                        label="Hola"
                    >
                        {bancos.map(bank => (
                        bank.ahora3 === true ? <MenuItem value={10}>{bank.banco}</MenuItem> : null
                        ))}
                    </Select>
                    </div>
                </Grid>
                <Grid item sm={6} xs={12}>
                    <div className='w-100'>
                    <InputLabel id="demo-simple-select-label">6 cuotas</InputLabel>
                    <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        fullWidth
                        style={{background: 'white'}}
                        value={bancos.codigo}
                        label="Age"
                    >
                        {bancos.map(bank => (
                        bank.ahora6 === true ? <MenuItem value={10}>{bank.banco}</MenuItem> : null
                        ))}
                    </Select>
                    </div>
                </Grid>
                </Grid>
            </FormControl>
            </div>
            <ul className='lista-prod'>
            {productosFiltrados.map(product => (
                <li className='grid-item' key={product.id}>
                <Product key={product.codigo} product={product} onAddToCart={addToCart} />
                </li>
            ))}
            </ul>
            <ShoppingCart cart={cart} onClearCart={clearCart} />
        </Container>
    );
  };
  export default Home;
