import React, { useState, useEffect } from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Container,
  Typography,
  Button,
  Divider,
} from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { FaWhatsapp, FaTrashAlt } from "react-icons/fa";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import { useTheme } from "@mui/material/styles";
import { formatPrice, parsePrice } from "../utils/priceUtils";

const ShoppingCartCatalogo = ({
  cart,
  setCart,
  cuotaKey = "tres_sin_interes",
  cuotasTexto = "3 cuotas",
}) => {
  const theme = useTheme();
  const [shippingCost, setShippingCost] = useState(21036);

  // Cargar costo de envío dinámico
  useEffect(() => {
    const loadShippingCost = () => {
      const costo = localStorage.getItem('costoEnvio');
      if (costo) {
        setShippingCost(parseFloat(costo));
      }
    };

    loadShippingCost();

    // Escuchar cambios en tiempo real
    const handleCostosUpdate = (event) => {
      setShippingCost(event.detail.costoEnvio);
    };

    window.addEventListener('costosUpdated', handleCostosUpdate);
    return () => window.removeEventListener('costosUpdated', handleCostosUpdate);
  }, []);

  const getCuotaSeleccionada = (product) => {
    const raw = product[cuotaKey];
    if (!raw || typeof raw !== "string" || raw.toLowerCase() === "no") return 0;
    return parsePrice(raw);
  };

  const calcularTotal = () => {
    return cart.reduce((acc, item) => acc + getCuotaSeleccionada(item), 0);
  };

  const total = calcularTotal();

  const limpiarCarrito = () => {
    setCart([]);
  };

  const eliminarItem = (codigo) => {
    setCart((prev) => prev.filter((item) => item.codigo !== codigo));
  };

  const generarLinkWhatsApp = () => {
    if (cart.length === 0) {
      return "https://api.whatsapp.com/send?text=No%20hay%20productos%20en%20el%20carrito";
    }

    const mensaje = cart
      .map((item) => {
        const precio = formatPrice(getCuotaSeleccionada(item));
        return `🛍️ ${item.descripcion} - ${precio} en ${cuotasTexto}`;
      })
      .join("%0A");

    return `https://api.whatsapp.com/send?text=✨ Hola me gustaria consultar por:%0A${mensaje}%0A%0ATotal: ${formatPrice(
      total
    )}`;
  };

  return (
    <div className="fixed-menu flex-center" style={{ position: "relative" }}>
      <Accordion
        sx={{
          width: "100%",
          maxWidth: 500,
          bottom: 12,
          borderRadius: "25px!important",
          overflow: "hidden",
          "@media (max-width:986px)": {
            borderRadius: "0px!important",
            width: "100%",
            bottom: 0,
          },
        }}
      >
        <AccordionSummary
          expandIcon={<ArrowDropDownIcon />}
          aria-controls="panel2-content"
          id="panel2-header"
          sx={{
            backgroundColor: theme.palette.primary.main,
            color: "#fff",
            borderRadius: 1,
          }}
        >
          <div className="flex">
            <AddShoppingCartIcon />
          </div>
          <div className="flex justify-between w-100">
            <Typography fontWeight={600}>Tu selección</Typography>
            <Typography fontWeight={800}>{formatPrice(total)}</Typography>
          </div>
        </AccordionSummary>

        <AccordionDetails>
          <Container
            maxWidth="lg"
            className="flex-center"
            style={{ flexDirection: "column", padding: "0px" }}
          >
            <ul className="w-100">
              {cart.length > 0 ? (
                cart.map((item) => (
                  <li key={item.codigo} className="w-100">
                    <div className="flex justify-between mar-t10 mar-b10">
                      <div>
                        <strong>{item.descripcion}</strong>
                        <br />
                        <span>
                          {formatPrice(getCuotaSeleccionada(item))}
                        </span>
                      </div>
                      <FaTrashAlt
                        onClick={() => eliminarItem(item.codigo)}
                        style={{ cursor: "pointer", color: "red" }}
                      />
                    </div>
                    <Divider />
                  </li>
                ))
              ) : (
                <Typography variant="body1" style={{ marginTop: 20 }}>
                  No hay productos en tu selección.
                </Typography>
              )}
            </ul>

            <div
              className="flex flex-row items-center"
              style={{ marginTop: 20, gap: 10 }}
            >
              <Button
                variant="contained"
                fullWidth
                color="primary"
                href={generarLinkWhatsApp()}
                target="_blank"
                style={{
                  backgroundColor: "#25D366",
                  color: "white",
                }}
                startIcon={<FaWhatsapp />}
              >
                Enviar por WhatsApp
              </Button>
              <Button fullWidth variant="outlined" onClick={limpiarCarrito}>
                Limpiar
              </Button>
            </div>
          </Container>
        </AccordionDetails>
      </Accordion>
    </div>
  );
};

export default ShoppingCartCatalogo;
