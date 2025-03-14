import React, { useState, useEffect } from "react";
import axios from "./utils/axios";
import {Autocomplete, TextField, Button, MenuItem, Select, FormControl, InputLabel, Typography } from "@mui/material";

import CardGenerator from "./components/CardGenerator";

const GeneradorDePlacas = () => {
  const [products, setProducts] = useState([]);
  const [banks, setBanks] = useState([]);
  const [selectedQuota, setSelectedQuota] = useState("tres_sin_interes");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedBank, setSelectedBank] = useState(null);
  const [isProductDisabled, setIsProductDisabled] = useState(true);
  const [customQuotaValue, setCustomQuotaValue] = useState("");
  const [showCard, setShowCard] = useState(false);

  const cuotasMap = {
    "3 cuotas": "3 cuotas",
    "6 cuotas": "6 cuotas",
    "12 cuotas": "12 cuotas",
    "18 cuotas": "18 cuotas",
    "24 cuotas": "24 cuotas"
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

  const handleQuotaChange = (event) => {
    setSelectedQuota(event.target.value);
    setShowCard(false);
  };

  const handleSelectProduct = (event, newValue) => {
    if (!newValue) return;
    setSelectedProduct(newValue);
    setShowCard(false);
  };

  const handleBankChange = (event, newValue) => {
    setSelectedBank(newValue);
    setShowCard(false);
  };

  const handleApply = () => {
    if (selectedProduct) {
      setShowCard(true);
    }
  };

  return (
    <>
      <Typography variant="h4" textAlign={'center'} fontSize={35} margin={'24px 0'}>Generador de Placas</Typography>
      <div style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "flex-start",
        maxWidth: 1200,
        padding: '8px 0',
        margin: '0 auto',
      }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", padding: "20px" }}>
          <Autocomplete
            options={products || []}
            getOptionLabel={(option) => option?.descripcion || ""}
            onChange={handleSelectProduct}
            renderInput={(params) => <TextField {...params} label="Selecciona un Producto" variant="outlined" fullWidth disabled={isProductDisabled} />}
            style={{ width: "400px", marginBottom: "20px", background: 'white' }}
          />
          <FormControl fullWidth style={{ width: "400px", marginBottom: "20px", background: 'white' }}>
            <InputLabel>Selecciona Cuotas</InputLabel>
            <Select value={selectedQuota} onChange={handleQuotaChange} variant="outlined">
              {Object.entries(cuotasMap).map(([label, value]) => (
                <MenuItem key={value} value={value}>
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
            style={{ width: "400px", marginBottom: "20px", background: 'white' }}
            type="text"
            placeholder="$0.00"
          />
          <Autocomplete
            options={banks || []}
            getOptionLabel={(option) => option?.banco || ""}
            onChange={handleBankChange}
            renderInput={(params) => <TextField {...params} label="Selecciona Banco (Opcional)" variant="outlined" fullWidth />}
            style={{ width: "400px", marginBottom: "20px", background: 'white' }}
          />
          <Button variant="contained" color="primary" onClick={handleApply} disabled={!selectedProduct}>
            Generar Vista Previa
          </Button>
        </div>
        <div className="w-100 flex flex-direction items-center justify-center items-self-center" style={{ border: '1px dashed silver', minHeight: 700, background: '#fafafa', borderRadius: 12 }}>
          {!showCard && <Typography variant="body1" fontSize={20} color={'primary'}>Espacio para vista previa</Typography>}
          {showCard &&
            <CardGenerator 
              selectedProducts={[selectedProduct]} 
              selectedQuota={selectedQuota}  // Asegurándonos de pasar el valor del Select
              customQuotaValue={customQuotaValue} 
              selectedBank={selectedBank} 
            />
          }
        </div>
      </div>
    </>
  );
};

export default GeneradorDePlacas;
