import React from "react";
import html2canvas from "html2canvas";
import { Button } from "@mui/material";

const CardGenerator = ({ 
  selectedProducts = [],
  selectedQuota,
  customQuotaValue,
  selectedBanks,
  titleColor,
  selectedFont,
  titleFontSize = 35,
  quotaFontSize = 35,
  backgroundColor = "#FFFFFF",
  borderRadius = 10,
  padding = 10,
  realisticMode = false,
  comboMode = false,
  comboLayout = "auto",
  comboSpacing = 15,
  comboAnimation = true,
}) => {
  
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
        backgroundColor: realisticMode ? "transparent" : backgroundColor,
      })
        .then((canvas) => {
          document.body.removeChild(clonedElement); // Eliminamos el clon después de la captura

          const imgData = canvas.toDataURL("image/png", 1.0);
          if (imgData.length < 50) {
            console.error("Error: La imagen generada está vacía");
            return;
          }

          const link = document.createElement("a");
          link.href = imgData;
          link.download = realisticMode ? "placa-realista.png" : "placa.jpg";
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

  // Función para renderizar producto único
  const renderSingleProduct = (product, quota, quotaValue, banks, color, font, titleSize, quotaSize) => {
    if (!product) return null;

    return (
      <div style={{
        position: "relative",
        width: "100%",
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        <h3
          style={{
            color: color || "blueviolet",
            fontSize: `${titleSize}px`,
            margin: "12px 0 0 0",
            fontFamily: `"${font}", sans-serif`,
            textShadow: realisticMode ? "2px 2px 4px rgba(0,0,0,0.3)" : "none",
          }}
        >
          {product.descripcion || "Sin descripción"}
        </h3>

        {product.discount && (
          <p style={{
            color: "white",
            fontSize: "20px",
            fontWeight: "normal",
            margin: 0,
            background: 'black',
            padding: '4px 12px',
            marginTop: 4,
            borderRadius: "20px",
          }}>
            {product.discount}
          </p>
        )}

        <img
          src={getImageUrl(product.imagen)}
          alt={product.descripcion || "Sin imagen"}
          style={{
            width: "100%",
            height: "auto",
            objectFit: "contain",
            borderRadius: realisticMode ? "0" : "5px",
            background: realisticMode ? "transparent" : "white",
            margin: "10px 0",
            filter: realisticMode ? "drop-shadow(0 4px 8px rgba(0,0,0,0.2))" : "none",
          }}
        />
        
        <p style={{ fontSize: "20px", fontWeight: "bold", color: "#000", margin: "5px 0" }}>
          {quota}
        </p>
        <h2 style={{ fontSize: "16px", fontWeight: "bold", color: "green", margin: 0 }}>
          Sin interés de
        </h2>
        <span 
          contentEditable="true" 
          suppressContentEditableWarning={true}
          style={{
            fontSize: `${quotaSize}px`,
            fontFamily: `"${font}", sans-serif`,
            fontWeight: "bold",
            color: "#000",
            textAlign: "center",
            border: "none",
            background: "transparent",
            outline: "none",
            width: "300px",
            textShadow: realisticMode ? "1px 1px 2px rgba(0,0,0,0.2)" : "none",
          }}
        >
          {quotaValue}
        </span>
      </div>
    );
  };

  // Función para renderizar layout de combo con IA
  const renderComboLayout = (products, quota, quotaValue, banks, color, font, titleSize, quotaSize) => {
    if (!products || products.length === 0) return null;

    const productCount = products.length;
    let layoutStyle = {};
    let imageSize = "100%";

    // Determinar layout basado en comboLayout o cantidad de productos
    if (comboLayout === "auto" || comboLayout === "auto") {
      // IA determina el mejor layout basado en cantidad de productos
      if (productCount === 1) {
        layoutStyle = { flexDirection: "column", alignItems: "center" };
        imageSize = "100%";
      } else if (productCount === 2) {
        layoutStyle = { 
          flexDirection: "row", 
          alignItems: "center", 
          justifyContent: "space-around",
          gap: `${comboSpacing}px`
        };
        imageSize = "45%";
      } else if (productCount === 3) {
        layoutStyle = { 
          flexDirection: "row", 
          alignItems: "center", 
          justifyContent: "space-around",
          flexWrap: "wrap",
          gap: `${comboSpacing}px`
        };
        imageSize = "30%";
      } else {
        layoutStyle = { 
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: `${comboSpacing}px`,
          alignItems: "center"
        };
        imageSize = "100%";
      }
    } else {
      // Layout específico seleccionado
      switch (comboLayout) {
        case "horizontal":
          layoutStyle = { 
            flexDirection: "row", 
            alignItems: "center", 
            justifyContent: "space-around",
            gap: `${comboSpacing}px`
          };
          imageSize = productCount === 2 ? "45%" : "30%";
          break;
        case "vertical":
          layoutStyle = { 
            flexDirection: "column", 
            alignItems: "center",
            gap: `${comboSpacing}px`
          };
          imageSize = "100%";
          break;
        case "grid":
          layoutStyle = { 
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: `${comboSpacing}px`,
            alignItems: "center"
          };
          imageSize = "100%";
          break;
        case "magazine":
          layoutStyle = { 
            display: "grid",
            gridTemplateColumns: productCount >= 3 ? "2fr 1fr" : "1fr 1fr",
            gap: `${comboSpacing}px`,
            alignItems: "center"
          };
          imageSize = "100%";
          break;
        default:
          layoutStyle = { flexDirection: "column", alignItems: "center" };
          imageSize = "100%";
      }
    }

    return (
      <div style={{
        width: "100%",
        display: "flex",
        ...layoutStyle,
        padding: "10px",
        transition: comboAnimation ? "all 0.3s ease" : "none"
      }}>
        {products.map((product, index) => (
          <div 
            key={index} 
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              minWidth: productCount === 1 ? "100%" : "auto",
              transition: comboAnimation ? "all 0.3s ease" : "none",
              transform: comboAnimation ? "scale(1)" : "none",
              opacity: comboAnimation ? 1 : 1
            }}
          >
            <h4
              style={{
                color: color || "blueviolet",
                fontSize: `${Math.max(titleSize - 10, 16)}px`,
                margin: "8px 0",
                fontFamily: `"${font}", sans-serif`,
                textShadow: realisticMode ? "1px 1px 2px rgba(0,0,0,0.3)" : "none",
                lineHeight: 1.2,
              }}
            >
              {product.descripcion?.substring(0, 30) + (product.descripcion?.length > 30 ? "..." : "")}
            </h4>

            <img
              src={getImageUrl(product.imagen)}
              alt={product.descripcion || "Sin imagen"}
              style={{
                width: imageSize,
                height: "auto",
                objectFit: "contain",
                borderRadius: realisticMode ? "0" : "5px",
                background: realisticMode ? "transparent" : "white",
                margin: "5px 0",
                filter: realisticMode ? "drop-shadow(0 2px 4px rgba(0,0,0,0.2))" : "none",
              }}
            />

            {index === 0 && (
              <div style={{ marginTop: "10px", textAlign: "center" }}>
                <p style={{ fontSize: "18px", fontWeight: "bold", color: "#000", margin: "5px 0" }}>
                  {quota}
                </p>
                <h3 style={{ fontSize: "14px", fontWeight: "bold", color: "green", margin: 0 }}>
                  Sin interés de
                </h3>
                <span 
                  contentEditable="true" 
                  suppressContentEditableWarning={true}
                  style={{
                    fontSize: `${Math.max(quotaSize - 10, 20)}px`,
                    fontFamily: `"${font}", sans-serif`,
                    fontWeight: "bold",
                    color: "#000",
                    textAlign: "center",
                    border: "none",
                    background: "transparent",
                    outline: "none",
                    width: "200px",
                    textShadow: realisticMode ? "1px 1px 2px rgba(0,0,0,0.2)" : "none",
                  }}
                >
                  {quotaValue}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  // Renderizar bancos
  const renderBanks = (banks) => {
    if (!Array.isArray(banks) || banks.filter(b => b?.logo).length === 0) return null;

    return (
      <div style={{ marginTop: "20px", textAlign: "center" }}>
        <h2 style={{ fontSize: "16px", fontWeight: "bold", color: "#555", marginBottom: 6 }}>
          Con Banco{banks.length > 1 ? "s" : ""}
        </h2>
        <div style={{
          display: "flex",
          gap: "8px",
          flexWrap: "wrap",
          justifyContent: "center",
          alignItems: "center"
        }}>
          {banks.filter(b => b?.logo).map((bank, idx) => (
            <img
              key={idx}
              src={getImageUrl(bank.logo)}
              alt={bank.banco || "Banco"}
              style={{ 
                width: "70px", 
                height: "auto",
                filter: realisticMode ? "drop-shadow(0 2px 4px rgba(0,0,0,0.2))" : "none",
              }}
            />
          ))}
        </div>
      </div>
    );
  };
    
  return (
    <div className="flex" style={{ flexDirection: "column", alignSelf: 'center', alignItems: 'center', justifyContent: 'center' }}>
      <div id="card-container" style={{
        width: "360px",
        height: "640px",
        background: realisticMode ? "transparent" : "#fff",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: 4,
        justifyContent: "center",
        overflow: "hidden"
      }}>
        <div style={{
          width: "100%",
          height: "100%",
          background: realisticMode ? "transparent" : backgroundColor,
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: realisticMode ? 0 : `${borderRadius}px`,
          overflow: "hidden",
          textAlign: "center",
          padding: `${padding}px`,
          border: realisticMode ? "none" : `4px solid ${titleColor || "blueviolet"}`,
          boxShadow: realisticMode ? "none" : "0 4px 20px rgba(0,0,0,0.1)",
        }}>
          {selectedProducts.length > 0 ? (
            comboMode ? (
              // Modo combo - múltiples productos con layout inteligente
              renderComboLayout(selectedProducts, selectedQuota, customQuotaValue, selectedBanks, titleColor, selectedFont, titleFontSize, quotaFontSize)
            ) : (
              // Modo single - producto único
              renderSingleProduct(selectedProducts[0], selectedQuota, customQuotaValue, selectedBanks, titleColor, selectedFont, titleFontSize, quotaFontSize)
            )
          ) : (
            <div style={{ textAlign: "center", color: "#666" }}>
              <p>No hay productos seleccionados</p>
            </div>
          )}

          {/* Renderizar bancos */}
          {renderBanks(selectedBanks)}
        </div>
      </div>
      
      <Button 
        variant="contained"
        onClick={captureImage} 
        style={{ 
          marginTop: "20px", 
          padding: "10px 20px", 
          fontSize: "16px", 
          cursor: "pointer",
          backgroundColor: realisticMode ? "#333" : "#1976d2",
          color: "white",
        }}
      >
        Descargar {realisticMode ? "PNG (Sin fondo)" : "JPG"}
      </Button>
    </div>
  );
};

export default CardGenerator;
