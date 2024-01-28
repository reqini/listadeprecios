import React from "react";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Fab from '@mui/material/Fab';
import NavigationIcon from '@mui/icons-material/Navigation';
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';

const ShoppingCart = ({ cart, onClearCart, banco3, banco6, onClick, className }) => {
  
  const totalPrice = cart.reduce((acc, item) => {
    const priceNumber = parseInt(item.psvp_lista.replace(/[$.,]/g, ""), 10);
    return acc + priceNumber;
  }, 0);

  const cuota12 = cart.reduce((acc, item) => {
    const priceNumber = parseInt(item.cuota_ah12.replace(/[$.,]/g, ""), 10);
    return acc + priceNumber;
  }, 0);

  const cuota6 = cart.reduce((acc, item) => {
    const priceNumber = parseInt(item.cuota_ah6.replace(/[$.,]/g, ""), 10);
    return acc + priceNumber;
  }, 0);

  const envio6 = 1000
  const envio12 = 500

  /* const compartirPorWhatsApp = () => {
    const mensaje = `¡Hola! ¿Como estas?, el costo en cuotas de tu futuro producto Essen es de:`;

    const productosEnTexto = cart.map(() => {
      return (
        ` ${'Ahora 6 de:'} - $${cuota6}`
      );
    }).join('\n');

    const textoFinal = mensaje + productosEnTexto;

    // Crea el enlace de WhatsApp
    const enlaceWhatsApp = `whatsapp://send?text=${encodeURIComponent(textoFinal)}`;

    // Abre el enlace en una nueva ventana
    window.open(enlaceWhatsApp);
  }; */

  return (
    <div className="fixed-menu flex-center" style={{position: 'relative'}}>
      <Fab onClick={onClick} className={className} variant="extended" size="small" color="primary">
        <NavigationIcon sx={{ mr: 1 }} />
      </Fab>
      <Accordion style={{ width: "100%", maxWidth: 500 }}>
        <AccordionSummary
          expandIcon={<ArrowDropDownIcon />}
          aria-controls="panel2-content"
          id="panel2-header"
          className="accordion"
        >
          <div className="flex">
            <AddShoppingCartIcon/>
            <Typography className="mar-l8">Carrito de Compras</Typography>
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
                    {item.descripcion} - ${totalPrice}
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
                    <Typography>
                      <b>Ahora 12</b> ${cuota12 + envio12}
                    </Typography>
                    <Typography>
                      <b>Ahora 6</b> ${cuota6 + envio6}
                    </Typography>
                    {banco6?.ahora6 && (
                      <Typography>
                        <b>6 cuotas sin interes</b> ${Math.round(totalPrice / 6).toFixed(0)}
                      </Typography>
                    )}
                    {banco3?.ahora3 && (
                    <Typography>
                      <b>3 cuotas sin interes</b> ${Math.round(totalPrice / 3).toFixed(0)}
                    </Typography>
                     )}
                  </div>
              </div>
              <div style={{ marginTop: 20 }}>
                <Button variant="contained" onClick={onClearCart}>
                  Limpiar carrito
                </Button>
                {/* <Button variant="contained" onClick={compartirPorWhatsApp}>
                  enviar info
                </Button> */}
              </div>
            </div>
          </Container>
        </AccordionDetails>
      </Accordion>
    </div>
  );
};
export default ShoppingCart;

