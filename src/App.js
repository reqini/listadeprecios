// App.js
import React, { useEffect, useState, lazy, Suspense } from 'react';
import Product from './products';
import Container from '@mui/material/Container';
import axios from 'axios';
import TextField from '@mui/material/TextField';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import Grid from '@mui/material/Grid';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import bancos from './bancos';

const ShoppingCart = ({ cart, onClearCart }) => {
  
  const totalPrice = cart.reduce((acc, item) => item.psvp_lista, 0);
  const cuota12 = cart.reduce((acc, item) => item.cuota_ah12, 0);
  const cuota6 = cart.reduce((acc, item) => item.cuota_ah6, 0);

  console.log(totalPrice);
  console.log(bancos);

  return (
      <div className='fixed-menu flex-center'>
        <Accordion style={{width: '100%', maxWidth: 500}}>
          <AccordionSummary
            expandIcon={<ArrowDropDownIcon />}
            aria-controls="panel2-content"
            id="panel2-header"
            className='accordion'
          >
            <Typography>Carrito de Compras</Typography>
            <Typography fontWeight={800}>Total: {totalPrice}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Container maxWidth="lg" className='flex-center' style={{flexDirection: 'column', padding: '0px 0 20px 0'}}>
              <div>
                <ul>
                  {cart.map((item) => (
                    <li key={item.codigo}>{item.descripcion} - ${item.psvp_lista}</li>
                  ))}
                </ul>
              </div>
              <div className='flex-center' style={{flexDirection: 'column'}}>
                <div>
                  <h3>Planes de Pago</h3>
                </div>
                <div className='flex-between'>
                  <div>
                    <Typography fontWeight={900}>cuotas sin interes</Typography>
                    <Typography><b>6 cuotas de</b> {cuota6}</Typography>
                    <Typography><b>12 cuotas de</b> {cuota12}</Typography>
                  </div>
                  {/* <div>
                    <Typography fontWeight={900}>cuotas con interes</Typography>
                    <Typography><b>3 cuotas de</b> {calculateInstallmentInt(3)}</Typography>
                    <Typography><b>6 cuotas de</b> {calculateInstallmentInt(6)}</Typography>
                    <Typography><b>12 cuotas de</b> {calculateInstallmentInt(12)}</Typography>
                  </div> */}
                </div>
              <div style={{marginTop: 20}}>
              <Button variant='contained' onClick={onClearCart}>Limpiar carrito</Button>
              </div>
              </div>
            </Container>
          </AccordionDetails>
        </Accordion>
      </div>
  );
};


const App = () => {

  const [cart, setCart] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [productosFiltrados, setProductosFiltrados] = useState([]);
  const [productos, setProductos] = useState([]);
  const [isSticky, setIsSticky] = useState(false);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/productos');

        setProductos(response.data);
        setProductosFiltrados(response.data);
      } catch (error) {
        console.error('Error al obtener productos', error);
      }
    };

    fetchData();
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
  }, [filtro, productos]);

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
                    bank.ahora3 == true ? <MenuItem value={10}>{bank.banco}</MenuItem> : null
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
                  bank.ahora6 == true ? <MenuItem value={10}>{bank.banco}</MenuItem> : null
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

export default App;
