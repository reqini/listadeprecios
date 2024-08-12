import React, { useState } from "react";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import { FormControl, InputLabel, Select, MenuItem, Divider } from "@mui/material";

const ShoppingCart = ({ cart, onClearCart, onClick, className }) => {
  const [selectedCuota, setSelectedCuota] = useState({});

  // Handler for updating the selected cuota for a specific item
  const handleCuotaChange = (codigo, cuota) => {
    setSelectedCuota(prev => ({
      ...prev,
      [codigo]: cuota
    }));
  };

  // Calculate the total price based on the selected cuota or price_negocio
  const totalPrice = cart.reduce((acc, item) => {
    const cuota = selectedCuota[item.codigo] || item.precio_negocio;
    const priceNumber = parseInt(cuota.replace(/[$.,]/g, ""), 10);
    return acc + priceNumber;
  }, 0);

  return (
    <div className="fixed-menu flex-center" style={{ position: 'relative' }}>
      <Accordion style={{ width: "100%", maxWidth: 600 }}>
        <AccordionSummary
          expandIcon={<ArrowDropDownIcon />}
          aria-controls="panel2-content"
          id="panel2-header"
          className="accordion"
        >
          <div className="flex">
            <AddShoppingCartIcon />
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
            <div className="w-100">
              <ul className="w-100">
                {cart.map((item) => (
                  <li key={item.codigo} className="w-100 flex flex-direction">
                    <div className="flex justify-between mar-t15 mar-b10">
                      {item.descripcion}
                      <div>
                        {selectedCuota[item.codigo] 
                          ? `$${selectedCuota[item.codigo]}`
                          : `$${item.precio_negocio}`}
                        </div>
                    </div>
                    
                    <FormControl variant="outlined" style={{ marginLeft: '10px', minWidth: 200, maxWidth: 300, width: '100%' }}>
                      <InputLabel>Cuotas</InputLabel>
                      <Select
                        value={selectedCuota[item.codigo] || item.precio_negocio}
                        onChange={(e) => handleCuotaChange(item.codigo, e.target.value)}
                        fullWidth
                        size="small"
                        label="Cuotas"
                      >
                        <MenuItem value={item.precio_negocio}>
                          Precio Negocio: ${item.precio_negocio}
                        </MenuItem>
                        {item.dieciocho_sin_interes && (
                          <MenuItem value={item.dieciocho_sin_interes}>
                            18 sin interés de: {item.dieciocho_sin_interes}
                          </MenuItem>
                        )}
                        {item.doce_sin_interes && (
                          <MenuItem value={item.doce_sin_interes}>
                            12 sin interés de: {item.doce_sin_interes}
                          </MenuItem>
                        )}
                        {item.diez_sin_interes && (
                          <MenuItem value={item.diez_sin_interes}>
                            10 sin interés de: {item.diez_sin_interes}
                          </MenuItem>
                        )}
                        {item.nueve_sin_interes && (
                          <MenuItem value={item.nueve_sin_interes}>
                            9 sin interés de: {item.nueve_sin_interes}
                          </MenuItem>
                        )}
                        {item.seis_sin_interes && (
                          <MenuItem value={item.seis_sin_interes}>
                            6 sin interés de: {item.seis_sin_interes}
                          </MenuItem>
                        )}
                        {item.tres_sin_interes && (
                          <MenuItem value={item.tres_sin_interes}>
                            3 sin interés de: {item.tres_sin_interes}
                          </MenuItem>
                        )}
                      </Select>
                    </FormControl>
                    <Divider style={{marginTop: 10}} />
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
                    <i className="envio">
                      ¡Si el producto supera los 140 puntos, <b>el envío es gratis</b>!
                    </i>
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
