import React from "react";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
/* import Fab from '@mui/material/Fab';
import NavigationIcon from '@mui/icons-material/Navigation'; */
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';

const ShoppingCart = ({ cart, onClearCart, onClick, className }) => {
  
  const totalPrice = cart.reduce((acc, item) => {
    const priceNumber = parseInt(item.psvp_lista.replace(/[$.,]/g, ""), 10);
    return acc + priceNumber;
  }, 0);

/*   const cuota12 = cart.reduce((acc, item) => {
    const priceNumber = parseInt(item.cuota_ah12.replace(/[$.,]/g, ""), 10);
    return acc + priceNumber;
  }, 0); */

/*   const puntos = cart.reduce((acc, item) => {
    const totalPuntos = parseInt(item.puntos);
    return totalPuntos;
  }, 0); */

  return (
    <div className="fixed-menu flex-center" style={{ position: 'relative' }}>
      
      <Accordion style={{ width: "100%", maxWidth: 500 }}>
        <AccordionSummary
          expandIcon={<ArrowDropDownIcon />}
          aria-controls="panel2-content"
          id="panel2-header"
          className="accordion"
        >
          <div className="flex">
            <AddShoppingCartIcon/>
            <Typography className="mar-l8">Simulador de Compra</Typography>
          </div>
          <Typography fontWeight={800}>Total: ${totalPrice}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Container
            maxWidth="lg"
            className="flex-center"
            style={{ flexDirection: "column", padding: "0px 0 20px 0" }}
          >
            <div>
              <ul>
                {cart.map((item) => (
                  <li key={item.codigo}>
                    {item.descripcion} - ${item.psvp_lista}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex-center" style={{ flexDirection: "column" }}>
              <div>
                <h3>Planes de Pago</h3>
              </div>
              <div className="flex-between">
                  <div className="flex-start-column">
                    <Typography className="flex flex-direction">
                      <i className="envio">¡Si el producto supera los 140 puntos, <b>el envio es gratis</b>!</i>
                    </Typography>
                  </div>
              </div>
              <div style={{ marginTop: 20 }}>
                <Button className="mar-r6" variant="contained" onClick={onClearCart}>
                  Limpiar carrito
                </Button>
              </div>
            </div>
          </Container>
        </AccordionDetails>
      </Accordion>
    </div>
  );
};
export default ShoppingCart;

