import React, { useState, useEffect, useCallback } from "react";
import { Accordion, AccordionSummary, AccordionDetails, Container, Typography, Button, FormControl, InputLabel, Select, MenuItem, Divider, Switch, FormControlLabel } from "@mui/material";
import { FaWhatsapp, FaTrashAlt } from 'react-icons/fa';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';

import { getDiscountedPrice, getCuotaPrice } from '../utils/cartUtils';
import { parsePrice, formatPrice } from '../utils/priceUtils';

const ShoppingCart = ({ cart, onClearCart, setCart, onRemoveFromCart }) => {
  const [selectedCuota, setSelectedCuota] = useState({});
  const [planCanje, setPlanCanje] = useState({});
  const [totalPrice, setTotalPrice] = useState(0);
  const [includeShipping, setIncludeShipping] = useState(false); 
  const SHIPPING_COST = 14833;

  // Función para calcular el precio total
  const calculateTotalPrice = useCallback(() => {
    let total = cart.reduce((acc, item) => {
      const selectedPrice = selectedCuota[item.codigo] 
        ? parsePrice(selectedCuota[item.codigo])
        : getDiscountedPrice(item.precio_negocio, item.codigo, planCanje, includeShipping, SHIPPING_COST);
      return acc + selectedPrice;
    }, 0);

    setTotalPrice(total);
  }, [cart, selectedCuota, planCanje, includeShipping]);

  // Manejo de cambio de cuota
  const handleCuotaChange = useCallback((codigo, cuota) => {
    setSelectedCuota(prev => ({ ...prev, [codigo]: cuota }));
    calculateTotalPrice(); // Llamar después de actualizar la cuota
  }, [calculateTotalPrice]);

  // Manejo de cambio de Plan Canje
  const handlePlanCanjeChange = useCallback((codigo, checked) => {
    setPlanCanje(prev => ({ ...prev, [codigo]: checked }));
  }, []);

  // Cálculo de puntos totales
  const calculateTotalPoints = useCallback(() => {
    return cart.reduce((acc, item) => acc + item.puntos, 0);
  }, [cart]);

  // Efecto para recalcular el total al cambiar las dependencias
  useEffect(() => {
    calculateTotalPrice();
  }, [calculateTotalPrice, includeShipping, selectedCuota, planCanje]);

  // Función para generar el link de WhatsApp
  const createWhatsAppLink = () => {
    const mensajeFinal = `Te paso el valor de los productos, te quedaría en: ${formatPrice(totalPrice)}`;
    return `https://api.whatsapp.com/send?text=${encodeURIComponent(mensajeFinal)}`;
  };

  // Determinar si mostrar el switch de envío
  const totalPoints = calculateTotalPoints();
  const showShippingSwitch = totalPoints < 140;

  // Manejo de la eliminación del producto del carrito y resetear cuotas/planCanje
  const handleRemoveFromCart = useCallback((codigo) => {
    setCart((prevCart) => prevCart.filter(item => item.codigo !== codigo));
    // Reseteamos la cuota y el plan canje del producto eliminado
    setSelectedCuota(prev => ({ ...prev, [codigo]: undefined }));
    setPlanCanje(prev => ({ ...prev, [codigo]: undefined }));
  }, [setCart]);

  return (
    <div className="fixed-menu flex-center" style={{ position: 'relative' }}>
      <Accordion style={{ width: "100%", maxWidth: 600 }}>
        <AccordionSummary expandIcon={<ArrowDropDownIcon />} aria-controls="panel2-content" id="panel2-header" className="accordion">
          <div className="flex">
            <AddShoppingCartIcon />
            <Typography className="mar-l8">Simulador de Compra</Typography>
          </div>
          <Typography fontWeight={800}>Total: {formatPrice(totalPrice)}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Container maxWidth="lg" className="flex-center" style={{ flexDirection: "column", padding: "0px 0 0px 0" }}>
            <ul className="w-100">
              {cart.length > 0 ? (
                cart.map(item => (
                  <li key={item.codigo} className="w-100 flex flex-direction">
                    <div className="flex justify-between mar-t15 mar-b10">
                      {item.descripcion}
                      {/* <div style={{fontSize: 12}}>
                        {selectedCuota[item.codigo] 
                          ? `Cuota seleccionada: ${formatPrice(selectedCuota[item.codigo])}` 
                          : `Precio de Negocio: ${formatPrice(getDiscountedPrice(item.precio_negocio, item.codigo, planCanje, includeShipping, SHIPPING_COST))}`}
                      </div> */}

                      <FaTrashAlt onClick={() => handleRemoveFromCart(item.codigo)} style={{cursor: 'pointer', color: 'red'}} />
                    </div>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={planCanje[item.codigo] || false}
                          onChange={e => handlePlanCanjeChange(item.codigo, e.target.checked)}
                        />
                      }
                      label="Aplicar Plan Canje"
                    />
                    <FormControl variant="outlined" style={{ marginLeft: '10px', minWidth: 200, maxWidth: 300, width: '100%' }}>
                      <InputLabel>Cuotas</InputLabel>
                      <Select
                        value={selectedCuota[item.codigo] || formatPrice(getDiscountedPrice(item.precio_negocio, item.codigo, planCanje, includeShipping, SHIPPING_COST))}
                        onChange={e => handleCuotaChange(item.codigo, e.target.value)}
                        fullWidth
                        size="small"
                        label="Cuotas"
                      >
                        <MenuItem value={formatPrice(getDiscountedPrice(item.precio_negocio, item.codigo, planCanje, includeShipping, SHIPPING_COST))}>
                          Precio de Negocio: {formatPrice(getDiscountedPrice(item.precio_negocio, item.codigo, planCanje, includeShipping, SHIPPING_COST))}
                        </MenuItem>
                        {['veinticuatro_sin_interes', 'veinte_sin_interes', 'dieciocho_sin_interes', 'doce_sin_interes', 'diez_sin_interes', 'nueve_sin_interes', 'seis_sin_interes', 'tres_sin_interes'].map((cuota) =>
                          item[cuota] && item[cuota] !== 'NO' && (
                            <MenuItem key={cuota} value={getCuotaPrice(item.psvp_lista, item[cuota], item.codigo, planCanje, includeShipping, SHIPPING_COST)}>
                              {`${cuota.replace(/_/g, ' ')} sin interés de: ${getCuotaPrice(item.psvp_lista, item[cuota], item.codigo, planCanje, includeShipping, SHIPPING_COST)}`}
                            </MenuItem>
                          )
                        )}
                      </Select>
                    </FormControl>
                    <Divider style={{ marginTop: 10 }} />
                  </li>
                ))
              ) : (
                <Typography variant="body1" color="textSecondary" style={{ marginTop: 20 }}>
                  No hay productos en el carrito.
                </Typography>
              )}
            </ul>

            {showShippingSwitch && cart.length > 0 && (
              <FormControlLabel
                control={
                  <Switch
                    checked={includeShipping}
                    onChange={(e) => setIncludeShipping(e.target.checked)}
                  />
                }
                label="Incluir envío"
              />
            )}

            {showShippingSwitch && cart.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', marginTop: 20 }}>
                <LocalShippingIcon style={{ color: 'green', marginRight: 8 }} />
                <Typography variant="body2" style={{ color: 'green' }}>
                  Nota: Si la compra no supera los 140 puntos, se agrega un costo de envío de ${SHIPPING_COST}.
                </Typography>
              </div>
            )}

            <div className="flex-row-mobile" style={{ marginTop: 20 }}>
              <Button fullWidth className="mar-r6" variant="contained" onClick={onClearCart}>Limpiar carrito</Button>
              <Button
                variant="contained"
                fullWidth
                color="primary"
                href={createWhatsAppLink()}
                target="_blank"
                style={{ backgroundColor: '#25D366', color: 'white', margin: '12px 0', display: 'none' }}
                startIcon={<FaWhatsapp />}
              >
                Compartir por WhatsApp
              </Button>
            </div>
          </Container>
        </AccordionDetails>
      </Accordion>
    </div>
  );
}

export default ShoppingCart;
