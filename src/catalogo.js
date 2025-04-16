import React, { useState, useEffect } from "react";
import axios from "./utils/axios";
import { Autocomplete, TextField } from "@mui/material";
import CardGenerator from "./components/CardGenerator";

const GeneradorDePlacas = () => {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedQuota, setSelectedQuota] = useState(null);
  /* const [selectedBank, setSelectedBank] = useState(null); */
  const [banks, setBanks] = useState([]);
  const cuotasMap = {
    "3 cuotas": "tres_sin_interes",
    "6 cuotas": "seis_sin_interes",
    "12 cuotas": "doce_sin_interes",
    "18 cuotas": "dieciocho_sin_interes",
    "24 cuotas": "veinticuatro_sin_interes"
  };
  const quotas = Object.keys(cuotasMap);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get("/api/productos");
        //console.log("Datos de la API:", response.data);

        const productosFiltrados = response.data?.filter(
          (producto) => producto?.linea?.toLowerCase() !== "repuestos"
        ) || [];

        const productosConImagenValida = productosFiltrados.map((producto) => ({
          ...producto,
          imagen: producto.imagen && producto.imagen.startsWith("http") ? producto.imagen : "/placeholder.png",
        }));

        setProducts(productosConImagenValida);
      } catch (error) {
        console.error("Error al obtener productos:", error);
        setProducts([]);
      }
    };

    const fetchBanks = async () => {
      try {
        const response = await axios.get("/api/bancos");
        //console.log("Datos de Bancos:", response.data);
        setBanks(response.data);
      } catch (error) {
        console.error("Error al obtener bancos:", error);
        setBanks([]);
      }
    };

    fetchProducts();
    fetchBanks();
  }, []);

  const handleSelectProduct = (event, newValue) => {
    if (!newValue) return;

    setSelectedProduct({
      id: newValue.id,
      descripcion: newValue.descripcion,
      imagen: newValue.imagen,
      precio: selectedQuota && newValue[cuotasMap[selectedQuota]] ? newValue[cuotasMap[selectedQuota]] : "Precio no disponible", // Obtener precio según la cuota
      cuotas: selectedQuota,
      banco: newValue.banco || "Sin banco asignado",
    });
  };

  const handleQuotaChange = (event, newValue) => {
    setSelectedQuota(newValue);
  };

  /* const handleBankChange = (event, newValue) => {
    setSelectedBank(newValue);
  }; */

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "20px" }}>
      {/* Selector de Productos */}
      <Autocomplete
        options={products || []}
        getOptionLabel={(option) => option?.descripcion || ""}
        onChange={handleSelectProduct}
        renderInput={(params) => <TextField {...params} label="Selecciona un Producto" variant="outlined" fullWidth />}
        style={{ width: "400px", marginBottom: "20px" }}
      />

      {/* Selector de Cuotas */}
      <Autocomplete
        options={quotas || []}
        getOptionLabel={(option) => option || ""}
        onChange={handleQuotaChange}
        renderInput={(params) => <TextField {...params} label="Selecciona Cuotas" variant="outlined" fullWidth />}
        style={{ width: "400px", marginBottom: "20px" }}
      />

      {/* Selector de Bancos */}
      <Autocomplete
        options={banks || []}
        getOptionLabel={(option) => option?.nombre || ""}
        onChange={handleBankChange}
        renderInput={(params) => <TextField {...params} label="Selecciona Banco" variant="outlined" fullWidth />}
        style={{ width: "400px", marginBottom: "20px" }}
      />

      {/* Render Card Generator con producto seleccionado */}
      <CardGenerator selectedProducts={selectedProduct ? [selectedProduct] : []} />
    </div>
  );
};

export default GeneradorDePlacas;