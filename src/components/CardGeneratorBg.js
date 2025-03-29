import React from "react";
import html2canvas from "html2canvas";
import { Button } from "@mui/material";

const CardGeneratorBg = ({ 
  selectedProducts = [],
  selectedQuota,
  customQuotaValue,
  selectedBanks,
  titleColor,
  selectedFont,
  titleFontSize = 35,
  quotaFontSize = 35,
  backgroundImage // ✅ nueva prop
}) => {
  const captureImage = () => {
    const cardElement = document.getElementById("card-container");

    if (!cardElement) {
      console.error("Error: No se encontró el elemento #card-container");
      return;
    }

    const clonedElement = cardElement.cloneNode(true);
    clonedElement.style.position = "absolute";
    clonedElement.style.left = "-9999px";
    document.body.appendChild(clonedElement);

    setTimeout(() => {
      html2canvas(clonedElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
      })
        .then((canvas) => {
          document.body.removeChild(clonedElement);
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
    }, 500);
  };

  const getImageUrl = (imagen) => {
    if (!imagen || imagen.trim() === "") return "/placeholder.png";
    return imagen.startsWith("http") 
      ? `${imagen}?cacheBust=${Date.now()}`
      : `https://tu-dominio.com${imagen}`;
  };

  return (
    <div className="flex" style={{ flexDirection: "column", alignSelf: "center" }}>
      <div
        id="card-container"
        style={{
            width: "360px",
            height: "640px",
            backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0.05) 100%), url(${backgroundImage || 'https://i.ibb.co/BVr3YHJr/Guiso.jpg'})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            position: "relative",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden"
        }}
        >
        {selectedProducts.length > 0 ? (
          selectedProducts.map((product, index) => (
            <div key={index} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <h3 style={{
                color: titleColor,
                fontSize: `${titleFontSize}px`,
                fontFamily: `'${selectedFont}', sans-serif`,
                textAlign: 'center',
                marginBottom: 12
              }}>{product.descripcion}</h3>

              <img
                src={getImageUrl(product.imagen)}
                alt={product.descripcion}
                style={{
                  width: "100%",
                  objectFit: "contain",
                  marginTop: 8,
                  marginBottom: 8,
                  boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
                }}
              />

              <p style={{fontSize: 20, fontWeight: "bold", color: 'white', margin: '8px 0' }}>{selectedQuota}</p>
              <h4 style={{ color: "white", margin: 0 }}>Sin interés de</h4>
              <span style={{
                fontSize: `${quotaFontSize}px`,
                fontWeight: "bold",
                color: "white",
                fontFamily: `'${selectedFont}', sans-serif`
              }}>{customQuotaValue}</span>

              {Array.isArray(selectedBanks) && selectedBanks.length > 0 && (
                <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
                  {selectedBanks.map((bank, idx) => (
                    <img
                      key={idx}
                      src={getImageUrl(bank.logo)}
                      alt={bank.banco}
                      style={{ width: 70 }}
                    />
                  ))}
                </div>
              )}
            </div>
          ))
        ) : (
          <h3 style={{ fontSize: 20, color: "#777" }}>Selecciona un producto</h3>
        )}
      </div>
      <Button
        variant="contained"
        onClick={captureImage}
        style={{ marginTop: 20 }}
      >
        Descargar JPG
      </Button>
    </div>
  );
};

export default CardGeneratorBg;
