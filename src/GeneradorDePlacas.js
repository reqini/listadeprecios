import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "./utils/axios";
import DialogResponsive from "./components/DialogResponsive"; // Ajusta la ruta según sea necesario
import { Autocomplete, TextField, Button, MenuItem, Select, FormControl, InputLabel, Typography } from "@mui/material";
import CardGenerator from "./components/CardGenerator";
import WebFont from "webfontloader";
import Navbar from "./components/Navbar";


const GeneradorDePlacas = () => {
  const [products, setProducts] = useState([]);
  const [banks, setBanks] = useState([]);
  const [selectedQuota, setSelectedQuota] = useState("3 cuotas");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedBank, setSelectedBank] = useState(null);
  const [customQuotaValue, setCustomQuotaValue] = useState("");
  const [showCard, setShowCard] = useState(false);
  const [titleColor, setTitleColor] = useState("#8A2BE2"); // Color inicial (blueviolet)
  const [selectedFont, setSelectedFont] = useState("Roboto");
  const [titleFontSize, setTitleFontSize] = useState(35);
  const [quotaFontSize, setQuotaFontSize] = useState(35);


  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("activeSession");
    navigate("/login");
  };
  
  const cuotasMap = {
    "3 cuotas": "tres_sin_interes",
    "6 cuotas": "seis_sin_interes",
    "12 cuotas": "doce_sin_interes",
    "18 cuotas": "dieciocho_sin_interes",
    "24 cuotas": "veinticuatro_sin_interes"
  };

  useEffect(() => {
  WebFont.load({
    google: {
      families: [
        "Roboto",
        "Montserrat",
        "Lato",
        "Poppins",
        "Playfair Display",
        "Oswald",
        "Raleway",
        "Lobster",
      ],
    },
  });
}, []);


  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get("/api/productos");
        const filteredProducts = response.data.filter(product => product.vigencia === "SI");
        setProducts(filteredProducts || []);
      } catch (error) {
        console.error("Error al obtener productos:", error);
        setProducts([]);
      }
    };

    const fetchBanks = async () => {
      try {
        const response = await axios.get("/api/bancos");
        setBanks(response.data || []);
      } catch (error) {
        console.error("Error al obtener bancos:", error);
        setBanks([]);
      }
    };

    fetchProducts();
    fetchBanks();
  }, []);

  const formatPrice = (value) => {
    if (!value) return "$0";
    let numericValue = parseFloat(value.toString().replace(/[^0-9.-]/g, ""));
    return `$${numericValue.toLocaleString("es-AR")}`; // Formatea con puntos de miles
  };

  const getQuotaValue = (product, quota) => {
    if (!product || !quota) return "";

    const cuotaKey = cuotasMap[quota];
    if (cuotaKey && product[cuotaKey] && product[cuotaKey] !== "NO") {
      try {
        return formatPrice(product[cuotaKey]); // Aplica el formato
      } catch {
        return "";
      }
    }
    return "";
  };

  const handleQuotaChange = (event) => {
    const newQuota = event.target.value;
    setSelectedQuota(newQuota);
    setCustomQuotaValue(getQuotaValue(selectedProduct, newQuota));
    setShowCard(false);
  };

  const handleSelectProduct = (event, newValue) => {
    setSelectedProduct(newValue);
    setCustomQuotaValue(getQuotaValue(newValue, selectedQuota));
    setShowCard(false);
  };

  const handleBankChange = (event, newValue) => {
    setSelectedBank(newValue);
    setShowCard(false);
  };

  const handleColorChange = (event) => {
    setTitleColor(event.target.value);
  };

  const handleApply = () => {
    if (selectedProduct) {
      setShowCard(true);
    }
  };

  return (
    <>
      <Navbar
        title="Generador de Placas"
        onLogout={handleLogout}
        user={{ username: localStorage.getItem("activeSession") || "" }}
      />
      {/* <div className="flex flex-direction items-center justify-center">
        <Typography variant="body" textAlign="center" fontSize={25} margin="8px 0">
        Generador de Placas
        </Typography>
        <Button size="medium" variant="contained" color="secondary" onClick={() => navigate("/home")} style={{maxWidth: 240}}>
          Volver a Home
        </Button>
      </div> */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "flex-start",
          maxWidth: 1200,
          padding: "8px 0",
          margin: "0 auto",
        }}
      >
        <div className="w-100" style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", padding: "12px" }}>
          <Autocomplete
            options={products || []}
            fullWidth
            getOptionLabel={(option) => option?.descripcion || ""}
            onChange={handleSelectProduct}
            renderInput={(params) => <TextField {...params} label="Selecciona un Producto" variant="outlined" fullWidth />}
            style={{ marginBottom: "12px", background: "white" }}
          />
          {/* Tamaño del título con slider intuitivo */}
          <div style={{ marginBottom: "12px", width: "100%" }}>
            <Typography gutterBottom>Tamaño del Título</Typography>
            <input
              type="range"
              min={12}
              max={60}
              step={1}
              value={titleFontSize}
              onChange={(e) => setTitleFontSize(Number(e.target.value))}
              style={{ width: "100%" }}
            />
            <Typography variant="caption" display="block">
              {titleFontSize}px — {
                titleFontSize <= 16 ? "Muy chico" :
                titleFontSize <= 24 ? "Chico" :
                titleFontSize <= 32 ? "Mediano" :
                titleFontSize <= 45 ? "Grande" : "Muy grande"
              }
            </Typography>
          </div>

          <FormControl fullWidth style={{ marginBottom: "12px", background: "white" }}>
            <InputLabel>Selecciona Cuotas</InputLabel>
            <Select value={selectedQuota} onChange={handleQuotaChange} variant="outlined">
              {Object.keys(cuotasMap).map((label) => (
                <MenuItem key={label} value={label}>
                  {label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Valor de la cuota"
            variant="outlined"
            fullWidth
            value={customQuotaValue}
            onChange={(event) => setCustomQuotaValue(event.target.value)}
            style={{ marginBottom: "12px", background: "white" }}
            type="text"
            placeholder="$0.00"
          />
          {/* Tamaño de la cuota con slider intuitivo */}
          <div style={{ marginBottom: "20px", width: "100%" }}>
            <Typography gutterBottom>Tamaño de la Cuota</Typography>
            <input
              type="range"
              min={12}
              max={60}
              step={1}
              value={quotaFontSize}
              onChange={(e) => setQuotaFontSize(Number(e.target.value))}
              style={{ width: "100%" }}
            />
            <Typography variant="caption" display="block">
              {quotaFontSize}px — {
                quotaFontSize <= 16 ? "Muy chico" :
                quotaFontSize <= 24 ? "Chico" :
                quotaFontSize <= 32 ? "Mediano" :
                quotaFontSize <= 45 ? "Grande" : "Muy grande"
              }
            </Typography>
          </div>

          {/* Selector de Color */}
          <div className="flex w-100">
            <TextField
              label="Color del título"
              variant="outlined"
              fullWidth
              InputProps={{
                inputProps: {
                  type: "color"
                }
              }}
              value={titleColor}
              onChange={handleColorChange}
              style={{ marginBottom: "12px", background: "white" }}
            />
            <div style={{
                width: 50,
                height: 55,
                borderRadius: 6,
                marginLeft: 12,
                border: "1px solid #ccc",
                backgroundColor: titleColor
              }}
            />
          </div>
          <FormControl fullWidth style={{ marginBottom: "12px", background: "white" }}>
            <InputLabel>Tipografía del título</InputLabel>
              <Select
                value={selectedFont}
                onChange={(e) => setSelectedFont(e.target.value)}
                variant="outlined"
              >
                {["Roboto", "Montserrat", "Lato", "Poppins", "Playfair Display", "Oswald", "Raleway", "Lobster"].map((font) => (
                  <MenuItem key={font} value={font} style={{ fontFamily: font }}>
                    {font}
                  </MenuItem>
                ))}
              </Select>
          </FormControl>

          <Autocomplete
            options={banks || []}
            fullWidth
            getOptionLabel={(option) => option?.banco || ""}
            onChange={handleBankChange}
            renderInput={(params) => <TextField {...params} label="Selecciona Banco (Opcional)" variant="outlined" fullWidth />}
            style={{ marginBottom: "20px", background: "white" }}
          />

          <Button fullWidth variant="contained" color="primary" onClick={handleApply} disabled={!selectedProduct}>
            Generar Vista Previa
          </Button>
        </div>

        <div
          className="w-100 desktop-fflex flex-direction items-center justify-center"
          style={{ border: "1px dashed silver", minHeight: 700, background: "#fafafa", borderRadius: 12, alignItems: 'center', marginTop: 20 }}
        >
          {!showCard && <Typography variant="body1" fontSize={20} color="primary">Espacio para vista previa</Typography>}
          <div className="desktop">
            {showCard && (
              <CardGenerator
                selectedProducts={[selectedProduct]}
                selectedQuota={selectedQuota}
                customQuotaValue={customQuotaValue}
                selectedBank={selectedBank}
                titleColor={titleColor}
                selectedFont={selectedFont}
                titleFontSize={titleFontSize}
                quotaFontSize={quotaFontSize}
              />
            )}
          </div>
        </div>
      </div>
      <div className="w-100 mobile">
        <DialogResponsive
          selectedProduct={selectedProduct}
          selectedQuota={selectedQuota}
          customQuotaValue={customQuotaValue}
          selectedBank={selectedBank}
          titleColor={titleColor}
          selectedFont={selectedFont}           // ✅ falta
          titleFontSize={titleFontSize}         // ✅ falta
          quotaFontSize={quotaFontSize}         // ✅ falta
        />
      </div>
    </>
  );
};

export default GeneradorDePlacas;
