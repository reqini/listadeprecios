import React, { useEffect, useState, useCallback } from "react";
import axios from "./utils/axios";
import {
  Container,
  TextField,
  Snackbar,
  Alert,
  Skeleton
} from "@mui/material";
import Product from "./components/products";
import ShoppingCart from "./components/cart";
import Navbar from "./components/Navbar";
import ResponsiveDialog from "./components/dialog";
import logo from "./assets/logo.png";
import { useAuth } from "./AuthContext";

const Home = () => {
  const { logout } = useAuth();

  // =============== NUEVO: validación de sesión ===============
  const [sessionChecked, setSessionChecked] = useState(false);
  const [sessionValid, setSessionValid] = useState(false);

  // =============== Tus estados originales ===============
  const [extras, setExtras] = useState(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [loading, setLoading] = useState(true);
  const [productos, setProductos] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [username, setUsername] = useState("");
  const [timeOfDay, setTimeOfDay] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [rango, setRango] = useState("");
  const [cart, setCart] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);

  const onAddToCart = (product) => {
    setCart((prevCart) => [...prevCart, product]);
  };

  const clearCart = () => setCart([]);

  // Tu función original para determinar saludo según la hora
  const getTimeOfDay = useCallback(() => {
    const currentHour = new Date().getHours();
    if (currentHour >= 0 && currentHour < 5) return "¿Trabajando de madrugada? :)";
    if (currentHour < 12) return "Buen día";
    if (currentHour < 20) return "Buenas tardes";
    return "Buenas noches";
  }, []);

  // =============== NUEVO: Verificar sesión antes de todo ===============
  useEffect(() => {
    const token = localStorage.getItem("token");
    const deviceId = localStorage.getItem("deviceId");

    // Si no hay token, directo al login
    if (!token) {
      window.location.href = "/";
      return;
    }

    const validateSession = async () => {
      try {
        const { data } = await axios.post("/api/validate-session", { token, deviceId });
        if (data.valid) {
          setSessionValid(true);
        } else {
          // Sesión inválida
          localStorage.removeItem("token");
          localStorage.removeItem("activeSession");
          window.location.href = "/";
        }
      } catch (error) {
        console.error("Error al validar la sesión:", error.message);
        localStorage.removeItem("token");
        localStorage.removeItem("activeSession");
        window.location.href = "/";
      } finally {
        setSessionChecked(true);
      }
    };

    validateSession();
  }, []);

  // =============== Efecto para obtener datos de usuario, solo si la sesión es válida ===============
  useEffect(() => {
    if (!sessionValid) return;

    const fetchUserData = async () => {
      const storedUsername = localStorage.getItem("activeSession");
      if (!storedUsername) return;

      setUsername(storedUsername);

      try {
        const { data: usuarios } = await axios.get(`/api/usuarios`);
        const user = usuarios.find((u) => u.username === storedUsername);
        if (user) {
          setRango(user.rango);
        }
      } catch (error) {
        console.error("Error al obtener los datos del usuario:", error.message);
      }
    };

    fetchUserData();
    setTimeOfDay(getTimeOfDay());

    // Actualiza saludo cada hora
    const interval = setInterval(() => setTimeOfDay(getTimeOfDay()), 3600000);
    return () => clearInterval(interval);
  }, [sessionValid, getTimeOfDay]);

  // =============== Manejo de resize de ventana ===============
  useEffect(() => {
    if (!sessionValid) return;
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [sessionValid]);

  // =============== Función reutilizable para fetch data ===============
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

  // =============== Efecto para cargar productos y extras, solo si la sesión es válida ===============
  useEffect(() => {
    if (!sessionValid) return;
    fetchData("productos", setProductos);
    fetchData("extras", setExtras);
  }, [sessionValid, fetchData]);

  // Filtra tus productos
  const productosFiltrados = productos.filter(
    (producto) =>
      producto.descripcion.toLowerCase().includes(filtro.toLowerCase()) &&
      producto.vigencia === "SI"
  );

  // Cerrar snackbar
  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") return;
    setSnackbarOpen(false);
  };

  // Cerrar modal
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  // Renderizar banner según rango
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

    if (!extras || !extras[0]) {
      console.warn("Extras no disponibles o vacíos.");
      return null;
    }

    if (!rango || rango.trim() === "" || rangosGrupo1.includes(rango)) {
      return (
        <div className="banner card-product mar-b30">
          <img
            src={windowWidth <= 460 ? extras[0]?.banner_mobile : extras[0]?.banner}
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
              src={windowWidth <= 460 ? extras[0]?.banner_super_mobile : extras[0]?.banner_super}
              alt="Banner Grupo 2"
              style={{ width: "100%" }}
            />
          </a>
        </div>
      );
    }
    return null;
  };

  // =============== Renderizado condicional según validación de sesión ===============
  if (!sessionChecked) {
    // Esperando validación, mostramos un “cargando” (podés estilizarlo a tu gusto)
    return (
      <Container maxWidth="lg" className="conteiner-list">
        <h2>Validando sesión...</h2>
        <Skeleton sx={{ height: 50, marginTop: 2 }} animation="wave" />
      </Container>
    );
  }

  if (!sessionValid) {
    // Si la sesión no es válida, se habrá redirigido; retornamos null
    return null;
  }

  // Si llegamos hasta acá, la sesión es válida
  return (
    <>
      <Navbar
        title={
          <p>
            {timeOfDay} <b>{username || "Usuario"}</b>, Te damos la Bienvenida
          </p>
        }
        user={{ username }}
        onLogout={logout}
      />
      <Container maxWidth="lg" className="conteiner-list">
        <div className="w-100 flex justify-center">
          <img src={logo} alt="logo" height="100" className="mar-t30 mar-b20" />
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
                <Product
                  product={product}
                  cuotaType="sin_interes"
                  onAddToCart={onAddToCart}
                />
              </li>
            ))
          )}
        </ul>

        <ShoppingCart
          cart={cart}
          setCart={setCart}
          onClearCart={clearCart}
        />

        {/* Modal de promociones bancarias */}
        <ResponsiveDialog open={openDialog} onClose={handleCloseDialog} />

        <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={handleSnackbarClose}>
          <Alert onClose={handleSnackbarClose} severity="success">
            Producto agregado al carrito
          </Alert>
        </Snackbar>
      </Container>
    </>
  );
};

export default Home;
