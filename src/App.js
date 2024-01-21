// App.js
import React, { useEffect, useState } from 'react';
import Product from './products';
import Container from '@mui/material/Container';
import axios from 'axios';
import numeral from 'numeral';
import TextField from '@mui/material/TextField';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

const ShoppingCart = ({ cart, onClearCart }) => {
  
  const totalPrice = cart.reduce((acc, item) => acc + item.price, 0);
  const precioFormateado = numeral(totalPrice).format('0.0,00');

  const calculateInstallment = (months) => {
    const installmentPrice = precioFormateado / months;
    return installmentPrice.toFixed(2);
  };

  const totalPriceInt = cart.reduce((acc, item) => acc + item.price * 1.3, 0);
  const precioFormateadoInt = numeral(totalPriceInt).format('0.0,00');

  const calculateInstallmentInt = (months) => {
    const installmentPrice = precioFormateadoInt / months;
    return installmentPrice.toFixed(2); 
  };

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
            <Typography fontWeight={800}>Total: ${totalPrice}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Container maxWidth="lg" className='flex-center' style={{flexDirection: 'column', padding: '0px 0 20px 0'}}>
              <div>
                <ul>
                  {cart.map((item) => (
                    <li key={item.id}>{item.name} - ${item.price}</li>
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
                    <Typography><b>3 cuotas de</b> ${calculateInstallment(3)}</Typography>
                    <Typography><b>6 cuotas de</b> ${calculateInstallment(6)}</Typography>
                    <Typography><b>12 cuotas de</b> ${calculateInstallment(12)}</Typography>
                  </div>
                  <div>
                    <Typography fontWeight={900}>cuotas con interes</Typography>
                    <Typography><b>3 cuotas de</b> ${calculateInstallmentInt(3)}</Typography>
                    <Typography><b>6 cuotas de</b> ${calculateInstallmentInt(6)}</Typography>
                    <Typography><b>12 cuotas de</b> ${calculateInstallmentInt(12)}</Typography>
                  </div>
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
      producto.name.toLowerCase().includes(filtro.toLowerCase())
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
      <ul className='lista-prod'>
        {productosFiltrados.map(product => (
          <li className='grid-item' key={product.id}>
            <Product key={product.id} product={product} onAddToCart={addToCart} />
          </li>
        ))}
      </ul>
      <ShoppingCart cart={cart} onClearCart={clearCart} />
    </Container>
  );
};

export default App;
