import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  MenuItem,
  Dialog,
  Divider,
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
import { useNavigate, useLocation } from "react-router-dom";
import Logo from '../assets/logo512.png'
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MenuIcon from '@mui/icons-material/Menu';

const Navbar = ({ user, onLogout, title }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [password, setPassword] = useState("");
  const [edited, setEdited] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [alertState, setAlertState] = useState(null);
  const [openDialog, setOpenDialog] = useState(null);

  const theme = useTheme();
  const location = useLocation();
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
        "/api/user/update-password",
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
        <Toolbar style={{fdisplay: 'flex', justifyContent: 'space-between'}}>
          <div className="flex items-center">
              {location.pathname !== "/home" ? (
                <IconButton size="small" color="secondary" onClick={() => navigate(-1)}>
                  <ArrowBackIcon color="secondary" />
                </IconButton>
              ) : (
                <img src={Logo} alt="logo" width="48" />
              )}
          </div>
          <Typography variant="body1" fontSize={16} sx={{ flexGrow: 1, margin: '0 12px' }}>
            {title}
          </Typography>
          <IconButton color="inherit" onClick={handleMenuOpen}>
            {/* <Typography margin={'0 10px 0 0'}>Menú</Typography> */}
            <MenuIcon />
          </IconButton>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
            <MenuItem
              onClick={() => {
                navigate("/home");
                handleMenuClose();
              }}
              disabled={location.pathname === "/home"}
            >
              Home
            </MenuItem>
            <Divider />
            <MenuItem
              onClick={() => {
                // Ejemplo: abrir el modal de perfil
                setOpenDialog("profile");
                handleMenuClose();
              }}
            >
              Perfil
            </MenuItem>
            <Divider></Divider>
            {/* Nuevo acceso a /emprendedora */}
            <MenuItem
              /* style={{display: 'none'}} */
              onClick={() => {
                navigate("/emprendedoras");
                handleMenuClose();
              }}
            >
              Catálogos
            </MenuItem>
            <Divider></Divider>
            <MenuItem
              onClick={() => {
                navigate("/generarPlaca");
                handleMenuClose();
              }}
            >
              Crear Placas <i style={{color: 'green', marginLeft: 12}}>V.0.3 Beta</i>
            </MenuItem>
            <Divider></Divider>
            <MenuItem
              onClick={() => {
                navigate("/faqs");
                handleMenuClose();
              }}
            >
              Preguntas Frecuentes
            </MenuItem>
            <Divider></Divider>
            <MenuItem
              onClick={() => {
                onLogout();
                handleMenuClose();
              }}
              style={{color: 'red'}}
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
