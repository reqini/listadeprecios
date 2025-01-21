import React from "react";
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
import { parsePrice, formatPrice } from "../utils/priceUtils";

const cuotaSimple = require("../../src/assets/cuotas-simples.webp");

const Product = ({ product, cuotaType, onAddToCart, catalog = false }) => {
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

  const getCuotaPrice = (psvpPrice, cuotaPrice) => {
    const parsedPSVPPrice = parsePrice(psvpPrice);
    const parsedCuotaPrice = parsePrice(cuotaPrice);
    return parsedCuotaPrice > 0
      ? formatPrice(parsedPSVPPrice / (parsedPSVPPrice / parsedCuotaPrice))
      : formatPrice(0);
  };

  const getAdjustedCuotaLabel = (cuota) => {
    if (cuota === "tres_con_interes" || cuota === "tres_sin_interes") {
      return "3 cuotas en efectivo";
    }
    if (cuota === "seis_con_interes" || cuota === "seis_sin_interes") {
      return "6 en efectivo";
    }
    return cuota.replace(/_/g, " ");
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

        {cuotas.map((cuota, idx) => {
          const cuotaValue = product[cuota];
          const isValidCuota =
            cuotaValue &&
            cuotaValue !== "NO" &&
            cuotaValue !== "$0" &&
            cuotaValue !== "0" &&
            cuotaValue !== 0 &&
            !isNaN(parseFloat(cuotaValue.replace(/[^\d.]/g, "")));

          if (isValidCuota) {
            return (
              <div className="flex-center" key={idx}>
                {cuotaType !== "con_interes" && (
                  <img src={cuotaSimple} alt="sin limites" height="15" />
                )}
                <Typography variant="body2" fontSize={13} fontStyle="italic">
                  <b style={{ color: "green" }}>
                    {`${getAdjustedCuotaLabel(cuota)} de: `}
                    <i style={{ color: "black" }}>
                      {getCuotaPrice(product.psvp_lista, cuotaValue)}
                    </i>
                  </b>
                </Typography>
              </div>
            );
          }
          return null;
        })}
      </CardContent>

      <CardActions sx={{ display: "flex", flexDirection: "column" }}>
        {!catalog && (
          <Button
            fullWidth
            onClick={() => onAddToCart && onAddToCart(product)}
            variant="contained"
            size="medium"
            color="primary"
          >
            Agregar al carrito
          </Button>
        )}
        <Button
          fullWidth
          href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
            `¡Hola! Te envío el valor de tu próxima Essen:
            Producto: ${product.descripcion}
            Precio de Negocio: ${formatPrice(parsePrice(product.precio_negocio))}
            PSVP lista: ${formatPrice(parsePrice(product.psvp_lista))}
            `
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
