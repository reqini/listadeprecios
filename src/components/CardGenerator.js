import React from "react";
import html2canvas from "html2canvas";
import { Button } from "@mui/material";

const CardGenerator = ({ selectedProducts = [], selectedQuota, customQuotaValue, selectedBank, titleColor }) => {
  
const captureImage = () => {
  const cardElement = document.getElementById("card-container");

  if (!cardElement) {
    console.error("Error: No se encontró el elemento #card-container");
    return;
  }

  // Clonamos el contenido para capturarlo fuera del Dialog en mobile
  const clonedElement = cardElement.cloneNode(true);
  clonedElement.style.position = "absolute";
  clonedElement.style.left = "-9999px"; // Lo ocultamos fuera de la vista
  document.body.appendChild(clonedElement);

  setTimeout(() => {
    html2canvas(clonedElement, {
      scale: 2, // Aumenta la calidad en mobile
      useCORS: true,
      allowTaint: true,
      logging: false,
    })
      .then((canvas) => {
        document.body.removeChild(clonedElement); // Eliminamos el clon después de la captura

        const imgData = canvas.toDataURL("image/jpeg", 1.0);
        if (imgData.length < 50) {
          console.error("Error: La imagen generada está vacía");
          return;
        }

        const link = document.createElement("a");
        link.href = imgData;
        link.download = "placa.jpg";
        link.click();
      })
      .catch((error) => {
        console.error("Error al generar la imagen:", error);
      });
  }, 500); // Esperamos un poco más para asegurarnos de que todo está cargado
};

  const getImageUrl = (imagen) => {
  if (!imagen || imagen.trim() === "") return "/placeholder.png";
  return imagen.startsWith("http") 
    ? `${imagen}?cacheBust=${Date.now()}` // Fuerza la recarga de la imagen para que html2canvas la procese bien
    : `https://tu-dominio.com${imagen}`;
};

    
  return (
    <div className="flex" style={{ flexDirection: "column", alignSelf: 'center' }}>
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
          background: "#FFFFFF",
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
            selectedProducts.map((product, index) => (
              <div key={index} style={{
                position: "relative",
                width: "100%",
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}>
                <h3 style={{ color: titleColor || "blueviolet", fontSize: "35px", margin: 0 }}>
                  {product.descripcion || "Sin descripción"}
                </h3>
                <img
                  src={getImageUrl(product.imagen)}
                  alt={product.descripcion || "Sin imagen"}
                  style={{
                    width: "100%",
                    height: "auto",
                    objectFit: "contain",
                    borderRadius: "5px",
                    background: "white"
                  }}
                />
                <p style={{ fontSize: "20px", fontWeight: "bold", color: "#000", margin: "5px 0" }}>
                  {selectedQuota}
                </p>
                <h2 style={{ fontSize: "16px", fontWeight: "bold", color: "green", margin: 0 }}>
                  Sin interés de
                </h2>
                <span 
                  contentEditable="true" 
                  suppressContentEditableWarning={true}
                  style={{
                    fontSize: "35px",
                    fontWeight: "bold",
                    color: "#000",
                    textAlign: "center",
                    border: "none",
                    background: "transparent",
                    outline: "none",
                    width: "300px"
                  }}
                >
                  {customQuotaValue}
                </span>


                <div className="flex flex-direction items-center"> 
                  <h2 style={{ fontSize: "16px", fontWeight: "bold", color: "#555", margin: '12px 12px 0 0' }}>
                    Con Banco
                  </h2>
                  {selectedBank?.logo && (
                    <img
                      src={getImageUrl(selectedBank.logo)}
                      alt={selectedBank.banco || "Banco desconocido"}
                      style={{ width: "70px", height: "auto", marginTop: "10px" }}
                    />
                  )}
                </div>
              </div>
            ))
          ) : (
            <h3 style={{ fontSize: "20px", color: "#777" }}>Selecciona un producto</h3>
          )}
        </div>
      </div>
      <Button 
        variant="contained"
        onClick={captureImage} 
        style={{ marginTop: "20px", padding: "10px", fontSize: "16px", cursor: "pointer" }}
      >
        Descargar JPG
      </Button>
    </div>
  );
};

export default CardGenerator;
