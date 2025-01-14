import React, { useEffect, useState, useCallback } from "react";
import axios from "./utils/axios";
import {
  Button,
  Container,
  TextField,
  Snackbar,
  Alert,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  Skeleton,
} from "@mui/material";
import { Logout as LogoutIcon } from "@mui/icons-material";
import Product from "./components/products";
import logo from "./assets/logo.png";
import { useAuth } from "./AuthContext";

const Home = () => {
  const { logout } = useAuth();
  const [extras, setExtras] = useState(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [loading, setLoading] = useState(true);
  const [productos, setProductos] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [username, setUsername] = useState("");
  const [timeOfDay, setTimeOfDay] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [cuotaType, setCuotaType] = useState("sin_interes");
  const [rango, setRango] = useState(""); // Estado para rango del usuario

  // Obtener el momento del día para el saludo
  const getTimeOfDay = useCallback(() => {
    const currentHour = new Date().getHours();
    if (currentHour >= 0 && currentHour < 5) return "¿Trabajando de madrugada? :)";
    if (currentHour < 12) return "Buen día";
    if (currentHour < 20) return "Buenas tardes";
    return "Buenas noches";
  }, []);

  // Cargar username y rango desde el backend
  useEffect(() => {
    const fetchUserData = async () => {
      const storedUsername = localStorage.getItem("activeSession");
      if (!storedUsername) return;

      setUsername(storedUsername);

      try {
        const { data: usuarios } = await axios.get(`/api/usuarios`);
        const user = usuarios.find((user) => user.username === storedUsername);
        if (user) {
          setRango(user.rango); // Asignar rango desde el Google Sheet
        }
      } catch (error) {
        console.error("Error al obtener los datos del usuario:", error.message);
      }
    };

    fetchUserData();
    setTimeOfDay(getTimeOfDay());
    const interval = setInterval(() => setTimeOfDay(getTimeOfDay()), 3600000);

    return () => clearInterval(interval);
  }, [getTimeOfDay]);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchData = useCallback(async (endpoint, setState) => {
    try {
      const { data } = await axios.get(`/api/${endpoint}`);
      setState(data);
      setTimeout(() => {
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error(`Error al obtener ${endpoint}:`, error);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData("productos", setProductos);
    fetchData("extras", setExtras);
  }, [fetchData]);

  const productosFiltrados = productos.filter(
    (producto) =>
      producto.descripcion.toLowerCase().includes(filtro.toLowerCase()) &&
      producto.vigencia === "SI"
  );

  const handleCuotaTypeChange = (event, newType) => {
    if (newType !== null) {
      setCuotaType(newType);
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") return;
    setSnackbarOpen(false);
  };

// Función para verificar el rango y mostrar el banner correspondiente
const getBannerForRango = () => {
  const rangosGrupo1 = [
    "Demostrador/a",
    "Demostrador/a plata",
    "Demostrador/a oro",
    "Coordinador/a",
    "Coordinador/a diamante",
  ];
  const rangosGrupo2 = [
    "Ejecutivo/a",
    "Ejecutivo/a senior",
    "Ejecutivo/a máster",
    "Ejecutivo/a premium",
    "Empresario/a",
    "Empresario/a VIP",
  ];

  // Verificar si extras y extras[0] existen
  if (!extras || !extras[0]) {
    console.warn("Extras no disponibles o vacíos.");
    return null;
  }

  if (!rango || rango.trim() === "" || rangosGrupo1.includes(rango)) {
    // Tratar a los usuarios sin rango como parte de rangosGrupo1
    return (
      <div className="banner card-product mar-b30">
        <img
          src={
            windowWidth <= 460
              ? extras[0]?.banner_mobile
              : extras[0]?.banner
          }
          alt="Banner Grupo 1"
          style={{ width: "100%" }}
        />
      </div>
    );
  } else if (rangosGrupo2.includes(rango)) {
    return (
      <div className="banner card-product mar-b30">
        <a
          href="https://www.mercadopago.com.ar/subscriptions/checkout?preapproval_plan_id=2c93808493147926019315fc5d760034"
          target="_blank"
          rel="noreferrer"
        >
          <img
            src={
              windowWidth <= 460
                ? extras[0]?.banner_super_mobile
                : extras[0]?.banner_super
            }
            alt="Banner Grupo 2"
            style={{ width: "100%" }}
          />
        </a>
      </div>
    );
  }
  return null;
};


  return (
    <Container maxWidth="lg" className="conteiner-list">
      <div
        className="flex-between-mobile"
        style={{
          paddingTop: 30,
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "10px",
        }}
      >
        <Typography variant="body1" color="primary" fontSize={18}>
          {timeOfDay} <b>{username || "Usuario"}</b>, Te damos la Bienvenida
        </Typography>
        <Button
          variant="contained"
          onClick={logout}
          color="error"
          style={{ width: "100%", maxWidth: 200 }}
          startIcon={<LogoutIcon />}
        >
          Cerrar Sesión
        </Button>
      </div>

      <div className="w-100 flex justify-center">
        <img src={logo} alt="logo" height="150" className="mar-t30 mar-b20" />
      </div>

      <div className="header mar-b30 flex-center pad20">
        <TextField
          style={{ maxWidth: 450 }}
          fullWidth
          className="search"
          label="Buscar Producto"
          variant="outlined"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
        />
      </div>

      <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
        <ToggleButtonGroup
          value={cuotaType}
          exclusive
          onChange={handleCuotaTypeChange}
          aria-label="Tipo de cuotas"
        >
          <ToggleButton
            value="sin_interes"
            aria-label="Cuotas sin interés"
            style={{
              backgroundColor: cuotaType === "sin_interes" ? "#A47A9E" : "#fff",
              color: cuotaType === "sin_interes" ? "#fff" : "#673ab7",
              border: "1px solid #A47A9E",
              borderRadius: "20px 0 0 20px",
            }}
          >
            Cuotas sin interés
          </ToggleButton>
          <ToggleButton
            value="con_interes"
            aria-label="Cuotas con interés"
            style={{
              backgroundColor: cuotaType === "con_interes" ? "#A47A9E" : "#fff",
              color: cuotaType === "con_interes" ? "#fff" : "#673ab7",
              border: "1px solid #A47A9E",
              borderRadius: "0 20px 20px 0",
            }}
          >
            Cuotas con interés
          </ToggleButton>
        </ToggleButtonGroup>
      </div>

      {getBannerForRango()}

      <ul className="lista-prod w-100">
        {loading ? (
          [...Array(6)].map((_, index) => (
            <Skeleton
              key={index}
              sx={{ height: 300, margin: 1 }}
              animation="wave"
              variant="rectangular"
              className="grid-item"
            />
          ))
        ) : (
          productosFiltrados.map((product) => (
            <li className="grid-item" key={product.id}>
              <Product product={product} cuotaType={cuotaType} />
            </li>
          ))
        )}
      </ul>

      {productosFiltrados.length === 0 && !loading && (
        <Typography variant="body1" color="textSecondary">
          No se encontraron productos.
        </Typography>
      )}

      <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: "100%" }}>
          Producto agregado al carrito
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Home;
