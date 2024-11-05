import React, { useState, useEffect } from "react";
import axios from "../utils/axios";
import {
  Button, Container, Drawer, Typography, TextField, Fab, Box, Slide, IconButton, MenuItem, Select, FormControlLabel, Checkbox
} from "@mui/material";
import html2canvas from "html2canvas";
import { Add as AddIcon, RotateRight as RotateRightIcon, ExpandLess, ExpandMore, Menu as MenuIcon, TextFields } from "@mui/icons-material";

const CanvaEditor = () => {
  // Definición de la función `getCuotasFromProduct` al inicio del archivo
  const getCuotasFromProduct = (product) => {
    const cuotas = [];
    // Recorremos las claves del objeto product y añadimos todas las que contengan "_sin_interes" y tengan un valor válido
    Object.keys(product).forEach((key) => {
      if (
        key.includes("_sin_interes") &&
        product[key] !== "" &&
        product[key] !== "$ 0" &&
        product[key] !== "0"
      ) {
        cuotas.push({ label: key.replace("_sin_interes", "").replace("_", " "), value: product[key] });
      }
    });
    return cuotas;
  };

  // Estado y funciones principales
  const [images, setImages] = useState([]);
  const [canvasElements, setCanvasElements] = useState([]);
  const [text, setText] = useState("");
  const [font, setFont] = useState("Roboto");
  const [dragging, setDragging] = useState(null);
  const [selectedElement, setSelectedElement] = useState(null);
  const [panelOpen, setPanelOpen] = useState(true);
  const [sidePanelOpen, setSidePanelOpen] = useState(false);
  const [selectedCuotas, setSelectedCuotas] = useState({});
  const [editingTextId, setEditingTextId] = useState(null);
  const [isBold, setIsBold] = useState(false);
  const [textAlign, setTextAlign] = useState("left");

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const { data } = await axios.get("/api/productos");
        console.log("Datos de productos obtenidos:", data);
        setImages(data);
      } catch (error) {
        console.error("Error fetching images:", error);
      }
    };

    fetchImages();

    const savedCanvas = localStorage.getItem("savedCanvas");
    if (savedCanvas) {
      setCanvasElements(JSON.parse(savedCanvas));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("savedCanvas", JSON.stringify(canvasElements));
  }, [canvasElements]);

  const handleDragStart = (e, data) => {
    e.dataTransfer.setData("elementData", JSON.stringify(data));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    try {
      const data = e.dataTransfer.getData("elementData");
      if (!data) {
        console.warn("No se encontraron datos en el evento drop.");
        return;
      }

      const elementData = JSON.parse(data);
      if (elementData) {
        if (elementData.type === "image") {
          const img = new Image();
          img.src = elementData.src;
          img.onload = () => {
            setCanvasElements((prevElements) => [
              ...prevElements,
              {
                ...elementData,
                x: 50,
                y: 50,
                width: img.width / 4,
                height: img.height / 4,
                id: prevElements.length,
                backgroundColor: "transparent",
              },
            ]);
          };
        } else if (elementData.type === "text") {
          setCanvasElements((prevElements) => [
            ...prevElements,
            {
              ...elementData,
              content: elementData.content || "Nuevo Texto",
              x: 100,
              y: 100,
              id: prevElements.length,
              fontSize: 24,
              rotation: 0,
              isBold: false,
              textAlign: "left",
            },
          ]);
        }
      }
    } catch (error) {
      console.error("Error al manejar el evento drop:", error);
    }
  };

  const addText = () => {
    const newText = text.trim() ? text : "Nuevo Texto";
    setCanvasElements((prevElements) => [
      ...prevElements,
      {
        type: "text",
        content: newText,
        font,
        x: 100,
        y: 100,
        fontSize: 24,
        rotation: 0,
        id: prevElements.length,
        isBold: false,
        textAlign: "left",
      },
    ]);
    setText(""); // Limpiamos el campo de texto después de agregarlo
  };

  const handleTextChange = (event) => {
    setText(event.target.value);
  };

  const handleTextEditChange = (event, index) => {
    const { value } = event.target;
    setCanvasElements((prevElements) =>
      prevElements.map((el, i) => (i === index ? { ...el, content: value } : el))
    );
  };

  const startDrag = (index) => {
    setDragging(index);
    setSelectedElement(index);
  };

  const onDrag = (e) => {
    if (dragging !== null) {
      const { offsetX, offsetY } = e.nativeEvent;
      setCanvasElements((prevElements) =>
        prevElements.map((el, i) =>
          i === dragging ? { ...el, x: offsetX, y: offsetY } : el
        )
      );
    }
  };

  const endDrag = () => {
    setDragging(null);
    setSelectedElement(null);
  };

  const changeSize = (delta) => {
    setCanvasElements((prevElements) =>
      prevElements.map((el, i) =>
        i === selectedElement
          ? {
              ...el,
              width: el.type === "image" ? el.width + delta : undefined,
              height: el.type === "image" ? el.height + delta : undefined,
              fontSize: el.type === "text" ? el.fontSize + delta : undefined,
            }
          : el
      )
    );
  };

  // Definición de la función `handleRotateHold`
  const handleRotateHold = (angle) => {
    if (selectedElement !== null) {
      let interval = setInterval(() => {
        setCanvasElements((prevElements) =>
          prevElements.map((el, i) =>
            i === selectedElement ? { ...el, rotation: (el.rotation + angle) % 360 } : el
          )
        );
      }, 100);
      const clearRotateInterval = () => clearInterval(interval);
      document.addEventListener("mouseup", clearRotateInterval);
      document.addEventListener("mouseleave", clearRotateInterval);
    }
  };

  // Definición de la función `toggleBold`
  const toggleBold = () => {
    if (selectedElement !== null) {
      setCanvasElements((prevElements) =>
        prevElements.map((el, i) =>
          i === selectedElement ? { ...el, isBold: !el.isBold } : el
        )
      );
    }
  };

  // Definición de la función `setAlignment`
  const setAlignment = (alignment) => {
    if (selectedElement !== null) {
      setCanvasElements((prevElements) =>
        prevElements.map((el, i) =>
          i === selectedElement ? { ...el, textAlign: alignment } : el
        )
      );
    }
  };

  const exportCanvas = () => {
    const canvas = document.getElementById("canvas-area");
    html2canvas(canvas, { width: 360, height: 700 }).then((canvas) => {
      const link = document.createElement("a");
      link.download = "canvas-image.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    });
  };

  const togglePanel = () => {
    setPanelOpen(!panelOpen);
  };

  const toggleSidePanel = () => {
    setSidePanelOpen(!sidePanelOpen);
  };

  const handleCuotaChange = (id, cuota) => {
    const cuotaText = `${cuota} cuotas`;
    setSelectedCuotas((prev) => ({
      ...prev,
      [id]: cuota,
    }));
    setCanvasElements((prevElements) => [
      ...prevElements,
      {
        type: "text",
        content: cuotaText,
        font,
        x: 150,
        y: 150,
        fontSize: 24,
        rotation: 0,
        id: prevElements.length,
        isBold: false,
        textAlign: "left",
      },
    ]);
  };

  return (
    <Container>
      {/* Código completo */}
      <Drawer
        variant="persistent"
        anchor="left"
        open={sidePanelOpen}
        sx={{ width: sidePanelOpen ? 240 : 0, flexShrink: 0 }}
        PaperProps={{ style: { width: 240 } }}
      >
        {/* Código para renderizar las imágenes y cuotas */}
        <Typography variant="h6" sx={{ padding: 2 }}>
          Imágenes
        </Typography>
        {images.map((product, index) => {
          const cuotas = getCuotasFromProduct(product);
          return (
            <Box key={index} sx={{ marginBottom: 2 }}>
              <img
                src={product.imagen}
                alt={`Producto ${index}`}
                draggable
                onDragStart={(e) => handleDragStart(e, { type: "image", src: product.imagen })}
                style={{ width: "100%", cursor: "pointer", marginBottom: "10px" }}
              />
              <Typography variant="body1" sx={{ marginTop: 1 }}>
                Precio: {product.precio_negocio || "No disponible"}
              </Typography>
              {cuotas.length > 0 ? (
                <Select
                  value={selectedCuotas[product.id] || ""}
                  onChange={(e) => handleCuotaChange(product.id, e.target.value)}
                  displayEmpty
                  fullWidth
                >
                  <MenuItem value="" disabled>
                    Seleccionar Cuotas
                  </MenuItem>
                  {cuotas.map((cuota, idx) => (
                    <MenuItem key={idx} value={cuota.label}>
                      {cuota.label} - {cuota.value}
                    </MenuItem>
                  ))}
                </Select>
              ) : (
                <Typography variant="body2" color="textSecondary">
                  No hay cuotas disponibles
                </Typography>
              )}
            </Box>
          );
        })}
      </Drawer>

      <IconButton onClick={toggleSidePanel} sx={{ position: "absolute", top: 20, left: sidePanelOpen ? 240 : 0 }}>
        <MenuIcon />
      </IconButton>

      {/* Canvas y el resto del componente */}
      <Box
        id="canvas-area"
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onMouseMove={onDrag}
        onMouseUp={endDrag}
        sx={{
          position: "relative",
          width: "100%",
          maxWidth: "360px",
          height: "700px",
          margin: "20px auto",
          border: "2px dashed gray",
          aspectRatio: "9 / 16",
          backgroundColor: "#f0f0f0",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {/* Renderizar canvas elements */}
        {canvasElements.map((element, index) => (
          element.type === "image" ? (
            <div
              key={element.id}
              style={{
                position: "absolute",
                top: element.y,
                left: element.x,
                width: element.width,
                height: element.height,
                cursor: "move",
                backgroundColor: element.backgroundColor,
                transform: `rotate(${element.rotation}deg)`,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
              onMouseDown={() => startDrag(index)}
              onMouseEnter={() => setSelectedElement(index)}
            >
              <img
                src={element.src}
                alt="element"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  pointerEvents: "none",
                }}
              />
              {selectedElement === index && (
                <IconButton
                  onMouseDown={() => handleRotateHold(15)}
                  sx={{
                    position: "absolute",
                    top: -10,
                    right: -10,
                    bgcolor: "rgba(255, 255, 255, 0.8)",
                    "&:hover": { bgcolor: "rgba(0, 0, 0, 0.6)", color: "white" },
                  }}
                >
                  <RotateRightIcon />
                </IconButton>
              )}
            </div>
          ) : (
            editingTextId === element.id ? (
              <TextField
                key={element.id}
                value={element.content}
                onChange={(e) => handleTextEditChange(e, index)}
                onBlur={() => setEditingTextId(null)}
                sx={{
                  position: "absolute",
                  top: element.y,
                  left: element.x,
                  fontSize: element.fontSize,
                  fontFamily: element.font,
                  cursor: "text",
                  transform: `rotate(${element.rotation}deg)`,
                  pointerEvents: "auto",
                }}
                inputProps={{ style: { fontWeight: element.isBold ? "bold" : "normal", textAlign: element.textAlign } }}
              />
            ) : (
              <Typography
                key={element.id}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  startDrag(index);
                }}
                onDoubleClick={() => setEditingTextId(element.id)}
                style={{
                  position: "absolute",
                  top: element.y,
                  left: element.x,
                  fontSize: element.fontSize,
                  fontFamily: element.font,
                  cursor: "move",
                  transform: `rotate(${element.rotation}deg)`,
                  pointerEvents: "auto",
                  fontWeight: element.isBold ? "bold" : "normal",
                  textAlign: element.textAlign,
                }}
              >
                {element.content}
              </Typography>
            )
          )
        ))}
      </Box>

      <Fab color="primary" onClick={addText} sx={{ position: "fixed", bottom: 80, right: 90 }}>
        <TextFields />
      </Fab>

      <Fab color="primary" onClick={exportCanvas} sx={{ position: "fixed", bottom: 80, right: 20 }}>
        <AddIcon />
      </Fab>

      {/* Herramientas del panel inferior */}
      <Box
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          width: "100%",
          bgcolor: "background.paper",
          boxShadow: 2,
          p: 2,
          zIndex: 10,
        }}
      >
        <Button onClick={togglePanel} startIcon={panelOpen ? <ExpandMore /> : <ExpandLess />}>
          {panelOpen ? "Ocultar Herramientas" : "Mostrar Herramientas"}
        </Button>
        <Slide direction="up" in={panelOpen} mountOnEnter unmountOnExit>
          <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 2 }}>
            <Button variant="contained" onClick={() => changeSize(10)}>Aumentar Tamaño</Button>
            <Button variant="contained" onClick={() => changeSize(-10)}>Reducir Tamaño</Button>
            <Button variant="contained" onMouseDown={() => handleRotateHold(15)}>Rotar Derecha</Button>
            <Button variant="contained" onMouseDown={() => handleRotateHold(-15)}>Rotar Izquierda</Button>
            <FormControlLabel
              control={<Checkbox checked={isBold} onChange={toggleBold} />}
              label="Negrita"
            />
            <Button variant="contained" onClick={() => setAlignment("left")}>Alinear Izquierda</Button>
            <Button variant="contained" onClick={() => setAlignment("center")}>Centrar</Button>
            <Button variant="contained" onClick={() => setAlignment("right")}>Alinear Derecha</Button>
          </Box>
        </Slide>
      </Box>
    </Container>
  );
};

export default CanvaEditor;
