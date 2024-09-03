import React, { useState, useEffect, useCallback } from "react";
import { Accordion, AccordionSummary, AccordionDetails, Container, Typography, Button, FormControl, InputLabel, Select, MenuItem, Divider, Switch, FormControlLabel } from "@mui/material";
import { FaWhatsapp } from 'react-icons/fa';
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';

const ShoppingCart = ({ cart, onClearCart }) => {
  const [selectedCuota, setSelectedCuota] = useState({});
  const [planCanje, setPlanCanje] = useState({});
  const [totalPrice, setTotalPrice] = useState(0);

  const handleCuotaChange = (codigo, cuota) => {
    setSelectedCuota(prev => ({ ...prev, [codigo]: cuota }));
  };

  const handlePlanCanjeChange = (codigo, checked) => {
    setPlanCanje(prev => ({ ...prev, [codigo]: checked }));
  };

  const parsePrice = (priceString) => {
    if (!priceString || typeof priceString !== 'string') return 0;
    const normalizedPrice = priceString.replace(/[^0-9]/g, '').trim();
    return parseInt(normalizedPrice, 10) || 0;
  };

  const applyPlanCanjeDiscount = (amount) => {
    const discountedAmount = amount - 30000;
    return discountedAmount > 0 ? discountedAmount : 0;
  };

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

  const calculateTotalPrice = useCallback(() => {
    const total = cart.reduce((acc, item) => {
      const selectedPrice = selectedCuota[item.codigo] 
        ? parsePrice(selectedCuota[item.codigo]) 
        : getDiscountedPrice(item.precio_negocio, item.codigo);
      return acc + selectedPrice;
    }, 0);
    setTotalPrice(total);
  }, [cart, selectedCuota, getDiscountedPrice]);

  useEffect(() => {
    calculateTotalPrice();
  }, [calculateTotalPrice]);

  const createWhatsAppLink = () => {
    const cuotasMap = {
      'dieciocho_sin_interes': 18,
      'doce_sin_interes': 12,
      'diez_sin_interes': 10,
      'nueve_sin_interes': 9,
      'seis_sin_interes': 6,
      'tres_sin_interes': 3
    };

    const cuotaSeleccionada = Object.keys(selectedCuota).find(key => selectedCuota[key] && cuotasMap[key]);

    let mensajeCuotas = '';

    if (cuotaSeleccionada) {
      const numCuotas = cuotasMap[cuotaSeleccionada];
      mensajeCuotas = `${numCuotas} cuotas sin interés de: ${formatPrice(totalPrice)}`;
    } else {
      mensajeCuotas = `si pagas de contado te quedaría: ${formatPrice(totalPrice)}`;
    }

    const mensajeFinal = `Te paso el valor de los productos, te quedaría en: ${mensajeCuotas}`;

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
          <Container maxWidth="lg" className="flex-center" style={{ flexDirection: "column", padding: "0px 0 20px 0" }}>
            <ul className="w-100">
              {cart.map(item => (
                <li key={item.codigo} className="w-100 flex flex-direction">
                  <div className="flex justify-between mar-t15 mar-b10">
                    {item.descripcion}
                    <div>{selectedCuota[item.codigo] || `Precio de Negocio: ${formatPrice(getDiscountedPrice(item.precio_negocio, item.codigo))}`}</div>
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
                      {item.dieciocho_sin_interes && item.dieciocho_sin_interes !== 'NO' && (
                        <MenuItem value={getCuotaPrice(item.psvp_lista, item.dieciocho_sin_interes, item.codigo)}>
                          18 sin interés de: {getCuotaPrice(item.psvp_lista, item.dieciocho_sin_interes, item.codigo)}
                        </MenuItem>
                      )}
                      {item.doce_sin_interes && item.doce_sin_interes !== 'NO' && (
                        <MenuItem value={getCuotaPrice(item.psvp_lista, item.doce_sin_interes, item.codigo)}>
                          12 sin interés de: {getCuotaPrice(item.psvp_lista, item.doce_sin_interes, item.codigo)}
                        </MenuItem>
                      )}
                      {item.diez_sin_interes && item.diez_sin_interes !== 'NO' && (
                        <MenuItem value={getCuotaPrice(item.psvp_lista, item.diez_sin_interes, item.codigo)}>
                          10 sin interés de: {getCuotaPrice(item.psvp_lista, item.diez_sin_interes, item.codigo)}
                        </MenuItem>
                      )}
                      {item.nueve_sin_interes && item.nueve_sin_interes !== 'NO' && (
                        <MenuItem value={getCuotaPrice(item.psvp_lista, item.nueve_sin_interes, item.codigo)}>
                          9 sin interés de: {getCuotaPrice(item.psvp_lista, item.nueve_sin_interes, item.codigo)}
                        </MenuItem>
                      )}
                      {item.seis_sin_interes && item.seis_sin_interes !== 'NO' && (
                        <MenuItem value={getCuotaPrice(item.psvp_lista, item.seis_sin_interes, item.codigo)}>
                          6 sin interés de: {getCuotaPrice(item.psvp_lista, item.seis_sin_interes, item.codigo)}
                        </MenuItem>
                      )}
                      {item.tres_sin_interes && item.tres_sin_interes !== 'NO' && (
                        <MenuItem value={getCuotaPrice(item.psvp_lista, item.tres_sin_interes, item.codigo)}>
                          3 sin interés de: {getCuotaPrice(item.psvp_lista, item.tres_sin_interes, item.codigo)}
                        </MenuItem>
                      )}
                    </Select>
                  </FormControl>
                  <Divider style={{ marginTop: 10 }} />
                </li>
              ))}
            </ul>
            <div className="flex-row-mobile" style={{ marginTop: 20 }}>
              <Button fullWidth className="mar-r6" variant="contained" onClick={onClearCart}>Limpiar carrito</Button>
              <Button
                variant="contained"
                fullWidth
                color="primary"
                href={createWhatsAppLink()}
                target="_blank"
                style={{ backgroundColor: '#25D366', color: 'white', margin: '12px 0' }}
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
};

export default ShoppingCart;
