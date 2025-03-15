import React, { useState, useEffect } from "react";
import axios from "./utils/axios";
import DialogResponsive from "./components/DialogResponsive"; // Ajusta la ruta según sea necesario
import { Autocomplete, TextField, Button, MenuItem, Select, FormControl, InputLabel, Typography } from "@mui/material";
import CardGenerator from "./components/CardGenerator";

const GeneradorDePlacas = () => {
  const [products, setProducts] = useState([]);
  const [banks, setBanks] = useState([]);
  const [selectedQuota, setSelectedQuota] = useState("3 cuotas");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedBank, setSelectedBank] = useState(null);
  const [customQuotaValue, setCustomQuotaValue] = useState("");
  const [showCard, setShowCard] = useState(false);
  const [titleColor, setTitleColor] = useState("#8A2BE2"); // Color inicial (blueviolet)

  const cuotasMap = {
    "3 cuotas": "tres_sin_interes",
    "6 cuotas": "seis_sin_interes",
    "12 cuotas": "doce_sin_interes",
    "18 cuotas": "dieciocho_sin_interes",
    "24 cuotas": "veinticuatro_sin_interes"
  };

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
      <Typography variant="h4" textAlign="center" fontSize={35} margin="24px 0">
        Generador de Placas
      </Typography>
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
        <div className="w-100" style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", padding: "20px" }}>
          <Autocomplete
            options={products || []}
            fullWidth
            getOptionLabel={(option) => option?.descripcion || ""}
            onChange={handleSelectProduct}
            renderInput={(params) => <TextField {...params} label="Selecciona un Producto" variant="outlined" fullWidth />}
            style={{ marginBottom: "20px", background: "white" }}
          />

          <FormControl fullWidth style={{ marginBottom: "20px", background: "white" }}>
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
            style={{ marginBottom: "20px", background: "white" }}
            type="text"
            placeholder="$0.00"
          />

          {/* Selector de Color */}
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
            style={{ marginBottom: "20px", background: "white" }}
          />
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
          style={{ border: "1px dashed silver", minHeight: 700, background: "#fafafa", borderRadius: 12, alignItems: 'center' }}
        >
          {!showCard && <Typography variant="body1" fontSize={20} color="primary">Espacio para vista previa</Typography>}
          <div className="desktop">
            {showCard && (
              <CardGenerator
                selectedProducts={[selectedProduct]}
                selectedQuota={selectedQuota}
                customQuotaValue={customQuotaValue}
                selectedBank={selectedBank}
                titleColor={titleColor} // Pasamos el color del título
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
        />
      </div>
    </>
  );
};

export default GeneradorDePlacas;
