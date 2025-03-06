import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Alert,
  useMediaQuery,
  InputAdornment,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import axios from "../utils/axios";
import { useNavigate } from "react-router-dom"; // Para redirigir

const Navbar = ({ user, onLogout, title }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [password, setPassword] = useState("");
  const [edited, setEdited] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [alertState, setAlertState] = useState(null);
  const [openDialog, setOpenDialog] = useState(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate(); // Hook para la navegación

  // Menú
  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  // Cambios de contraseña
  const handleChangePassword = (e) => {
    setPassword(e.target.value);
    setEdited(true);
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const handleSaveChanges = async () => {
    if (!password.trim()) {
      setAlertState({ type: "error", message: "La contraseña no puede estar vacía" });
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "/api/update-password",
        { username: user.username, password },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setAlertState({ type: "success", message: "Contraseña actualizada correctamente" });
        setPassword("");
        setEdited(false);
      } else {
        setAlertState({ type: "error", message: response.data.message || "Error desconocido" });
      }
    } catch (error) {
      setAlertState({ type: "error", message: "Error al actualizar la contraseña" });
    }
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="body1" fontSize={16} sx={{ flexGrow: 1, margin: 0 }}>
            {title}
          </Typography>
          <IconButton color="inherit" onClick={handleMenuOpen}>
            <Typography margin={'0 10px 0 0'}>Mi Menú</Typography><Avatar>{user?.username?.charAt(0).toUpperCase() || "?"}</Avatar>
          </IconButton>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
            <MenuItem
              onClick={() => {
                // Ejemplo: abrir el modal de perfil
                setOpenDialog("profile");
                handleMenuClose();
              }}
            >
              Perfil
            </MenuItem>
            
            {/* Nuevo acceso a /emprendedora */}
            <MenuItem
              /* style={{display: 'none'}} */
              onClick={() => {
                navigate("/emprendedoras");
                handleMenuClose();
              }}
            >
              Emprendedora
            </MenuItem>
            
            <MenuItem
              onClick={() => {
                onLogout();
                handleMenuClose();
              }}
            >
              Cerrar sesión
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* MODAL PERFIL */}
      <Dialog open={openDialog === "profile"} onClose={() => setOpenDialog(null)} fullScreen={isMobile}>
        <DialogTitle>Perfil de usuario</DialogTitle>
        <DialogContent>
          {alertState && <Alert severity={alertState.type}>{alertState.message}</Alert>}
          <TextField
            label="Nombre de usuario"
            fullWidth
            disabled
            value={user?.username || ""}
            style={{ marginTop: 10 }}
          />
          <TextField
            label="Nueva contraseña"
            fullWidth
            style={{ marginTop: 10 }}
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={handleChangePassword}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={togglePasswordVisibility}>
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(null)}>Cerrar</Button>
          <Button onClick={handleSaveChanges} disabled={!edited}>
            Guardar cambios
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Navbar;
