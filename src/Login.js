import React, { useState, useEffect } from "react";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import logo from "./assets/logo.png";
import IconButton from "@mui/material/IconButton";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import axios from "./utils/axios";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import { v4 as uuidv4 } from "uuid";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Typography from "@mui/material/Typography";

const frases = [
  { icon: "📦", text: "Accedé a productos exclusivos" },
  { icon: "📱", text: "Desde cualquier dispositivo" },
  { icon: "🧾", text: "Listas actualizadas al instante" }
];

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [deviceId, setDeviceId] = useState("");
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [slideIndex, setSlideIndex] = useState(0);

  useEffect(() => {
    const storedDeviceId = localStorage.getItem("deviceId");
    if (!storedDeviceId) {
      const newDeviceId = uuidv4();
      localStorage.setItem("deviceId", newDeviceId);
      setDeviceId(newDeviceId);
    } else {
      setDeviceId(storedDeviceId);
    }

    const query = new URLSearchParams(window.location.search);
    if (query.get("status") === "approved") setShowSnackbar(true);

    const savedUsername = localStorage.getItem("registeredUsername");
    if (savedUsername) setUsername(savedUsername);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % frases.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleClickShowPassword = () => setShowPassword(!showPassword);

  const handleChangeUsername = (e) => {
    const value = e.target.value;
    setUsername(value.replace(/\s+/g, "").toLowerCase());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setShowModal(false);
    setErrorMsg("");

    // ✅ Backend de Render funcionando - Login real

    try {
      const response = await axios.post(`/auth/login`, {
        username,
        password,
        deviceId,
      });

      if (response.data.token) {
        const subscriptionStatus = response.data.subscription_status || 'none';
        
        // Guardar datos de sesión
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("activeSession", response.data.username);
        localStorage.setItem("tipoUsuario", response.data.tipo_usuario || '');
        localStorage.setItem("subscriptionStatus", subscriptionStatus);
        localStorage.setItem("accessCode", response.data.access_code || '');
        
        // Manejar diferentes estados de suscripción
        if (subscriptionStatus === 'none') {
          // Sin suscripción - redirigir a activar
          window.location.href = "/suscripcion/activar";
          return;
        }
        
        if (subscriptionStatus === 'past_due' || subscriptionStatus === 'canceled') {
          // Suscripción vencida/cancelada - redirigir a renovar
          window.location.href = "/suscripcion/renovar";
          return;
        }
        
        if (subscriptionStatus === 'active') {
          // Suscripción activa - verificar si completó onboarding
          const onboardingCompleted = localStorage.getItem('onboardingCompleted');
          if (!onboardingCompleted) {
            window.location.href = "/onboarding";
          } else {
            window.location.href = "/home";
          }
          return;
        }
        
        // Estado desconocido - redirigir a activar por seguridad
        window.location.href = "/suscripcion/activar";
      } else {
        alert("Usuario o contraseña incorrectos");
      }
    } catch (error) {
      console.error("Error durante la autenticación:", error);
      
      // Verificar si es error de suscripción inactiva
      if (error.response?.status === 403 && error.response.data.code === 'SUBSCRIPTION_INACTIVE') {
        setErrorMsg(error.response.data.message || "Tu suscripción está vencida o inactiva. Volvé a suscribirte para acceder.");
        setShowModal(true);
        setTimeout(() => {
          window.location.href = "/suscripcion/renovar";
        }, 2000);
        return;
      }
      
      if (error.response?.status === 403 && error.response.data.showModal) {
        setErrorMsg(error.response.data.message || "Máximo de sesiones activas alcanzado.");
        setShowModal(true);
      } else if (error.response?.status === 401) {
        setErrorMsg("Usuario o contraseña incorrectos. Verifica tus credenciales.");
        setShowModal(true);
      } else if (error.code === 'NETWORK_ERROR' || !error.response) {
        setErrorMsg("Error de conexión. Verifica tu conexión a internet e intenta nuevamente.");
        setShowModal(true);
      } else {
        setErrorMsg("Error inesperado. Intenta nuevamente en unos momentos.");
        setShowModal(true);
      }
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="full-width" style={{ backgroundColor: "#FFEDC4" }}>
      <Container className="flex justify-center items-center flex-direction" maxWidth="sm" style={{ paddingTop: 80 }}>
        <img src={logo} alt="logo" height="100" className="mar-b10" />
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <Typography variant="h6">{frases[slideIndex].icon} {frases[slideIndex].text}</Typography>
        </div>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={0} className="card">
            <Grid item xs={12} style={{ margin: "10px 0" }}>
              <TextField required fullWidth id="filled-required-name" label={"Usuario"} value={username} variant="filled" onChange={handleChangeUsername} style={{ backgroundColor: "white" }} />
            </Grid>
            <Grid item xs={12} style={{ margin: "10px 0" }}>
              <TextField
                required
                fullWidth
                type={showPassword ? "text" : "password"}
                id="filled-required-code"
                label="Código de emprendedora"
                value={password}
                variant="filled"
                onChange={(e) => setPassword(e.target.value)}
                style={{ backgroundColor: "white" }}
                InputProps={{
                  endAdornment: (
                    <IconButton onClick={handleClickShowPassword} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12} style={{ margin: "10px 0" }}>
              <Button fullWidth type="submit" variant="contained" size="large" disabled={loading}>
                {loading ? "Cargando..." : "Entrar"}
              </Button>
            </Grid>
            <Grid item xs={12} style={{ margin: "10px 0", textAlign: 'center' }}>
              {/* <Typography fontSize={16} variant="body2">
                ¿No sos parte aún? <a href="/registro" style={{ color: 'black', fontWeight: 'bold' }}>Registrate</a>
              </Typography> */}
              {/* <Typography fontSize={14} variant="body2">
                o charlemos por <a href="https://wa.me/5491151347453" rel="noopener" style={{ color: 'black' }}>Whatsapp</a>
              </Typography> */}
            </Grid>
          </Grid>
        </form>
      </Container>

      <Dialog open={showModal} onClose={() => setShowModal(false)}>
        <DialogTitle>Atención</DialogTitle>
        <DialogContent>
          <Typography>{errorMsg}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowModal(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={showSnackbar}
        autoHideDuration={5000}
        onClose={() => setShowSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <MuiAlert onClose={() => setShowSnackbar(false)} severity="success" elevation={6} variant="filled">
          ¡Gracias por suscribirte! Ya podés iniciar sesión.
        </MuiAlert>
      </Snackbar>
    </div>
  );
};

export default Login;
