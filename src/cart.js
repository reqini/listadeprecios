import React from "react";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

const ShoppingCart = ({ cart, onClearCart, banco3, banco6 }) => {
  const totalPrice = cart.reduce((acc, item) => {
    const priceNumber = parseInt(item.psvp_lista.replace(/[$.,]/g, ""), 10);
    return acc + priceNumber;
  }, 0);

  const cuota12 = cart.reduce((acc, item) => item.cuota_ah12.replace(/[$.,]/g, ""), 0);
  const cuota6 = cart.reduce((acc, item) => item.cuota_ah6.replace(/[$.,]/g, ""), 0);

  return (
    <div className="fixed-menu flex-center">
      <Accordion style={{ width: "100%", maxWidth: 500 }}>
        <AccordionSummary
          expandIcon={<ArrowDropDownIcon />}
          aria-controls="panel2-content"
          id="panel2-header"
          className="accordion"
        >
          <Typography>Carrito de Compras</Typography>
          <Typography fontWeight={800}>Total: {totalPrice}</Typography>
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
                    <Typography fontWeight={900}>cuotas sin interes</Typography>
                    <Typography>
                      <b>Ahora 6</b> ${cuota6}
                    </Typography>
                    {banco6?.ahora6 && (
                      <Typography>
                        <b>6 cuotas sin interes</b> ${(totalPrice / 6).toFixed(2)}
                      </Typography>
                    )}
                    {banco3?.ahora3 && (
                    <Typography>
                      <b>3 cuotas sin interes</b> ${(totalPrice / 3).toFixed(2)}
                    </Typography>
                     )}
                  </div>
                  <div className="flex-start-column" >
                    <Typography fontWeight={900}>cuotas con interes</Typography>
                    <Typography>
                      <b>Ahora 12</b> ${cuota12}
                    </Typography>
                  </div>
              </div>
              <div style={{ marginTop: 20 }}>
                <Button variant="contained" onClick={onClearCart}>
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

