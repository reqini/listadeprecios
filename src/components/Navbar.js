import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  MenuItem,
  Box,
  // Dialog, // Temporalmente oculto - modal reemplazado por pantalla dedicada
  Divider,
  // DialogTitle, // Temporalmente oculto
  // DialogContent, // Temporalmente oculto
  // DialogActions, // Temporalmente oculto
  // Button, // Temporalmente oculto
  // TextField, // Temporalmente oculto
  // Alert, // Temporalmente oculto
  // useMediaQuery, // Temporalmente oculto
  // InputAdornment, // Temporalmente oculto
  Badge
} from "@mui/material";
// import { useTheme } from "@mui/material/styles"; // Temporalmente oculto
// import { Visibility, VisibilityOff } from "@mui/icons-material"; // Temporalmente oculto
// import axios from "../utils/axios"; // Temporalmente oculto
import { useNavigate, useLocation } from "react-router-dom";
import { isCatalogRoute } from "../utils/isCatalogRoute";
import Logo from '../assets/logo512.png'
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MenuIcon from '@mui/icons-material/Menu';
import ModernSearchBar from "./ModernSearchBar";
import { IS_CHRISTMAS_MODE } from "../config/christmasConfig";
import { Alert } from "@mui/material";

const Navbar = ({ user, onLogout, title, searchValue, onSearchChange, showSearch = false }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  // Estados del modal de perfil - temporalmente ocultos
  // const [password, setPassword] = useState("");
  // const [edited, setEdited] = useState(false);
  // const [showPassword, setShowPassword] = useState(false);
  // const [alertState, setAlertState] = useState(null);
  // const [openDialog, setOpenDialog] = useState(null);

  // const theme = useTheme(); // Temporalmente oculto
  const location = useLocation();
  const isCatalog = isCatalogRoute(location.pathname);
  // const isMobile = useMediaQuery(theme.breakpoints.down("sm")); // Temporalmente oculto
  const navigate = useNavigate(); // Hook para la navegación

  // Detectar scroll solo si NO es catálogo
  useEffect(() => {
    if (isCatalog) {
      setIsScrolled(false); // En catálogos siempre relative
      return;
    }

    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      setIsScrolled(scrollTop > 100); // Cambiar a fixed después de 100px de scroll
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Verificar estado inicial

    return () => window.removeEventListener('scroll', handleScroll);
  }, [isCatalog]);

  // Menú
  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  // Cambios de contraseña
  // const handleChangePassword = (e) => {
  //   setPassword(e.target.value);
  //   setEdited(true);
  // };

  // const togglePasswordVisibility = () => setShowPassword(!showPassword);

  // const handleSaveChanges = async () => {
  //   if (!password.trim()) {
  //     setAlertState({ type: "error", message: "La contraseña no puede estar vacía" });
  //     return;
  //   }
  //   try {
  //     const token = localStorage.getItem("token");
  //     const response = await axios.post(
  //       "/api/user/update-password",
  //       { username: user.username, password },
  //       { headers: { Authorization: `Bearer ${token}` } }
  //     );

  //     if (response.data.success) {
  //       setAlertState({ type: "success", message: "Contraseña actualizada correctamente" });
  //       setPassword("");
  //       setEdited(false);
  //     } else {
  //       setAlertState({ type: "error", message: response.data.message || "Error desconocido" });
  //     }
  //   } catch (error) {
  //     setAlertState({ type: "error", message: "Error al actualizar la contraseña" });
  //   }
  // };

  // Determinar posición según si es catálogo o no
  const appBarPosition = isCatalog ? 'relative' : (isScrolled ? 'fixed' : 'relative');
  const appBarZIndex = isCatalog ? 1 : (isScrolled ? 1000 : 1);
  const appBarBoxShadow = isCatalog || !isScrolled ? 'none' : '0 2px 8px rgba(0,0,0,0.1)';

  return (
    <>
      {/* Banner Navideño Superior */}
      {IS_CHRISTMAS_MODE && (
        <Alert
          severity="info"
          icon={false}
          sx={{
            backgroundColor: '#C62828',
            color: '#FFFFFF',
            textAlign: 'center',
            py: 0.5,
            fontSize: { xs: '0.75rem', sm: '0.875rem' },
            fontWeight: 600,
            borderRadius: 0,
            '& .MuiAlert-message': {
              width: '100%',
            },
          }}
        >
          🎄 Especial Navidad: promociones y cuotas
        </Alert>
      )}

      {/* Spacer solo cuando está fixed (no catálogo y scrolled) */}
      {!isCatalog && isScrolled && (
        <Box sx={{ height: { xs: '70px', sm: '64px' } }} />
      )}
      
      <AppBar 
        position={appBarPosition} 
        sx={{ 
          zIndex: appBarZIndex,
          boxShadow: appBarBoxShadow,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          minHeight: { xs: '70px', sm: '64px' },
          height: { xs: 'auto', sm: '64px' },
        }}
      >
        <Toolbar 
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            flexDirection: { xs: showSearch ? 'column' : 'row', sm: 'row' },
            paddingY: { xs: showSearch ? 1.5 : 1, sm: 0 },
            paddingX: { xs: 1, sm: 2 },
            gap: { xs: showSearch ? 1 : 0, sm: 0 },
            flexWrap: 'nowrap',
            minHeight: { xs: '70px !important', sm: '64px !important' },
            height: { xs: 'auto', sm: '64px' },
            overflow: 'visible',
          }}
        >
          {/* Logo/título - Lado izquierdo */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: { xs: 'center', sm: 'flex-start' },
            order: { xs: 1, sm: 1 },
            flex: { xs: showSearch ? '0 0 auto' : '1 1 auto', sm: '0 0 auto' },
            width: { xs: showSearch ? 'auto' : '100%', sm: 'auto' },
            position: 'relative',
          }}>
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                width: { xs: '48px', sm: '48px' },
                height: { xs: '48px', sm: '48px' },
              }}
            >
              {location.pathname !== "/home" ? (
                <IconButton 
                  size="small" 
                  color="secondary" 
                  onClick={() => navigate(-1)}
                  sx={{
                    padding: { xs: 1, sm: 0.5 },
                  }}
                >
                  <ArrowBackIcon color="secondary" />
                </IconButton>
              ) : (
                <>
                  <img 
                    src={Logo} 
                    alt="logo" 
                    style={{ 
                      width: '48px', 
                      height: '48px',
                      objectFit: 'contain',
                    }} 
                  />
                  {/* Gorrito navideño sobre el logo - Centrado perfecto */}
                  {IS_CHRISTMAS_MODE && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: { xs: -6, sm: -8 },
                        left: '50%',
                        transform: 'translateX(-50%)',
                        fontSize: { xs: '20px', sm: '24px' },
                        zIndex: 2,
                        lineHeight: 1,
                        pointerEvents: 'none',
                      }}
                    >
                      🎅
                    </Box>
                  )}
                </>
              )}
            </Box>
            {!showSearch && (
              <Typography 
                variant="body1" 
                fontSize={16} 
                sx={{ 
                  margin: { sm: '0 12px' }, 
                  display: { xs: 'none', sm: 'block' },
                  flex: 1,
                }}
              >
                {title}
              </Typography>
            )}
          </Box>
          
          {/* Buscador (si showSearch es true) - Centrado con max-width 560px y width 100% */}
          {showSearch && (
            <Box sx={{ 
              width: '100%',
              maxWidth: { xs: '100%', sm: '560px' },
              marginX: 'auto',
              order: { xs: 2, sm: 2 },
              flex: { sm: '1 1 auto' },
              display: 'flex',
              justifyContent: 'center',
              px: { xs: 1, sm: 2 },
              mt: { xs: 0, sm: 0 },
            }}>
              <Box sx={{ width: '100%' }}>
                <ModernSearchBar
                  value={searchValue || ''}
                  onChange={onSearchChange || (() => {})}
                  placeholder="Buscar productos por nombre, categoría o banco..."
                  sx={{
                    width: '100%',
                    paddingX: 0,
                    paddingY: { xs: 1, sm: 0.5 },
                    marginBottom: 0,
                    boxShadow: 'none',
                    backgroundColor: 'transparent',
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    },
                  }}
                />
              </Box>
            </Box>
          )}
          
          {/* Menú hamburguesa - Lado derecho */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            justifyContent: { xs: 'flex-end', sm: 'flex-end' },
            order: { xs: 3, sm: 3 },
            flex: { xs: showSearch ? '0 0 auto' : '0 0 auto', sm: '0 0 auto' },
            marginLeft: { xs: 0, sm: showSearch ? 0 : 'auto' },
            position: { xs: showSearch ? 'relative' : 'absolute', sm: 'relative' },
            right: { xs: showSearch ? 'auto' : 8, sm: 'auto' },
            top: { xs: showSearch ? 'auto' : '50%', sm: 'auto' },
            transform: { xs: showSearch ? 'none' : 'translateY(-50%)', sm: 'none' },
            zIndex: 10,
          }}>
            <IconButton color="inherit" onClick={handleMenuOpen}>
              <Badge
                variant="dot"
                color="secondary"
                sx={{
                  "& .MuiBadge-dot": {
                    height: 15,
                    minWidth: 15,
                    borderRadius: "50%",
                  },
                }}
              >
                <MenuIcon />
              </Badge>
            </IconButton>
          </Box>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
            {/* Home */}
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
            
            {/* Perfil */}
            <MenuItem
              onClick={() => {
                navigate("/perfil");
                handleMenuClose();
              }}
            >
              Perfil
            </MenuItem>
            <Divider />
            
            {/* Catálogos y Clientes */}
            <MenuItem
              onClick={() => {
                navigate("/emprendedoras");
                handleMenuClose();
              }}
            >
              Catálogos y Clientes
            </MenuItem>
            <Divider />
            
            {/* Ventas */}
            <MenuItem onClick={() => navigate("/ventas")}>
              <Box display="flex" alignItems="center" gap={1}>
                <Typography fontWeight="bold">Ventas</Typography>
                <Typography color="primary" fontSize={12}>🚀 Lanzamiento</Typography>
              </Box>
            </MenuItem>
            <Divider />
            
            {/* Preguntas Frecuentes */}
            <MenuItem
              onClick={() => {
                navigate("/faqs");
                handleMenuClose();
              }}
            >
              Preguntas Frecuentes
            </MenuItem>
            <Divider />
            
            {/* Capacitaciones */}
            <MenuItem
              onClick={() => {
                navigate("/capacitaciones");
                handleMenuClose();
              }}
            >
              <Box display="flex" alignItems="center" gap={1}>
                <Typography fontWeight="bold">Capacitaciones</Typography>
                <Typography color="secondary" fontSize={12}>🎓 Gratis</Typography>
              </Box>
            </MenuItem>
            <Divider />
            
            {/* Buscador Inteligente - Unificado */}
            <MenuItem
              onClick={() => {
                navigate("/buscador-inteligente");
                handleMenuClose();
              }}
            >
              <Box display="flex" alignItems="center" gap={1}>
                <Typography fontWeight="bold">Buscador Inteligente</Typography>
                <Typography color="primary" fontSize={12}>🤖 IA</Typography>
              </Box>
            </MenuItem>
            {(user?.username === 'cocinaty' || localStorage.getItem('activeSession') === 'cocinaty') && (
              <>
                <Divider />
                {/* Panel de Administración - Solo para cocinaty */}
                <MenuItem
                  onClick={() => {
                    navigate("/administrador");
                    handleMenuClose();
                  }}
                  disabled={location.pathname === "/administrador"}
                >
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography fontWeight="bold">Panel de Administración</Typography>
                    <Typography color="secondary" fontSize={12}>🔧 Admin</Typography>
                  </Box>
                </MenuItem>
              </>
            )}
            <Divider />
            
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

      {/* MODAL PERFIL - REEMPLAZADO POR PANTALLA DEDICADA */}
      {/* <Dialog open={openDialog === "profile"} onClose={() => setOpenDialog(null)} fullScreen={isMobile}>
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
      </Dialog> */}
    </>
  );
};

export default Navbar;
