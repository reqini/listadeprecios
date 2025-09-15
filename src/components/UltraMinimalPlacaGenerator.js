import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../utils/axios";
import Navbar from "./Navbar";
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  Autocomplete,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Paper,
  Alert,
  Snackbar,
  useTheme,
  useMediaQuery,
  alpha,
  styled,
  IconButton,
  Fab
} from "@mui/material";
import {
  Download as DownloadIcon,
  CloudUpload as CloudUploadIcon,
  Image as ImageIcon,
  Close as CloseIcon
} from "@mui/icons-material";
import html2canvas from "html2canvas";

// Componente de input de archivo minimalista
const HiddenFileInput = styled('input')({
  display: 'none',
});

// Área de drag & drop minimalista
const DropZone = styled(Paper)(({ theme, isDragOver }) => ({
  border: `2px dashed ${isDragOver ? theme.palette.primary.main : theme.palette.divider}`,
  borderRadius: theme.spacing(1),
  padding: theme.spacing(2),
  textAlign: 'center',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  backgroundColor: isDragOver ? alpha(theme.palette.primary.main, 0.04) : 'transparent',
  minHeight: 60,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: alpha(theme.palette.primary.main, 0.04),
  },
}));

const UltraMinimalPlacaGenerator = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();

  // Estados esenciales únicamente
  const [products, setProducts] = useState([]);
  const [banks, setBanks] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedQuota, setSelectedQuota] = useState("3 cuotas");
  const [selectedBanks, setSelectedBanks] = useState([]);
  const [customQuotaValue, setCustomQuotaValue] = useState("");
  const [showCard, setShowCard] = useState(false);
  
  // Estados de diseño minimalistas
  const [titleColor, setTitleColor] = useState("#1976D2");
  const [backgroundColor, setBackgroundColor] = useState("#FFFFFF");
  const [fontSize, setFontSize] = useState(18);
  
  // Estados de archivos
  const [uploadedImage, setUploadedImage] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  
  // Estados de UI
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  // Mapa de cuotas simplificado
  const cuotasMap = useMemo(() => ({
    "3 cuotas": "tres_sin_interes",
    "6 cuotas": "seis_sin_interes",
    "12 cuotas": "doce_sin_interes",
    "24 cuotas": "veinticuatro_sin_interes"
  }), []);

  // Cargar datos
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsResponse, banksResponse] = await Promise.all([
          axios.get("/api/productos"),
          axios.get("/api/bancos")
        ]);
        
        const filteredProducts = productsResponse.data.filter(product => product.vigencia === "SI");
        setProducts(filteredProducts || []);
        setBanks(banksResponse.data || []);
      } catch (error) {
        console.error("Error al obtener datos:", error);
        showSnackbar("Error al cargar datos", "error");
      }
    };
    fetchData();
  }, []);

  // Función para mostrar notificaciones
  const showSnackbar = (message, severity = "success") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  // Manejo de archivos - drag & drop directo a la placa
  const handleCardDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleCardDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleCardDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target.result);
        showSnackbar("Imagen aplicada a la placa", "success");
      };
      reader.readAsDataURL(file);
    }
  }, []);

  // Manejo de archivos - área de upload
  const handleFileUpload = useCallback((event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target.result);
        showSnackbar("Imagen subida", "success");
      };
      reader.readAsDataURL(file);
    } else {
      showSnackbar("Selecciona una imagen válida", "error");
    }
  }, []);

  // Selección de producto
  const handleSelectProduct = useCallback((event, newValue) => {
    setSelectedProduct(newValue);
    if (newValue) {
      const cuotaKey = cuotasMap[selectedQuota];
      const price = newValue[cuotaKey];
      setCustomQuotaValue(price || "");
    }
    setShowCard(false);
  }, [selectedQuota, cuotasMap]);

  // Cambio de cuota
  const handleQuotaChange = useCallback((event) => {
    const newQuota = event.target.value;
    setSelectedQuota(newQuota);
    if (selectedProduct) {
      const cuotaKey = cuotasMap[newQuota];
      const price = selectedProduct[cuotaKey];
      setCustomQuotaValue(price || "");
    }
    setShowCard(false);
  }, [selectedProduct, cuotasMap]);

  // Generar vista previa
  const handleGeneratePreview = useCallback(() => {
    if (selectedProduct) {
      setShowCard(true);
      showSnackbar("Vista previa generada", "success");
    } else {
      showSnackbar("Selecciona un producto primero", "warning");
    }
  }, [selectedProduct]);

  // Capturar imagen
  const captureImage = useCallback(() => {
    const cardElement = document.getElementById("placa-container");
    if (!cardElement) {
      showSnackbar("Error: No se encontró la placa", "error");
      return;
    }

    html2canvas(cardElement, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: backgroundColor,
    }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png", 1.0);
      const link = document.createElement("a");
      link.download = `placa-${Date.now()}.png`;
      link.href = imgData;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showSnackbar("Placa descargada", "success");
    }).catch((error) => {
      console.error("Error al generar la imagen:", error);
      showSnackbar("Error al descargar", "error");
    });
  }, [backgroundColor]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("activeSession");
    navigate("/login");
  };

  return (
    <>
      <Navbar
        title="Crear Placa"
        onLogout={handleLogout}
        user={{ username: localStorage.getItem("activeSession") || "" }}
      />
      
      <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50', pb: 10 }}>
        <Container maxWidth="lg" sx={{ py: 2 }}>
          <Grid container spacing={2}>
            {/* Panel de control - Mobile first */}
            <Grid item xs={12} md={4}>
              <Card sx={{ 
                position: isMobile ? 'static' : 'sticky',
                top: 100,
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                borderRadius: 2
              }}>
                <CardContent sx={{ p: 2 }}>
                  {/* Selección de producto */}
                  <Autocomplete
                    options={products}
                    getOptionLabel={(option) => option?.descripcion || ""}
                    onChange={handleSelectProduct}
                    value={selectedProduct}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Producto"
                        variant="outlined"
                        fullWidth
                        size="small"
                        sx={{ mb: 2 }}
                      />
                    )}
                  />

                  {/* Cuotas y valor */}
                  <Grid container spacing={1} sx={{ mb: 2 }}>
                    <Grid item xs={6}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Cuotas</InputLabel>
                        <Select value={selectedQuota} onChange={handleQuotaChange}>
                          {Object.keys(cuotasMap).map((label) => (
                            <MenuItem key={label} value={label}>{label}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        label="Valor"
                        value={customQuotaValue}
                        onChange={(e) => setCustomQuotaValue(e.target.value)}
                        fullWidth
                        size="small"
                      />
                    </Grid>
                  </Grid>

                  {/* Bancos */}
                  <Autocomplete
                    multiple
                    options={banks}
                    getOptionLabel={(option) => option?.banco || ""}
                    onChange={(e, newValue) => setSelectedBanks(newValue)}
                    value={selectedBanks}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Bancos"
                        variant="outlined"
                        fullWidth
                        size="small"
                        sx={{ mb: 2 }}
                      />
                    )}
                  />

                  {/* Diseño minimalista */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" gutterBottom>
                      Diseño
                    </Typography>
                    <Grid container spacing={1}>
                      <Grid item xs={6}>
                        <TextField
                          label="Texto"
                          type="color"
                          value={titleColor}
                          onChange={(e) => setTitleColor(e.target.value)}
                          fullWidth
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          label="Fondo"
                          type="color"
                          value={backgroundColor}
                          onChange={(e) => setBackgroundColor(e.target.value)}
                          fullWidth
                          size="small"
                        />
                      </Grid>
                    </Grid>
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="caption" gutterBottom>
                        Tamaño: {fontSize}px
                      </Typography>
                      <input
                        type="range"
                        min="16"
                        max="40"
                        value={fontSize}
                        onChange={(e) => setFontSize(parseInt(e.target.value))}
                        style={{ width: '100%' }}
                      />
                    </Box>
                  </Box>

                  {/* Subir imagen */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" gutterBottom>
                      Imagen de fondo
                    </Typography>
                    <DropZone
                      isDragOver={isDragOver}
                      onClick={() => document.getElementById('file-input').click()}
                    >
                      {uploadedImage ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <img 
                            src={uploadedImage} 
                            alt="Preview" 
                            style={{ 
                              width: 40, 
                              height: 40, 
                              objectFit: 'cover',
                              borderRadius: 4
                            }} 
                          />
                          <Typography variant="caption">Imagen cargada</Typography>
                          <IconButton 
                            size="small" 
                            onClick={(e) => {
                              e.stopPropagation();
                              setUploadedImage(null);
                            }}
                          >
                            <CloseIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      ) : (
                        <Box>
                          <CloudUploadIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                          <Typography variant="caption" color="text.secondary">
                            Toca para subir o arrastra a la placa
                          </Typography>
                        </Box>
                      )}
                    </DropZone>
                    <HiddenFileInput
                      id="file-input"
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                    />
                  </Box>

                  {/* Botones de acción */}
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={handleGeneratePreview}
                    size="small"
                    sx={{ mb: 1 }}
                  >
                    Generar
                  </Button>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={captureImage}
                    disabled={!showCard}
                    size="small"
                    startIcon={<DownloadIcon />}
                  >
                    Descargar
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            {/* Vista previa */}
            <Grid item xs={12} md={8}>
              <Card sx={{ 
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                borderRadius: 2,
                minHeight: isMobile ? 300 : 500
              }}>
                <CardContent sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Vista Previa
                  </Typography>
                  
                  <Box
                    sx={{
                      border: '2px dashed #e0e0e0',
                      borderRadius: 2,
                      minHeight: isMobile ? 250 : 400,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'grey.50',
                      position: 'relative',
                      p: 2
                    }}
                  >
                    {!showCard ? (
                      <Box sx={{ textAlign: 'center' }}>
                        <ImageIcon sx={{ fontSize: 48, color: 'grey.400', mb: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                          Selecciona un producto y genera la vista previa
                        </Typography>
                      </Box>
                    ) : (
                      <Box 
                        id="placa-container"
                        onDragOver={handleCardDragOver}
                        onDragLeave={handleCardDragLeave}
                        onDrop={handleCardDrop}
                        sx={{
                          width: isMobile ? 200 : 270,
                          height: isMobile ? 355 : 480, // Relación 9:16 (Instagram Stories)
                          bgcolor: backgroundColor,
                          borderRadius: 2,
                          p: 2,
                          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                          position: 'relative',
                          overflow: 'hidden',
                          cursor: isDragOver ? 'copy' : 'default',
                          border: isDragOver ? '2px dashed #1976D2' : 'none',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between'
                        }}
                      >
                        {selectedProduct && (
                          <>
                            {/* Contenido superior */}
                            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                              {/* Imagen del producto */}
                              {selectedProduct.imagen && (
                                <Box sx={{ 
                                  display: 'flex', 
                                  justifyContent: 'center', 
                                  mb: 2 
                                }}>
                                  <img 
                                    src={selectedProduct.imagen} 
                                    alt={selectedProduct.descripcion}
                                    style={{
                                      maxWidth: isMobile ? '60px' : '80px',
                                      maxHeight: isMobile ? '60px' : '80px',
                                      objectFit: 'contain',
                                      borderRadius: '8px',
                                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                    }}
                                  />
                                </Box>
                              )}

                              {/* Título del producto */}
                              <Typography
                                variant="h6"
                                sx={{
                                  color: titleColor,
                                  fontSize: isMobile ? fontSize : fontSize + 2,
                                  fontWeight: 'bold',
                                  mb: 2,
                                  textAlign: 'center',
                                  lineHeight: 1.2,
                                  px: 1
                                }}
                              >
                                {selectedProduct.descripcion}
                              </Typography>
                            </Box>

                            {/* Contenido inferior */}
                            <Box sx={{ flex: 0 }}>
                              {/* Precio y cuotas */}
                              <Box sx={{ 
                                display: 'flex', 
                                flexDirection: 'column',
                                alignItems: 'center',
                                mb: 2
                              }}>
                                <Typography
                                  variant="h4"
                                  sx={{
                                    color: titleColor,
                                    fontSize: isMobile ? fontSize + 6 : fontSize + 8,
                                    fontWeight: 'bold',
                                    textAlign: 'center'
                                  }}
                                >
                                  {customQuotaValue}
                                </Typography>
                                <Typography
                                  variant="h6"
                                  sx={{
                                    color: titleColor,
                                    fontSize: isMobile ? fontSize - 2 : fontSize,
                                    opacity: 0.8,
                                    textAlign: 'center'
                                  }}
                                >
                                  en {selectedQuota}
                                </Typography>
                              </Box>

                              {/* Bancos */}
                              {selectedBanks.length > 0 && (
                                <Box sx={{ 
                                  display: 'flex', 
                                  flexWrap: 'wrap', 
                                  gap: 0.5, 
                                  justifyContent: 'center',
                                  alignItems: 'center'
                                }}>
                                  <Typography 
                                    variant="caption" 
                                    sx={{ 
                                      color: titleColor, 
                                      opacity: 0.7,
                                      mr: 0.5,
                                      fontSize: '0.7rem'
                                    }}
                                  >
                                    Disponible en:
                                  </Typography>
                                  {selectedBanks.slice(0, 3).map((bank, index) => (
                                    <Chip
                                      key={index}
                                      label={bank.banco}
                                      size="small"
                                      variant="outlined"
                                      sx={{ 
                                        color: titleColor,
                                        borderColor: titleColor,
                                        fontSize: '0.65rem',
                                        height: '18px'
                                      }}
                                    />
                                  ))}
                                  {selectedBanks.length > 3 && (
                                    <Chip
                                      label={`+${selectedBanks.length - 3}`}
                                      size="small"
                                      variant="outlined"
                                      sx={{ 
                                        color: titleColor,
                                        borderColor: titleColor,
                                        fontSize: '0.65rem',
                                        height: '18px'
                                      }}
                                    />
                                  )}
                                </Box>
                              )}
                            </Box>

                            {/* Imagen de fondo */}
                            {uploadedImage && (
                              <Box sx={{ 
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                backgroundImage: `url(${uploadedImage})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                opacity: 0.1,
                                zIndex: -1
                              }} />
                            )}

                            {/* Indicador de drag and drop */}
                            {isDragOver && (
                              <Box sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                bgcolor: 'rgba(25, 118, 210, 0.15)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                zIndex: 1,
                                borderRadius: 2
                              }}>
                                <Box sx={{ 
                                  textAlign: 'center',
                                  bgcolor: 'white',
                                  p: 2,
                                  borderRadius: 2,
                                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                                  border: '2px dashed #1976D2'
                                }}>
                                  <CloudUploadIcon sx={{ fontSize: 32, color: 'primary.main', mb: 1 }} />
                                  <Typography variant="body2" color="primary.main" fontWeight="bold">
                                    Suelta la imagen aquí
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    Se aplicará como fondo
                                  </Typography>
                                </Box>
                              </Box>
                            )}
                          </>
                        )}
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>

        {/* FAB para mobile */}
        {isMobile && showCard && (
          <Fab
            color="primary"
            sx={{
              position: 'fixed',
              bottom: 16,
              right: 16,
              zIndex: 1000
            }}
            onClick={captureImage}
          >
            <DownloadIcon />
          </Fab>
        )}

        {/* Snackbar */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={3000}
          onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            onClose={() => setSnackbarOpen(false)} 
            severity={snackbarSeverity}
            sx={{ width: '100%' }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Box>
    </>
  );
};

export default UltraMinimalPlacaGenerator;
