import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  CardActions,
  Divider,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
} from "@mui/material";
import { FaWhatsapp } from "react-icons/fa";
import { parsePrice, formatPrice } from "../utils/priceUtils";

const cuotaSimple = require("../../src/assets/cuotas-simples.webp");

const Product = ({ product, cuotaType, onAddToCart, catalog = false }) => {
  const [selectedCuota, setSelectedCuota] = useState("");

  const cuotasConInteres = ["tres_con_interes", "seis_con_interes"];
  const cuotasSinInteres = [
    "veinticuatro_sin_interes",
    "veinte_sin_interes",
    "dieciocho_sin_interes",
    "doce_sin_interes",
    "diez_sin_interes",
    "nueve_sin_interes",
    "seis_sin_interes",
    "tres_sin_interes",
  ];

  const cuotas = cuotaType === "con_interes" ? cuotasConInteres : cuotasSinInteres;

  const getCuotaPrice = (cuotaPrice) => {
    const parsedCuotaPrice = parsePrice(cuotaPrice);
    return parsedCuotaPrice > 0 ? formatPrice(parsedCuotaPrice) : formatPrice(0);
  };

  const getAdjustedCuotaLabel = (cuota) => {
    const cuotasNumero = cuota.match(/\d+/);
    if (cuotasNumero) {
      return cuota.includes("sin_interes")
        ? `${cuotasNumero[0]} cuotas sin interés`
        : `${cuotasNumero[0]} cuotas con interés`;
    }
    return cuota.replace(/_/g, " ");
  };

  const isValidCuota = (cuotaValue) => {
    return cuotaValue && parseFloat(cuotaValue.replace(/[^\d.]/g, "")) > 0;
  };

  const handleCuotaChange = (event) => {
    setSelectedCuota(event.target.value);
  };

  return (
    <Card sx={{ maxWidth: 600, paddingBottom: "12px" }} className="card-product">
      {cuotaType !== "con_interes" && product.discount && (
        <div className="descuento">{product.discount}</div>
      )}
      <CardMedia
        component="img"
        height="220"
        image={product.imagen || "../descarga.png"}
        alt="Producto"
      />
      <CardContent style={{ display: "flex", flexDirection: "column" }}>
        <Typography className="titulo" gutterBottom variant="h6" fontSize={18}>
          {product.descripcion}
        </Typography>
        <Typography variant="body2" fontSize={12} fontStyle="italic">
          Línea <b>{product.linea}</b>
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Precio de Negocio: <b>{formatPrice(parsePrice(product.precio_negocio))}</b>
        </Typography>
        <Typography variant="body2" color="text.secondary">
          PSVP lista: <b>{formatPrice(parsePrice(product.psvp_lista))}</b>
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Puntos: <b>{product.puntos}</b>
        </Typography>
        <Divider sx={{ my: 2 }} />

        {/* Mostrar cuotas */}
        {cuotas.map((cuota, idx) => {
          const cuotaValue = product[cuota];
          return isValidCuota(cuotaValue) ? (
            <div className="flex-center" key={idx}>
              {cuotaType !== "con_interes" && (
                <img src={cuotaSimple} alt="Cuota sin interés" height="15" />
              )}
              <Typography variant="body2" fontSize={13} fontStyle="italic">
                <b style={{ color: "green" }}>
                  {`${getAdjustedCuotaLabel(cuota)} de: `}
                  <i style={{ color: "black" }}>{getCuotaPrice(cuotaValue)}</i>
                </b>
              </Typography>
            </div>
          ) : null;
        })}

        {/* Combo de selección de cuotas */}
        <FormControl fullWidth sx={{ my: 2 }}>
          <InputLabel>Selecciona una cuota</InputLabel>
          <Select value={selectedCuota} onChange={handleCuotaChange} label="Selecciona una cuota">
            {cuotas.map((cuota, idx) => {
              const cuotaValue = product[cuota];
              return isValidCuota(cuotaValue) ? (
                <MenuItem key={idx} value={getCuotaPrice(cuotaValue)}>
                  {`${getAdjustedCuotaLabel(cuota)} de ${getCuotaPrice(cuotaValue)}`}
                </MenuItem>
              ) : null;
            })}
          </Select>
        </FormControl>
      </CardContent>

      <CardActions sx={{ display: "flex", flexDirection: "column" }}>
        {!catalog && (
          <Button fullWidth onClick={() => onAddToCart(product)} variant="contained" size="medium" color="primary">
            Agregar al carrito
          </Button>
        )}
       <Button
  fullWidth
  href={selectedCuota
    ? `https://api.whatsapp.com/send?text=${encodeURIComponent(
        `¡Hola! Te envío el valor de tu próxima Essen:\n
        🛒 Producto: ${product.descripcion}\n
        💳 ${getAdjustedCuotaLabel(
          cuotas.find((cuota) => getCuotaPrice(product[cuota]) === selectedCuota) || "1 cuota sin interés"
        )} de ${selectedCuota}\n
        ¡Aprovechá esta oferta!`
      )}`
    : "#"}
  target={selectedCuota ? "_blank" : ""}
  variant="contained"
  size="medium"
  color="primary"
  sx={{ my: 1, backgroundColor: "#25D366", color: "white" }}
  startIcon={<FaWhatsapp />}
  disabled={!selectedCuota}
>
  Compartir
</Button>


        {product.ficha_tecnica ? (
          <Button fullWidth target="_blank" href={product.ficha_tecnica} variant="outlined" size="medium" color="primary">
            Ficha técnica
          </Button>
        ) : (
          <Button fullWidth variant="disabled" size="medium" color="primary">
            Sin ficha técnica
          </Button>
        )}
      </CardActions>
    </Card>
  );
};

export default Product;