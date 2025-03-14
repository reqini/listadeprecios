import React from "react";
import { Button } from "@mui/material";
import html2canvas from "html2canvas";

const CardGenerator = ({ selectedProducts = [] }) => {
  const captureImage = () => {
    const cardElement = document.getElementById("card-container");
    html2canvas(cardElement).then((canvas) => {
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = "card.png";
      link.click();
    });
  };

  return (
    <div id="card-container" style={{
      width: "360px",
      height: "640px",
      background: "#fff",
      position: "relative",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "10px",
      overflow: "hidden",
      border: "2px solid #000",
    }}>
      <div style={{
        width: "100%",
        height: "100%",
        background: "#e0e0e0",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "10px",
        overflow: "hidden",
        textAlign: "center",
        padding: "10px",
      }}>
        {selectedProducts.length > 0 ? (
          selectedProducts.map((product, index) => {
            console.log("Producto recibido:", product);
            console.log("Precio recibido:", product.precio_lista, product.precio_negocio, product.cuota_precio);

            // Determinar el precio válido a mostrar
            const precioValido =
              product.cuota_precio && !isNaN(Number(product.cuota_precio))
                ? Number(product.cuota_precio).toFixed(2)
                : product.precio_negocio && !isNaN(Number(product.precio_negocio))
                ? Number(product.precio_negocio).toFixed(2)
                : product.precio_lista && !isNaN(Number(product.precio_lista))
                ? Number(product.precio_lista).toFixed(2)
                : null;

            return (
              <div key={index} style={{ position: "relative", width: "100%" }}>
                <h3 style={{ marginTop: "10px", fontSize: "18px", color: "#333" }}>
                  {product.descripcion || "Sin descripción"}
                </h3>
                <img
                  src={product.imagen || "/placeholder.png"}
                  alt={product.descripcion || "Sin imagen"}
                  style={{
                    width: "100%",
                    height: "auto",
                    objectFit: "contain",
                    borderRadius: "5px",
                    background: "white",
                  }}
                />
                {precioValido ? (
                  <h3 style={{ fontSize: "20px", color: "#333" }}>
                    ${precioValido}
                  </h3>
                ) : (
                  <h3 style={{ fontSize: "20px", color: "#777" }}>Precio no disponible</h3>
                )}
                {product.cuotas ? (
                  <h2 style={{ fontSize: "22px", fontWeight: "bold", color: "#000" }}>
                    {product.cuotas} cuotas
                  </h2>
                ) : (
                  <h2 style={{ fontSize: "22px", fontWeight: "bold", color: "#777" }}>Sin cuotas disponibles</h2>
                )}
                {product.banco ? (
                  <h2 style={{ fontSize: "18px", fontWeight: "bold", color: "#555" }}>
                    Banco: {product.banco}
                  </h2>
                ) : (
                  <h2 style={{ fontSize: "18px", fontWeight: "bold", color: "#777" }}>Sin banco asignado</h2>
                )}
                {product.bancoImagen && (
                  <img
                    src={product.bancoImagen}
                    alt={product.banco || "Banco desconocido"}
                    style={{ width: "80px", height: "auto", marginTop: "10px" }}
                  />
                )}
              </div>
            );
          })
        ) : (
          <h3 style={{ fontSize: "20px", color: "#777" }}>Selecciona un producto</h3>
        )}
      </div>
      <Button onClick={captureImage} variant="contained" color="primary" style={{ marginTop: "20px" }}>
        Exportar Imagen
      </Button>
    </div>
  );
};

export default CardGenerator;