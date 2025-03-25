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
import { v4 as uuidv4 } from "uuid"; // Importamos uuid para generar el deviceId

// ==== IMPORTS PARA EL MODAL (Material UI) ====
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Typography from "@mui/material/Typography";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [deviceId, setDeviceId] = useState("");

  // ==== ESTADOS PARA EL MODAL ====
  const [showModal, setShowModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    // Generar un deviceId único y guardarlo en localStorage
    const storedDeviceId = localStorage.getItem("deviceId");
    if (!storedDeviceId) {
      const newDeviceId = uuidv4();
      localStorage.setItem("deviceId", newDeviceId);
      setDeviceId(newDeviceId);
    } else {
      setDeviceId(storedDeviceId);
    }
  }, []);

  // Toggle para mostrar u ocultar la contraseña
  const handleClickShowPassword = () => setShowPassword(!showPassword);

  // Controlar el cambio del nombre de usuario
  const handleChangeUsername = (e) => {
    const value = e.target.value;
    setUsername(value.replace(/\s+/g, "").toLowerCase());
  };

  // Enviar el formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setShowModal(false);
    setErrorMsg("");

    try {
      // Hacemos una solicitud POST al backend para autenticar
      const response = await axios.post(`/api/login`, {
        username,
        password,
        deviceId, // Enviamos el deviceId
      });

      if (response.data.token) {
        // Guardar el token y el nombre de usuario en localStorage para mantener la sesión
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("activeSession", response.data.username);

        // Redirigir al home después de un login exitoso
        window.location.href = "/home";
      } else {
        // Mostrar error si el usuario o la contraseña son incorrectos
        alert("Usuario o contraseña incorrectos");
      }
    } catch (error) {
      // Si el backend responde con 403 y showModal = true, mostramos nuestro diálogo.
      if (
        error.response &&
        error.response.status === 403 &&
        error.response.data.showModal
      ) {
        setErrorMsg(
          error.response.data.message || "Máximo de sesiones activas alcanzado."
        );
        setShowModal(true);
      } else {
        console.error("Error durante la autenticación:", error.message);
        alert("Hubo un problema al iniciar sesión. Por favor, intenta de nuevo.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="full-width" style={{ backgroundColor: "#FFEDC4" }}>
      <Container
        className="flex justify-center items-center flex-direction"
        maxWidth="sm"
        style={{ paddingTop: 100 }}
      >
        <img src={logo} alt="logo" height="100" className="mar-b10" />
        <form onSubmit={handleSubmit}>
          <Grid container spacing={0} className="card">
            <Grid item xs={12} style={{ margin: "10px 0" }}>
              <TextField
                required
                fullWidth
                style={{ color: "black", backgroundColor: "white" }}
                id="filled-required-name"
                label={"Usuario"}
                value={username}
                variant="filled"
                onChange={handleChangeUsername}
              />
            </Grid>
            <Grid item xs={12} style={{ margin: "10px 0" }}>
              <TextField
                required
                fullWidth
                type={showPassword ? "text" : "password"}
                style={{ color: "black", backgroundColor: "white" }}
                id="filled-required-code"
                label="Contraseña"
                value={password}
                variant="filled"
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      edge="end"
                      style={{
                        position: "absolute",
                        right: 15,
                        top: "50%",
                        transform: "translateY(-50%)",
                      }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} style={{ margin: "10px 0" }}>
              <Button
                fullWidth
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
              >
                {loading ? "Cargando..." : "Entrar"}
              </Button>
            </Grid>
            <Grid item xs={12} style={{ margin: "10px 0", textAlign: 'center' }}>
              <Typography fontSize={18} variant="body1">¿Queres ser parte de esta gran experiencia?</Typography>
              <Typography fontSize={16} variant="body2"><a href="https://wa.me/5491123456789" rel="noopener" style={{ color: 'black'}}>Charlemos por whatsapp mi nombre es Luciano</a></Typography>
            </Grid>
          </Grid>
        </form>
      </Container>

      {/* TODO: Integrar login biométrico si fuera una app móvil (TouchID/FaceID).
          En web no es usual, pero podrías añadir algo como WebAuthn/FIDO2. */}

      {/* Modal para avisar que se superó el límite de sesiones */}
      <Dialog open={showModal} onClose={() => setShowModal(false)}>
        <DialogTitle>Atención</DialogTitle>
        <DialogContent>
          <Typography>{errorMsg}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowModal(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Login;
