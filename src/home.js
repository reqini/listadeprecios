import React, { useEffect, useState, useCallback, useMemo } from "react";
import { filterAllProducts } from "./utils/filterProducts";
import axios from "./utils/axios";
import useMediaQuery from "@mui/material/useMediaQuery";
import {
  Container,
  TextField,
  Snackbar,
  Alert,
  Skeleton,
  Typography,
  Grid,
  InputLabel,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  Select,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box
} from "@mui/material";
import { Link } from "react-router-dom";
import ModernProductCardAirbnb from "./components/ModernProductCardAirbnb";
import StickySearchBarWithScroll from "./components/StickySearchBarWithScroll";
import ModernCartBottomSheet from "./components/ModernCartBottomSheet";
import Navbar from "./components/Navbar";
import ResponsiveDialog from "./components/dialog";
import { useAuth } from "./AuthContext";
import ReviewSlider from "./components/ReviewSlider";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LaunchProductsCarousel from "./components/LaunchProductsCarousel";

const Home = () => {
  const { logout } = useAuth();
  const [openThemeDialog, setOpenThemeDialog] = useState(false);
  const isMobile = useMediaQuery('(max-width:600px)');

  const [catalogos] = useState([
  { nombre: "Preferencial", url: "/preferencial" },
    { nombre: "Contado", url: "/contado" },
    { nombre: "Preferencial", url: "/preferencial" },
    { nombre: "3 Cuotas", url: "/catalogo3" },
    { nombre: "6 Cuotas", url: "/catalogo6" },
    { nombre: "9 Cuotas", url: "/catalogo9" },
    { nombre: "10 Cuotas", url: "/catalogo10" },
    { nombre: "12 Cuotas", url: "/catalogo12" },
    { nombre: "14 Cuotas", url: "/catalogo14" },
    { nombre: "15 Cuotas", url: "/catalogo15" },
    { nombre: "18 Cuotas", url: "/catalogo18" }
  ]);

  const [selectedCatalog, setSelectedCatalog] = useState("");


  // Nuevo estado para los colores
  const [primaryColor, setPrimaryColor] = useState(localStorage.getItem("userPrimary") || "#A47A9E");
  const [secondaryColor, setSecondaryColor] = useState(localStorage.getItem("userSecondary") || "#FFC43C");

  // =============== NUEVO: validación de sesión ===============
  const [sessionChecked, setSessionChecked] = useState(false);
  const [sessionValid, setSessionValid] = useState(false);

  // =============== Tus estados originales ===============
  const [extras, setExtras] = useState(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [loading, setLoading] = useState(true);
  const [productos, setProductos] = useState([]); // Lista ORIGINAL de productos - NUNCA modificar
  const [productosOriginales, setProductosOriginales] = useState([]); // Backup de productos originales
  const [searchTerm, setSearchTerm] = useState(""); // Estado SOLO para el input - independiente
  const [username, setUsername] = useState("");
  const [timeOfDay, setTimeOfDay] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [rango, setRango] = useState("");
  const [cart, setCart] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [bankLogos, setBankLogos] = useState([]); // Logos de bancos para Home

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      setShowScrollTop(scrollTop > 300);
    };

    handleScroll(); // ⚠️ Fuerza verificación inicial por si ya hay scroll

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const aplicarColores = () => {
    localStorage.setItem("userPrimary", primaryColor);
    localStorage.setItem("userSecondary", secondaryColor);

    const themeMetaTag = document.querySelector('meta[name="theme-color"]');
    if (themeMetaTag) {
      themeMetaTag.setAttribute("content", primaryColor);
    }

    window.location.reload(); // recarga para aplicar todo
  };

  const onAddToCart = (product) => {
    setCart((prevCart) => {
      // Buscar si el producto ya existe en el carrito (por código)
      const existingIndex = prevCart.findIndex(
        (item) => item.codigo === product.codigo
      );
      
      if (existingIndex >= 0) {
        // Si existe, incrementar la cantidad
        const updatedCart = [...prevCart];
        updatedCart[existingIndex] = {
          ...updatedCart[existingIndex],
          cantidad: (updatedCart[existingIndex].cantidad || 1) + 1,
        };
        return updatedCart;
      } else {
        // Si no existe, agregarlo con cantidad 1
        return [...prevCart, { ...product, cantidad: 1 }];
      }
    });
  };

  // clearCart removido - no se usa actualmente

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
        const { data } = await axios.post("/auth/validate-session", { token, deviceId });
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
        const { data: usuarios } = await axios.get(`/api/user/all`);
        const user = usuarios.find((u) => u.username === storedUsername);
        if (user) {
          setRango(user.rango);
          localStorage.setItem("user", JSON.stringify(user)); // 👈 SUMALO
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
  // =============== Efecto para cargar productos y extras, solo si la sesión es válida ===============
  useEffect(() => {
    if (!sessionValid) return;
    const loadProductos = async () => {
      try {
        const { data } = await axios.get('/api/productos');
        // Guardar productos originales y productos actuales
        setProductosOriginales(data);
        setProductos(data);
        setLoading(false);
      } catch (error) {
        console.error('Error al obtener productos:', error);
        setLoading(false);
      }
    };
    loadProductos();
    fetchData("extras", setExtras);
  }, [sessionValid, fetchData]);

  // Cargar logos de bancos para Home desde Google Sheets
  useEffect(() => {
    if (!sessionValid) return;
    
    const loadBankLogos = async () => {
      try {
        const { getBankLogosForCatalogo } = await import('./utils/catalogoPromosAPI');
        const logos = await getBankLogosForCatalogo('/home');
        setBankLogos(logos);
      } catch (error) {
        console.warn('No se pudieron cargar logos de bancos para Home:', error);
        setBankLogos([]);
      }
    };
    
    loadBankLogos();
    
    // Escuchar actualizaciones de promos
    const handlePromosUpdate = () => {
      loadBankLogos();
    };
    window.addEventListener('catalogoPromosUpdated', handlePromosUpdate);
    return () => window.removeEventListener('catalogoPromosUpdated', handlePromosUpdate);
  }, [sessionValid]);

  // Filtrado sólido y robusto - filtra en tiempo real mientras el usuario escribe
  const productosFiltrados = useMemo(() => {
    // Usar productosOriginales si existe y tiene datos, sino usar productos como fallback
    const productosBase = (productosOriginales && productosOriginales.length > 0) 
      ? productosOriginales 
      : (productos && productos.length > 0 ? productos : []);
    
    // Si no hay productos base, retornar vacío
    if (!productosBase || productosBase.length === 0) {
      return [];
    }
    
    // Filtrar productos válidos (sin repuestos, vigentes)
    let productosValidos = productosBase.filter((producto) => {
      const linea = (producto?.linea || '').toLowerCase();
      const vigencia = (producto?.vigencia || '').toLowerCase();
      // Excluir repuestos y productos con vigencia 'no'
      return linea !== 'repuestos' && vigencia !== 'no';
    });
    
    // Si no hay término de búsqueda, retornar todos los productos válidos
    const searchTrimmed = searchTerm ? searchTerm.trim() : '';
    if (!searchTrimmed) {
      return productosValidos;
    }
    
    // Si hay búsqueda, aplicar filtrado por término
    return filterAllProducts(productosValidos, searchTrimmed);
  }, [productosOriginales, productos, searchTerm]);


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
        <Link to="/generarPlaca" style={{ textDecoration: "none" }}>
          <div className="banner card-product mar-b30" style={{ cursor: "pointer" }}>
            <img
              src={windowWidth <= 460 ? extras[0]?.banner_mobile : extras[0]?.banner}
              alt="Banner Grupo 1"
              style={{ width: "100%" }}
            />
          </div>
        </Link>
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
        <Skeleton sx={{ height: 50, marginTop: 2 }} animation="wave" />
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
            {timeOfDay} <b>{username === 'cocinatalia' ? 'Chupa Pito' : username || "Usuario"}</b>{/* , Te damos la Bienvenida */}
          </p>
        }
        onLogout={logout}
        user={{ username: username || localStorage.getItem("activeSession") || "" }}
      />
      {/* Buscador fixed en top: 0 */}
      <StickySearchBarWithScroll
        value={searchTerm}
        onChange={(e) => {
          // SOLO actualizar el estado del input - NADA MÁS
          setSearchTerm(e.target.value);
        }}
        placeholder="Buscar Producto"
      />

      <Container 
        maxWidth="lg" 
        className="conteiner-list"
        sx={{
          paddingTop: { xs: 2, sm: 3 }, // Padding normal, search solo fixed al hacer scroll
          paddingBottom: { xs: 4, sm: 5 },
        }}
      >

        {getBannerForRango()}
          
          {/* Carrousel de Lanzamientos / Entrega Inmediata */}
          {!loading && productos.length > 0 && (
            <LaunchProductsCarousel
              productos={productos}
              onAddToCart={(prod) => onAddToCart(prod)}
              onProductClick={(prod) => {
                // Opcional: abrir modal o navegar al detalle
                console.log('Producto clickeado:', prod);
              }}
            />
          )}

          <Accordion sx={{ marginBottom: 2, display: 'none' }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1" fontWeight={600}>
                Desplegar Reseñas
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ background: '#e9e9e9' }}>
              <ReviewSlider />
            </AccordionDetails>
          </Accordion>
          <div className="flex flex-direction-mobile align-center justify-center mar-b20 w-100">
            <Typography style={{maxWidth: 350}} textAlign={'center'} variant="h6">Por este medio podes generar la url y enviar el catálogo que tu cliente quiera</Typography>
          </div>
        {/* Sección de catálogos - Acceso libre para todos los usuarios */}
        <div className="flex flex-direction-mobile align-center justify-center mar-b20 w-100" style={{ gap: 12 }}>
          <FormControl size="small" sx={{ minWidth: 200, width: '100%', maxWidth: 400, background: 'white' }}>
            <InputLabel>Seleccioná un catálogo</InputLabel>
            <Select
              value={selectedCatalog}
              fullWidth
              size="large"
              variant="outlined"
              onChange={(e) => setSelectedCatalog(e.target.value)}
              label="Seleccioná un catálogo"
            >
              <MenuItem value="">-- Elegí uno --</MenuItem>
              {catalogos.map((cat) => (
                <MenuItem key={cat.url} value={cat.url}>{cat.nombre}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="contained"
            disabled={!selectedCatalog}
            onClick={() => {
              const url = `${window.location.origin}${selectedCatalog}`;
              navigator.clipboard.writeText(url);
              setSnackbarOpen(true);
            }}
          >
            Copiar URL
          </Button>
        </div>

        {/* Grid responsive estilo Airbnb - Moderno */}
        {loading ? (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(2, 1fr)',
                lg: 'repeat(3, 1fr)',
              },
              gap: { xs: 3, sm: 3, md: 4 },
            }}
          >
            {[...Array(6)].map((_, index) => (
              <Skeleton
                key={index}
                variant="rectangular"
                height={500}
                sx={{
                  borderRadius: 3,
                  animation: 'wave',
                }}
              />
            ))}
          </Box>
        ) : productosFiltrados.length === 0 && searchTerm && searchTerm.trim() ? (
          <Box
            sx={{
              textAlign: 'center',
              padding: { xs: 4, sm: 6 },
            }}
          >
            <Typography
              variant="h6"
              sx={{
                color: '#717171',
                fontSize: { xs: '1.125rem', sm: '1.25rem' },
                fontWeight: 500,
                mb: 1,
              }}
            >
              No se encontraron productos
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: '#999',
                fontSize: { xs: '0.875rem', sm: '1rem' },
              }}
            >
              No hay productos que coincidan con "{searchTerm}". Intenta con otro término de búsqueda.
            </Typography>
          </Box>
        ) : productosFiltrados.length > 0 ? (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr', // Mobile: 1 card por fila
                sm: 'repeat(2, 1fr)', // Tablet: 2 columnas
                md: 'repeat(2, 1fr)', // Desktop: 2 columnas
                lg: 'repeat(3, 1fr)', // Large: 3 columnas
              },
              gap: { xs: 3, sm: 3, md: 4 },
            }}
          >
            {productosFiltrados.map((product) => (
              <ModernProductCardAirbnb
                key={product.id || product.codigo}
                product={product}
                onAddToCart={(prod) => onAddToCart(prod)}
                selectedCuota={null} // Sin cuota específica, se selecciona en el selector
                isContado={false}
                showAllData={true} // Mostrar TODOS los datos: precio negocio, PSVP, puntos, precio preferencial, todas las cuotas
                // Badges opcionales desde datos
                isNew={product.nuevo === 'si' || product.nuevo === true || product.nuevo === 'Sí'}
                isBestSeller={product.mas_vendida === 'si' || product.mas_vendida === true || product.mas_vendida === 'Sí'}
                stockLow={
                  product.stock_actual && product.stock_total &&
                  parseFloat(product.stock_actual) > 0 && parseFloat(product.stock_total) > 0 &&
                  (parseFloat(product.stock_actual) / parseFloat(product.stock_total)) < 0.2
                }
                bankLogos={bankLogos} // Pasar logos de bancos desde Google Sheets
              />
            ))}
          </Box>
        ) : (
          <Box
            sx={{
              textAlign: 'center',
              padding: { xs: 4, sm: 6 },
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color: '#999',
                fontSize: { xs: '0.875rem', sm: '1rem' },
              }}
            >
              No hay productos disponibles en este momento.
            </Typography>
          </Box>
        )}

        {/* Carrito moderno con bottom sheet */}
        <ModernCartBottomSheet 
          cart={cart} 
          setCart={setCart} 
          cuotaKey="tres_sin_interes" 
          cuotasTexto="3 cuotas"
        />
        
        {/* Modal de promociones bancarias */}
        <ResponsiveDialog open={openDialog} onClose={handleCloseDialog} style={{display: 'none'}} />

        <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={handleSnackbarClose}>
          <Alert onClose={handleSnackbarClose} severity="success">
            Producto agregado al carrito
          </Alert>
        </Snackbar>
        <section style={{ fontSize: '0.9rem', color: '#666', padding: '2rem 0', width: '100%' }}>
          <p>
            Catálogo Simple es una herramienta pensada para <strong>emprendedoras Essen</strong> que buscan simplificar su trabajo. Accedé gratis a la <strong>lista de precios Essen actualizada</strong>, catálogos visuales con cuotas y mucho más. 
            Ideal para quienes venden Essen en Argentina y quieren tener todo en un solo lugar.
          </p>
          <Typography fontSize={13} margin={'6px 0 12px 0'} style={{textAlign: 'center'}}>
            <b>Desarrollado por:</b><br></br>
            <b>
              <a href="https://www.instagram.com/cocinatyy" rel="noreferrer">@Cocinatyy </a>
            </b>
            y
            <b>
              <a href="https://www.instagram.com/lrecchini/" rel="noreferrer"> Luciano Recchini</a>
            </b>
          </Typography>
        </section>
        <Dialog
          open={openThemeDialog}
          onClose={() => setOpenThemeDialog(false)}
          fullWidth
          maxWidth="sm"
          sx={{
            '& .MuiDialog-paper': {
              margin: { xs: 1, sm: 2 },
              width: '100%',
            },
          }}
        >
          <DialogTitle sx={{ textAlign: 'center', fontWeight: 600 }}>
            Personalización de Tema
          </DialogTitle>

          <DialogContent sx={{ px: { xs: 2, sm: 4 }, pb: 2 }}>
            <Grid container spacing={2} mt={1}>
              <Grid item xs={12} sm={6}>
                <InputLabel>Color Primario</InputLabel>
                <TextField
                  type="color"
                  fullWidth
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <InputLabel>Color Secundario</InputLabel>
                <TextField
                  type="color"
                  fullWidth
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                />
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Button
                  variant="text"
                  color="primary"
                  fullWidth
                  onClick={() => setOpenThemeDialog(false)}
                >
                  Cancelar
                </Button>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => {
                    setPrimaryColor("#A47A9E");
                    setSecondaryColor("#FFC43Co");
                  }}
                >
                  Colores originales
                </Button>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={aplicarColores}
                >
                  Aplicar
                </Button>
              </Grid>
            </Grid>
          </DialogActions>
        </Dialog>
      </Container>
      {showScrollTop && (
        <Button
        variant="contained"
        color="primary"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        sx={{
          position: "fixed",
          bottom: isMobile ? 65 : 24,
          left: 24,
          zIndex: 9999,
          backgroundColor: "red",
          borderRadius: "50%",
          minWidth: 0,
          width: 48,
          height: 48,
          boxShadow: 3,
          fontSize: 24,
        }}
      >
        ↑
        </Button>
      )}
    </>
  );
};

export default Home;