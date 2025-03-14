import React from "react";
import html2canvas from "html2canvas";

const CardGenerator = ({ selectedProducts = [], selectedQuota, customQuotaValue, selectedBank }) => {
  
const captureImage = () => {
  const cardElement = document.getElementById("card-container");

  setTimeout(() => { // Espera 300ms para asegurar que todas las imágenes carguen
    html2canvas(cardElement, {
      scale: 1, // Captura con más calidad
      useCORS: true, // Permite cargar imágenes externas

      logging: false, // Reduce los logs en la consola
    }).then((canvas) => {
      const imgData = canvas.toDataURL("image/jpeg", 1.0); // Exportación en JPG con calidad máxima
      const link = document.createElement("a");
      link.href = imgData;
      link.download = "placa.jpg";
      link.click();
    }).catch((error) => {
      console.error("Error al generar la imagen:", error);
    });
  }, 400); // Espera 300ms antes de capturar
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
                <h3 style={{
                  marginTop: "10px",
                  fontSize: "35px",
                  color: "blueviolet",
                  margin: 0
                }}>
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


                <div className="flex items-center"> 
                  <h2 style={{ fontSize: "16px", fontWeight: "bold", color: "#555", margin: '0 12px 0 0' }}>
                    Con Banco
                  </h2>
                  {selectedBank?.logo && (
                    <img
                      src={getImageUrl(selectedBank.logo)}
                      alt={selectedBank.banco || "Banco desconocido"}
                      style={{ width: "50px", height: "auto", marginTop: "10px" }}
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
      <button 
        onClick={captureImage} 
        style={{ marginTop: "20px", padding: "10px", fontSize: "16px", cursor: "pointer" }}
      >
        Descargar JPG
      </button>
    </div>
  );
};

export default CardGenerator;
