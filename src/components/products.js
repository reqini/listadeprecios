import React, { useState, useCallback } from "react";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  CardActions,
  Divider,
} from "@mui/material";
import { FaWhatsapp } from "react-icons/fa";
import { formatPrice, parsePrice } from "../utils/priceUtils";

const cuotaSimple = require("../../src/assets/cuotas-simples.webp");

const Product = ({ product, cuotaType = "sin_interes", onAddToCart, catalog = false }) => {
  const [selectedCuota, setSelectedCuota] = useState("");

  // Manejador de cambio en la selección de cuota
  const handleCuotaChange = useCallback((event) => setSelectedCuota(event.target.value), []);

  // Función para mapear nombres de cuotas a números
  const parseCuotaString = (cuotaString) => {
    const stringToNumberMap = {
      uno: 1,
      dos: 2,
      tres: 3,
      cuatro: 4,
      cinco: 5,
      seis: 6,
      siete: 7,
      ocho: 8,
      nueve: 9,
      diez: 10,
      once: 11,
      doce: 12,
      trece: 13,
      catorce: 14,
      quince: 15,
      dieciseis: 16,
      diecisiete: 17,
      dieciocho: 18,
      diecinueve: 19,
      veinte: 20,
      veintiuno: 21,
      veintidos: 22,
      veintitres: 23,
      veinticuatro: 24,
    };

    const match = cuotaString?.match(/^[a-z]+/i);
    return match ? stringToNumberMap[match[0].toLowerCase()] || null : null;
  };

  // Cálculo de cuotas
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

  const getCuotaValue = (cuota) => {
    const cuotaRawValue = product[cuota];
    if (!cuotaRawValue || cuotaRawValue === "NO" || cuotaRawValue === "$0") {
      return null;
    }
    return formatPrice(parsePrice(cuotaRawValue));
  };

  const getCuotaPrice = (psvpPrice, cuotaPrice) => {
    const parsedPSVPPrice = parsePrice(psvpPrice);
    const parsedCuotaPrice = parsePrice(cuotaPrice);
    return formatPrice(
      parsedCuotaPrice > 0 ? parsedPSVPPrice / (parsedPSVPPrice / parsedCuotaPrice) : 0
    );
  };

  return (
    <Card sx={{ maxWidth: 600, paddingBottom: "12px" }} className="card-product">
      {product.discount && <div className="descuento">{product.discount}</div>}
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
          const cuotaValue = getCuotaValue(cuota);
          if (cuotaValue) {
            return (
              <div className="flex-center" key={idx}>
                {cuotaType === "sin_interes" && (
                  <img src={cuotaSimple} alt="sin límites" height="15" />
                )}
                <Typography variant="body2" fontSize={13} fontStyle="italic">
                  <b style={{ color: "green" }}>
                    {`${cuota.replace(/_/g, " ")}: `}
                    <i style={{ color: "black" }}>{cuotaValue}</i>
                  </b>
                </Typography>
              </div>
            );
          }
          return null;
        })}
      </CardContent>
      <CardActions sx={{ display: "flex", flexDirection: "column" }}>
        <Button
          fullWidth
          href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
            `¡Te envío el valor de tu próxima Essen:\nProducto: ${product.descripcion}`
          )}`}
          target="_blank"
          variant="contained"
          size="medium"
          color="primary"
          sx={{ my: 1, backgroundColor: "#25D366", color: "white" }}
          startIcon={<FaWhatsapp />}
        >
          Compartir
        </Button>
        {product.ficha_tecnica ? (
          <Button
            fullWidth
            target="_blank"
            href={product.ficha_tecnica}
            variant="outlined"
            size="medium"
            color="primary"
          >
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
