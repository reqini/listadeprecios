import React, { useState, useEffect, useCallback } from "react";
import { 
  Accordion, AccordionSummary, AccordionDetails, 
  Container, Typography, Button, FormControl, InputLabel, 
  Select, MenuItem, Divider, Switch, FormControlLabel 
} from "@mui/material";
import { FaWhatsapp, FaTrashAlt } from 'react-icons/fa';  // Importamos el ícono de eliminación
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';

const ShoppingCart = ({ cart, onClearCart, onRemoveFromCart }) => { // Recibimos la nueva función onRemoveFromCart
  const [selectedCuota, setSelectedCuota] = useState({});
  const [planCanje, setPlanCanje] = useState({});
  const [totalPrice, setTotalPrice] = useState(0);
  const SHIPPING_COST = 14126; // Costo de envío fijo

  const handleCuotaChange = useCallback((codigo, cuota) => {
    setSelectedCuota(prev => ({ ...prev, [codigo]: cuota }));
  }, []);

  const handlePlanCanjeChange = useCallback((codigo, checked) => {
    setPlanCanje(prev => ({ ...prev, [codigo]: checked }));
  }, []);

  const parsePrice = (priceString) => {
    if (!priceString || typeof priceString !== 'string') return 0;
    return parseInt(priceString.replace(/[^0-9]/g, '').trim(), 10) || 0;
  };

  const applyPlanCanjeDiscount = (amount) => Math.max(amount - 30000, 0);

  const formatPrice = (price) =>
    Math.round(price).toLocaleString('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });

  const getDiscountedPrice = useCallback((price, codigo) => {
    const parsedPrice = parsePrice(price);
    return planCanje[codigo] ? applyPlanCanjeDiscount(parsedPrice) : parsedPrice;
  }, [planCanje]);

  const getCuotaPrice = (psvpPrice, cuotaPrice, codigo) => {
    const parsedPSVPPrice = parsePrice(psvpPrice);
    const parsedCuotaPrice = parsePrice(cuotaPrice);

    const discountedPSVP = planCanje[codigo] ? applyPlanCanjeDiscount(parsedPSVPPrice) : parsedPSVPPrice;

    return formatPrice(parsedCuotaPrice > 0 ? (discountedPSVP / (parsedPSVPPrice / parsedCuotaPrice)) : 0);
  };

  // Calcular el total de puntos del carrito
  const calculateTotalPoints = useCallback(() => {
    return cart.reduce((acc, item) => acc + item.puntos, 0);
  }, [cart]);

  const calculateTotalPrice = useCallback(() => {
    let total = cart.reduce((acc, item) => {
      const selectedPrice = selectedCuota[item.codigo] 
        ? parsePrice(selectedCuota[item.codigo]) 
        : getDiscountedPrice(item.precio_negocio, item.codigo);
      return acc + selectedPrice;
    }, 0);

    // Si los puntos superan los 140, agregar el costo de envío automáticamente
    if (calculateTotalPoints() > 140) {
      total += SHIPPING_COST;
    }

    setTotalPrice(total);
  }, [cart, selectedCuota, getDiscountedPrice, calculateTotalPoints]);

  useEffect(() => {
    calculateTotalPrice();
  }, [calculateTotalPrice]);

  const createWhatsAppLink = () => {
    const mensajeFinal = `Te paso el valor de los productos, te quedaría en: ${formatPrice(totalPrice)}`;
    return `https://api.whatsapp.com/send?text=${encodeURIComponent(mensajeFinal)}`;
  };

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
              {cart.map(item => (
                <li key={item.codigo} className="w-100 flex flex-direction">
                  <div className="flex justify-between mar-t15 mar-b10">
                    {item.descripcion}
                    <div>{selectedCuota[item.codigo] || `Precio de Negocio: ${formatPrice(getDiscountedPrice(item.precio_negocio, item.codigo))}`}</div>
                    {/* Botón para eliminar producto */}
                    <FaTrashAlt onClick={() => onRemoveFromCart(item.codigo)} style={{cursor: 'pointer', color: 'red'}} />
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
                      value={selectedCuota[item.codigo] || formatPrice(getDiscountedPrice(item.precio_negocio, item.codigo))}
                      onChange={e => handleCuotaChange(item.codigo, e.target.value)}
                      fullWidth
                      size="small"
                      label="Cuotas"
                    >
                      <MenuItem value={formatPrice(getDiscountedPrice(item.precio_negocio, item.codigo))}>
                        Precio de Negocio: {formatPrice(getDiscountedPrice(item.precio_negocio, item.codigo))}
                      </MenuItem>
                      {['dieciocho_sin_interes', 'doce_sin_interes', 'diez_sin_interes', 'nueve_sin_interes', 'seis_sin_interes', 'tres_sin_interes'].map((cuota) =>
                        item[cuota] && item[cuota] !== 'NO' && (
                          <MenuItem key={cuota} value={getCuotaPrice(item.psvp_lista, item[cuota], item.codigo)}>
                            {`${cuota.replace(/_/g, ' ')} sin interés de: ${getCuotaPrice(item.psvp_lista, item[cuota], item.codigo)}`}
                          </MenuItem>
                        )
                      )}
                    </Select>
                  </FormControl>
                  <Divider style={{ marginTop: 10 }} />
                </li>
              ))}
            </ul>

            {calculateTotalPoints() < 140 && (
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
  )
}

export default ShoppingCart
