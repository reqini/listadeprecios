import React, { useState, useEffect, useCallback } from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Container,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Switch,
  FormControlLabel,
} from "@mui/material";
import { FaWhatsapp, FaTrashAlt } from "react-icons/fa";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import { useTheme } from "@mui/material/styles";
import { getDiscountedPrice, getCuotaPrice } from "../utils/cartUtils";
import { parsePrice, formatPrice } from "../utils/priceUtils";

const ShoppingCart = ({ cart, onClearCart, setCart, /* onRemoveFromCart */ }) => {
  const [selectedCuota, setSelectedCuota] = useState({});
  const [planCanje, setPlanCanje] = useState({});
  const [totalPrice, setTotalPrice] = useState(0);
  const [includeShipping, setIncludeShipping] = useState(false);
  const SHIPPING_COST = 18697; // COSTO DE ENVIO
  const theme = useTheme();

  // Función para calcular el precio total
  const calculateTotalPrice = useCallback(() => {
    let total = cart.reduce((acc, item) => {
      const selectedPrice = selectedCuota[item.codigo]
        ? parsePrice(selectedCuota[item.codigo])
        : getDiscountedPrice(
            item.precio_negocio,
            item.codigo,
            planCanje,
            includeShipping,
            SHIPPING_COST
          );
      return acc + selectedPrice;
    }, 0);

    setTotalPrice(total);
  }, [cart, selectedCuota, planCanje, includeShipping]);

  // Manejo de cambio de cuota
  const handleCuotaChange = useCallback(
    (codigo, cuota) => {
      setSelectedCuota((prev) => ({ ...prev, [codigo]: cuota }));
      calculateTotalPrice(); // Llamar después de actualizar la cuota
    },
    [calculateTotalPrice]
  );

  // Manejo de cambio de Plan Canje
  const handlePlanCanjeChange = useCallback((codigo, checked) => {
    setPlanCanje((prev) => ({ ...prev, [codigo]: checked }));
  }, []);

  // Cálculo de puntos totales
  const calculateTotalPoints = useCallback(() => {
    return cart.reduce((acc, item) => acc + (item.puntos || 0), 0); // Asegura que siempre haya un número
  }, [cart]);

  // Efecto para recalcular el total al cambiar las dependencias
  useEffect(() => {
    calculateTotalPrice();
  }, [calculateTotalPrice, includeShipping, selectedCuota, planCanje]);

  // Función para generar el link de WhatsApp
  const createWhatsAppLink = () => {
    if (cart.length === 0) {
      return `https://api.whatsapp.com/send?text=${encodeURIComponent(
        "No hay productos en el carrito."
      )}`;
    }

    // Generar mensaje con los nombres de los productos, cuotas y plan canje
    const mensajeProductos = cart
      .map((item) => {
        const cuotaSeleccionada = selectedCuota[item.codigo];
        const precioCuota = cuotaSeleccionada
          ? formatPrice(parsePrice(cuotaSeleccionada))
          : formatPrice(
              getDiscountedPrice(
                item.precio_negocio,
                item.codigo,
                planCanje,
                false,
                0
              )
            );

        const textoCuotas = cuotaSeleccionada
          ? `Cuota: ${precioCuota}`
          : "1 cuota sin interés";

        const textoPlanCanje = planCanje[item.codigo]
          ? "Plan Canje aplicado"
          : "";

        return `- Producto: ${item.descripcion}\n  ${textoCuotas}\n  ${textoPlanCanje}`;
      })
      .join("\n\n");

    // Agregar detalles del envío
    const envioMensaje = includeShipping
      ? `Se incluye costo de envío: ${formatPrice(SHIPPING_COST)}`
      : "No incluye costo de envío.";

    // Crear mensaje final
    const mensajeFinal = `Detalle de los productos seleccionados:\n\n${mensajeProductos}\n\n${envioMensaje}\n\nTotal: ${formatPrice(
      totalPrice
    )}`;

    return `https://api.whatsapp.com/send?text=${encodeURIComponent(
      mensajeFinal
    )}`;
  };

  // Determinar si mostrar el switch de envío
  const totalPoints = calculateTotalPoints();
  const showShippingSwitch = totalPoints < 140; // Ahora depende exclusivamente de los puntos totales

  // Manejo de la eliminación del producto del carrito y resetear cuotas/planCanje
  const handleRemoveFromCart = useCallback(
    (codigo) => {
      setCart((prevCart) => prevCart.filter((item) => item.codigo !== codigo));
      setSelectedCuota((prev) => ({ ...prev, [codigo]: undefined }));
      setPlanCanje((prev) => ({ ...prev, [codigo]: undefined }));
    },
    [setCart]
  );

  return (
    <div className="fixed-menu flex-center" style={{ position: "relative" }}>
      <Accordion   sx={{
        width: "100%",
        maxWidth: 500,
        bottom: 12,
        borderRadius: '25px!important',
        overflow: "hidden",

        // Media queries responsivas
        "@media (max-width:986px)": {
          borderRadius: '0px!important',
          width: '100%',
          bottom: 0
        },
      }}>
        <AccordionSummary
          expandIcon={<ArrowDropDownIcon />}
          aria-controls="panel2-content"
          id="panel2-header"
          className="accordion"
          sx={{
            backgroundColor: theme.palette.primary.main,
            color: "#fff", // opcional para texto blanco
            borderRadius: 1,
          }}
        >
          <div className="flex">
            <AddShoppingCartIcon />
            <Typography className="mar-l8">Simulador de Compra</Typography>
          </div>
          <Typography fontWeight={800}>
            Total: {formatPrice(totalPrice)}
          </Typography>
        </AccordionSummary>

        <AccordionDetails>
          <Container
            maxWidth="lg"
            className="flex-center"
            style={{ flexDirection: "column", padding: "0px 0 0px 0" }}
          >
            <ul className="w-100">
              {cart.length > 0 ? (
                cart.map((item) => (
                  <li key={item.codigo} className="w-100 flex flex-direction">
                    <div className="flex justify-between mar-t15 mar-b10">
                      {item.descripcion}
                      <FaTrashAlt
                        onClick={() => handleRemoveFromCart(item.codigo)}
                        style={{ cursor: "pointer", color: "red" }}
                      />
                    </div>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={planCanje[item.codigo] || false}
                          onChange={(e) =>
                            handlePlanCanjeChange(item.codigo, e.target.checked)
                          }
                        />
                      }
                      label="Aplicar Plan Canje"
                    />
                    <FormControl
                      variant="outlined"
                      style={{
                        marginLeft: "10px",
                        minWidth: 200,
                        maxWidth: 300,
                        width: "100%",
                      }}
                    >
                      <InputLabel>Cuotas</InputLabel>
                      <Select
                        value={
                          selectedCuota[item.codigo] ||
                          formatPrice(
                            getDiscountedPrice(
                              item.precio_negocio,
                              item.codigo,
                              planCanje,
                              includeShipping,
                              SHIPPING_COST
                            )
                          )
                        }
                        onChange={(e) =>
                          handleCuotaChange(item.codigo, e.target.value)
                        }
                        fullWidth
                        size="small"
                        label="Cuotas"
                      >
                        <MenuItem
                          value={formatPrice(
                            getDiscountedPrice(
                              item.precio_negocio,
                              item.codigo,
                              planCanje,
                              includeShipping,
                              SHIPPING_COST
                            )
                          )}
                        >
                          Precio de Negocio:{" "}
                          {formatPrice(
                            getDiscountedPrice(
                              item.precio_negocio,
                              item.codigo,
                              planCanje,
                              includeShipping,
                              SHIPPING_COST
                            )
                          )}
                        </MenuItem>
                        {[
                          "veinticuatro_sin_interes",
                          "veinte_sin_interes",
                          "dieciocho_sin_interes",
                          "doce_sin_interes",
                          "catorce_sin_interes",
                          "diez_sin_interes",
                          "nueve_sin_interes",
                          "seis_sin_interes",
                          "tres_sin_interes",
                        ].map(
                          (cuota) =>
                            item[cuota] &&
                            item[cuota] !== "NO" && (
                              <MenuItem
                                key={cuota}
                                value={getCuotaPrice(
                                  item.psvp_lista,
                                  item[cuota],
                                  item.codigo,
                                  planCanje,
                                  includeShipping,
                                  SHIPPING_COST
                                )}
                              >
                                {`${cuota.replace(/_/g, " ")} sin interés de: ${getCuotaPrice(
                                  item.psvp_lista,
                                  item[cuota],
                                  item.codigo,
                                  planCanje,
                                  includeShipping,
                                  SHIPPING_COST
                                )}`}
                              </MenuItem>
                            )
                        )}
                      </Select>
                    </FormControl>
                    <Divider style={{ marginTop: 10 }} />
                  </li>
                ))
              ) : (
                <Typography
                  variant="body1"
                  color="textSecondary"
                  style={{ marginTop: 20 }}
                >
                  No hay productos en el carrito.
                </Typography>
              )}
            </ul>

              {showShippingSwitch && (
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
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginTop: 20,
                }}
              >
                <LocalShippingIcon
                  style={{ color: "green", marginRight: 8 }}
                />
                <Typography variant="body2" style={{ color: "green" }}>
                  Nota: Si la compra no supera los 140 puntos, se agrega un
                  costo de envío de ${SHIPPING_COST}.
                </Typography>
              </div>
            <div className="flex flex-row items-center" style={{ marginTop: 20 }}>
              <Button
                variant="contained"
                fullWidth
                color="primary"
                href={createWhatsAppLink()}
                target="_blank"
                style={{
                  backgroundColor: "#25D366",
                  color: "white",
                  margin: "12px 0",
                }}
                startIcon={<FaWhatsapp />}
              >
                Compartir
              </Button>
              <Button
                fullWidth
                className="mar-l6"
                style={{ height: 38 }}
                variant="contained"
                onClick={onClearCart}
              >
                Limpiar carrito
              </Button>
            </div>
          </Container>
        </AccordionDetails>
      </Accordion>
    </div>
  );
};

export default ShoppingCart;
