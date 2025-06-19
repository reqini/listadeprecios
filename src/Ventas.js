import React, { useState, useEffect, useCallback } from "react";
import axios from "./utils/axios";
import {
  Container,
  Typography,
  Grid,
  TextField,
  Button,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Snackbar,
  Alert,
  List,
  ListItem,
  Divider,
  ListItemText,
  LinearProgress
} from "@mui/material";
import Navbar from "./components/Navbar";

const Ventas = () => {
  const [productos, setProductos] = useState([]);
  const [bancos, setBancos] = useState([]);
  const [descripcion, setDescripcion] = useState("");
  const [puntos, setPuntos] = useState("");
  const [banco, setBanco] = useState("");
  const [valorComisionable, setValorComisionable] = useState("");
  const [cuotas, setCuotas] = useState(3);
  const [ventas, setVentas] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [fecha, setFecha] = useState(new Date().toISOString().split("T")[0]);
  const [categoria, setCategoria] = useState("C");


  const fetchData = useCallback(async (endpoint, setter) => {
  try {
    const { data } = await axios.get(`/api/${endpoint}`);
    if (endpoint === "productos") {
      const filtrados = data.filter((prod) => prod.vigencia?.toLowerCase() === "si");
      setter(filtrados);
    } else if (endpoint === "ventas") {
      setter(data.ventas);
    } else {
      setter(data);
    }
  } catch (error) {
    console.error(`Error al obtener ${endpoint}:`, error);
  }
}, []);


  useEffect(() => {
    fetchData("productos", setProductos);
    fetchData("bancos", setBancos);
    fetchData("ventas", setVentas);
  }, [fetchData]);

const handleAddVenta = async () => {
  if (!fecha) {
    alert("La fecha es obligatoria");
    return;
  }

  const nuevaVenta = {
    descripcion,
    puntos,
    banco,
    valor_comisionable: valorComisionable.replace(/\./g, '').replace(/,/g, '.'),
    cuotas,
    fecha,
  };

  try {
    await axios.post("/api/ventas", nuevaVenta);
    setVentas([...ventas, nuevaVenta]);
    setDescripcion("");
    setPuntos("");
    setBanco("");
    setValorComisionable("");
    setCuotas(3);
    setFecha(""); // Resetear fecha
    setSnackbarOpen(true);
  } catch (error) {
    console.error("Error al guardar venta:", error);
  }
};
  
  const calcularGastoMonotributo = (categoria) => {
  const gastos = {
    A: 12706,
    B: 14140,
    C: 16218,
    D: 20657,
    E: 26390,
    F: 33562,
    G: 39230,
    H: 57449,
  };
  return gastos[categoria] || 0;
  };
  
  const limiteCategoria = (categoria) => {
  const limites = {
    A: 2108288.01,
    B: 3133941.63,
    C: 4387518.23,
    D: 5449094.55,
    E: 6416528.72,
    F: 8020660.90,
    G: 9624793.09,
    H: 11916410.77,
  };
  return limites[categoria] || 0;
  };

    // 🔢 Cálculo del total de comisiones
  const totalComision = ventas.reduce((acc, venta) => {
    const valor = parseFloat(
      typeof venta.valor_comisionable === "string"
        ? venta.valor_comisionable.replace(/\./g, '').replace(/,/g, '.')
        : venta.valor_comisionable
    );
    return acc + (isNaN(valor) ? 0 : valor);
  }, 0);
  
  const tope = limiteCategoria(categoria);
  const porcentajeUsado = Math.min((totalComision / tope) * 100, 100);
  const colorBarra = porcentajeUsado < 80 ? "primary" : porcentajeUsado < 100 ? "warning" : "error";


const ventasAgrupadasPorMes = ventas.reduce((acc, venta) => {
  const [year, month] = venta.fecha.split("-"); // asumiendo formato YYYY-MM-DD
  const key = `${month}-${year}`; // Ejemplo: 06-2025
  if (!acc[key]) acc[key] = [];
  acc[key].push(venta);
  return acc;
}, {});
  
    
const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("activeSession");
    window.location.href = "/login";
};

    return (
    <>
        <Navbar
            title="Ventas"
            onLogout={handleLogout}
            user={{ username: localStorage.getItem("activeSession") || "" }}
        />
        <Container maxWidth="md" sx={{ mt: 4, borderRadius: 2 }}>
            <Grid container spacing={2} sx={{ p: 3, background: 'white' }}>
              <Grid item xs={12}>
                <Typography variant="h5">
                    Cargar Nueva Venta
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                    <InputLabel>Producto</InputLabel>
                    <Select
                    value={descripcion}
                    onChange={(e) => {
                        const prod = productos.find((p) => p.descripcion === e.target.value);
                        setDescripcion(e.target.value);
                        setPuntos(prod?.puntos || "");
                        setValorComisionable((parseFloat(prod?.valor_comisionable) || 0).toLocaleString("es-AR"));
                    }}
                    label="Producto"
                    >
                    {productos.map((prod, idx) => (
                        <MenuItem key={idx} value={prod.descripcion}>
                        {prod.descripcion}
                        </MenuItem>
                    ))}
                    </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={2}>
                <TextField
                  fullWidth
                  label="Puntos"
                  value={puntos}
                  disabled
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  type="date"
                  label="Fecha"
                  InputLabelProps={{ shrink: true }}
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                    <InputLabel>Banco</InputLabel>
                    <Select
                    value={banco}
                    onChange={(e) => setBanco(e.target.value)}
                    label="Banco"
                    >
                    {bancos.map((b, idx) => {
                        const nombre = typeof b === "string" ? b : b.banco;
                        return (
                        <MenuItem key={idx} value={nombre}>
                            {nombre}
                        </MenuItem>
                        );
                    })}
                    </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  label="Valor comisionable"
                  variant="outlined"
                  fullWidth
                  value={valorComisionable}
                  onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  setValorComisionable(value ? parseFloat(value).toLocaleString("es-AR") : "");
                  }}
                  InputProps={{
                  startAdornment: <span style={{ marginRight: 4 }}>$</span>,
                  inputProps: { inputMode: "numeric", pattern: "[0-9]*" }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <FormControl fullWidth>
                  <InputLabel>Cuotas</InputLabel>
                  <Select
                    value={cuotas}
                    onChange={(e) => setCuotas(Number(e.target.value))}
                    label="Cuotas"
                  >
                  {[...Array(22)].map((_, i) => (
                      <MenuItem key={i + 3} value={i + 3}>
                      {i + 3}
                      </MenuItem>
                  ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Button size="large" fullWidth variant="contained" onClick={handleAddVenta}>
                    Guardar Venta
                </Button>
              </Grid>
              <Grid item xs={12} style={{display: 'none'}}>
                <Typography variant="body2" sx={{ mt: 3 }}>
                  Llevás usado el <strong>{porcentajeUsado.toFixed(1)}%</strong> del tope anual de tu categoría.
                </Typography>

                <LinearProgress
                  variant="determinate"
                  value={porcentajeUsado}
                  color={colorBarra}
                  sx={{ height: 10, borderRadius: 5, mt: 1 }}
                />

                <Typography variant="body2" sx={{ mt: 1 }}>
                  Te quedan ${Math.max(tope - totalComision, 0).toLocaleString("es-AR")} antes de pasarte.
                </Typography>
              </Grid>
              <Grid xs={12} style={{display: 'none'}}>
                <FormControl fullWidth sx={{ mt: 2 }}>
                  <InputLabel>Categoría Monotributo</InputLabel>
                  <Select
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value)}
                    label="Categoría Monotributo"
                  >
                    <MenuItem value="A">A (hasta $2.108.288,01 anuales)</MenuItem>
                    <MenuItem value="B">B (hasta $3.133.941,63)</MenuItem>
                    <MenuItem value="C">C (hasta $4.387.518,23)</MenuItem>
                    <MenuItem value="D">D (hasta $5.449.094,55)</MenuItem>
                    <MenuItem value="E">E (hasta $6.416.528,72)</MenuItem>
                    <MenuItem value="F">F (hasta $8.020.660,90)</MenuItem>
                    <MenuItem value="G">G (hasta $9.624.793,09)</MenuItem>
                    <MenuItem value="H">H (hasta $11.916.410,77)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid xs={12} sx={{ p: 3, background: 'white' }}>
                <Typography variant="h6" sx={{ color: "green", display: 'none' }}>
                  Total comisionable acumulado: ${totalComision.toLocaleString("es-AR")}
                </Typography>
                {/* Estimación de ganancia real según categoría */}
                <Grid item xs={12} sx={{ mt: 2, display: 'none' }}>
                  <Typography variant="body1" sx={{ mt: 1 }}>
                    Estás en categoría <strong>{categoria}</strong>. Te quedarían aprox.:
                  </Typography>

                  <Typography variant="h6" sx={{ color: "green", mt: 1 }}>
                    Ganancia neta estimada:{" "}
                    <strong>
                      ${((totalComision * 0.83) - calcularGastoMonotributo(categoria)).toLocaleString("es-AR")}
                    </strong>{" "}
                    <span style={{ fontSize: 12 }}>(estimación sin contar extras)</span>
                  </Typography>
                </Grid>
                <Divider sx={{mt: 2}}></Divider>
                <Typography variant="h6" sx={{ mt: 2 }}>
                    Ventas Cargadas
                </Typography>
                {Object.entries(ventasAgrupadasPorMes).map(([mes, ventasDelMes], idx) => (
                  <div key={idx}>
                    <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: "bold" }}>
                      Ventas del {mes}
                    </Typography>
                    <List>
                      {ventasDelMes.map((venta, index) => (
                        <ListItem key={index} divider sx={{background: '#fafafa'}}>
                          <ListItemText
                            primary={`${venta.descripcion} - ${venta.banco}`}
                            secondary={`Valor Comisionable: $${(parseFloat(venta.valor_comisionable) || 0).toLocaleString("es-AR")} | Cuotas: ${venta.cuotas} | Puntos: ${venta.puntos} | Fecha: ${venta.fecha}`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </div>
                ))}
              </Grid>
            </Grid>
          <Snackbar
              open={snackbarOpen}
              autoHideDuration={3000}
              onClose={() => setSnackbarOpen(false)}
          >
              <Alert onClose={() => setSnackbarOpen(false)} severity="success">
              Venta cargada correctamente
              </Alert>
          </Snackbar>
        </Container>
    </>
  );
};

export default Ventas;
