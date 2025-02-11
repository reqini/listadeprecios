import React, { useState } from 'react';
import { 
  AppBar, Toolbar, IconButton, Typography, Avatar, Menu, MenuItem, Dialog, 
  DialogTitle, DialogContent, DialogActions, Button, TextField, Alert, useMediaQuery, InputAdornment 
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { Link } from "react-router-dom"; // 🔹 Importamos Link para la navegación
import axios from '../utils/axios';

const Navbar = ({ user, onLogout, title }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [openProfile, setOpenProfile] = useState(false);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [password, setPassword] = useState('');
  const [edited, setEdited] = useState(false);
  const [alert, setAlert] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleProfileOpen = () => {
    setOpenProfile(true);
    handleMenuClose();
  };

  const handleProfileClose = () => {
    setOpenProfile(false);
    setEdited(false);
  };

  const handleChangePassword = (event) => {
    setPassword(event.target.value);
    setEdited(true);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSaveChanges = async () => {
    if (!password.trim()) {
      setAlert({ type: "error", message: "La contraseña no puede estar vacía" });
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
        setAlert({ type: "success", message: "Contraseña actualizada correctamente" });
        setEdited(false);
        setPassword("");
      } else {
        setAlert({ type: "error", message: response.data.message || "Error desconocido" });
      }
    } catch (error) {
      console.error("❌ Error al actualizar la contraseña:", error.message);
      setAlert({ type: "error", message: "Error al actualizar la contraseña" });
    }
  };
  
  const handleDeleteAccount = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "/api/delete-account",
        { username: user.username },
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      onLogout();
    } catch (error) {
      console.error("❌ Error al eliminar la cuenta:", error.message);
      setAlert({ type: "error", message: "Error al eliminar la cuenta" });
    }
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography
            variant="body1"
            fontSize={18}
            sx={{
              flexGrow: 1,
              "@media (max-width: 600px)": { fontSize: "12px" },
            }}
          >
            {title}
          </Typography>

          {/* 🔹 Nueva opción para la Rifa en el Navbar */}
          <Button color="inherit" component={Link} to="/rifa">
            Rifas
          </Button>

          <IconButton color="inherit" onClick={handleMenuOpen}>
            <Avatar>{user.username.charAt(0).toUpperCase()}</Avatar>
          </IconButton>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
            <MenuItem onClick={handleProfileOpen}>Perfil</MenuItem>
            <MenuItem onClick={onLogout}>Cerrar sesión</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Diálogo de perfil */}
      <Dialog open={openProfile} onClose={handleProfileClose} fullScreen={isMobile}>
        <DialogTitle>Perfil de usuario</DialogTitle>
        <DialogContent>
          {alert && <Alert severity={alert.type}>{alert.message}</Alert>}
          <TextField 
            label="Nombre de usuario" 
            fullWidth 
            value={user.username} 
            disabled 
            margin="dense" 
          />
          <TextField 
            label="Nueva contraseña" 
            fullWidth 
            value={password} 
            onChange={handleChangePassword} 
            type={showPassword ? "text" : "password"} 
            margin="dense"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={togglePasswordVisibility} edge="end">
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={handleProfileClose} color="primary">Cerrar</Button>
          <Button onClick={handleSaveChanges} color="primary" disabled={!edited}>
            Guardar cambios
          </Button>
          <Button variant="contained" onClick={() => setOpenDeleteConfirm(true)} color="error">
            Eliminar cuenta
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de confirmación de eliminación */}
      <Dialog open={openDeleteConfirm} onClose={() => setOpenDeleteConfirm(false)}>
        <DialogTitle>¿Estás seguro?</DialogTitle>
        <DialogContent>
          <Typography>Esta acción eliminará tu cuenta permanentemente.</Typography>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={() => setOpenDeleteConfirm(false)} color="primary">Cancelar</Button>
          <Button onClick={handleDeleteAccount} color="error">Eliminar</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Navbar;
