// App.js
import React, { useEffect, useState } from 'react';
import Product from './products';
/* import Cart from './cart'; */
import axios from 'axios';
import TextField from '@mui/material/TextField';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

const ShoppingCart = ({ cart, onClearCart }) => {
  const totalPrice = cart.reduce((acc, item) => acc + item.price, 0);

  const calculateInstallment = (months) => {
    const installmentPrice = totalPrice / months;
    return installmentPrice.toFixed(2);
  };

  const totalPriceInt = cart.reduce((acc, item) => acc + item.price * 1.3, 0);

  const calculateInstallmentInt = (months) => {
    const installmentPrice = totalPriceInt / months;
    return installmentPrice.toFixed(2);
  };

  return (
    <div>
      <h2>Carrito de Compras</h2>
      
      <ul>
        {cart.map((item) => (
          <li key={item.id}>{item.name} - ${item.price}</li>
        ))}
      </ul>
      <p>Total: ${totalPrice}</p>
      <button onClick={onClearCart}>Limpiar carrito</button>
      <h3>Planes de Pago</h3>

      cuotas sin interes
      <p>3 cuotas de ${calculateInstallment(3)}</p>
      <p>6 cuotas de ${calculateInstallment(6)}</p>
      <p>12 cuotas de ${calculateInstallment(12)}</p>

       Cuotas con interes   
    
      <p>3 cuotas de ${calculateInstallmentInt(3)}</p>
      <p>6 cuotas de ${calculateInstallmentInt(6)}</p>
      <p>12 cuotas de ${calculateInstallmentInt(12)}</p>
    </div>
  );
};


const App = () => {

  const [cart, setCart] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [productosFiltrados, setProductosFiltrados] = useState([]);
  const [productos, setProductos] = useState([]);

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
    <div>
      <h1>Productos Essen</h1>
      <TextField id="outlined-basic" label="Buscar por nombre" variant="outlined" value={filtro} onChange={(e) => setFiltro(e.target.value)} />
      <ul>
        {productosFiltrados.map(product => (
          <li key={product.id}>
            <Product key={product.id} product={product} onAddToCart={addToCart} />
          </li>
        ))}
      </ul>
      <ShoppingCart cart={cart} onClearCart={clearCart} />
    </div>
  );
};

export default App;
