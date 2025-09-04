import React from "react";
import html2canvas from "html2canvas";
import { Button, Box, Typography } from "@mui/material";

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
  comboTitle = "",
  comboLayers = [],
  comboTotalQuota = 0,
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
            console.error("Error: La imagen generada está vacía o corrupta");
            return;
          }

          // Crear un enlace de descarga
          const link = document.createElement("a");
          link.download = `placa-${Date.now()}.png`;
          link.href = imgData;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        })
        .catch((error) => {
          console.error("Error al generar la imagen:", error);
          document.body.removeChild(clonedElement);
        });
    }, 100);
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "";
    if (imagePath.startsWith("http")) return imagePath;
    return `/assets/products/${imagePath}`;
  };

  const renderSingleProduct = (product, quota, quotaValue, banks, color, font, titleSize, quotaSize) => {
    if (!product) return null;

    return (
      <div style={{ textAlign: "center", padding: "20px" }}>
        <h2
          style={{
            color: color || "blueviolet",
            fontSize: `${titleSize}px`,
            margin: "0 0 20px 0",
            fontFamily: `"${font}", sans-serif`,
            textShadow: realisticMode ? "1px 1px 2px rgba(0,0,0,0.3)" : "none",
            lineHeight: 1.2,
          }}
        >
          {product.descripcion}
        </h2>

        <img
          src={getImageUrl(product.imagen)}
          alt={product.descripcion || "Sin imagen"}
          style={{
            width: "100%",
            height: "auto",
            objectFit: "contain",
            borderRadius: realisticMode ? "0" : "5px",
            background: realisticMode ? "transparent" : "white",
            margin: "20px 0",
            filter: realisticMode ? "drop-shadow(0 2px 4px rgba(0,0,0,0.2))" : "none",
          }}
        />

        <div style={{ marginTop: "20px" }}>
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
              fontSize: `${quotaSize}px`,
              fontFamily: `"${font}", sans-serif`,
              fontWeight: "bold",
              color: "green",
              textAlign: "center",
              border: "none",
              background: "transparent",
              outline: "none",
              width: "200px",
              textShadow: realisticMode ? "1px 1px 2px rgba(0,0,0,0.3)" : "none",
            }}
          >
            {quotaValue}
          </span>
        </div>
      </div>
    );
  };

  const renderComboLayout = (products, quota, quotaValue, banks, color, font, titleSize, quotaSize) => {
    if (!products || products.length === 0) return null;

    return (
      <div style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "10px",
        transition: comboAnimation ? "all 0.3s ease" : "none"
      }}>
        {/* Título del combo unificado */}
        {comboTitle && (
          <Box sx={{ 
            mb: 2, 
            p: 2, 
            bgcolor: "rgba(255,255,255,0.9)", 
            borderRadius: 2,
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
          }}>
            <Typography
              variant="h4"
              sx={{
                color: color || "blueviolet",
                fontSize: `${Math.min(titleSize, 28)}px`,
                fontFamily: `"${font}", sans-serif`,
                textShadow: realisticMode ? "1px 1px 2px rgba(0,0,0,0.3)" : "none",
                lineHeight: 1.2,
                textAlign: "center",
                fontWeight: "bold",
                background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                textTransform: "uppercase",
                letterSpacing: "0.5px"
              }}
            >
              {comboTitle}
            </Typography>
          </Box>
        )}

        {/* Contenedor de imágenes compuestas */}
        <div style={{
          position: "relative",
          width: "100%",
          height: "200px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "10px 0"
        }}>
          {comboLayers.length > 0 ? (
            // Renderizar capas compuestas con posiciones IA
            comboLayers.map((layer, index) => (
              <img
                key={index}
                src={layer.src}
                alt={`Producto ${index + 1}`}
                style={{
                  position: "absolute",
                  left: `${layer.x}px`,
                  top: `${layer.y}px`,
                  width: `${layer.width}px`,
                  height: "auto",
                  objectFit: "contain",
                  zIndex: layer.z || index + 1,
                  filter: layer.shadow ? "drop-shadow(0 4px 8px rgba(0,0,0,0.3))" : "none",
                  transition: comboAnimation ? "all 0.3s ease" : "none",
                                          transform: `rotate(${layer.rotation || 0}deg) scale(${layer.scale || 1})`,
                  opacity: comboAnimation ? 1 : 1,
                  background: "transparent", // Siempre transparente para mejor acoplamiento
                  borderRadius: "0", // Sin bordes redondeados para mejor integración
                  mixBlendMode: "normal", // Mejor integración de colores
                }}
              />
            ))
          ) : (
            // Fallback: layout tradicional si no hay capas compuestas
            products.map((product, index) => (
              <div 
                key={index} 
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  margin: "0 5px",
                  transition: comboAnimation ? "all 0.3s ease" : "none",
                }}
              >
                <img
                  src={getImageUrl(product.imagen)}
                  alt={product.descripcion || "Sin imagen"}
                  style={{
                    width: products.length === 1 ? "100%" : products.length === 2 ? "45%" : "30%",
                    height: "auto",
                    objectFit: "contain",
                    borderRadius: realisticMode ? "0" : "5px",
                    background: realisticMode ? "transparent" : "white",
                    margin: "5px 0",
                    filter: realisticMode ? "drop-shadow(0 2px 4px rgba(0,0,0,0.2))" : "none",
                  }}
                />
              </div>
            ))
          )}
        </div>

        {/* Información de cuotas del combo */}
        {comboTotalQuota > 0 && (
          <Box sx={{ 
            mt: 3, 
            p: 2, 
            bgcolor: "rgba(76, 175, 80, 0.1)", 
            borderRadius: 2,
            border: "2px solid #4CAF50",
            textAlign: "center"
          }}>
            <Typography variant="h6" sx={{ fontWeight: "bold", color: "#000", mb: 1 }}>
              {quota}
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: "bold", color: "#4CAF50", mb: 1 }}>
              Total sin interés de
            </Typography>
            <Typography
              variant="h3"
              sx={{
                fontSize: `${Math.min(quotaSize, 36)}px`,
                fontFamily: `"${font}", sans-serif`,
                fontWeight: "bold",
                color: "#4CAF50",
                textShadow: realisticMode ? "1px 1px 2px rgba(0,0,0,0.3)" : "none",
                background: "linear-gradient(45deg, #4CAF50 30%, #8BC34A 90%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                textTransform: "uppercase",
                letterSpacing: "1px"
              }}
            >
              ${comboTotalQuota.toLocaleString("es-AR")}
            </Typography>
          </Box>
        )}
      </div>
    );
  };

  // Renderizar bancos
  const renderBanks = (banks) => {
    if (!Array.isArray(banks) || banks.filter(b => b?.logo).length === 0) return null;

    return (
      <div style={{ marginTop: "20px", textAlign: "center" }}>
        <div style={{ 
          display: "flex", 
          justifyContent: "center", 
          alignItems: "center", 
          flexWrap: "wrap",
          gap: "10px"
        }}>
          {banks.map((bank, index) => (
            <img
              key={index}
              src={getImageUrl(bank.logo)}
              alt={bank.nombre || "Banco"}
              style={{
                height: "30px",
                width: "auto",
                objectFit: "contain",
                filter: realisticMode ? "drop-shadow(0 1px 2px rgba(0,0,0,0.2))" : "none",
              }}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div
        id="card-container"
        style={{
          width: "360px",
          minHeight: "500px",
          background: realisticMode ? "transparent" : backgroundColor,
          borderRadius: `${borderRadius}px`,
          border: realisticMode ? "none" : "1px solid #ddd",
          boxShadow: realisticMode ? "none" : "0 4px 8px rgba(0,0,0,0.1)",
          padding: `${padding}px`,
          fontFamily: `"${selectedFont}", sans-serif`,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {selectedProducts && selectedProducts.length > 0 ? (
          comboMode ? (
            // Modo combo - múltiples productos
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
      
      <Button 
        variant="contained"
        onClick={captureImage} 
        style={{ 
          marginTop: "20px",
          backgroundColor: realisticMode ? "#4CAF50" : "#1976d2",
          color: "white",
          fontWeight: "bold",
          padding: "10px 20px",
          borderRadius: "5px",
          textTransform: "none",
          fontSize: "16px"
        }}
      >
        {realisticMode ? "Descargar PNG (Sin fondo)" : "Descargar Imagen"}
      </Button>
    </div>
  );
};

export default CardGenerator;