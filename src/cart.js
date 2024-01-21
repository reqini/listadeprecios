// Cart.js
import React from 'react';

const Cart = ({ cart }) => {
  const totalPrice = cart.reduce((acc, item) => acc + item.price, 0);

  return (
    <div>
      <h2>Shopping Cart</h2>
      <ul>
        {cart.map((item, index) => (
          <li key={index}>{item.name} - ${item.price}</li>
        ))}
      </ul>
      <p>Total: ${totalPrice}</p>
    </div>
  );
};

export default Cart;
