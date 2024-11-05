/* eslint-disable */
import React, { useEffect, useState, useRef } from "react";
import axios from "./utils/axios";
import Container from "@mui/material/Container";
import TextField from "@mui/material/TextField";
import Skeleton from "@mui/material/Skeleton";
import ProductsPlacas from "./components/productsPlacas";
import logo from './assets/logo.png';
import { Button, Snackbar, Alert, FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import introJs from 'intro.js'; 
import 'intro.js/introjs.css';
import html2canvas from 'html2canvas';

const Placas = () => {
  const [loading, setLoading] = useState(true);
  const [productos, setProductos] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [productosFiltrados, setProductosFiltrados] = useState([]);
  const [isSticky, setIsSticky] = useState(false);
  const [selectedCuota, setSelectedCuota] = useState('12 cuotas sin interés');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [exporting, setExporting] = useState(false);
  const productRef = useRef(null); 
  const buttonRef = useRef(null); 

  const cuotasMap = {
    "24 cuotas sin interés": 'veinticuatro_sin_interes',
    "18 cuotas sin interés": 'dieciocho_sin_interes',
    "12 cuotas sin interés": 'doce_sin_interes',
    "9 cuotas sin interés": 'nueve_sin_interes',
    "6 cuotas sin interés": 'seis_sin_interes',
    "3 cuotas sin interés": 'tres_sin_interes'
  };

  const exportToPNG = async (ref) => {
    if (ref) {
      setExporting(true);
      if (buttonRef.current) {
        buttonRef.current.style.opacity = "0"; 
      }

      try {
        const canvas = await html2canvas(ref, { scale: 2, useCORS: true });
        const link = document.createElement("a");
        link.href = canvas.toDataURL("image/png");
        link.download = "producto.png";
        link.click();
      } catch (error) {
        console.error("Error al exportar PNG:", error);
      } finally {
        if (buttonRef.current) {
          buttonRef.current.style.opacity = "1";
        }
        setExporting(false); 
      }
    } else {
      console.warn("Referencia de producto no encontrada");
    }
  };

  useEffect(() => {
    const getData = async () => {
      const result = await axios.get(`/api/productos`);
      setLoading(false);
      setProductos(result.data);
      setProductosFiltrados(result.data);
    };

    getData();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      setIsSticky(offset > 100);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    let productosFiltrados = productos.filter((producto) =>
      producto.descripcion.toLowerCase().includes(filtro.toLowerCase()) &&
      producto.linea.toLowerCase() !== 'repuestos'
    );

    if (selectedCuota && cuotasMap[selectedCuota]) {
      const cuotaKey = cuotasMap[selectedCuota];
      productosFiltrados = productosFiltrados.filter(
        (producto) => producto[cuotaKey] && producto[cuotaKey] !== 'NO'
      );
    }

    setProductosFiltrados(productosFiltrados);
  }, [filtro, productos, selectedCuota, cuotasMap]);

  return (
    <Container maxWidth="lg" className="conteiner-list">
      <div className="w-100 flex justify-center">
        <img src={logo} alt="logo" height="100" className='mar-t30 mar-b20' />
      </div>

      <div className={`header-catalogo flex-center pad10 ${isSticky ? "sticky" : ""}`}>
        <TextField
          style={{ maxWidth: 450 }}
          fullWidth
          className="search"
          id="outlined-basic"
          label="Buscar Producto"
          variant="outlined"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
        />
      </div>

      {/* Selector de Cuotas */}
      <FormControl variant="outlined" sx={{ my: 2, minWidth: 120 }} style={{ backgroundColor: 'white' }}>
        <InputLabel>Cuotas</InputLabel>
        <Select
          value={selectedCuota}
          onChange={(e) => setSelectedCuota(e.target.value)}
          label="Cuotas"
        >
          {Object.keys(cuotasMap).map((cuota, idx) => (
            <MenuItem key={idx} value={cuota}>
              {cuota}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <ul className="lista-prod-placas w-100">
        {loading ? (
          [...Array(8)].map((_, idx) => (
            <Skeleton key={idx} sx={{ height: 300, margin: 1 }} animation="wave" variant="rectangular" />
          ))
        ) : (
          productosFiltrados.map((product) =>
            product.vigencia === "SI" ? (
              <li className="grid-item" key={product.id}>
                <div ref={el => el && (productRef.current = el)}>
                  <ProductsPlacas
                    product={product}
                    selectedCuota={selectedCuota}
                  />
                  {!exporting ? (
                    <Button
                      ref={buttonRef}
                      variant="contained"
                      onClick={() => exportToPNG(productRef.current)}
                      color="primary"
                      style={{ marginTop: 10 }}
                    >
                      Exportar a PNG
                    </Button>
                  ) : (
                    <Button variant="contained" disabled style={{ marginTop: 10 }}>
                      Exportando...
                    </Button>
                  )}
                </div>
              </li>
            ) : null
          )
        )}
      </ul>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Placas;
