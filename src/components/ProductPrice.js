import React from "react";
import { Typography } from "@mui/material";
import { formatPrice } from "../utils/priceUtils";

const ProductPrice = ({ product }) => {
    
  const precioNegocio = product.precio_negocio
    ? formatPrice(parseFloat(product.precio_negocio.replace(/[^\d.-]/g, "")) || 0)
    : "$0";
  const psvpLista = product.psvp_lista
    ? formatPrice(parseFloat(product.psvp_lista.replace(/[^\d.-]/g, "")) || 0)
    : "$0";

  return (
    <div>
      <Typography variant="body2" color="text.secondary" style={{ marginBottom: "10px" }}>
        Precio de Negocio: <b>{precioNegocio}</b> PSVP lista: <b>{psvpLista}</b>
      </Typography>
    </div>
  );
};

export default ProductPrice;
