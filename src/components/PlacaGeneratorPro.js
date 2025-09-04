import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Chip,
  Slider,
  Switch,
  FormControlLabel,
  Grid,
  Paper,
  Alert,
  Fab,
  Badge,
  Tooltip,
  Collapse,
  Divider,
  LinearProgress,
  Avatar,
  Autocomplete,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  AutoAwesome as AutoAwesomeIcon,
  Palette as PaletteIcon,
  PhotoCamera as CameraIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  Save as SaveIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  RotateLeft as RotateLeftIcon,
  Flip as FlipIcon,
  Brightness4 as BrightnessIcon,
  Contrast as ContrastIcon,
  BlurOn as BlurIcon,
  Gradient as GradientIcon,
  Texture as TextureIcon,
  Style as StyleIcon,
  Psychology as PsychologyIcon,
  Star as StarIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Visibility as PreviewIcon,
  Shuffle as ShuffleIcon,
  Speed as SpeedIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
  Settings as SettingsIcon,
  Tune as TuneIcon,
  ViewComfy as ViewComfyIcon,
  Analytics as AnalyticsIcon,
  Lightbulb as LightbulbIcon,
  LocalFireDepartment as FireIcon,
  WorkspacePremium as PremiumIcon,
} from '@mui/icons-material';
import { buildComboTitle, composeCombo } from '../utils/aiComposer';
import html2canvas from 'html2canvas';

const PlacaGeneratorPro = ({ 
  products = [],
  banks = [],
  onSave,
  onExport 
}) => {
  // Estados principales
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectedBanks, setSelectedBanks] = useState([]);
  const [selectedQuota, setSelectedQuota] = useState("3 cuotas");
  const [customQuotaValue, setCustomQuotaValue] = useState("");
  
  // Estados de diseño
  const [titleColor, setTitleColor] = useState("#2196F3");
  const [selectedFont, setSelectedFont] = useState("Roboto");
  const [titleFontSize, setTitleFontSize] = useState(35);
  const [quotaFontSize, setQuotaFontSize] = useState(35);
  const [backgroundColor, setBackgroundColor] = useState("#FFFFFF");
  const [borderRadius, setBorderRadius] = useState(10);
  const [padding, setPadding] = useState(10);
  
  // Estados PRO avanzados
  const [activeMode, setActiveMode] = useState('products'); // products, design, ai, collage
  const [realisticMode, setRealisticMode] = useState(false);
  const [comboMode, setComboMode] = useState(false);
  const [comboLayout, setComboLayout] = useState("auto");
  const [comboSpacing, setComboSpacing] = useState(15);
  const [comboAnimation, setComboAnimation] = useState(true);
  const [comboTitle, setComboTitle] = useState("");
  const [comboLayers, setComboLayers] = useState([]);
  const [comboTotalQuota, setComboTotalQuota] = useState(0);
  
  // Estados de efectos visuales
  const [zoomLevel, setZoomLevel] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [blur, setBlur] = useState(0);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [aiProcessing, setAiProcessing] = useState(false);
  
  // Estados de collage
  const [collageStyle, setCollageStyle] = useState("modern"); // modern, vintage, minimal, colorful
  const [colorHarmony, setColorHarmony] = useState("auto"); // auto, warm, cool, monochrome
  const [backgroundRemoval, setBackgroundRemoval] = useState(true);
  const [unifiedColors, setUnifiedColors] = useState(false);
  const [shadowEffects, setShadowEffects] = useState(true);
  const [gradientBackground, setGradientBackground] = useState(false);
  
  const canvasRef = useRef(null);

  // Mapeo de cuotas
  const cuotasMap = {
    "3 cuotas": "cuota_3",
    "6 cuotas": "cuota_6", 
    "9 cuotas": "cuota_9",
    "12 cuotas": "cuota_12",
    "15 cuotas": "cuota_15",
    "18 cuotas": "cuota_18",
    "20 cuotas": "cuota_20",
    "24 cuotas": "cuota_24"
  };

  // Función para calcular total de cuotas en combo
  const calculateComboTotalQuota = useCallback((products, quota) => {
    if (!comboMode || !products || products.length === 0 || !quota) return 0;
    
    let total = 0;
    products.forEach(product => {
      const cuotaKey = cuotasMap[quota];
      if (cuotaKey && product[cuotaKey] && product[cuotaKey] !== "NO") {
        try {
          const cleanValue = product[cuotaKey].toString()
            .replace(/[^\d.,]/g, '')
            .replace(',', '.');
          
          const numericValue = parseFloat(cleanValue);
          if (!isNaN(numericValue) && numericValue > 0) {
            total += numericValue;
          }
        } catch (error) {
          console.warn('Error parsing quota value:', product[cuotaKey], error);
        }
      }
    });
    
    return Math.round(total * 100) / 100;
  }, [comboMode, cuotasMap]);

  // Actualizar combo title y capas cuando cambien los productos
  useEffect(() => {
    if (comboMode && selectedProducts.length > 0) {
      const title = buildComboTitle(selectedProducts);
      setComboTitle(title);

      const productImages = selectedProducts.map(p => p.imagen || p.imagen_url).filter(Boolean);
      if (productImages.length > 0) {
        composeCombo(productImages, { 
          layout: comboLayout,
          canvasWidth: 360,
          canvasHeight: 360
        })
          .then(layers => setComboLayers(layers))
          .catch(error => console.error("Error generando capas:", error));
      }
    } else {
      setComboTitle("");
      setComboLayers([]);
    }
  }, [comboMode, selectedProducts, comboLayout]);

  // Actualizar total de cuotas del combo
  useEffect(() => {
    if (comboMode && selectedProducts.length > 0 && selectedQuota) {
      const total = calculateComboTotalQuota(selectedProducts, selectedQuota);
      setComboTotalQuota(total);
    } else {
      setComboTotalQuota(0);
    }
  }, [comboMode, selectedProducts, selectedQuota, calculateComboTotalQuota]);

  // Función para generar collage con IA
  const generateAICollage = async () => {
    setAiProcessing(true);
    try {
      // Simular procesamiento de IA para collage
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Aplicar efectos de collage automáticamente
      if (backgroundRemoval) {
        setRealisticMode(true);
      }
      
      if (unifiedColors) {
        // Aplicar paleta de colores unificada
        const colorPalettes = {
          modern: "#2196F3",
          vintage: "#8D6E63", 
          minimal: "#424242",
          colorful: "#E91E63"
        };
        setTitleColor(colorPalettes[collageStyle] || "#2196F3");
      }
      
      if (gradientBackground) {
        setBackgroundColor("linear-gradient(135deg, #667eea 0%, #764ba2 100%)");
      }
      
      setAiProcessing(false);
    } catch (error) {
      console.error("Error generando collage:", error);
      setAiProcessing(false);
    }
  };

  // Función para capturar imagen
  const captureImage = () => {
    const cardElement = document.getElementById("pro-card-container");
    if (!cardElement) return;

    const clonedElement = cardElement.cloneNode(true);
    clonedElement.style.position = "absolute";
    clonedElement.style.left = "-9999px";
    document.body.appendChild(clonedElement);

    setTimeout(() => {
      html2canvas(clonedElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: realisticMode ? "transparent" : backgroundColor,
      })
        .then((canvas) => {
          document.body.removeChild(clonedElement);
          const imgData = canvas.toDataURL("image/png", 1.0);
          
          const link = document.createElement("a");
          link.download = `placa-pro-${Date.now()}.png`;
          link.href = imgData;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        })
        .catch((error) => {
          console.error("Error al generar la imagen:", error);
          document.body.removeChild(clonedElement);
        });
    }, 100);
  };

  // Renderizar productos seleccionados
  const renderSelectedProducts = () => (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
        🛍️ Productos Seleccionados ({selectedProducts.length})
      </Typography>
      
      {selectedProducts.length > 0 ? (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {selectedProducts.map((product, index) => (
            <Chip
              key={index}
              label={product.descripcion?.substring(0, 30) + "..."}
              onDelete={() => {
                setSelectedProducts(prev => prev.filter((_, i) => i !== index));
              }}
              color="primary"
              variant="outlined"
              sx={{ mb: 1 }}
            />
          ))}
        </Box>
      ) : (
        <Alert severity="info">
          Selecciona productos para crear tu placa profesional
        </Alert>
      )}
    </Box>
  );

  // Renderizar controles de productos
  const renderProductsPanel = () => (
    <Box>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
        🛍️ Selección de Productos
      </Typography>
      
      {/* Autocomplete para productos */}
      <Autocomplete
        multiple
        options={products}
        getOptionLabel={(option) => option.descripcion || ""}
        value={selectedProducts}
        onChange={(event, newValue) => {
          setSelectedProducts(newValue);
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Buscar productos"
            placeholder="Selecciona productos para tu combo"
            helperText={`${selectedProducts.length} productos seleccionados`}
          />
        )}
        renderTags={(value, getTagProps) =>
          value.map((option, index) => (
            <Chip
              {...getTagProps({ index })}
              key={index}
              label={option.descripcion?.substring(0, 20) + "..."}
              size="small"
            />
          ))
        }
        sx={{ mb: 2 }}
      />

      {/* Modo Combo */}
      <Paper sx={{ p: 2, mb: 2, bgcolor: comboMode ? "#E3F2FD" : "#FAFAFA" }}>
        <FormControlLabel
          control={
            <Switch
              checked={comboMode}
              onChange={(e) => setComboMode(e.target.checked)}
              color="primary"
            />
          }
          label={
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <AddIcon color={comboMode ? "primary" : "disabled"} />
              <Typography variant="h6" color={comboMode ? "primary" : "text.secondary"}>
                Modo Combo
              </Typography>
              {comboMode && (
                <Chip
                  label={`${selectedProducts.length} productos`}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              )}
            </Box>
          }
        />
      </Paper>

      {/* Layout del combo */}
      {comboMode && (
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
            Layout del Combo
          </Typography>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Estilo de Layout</InputLabel>
            <Select
              value={comboLayout}
              onChange={(e) => setComboLayout(e.target.value)}
              label="Estilo de Layout"
            >
              <MenuItem value="auto">Auto (IA)</MenuItem>
              <MenuItem value="horizontal">Horizontal</MenuItem>
              <MenuItem value="vertical">Vertical</MenuItem>
              <MenuItem value="grid">Grid</MenuItem>
              <MenuItem value="magazine">Magazine</MenuItem>
            </Select>
          </FormControl>
          
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip
              icon={<PreviewIcon />}
              label="Preview"
              size="small"
              color="primary"
              variant="outlined"
            />
            <Chip
              icon={<ShuffleIcon />}
              label="Auto Layout"
              size="small"
              color="secondary"
              onClick={() => setComboLayout("auto")}
              variant="outlined"
            />
            <Chip
              icon={<SpeedIcon />}
              label={`Layout: ${comboLayout}`}
              size="small"
              color="info"
              variant="outlined"
            />
          </Box>
        </Paper>
      )}

      {renderSelectedProducts()}
    </Box>
  );

  // Renderizar controles de collage
  const renderCollagePanel = () => (
    <Box>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
        🎨 Collage Profesional
      </Typography>

      <Alert severity="info" sx={{ mb: 2 }}>
        <Typography variant="body2">
          Crea composiciones profesionales como el ejemplo que viste, 
          con fondos removidos y colores unificados.
        </Typography>
      </Alert>

      {/* Estilo de collage */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
          Estilo de Collage
        </Typography>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Estilo</InputLabel>
          <Select
            value={collageStyle}
            onChange={(e) => setCollageStyle(e.target.value)}
            label="Estilo"
          >
            <MenuItem value="modern">Moderno (Turquesa)</MenuItem>
            <MenuItem value="vintage">Vintage (Marrón)</MenuItem>
            <MenuItem value="minimal">Minimalista (Gris)</MenuItem>
            <MenuItem value="colorful">Colorido (Rosa)</MenuItem>
          </Select>
        </FormControl>
      </Paper>

      {/* Efectos automáticos */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
          Efectos Automáticos
        </Typography>
        
        <FormControlLabel
          control={
            <Switch
              checked={backgroundRemoval}
              onChange={(e) => setBackgroundRemoval(e.target.checked)}
            />
          }
          label="Remover fondos automáticamente"
        />
        
        <FormControlLabel
          control={
            <Switch
              checked={unifiedColors}
              onChange={(e) => setUnifiedColors(e.target.checked)}
            />
          }
          label="Unificar colores (como el ejemplo)"
        />
        
        <FormControlLabel
          control={
            <Switch
              checked={shadowEffects}
              onChange={(e) => setShadowEffects(e.target.checked)}
            />
          }
          label="Efectos de sombra profesional"
        />
        
        <FormControlLabel
          control={
            <Switch
              checked={gradientBackground}
              onChange={(e) => setGradientBackground(e.target.checked)}
            />
          }
          label="Fondo con gradiente"
        />
      </Paper>

      {/* Botón de generación IA */}
      <Button
        variant="contained"
        fullWidth
        startIcon={aiProcessing ? <LinearProgress /> : <AutoAwesomeIcon />}
        onClick={generateAICollage}
        disabled={aiProcessing || selectedProducts.length === 0}
        sx={{ 
          mb: 2, 
          bgcolor: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
          '&:hover': {
            bgcolor: 'linear-gradient(45deg, #FF8E53 30%, #FE6B8B 90%)'
          }
        }}
      >
        {aiProcessing ? 'Generando Collage...' : '🎨 Generar Collage con IA'}
      </Button>
    </Box>
  );

  // Renderizar controles de diseño
  const renderDesignPanel = () => (
    <Box>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
        🎨 Controles de Diseño
      </Typography>
      
      {/* Modo realista */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <FormControlLabel
          control={
            <Switch
              checked={realisticMode}
              onChange={(e) => setRealisticMode(e.target.checked)}
            />
          }
          label="Modo Realista (Sin fondo)"
        />
      </Paper>

      {/* Colores */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
          Colores
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <TextField
              type="color"
              label="Color del título"
              value={titleColor}
              onChange={(e) => setTitleColor(e.target.value)}
              fullWidth
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              type="color"
              label="Color de fondo"
              value={backgroundColor}
              onChange={(e) => setBackgroundColor(e.target.value)}
              fullWidth
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Tamaños */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
          Tamaños
        </Typography>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Tamaño del título: {titleFontSize}px
          </Typography>
          <Slider
            value={titleFontSize}
            onChange={(e, newValue) => setTitleFontSize(newValue)}
            min={20}
            max={60}
            step={5}
          />
        </Box>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Tamaño de cuota: {quotaFontSize}px
          </Typography>
          <Slider
            value={quotaFontSize}
            onChange={(e, newValue) => setQuotaFontSize(newValue)}
            min={20}
            max={60}
            step={5}
          />
        </Box>
      </Paper>
    </Box>
  );

  // Renderizar preview de la placa
  const renderPlacaPreview = () => (
    <Box sx={{ 
      position: 'relative',
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      bgcolor: 'grey.100',
      borderRadius: 2,
      overflow: 'hidden'
    }}>
      <Card
        id="pro-card-container"
        sx={{
          width: 360,
          minHeight: 500,
          background: realisticMode ? "transparent" : backgroundColor,
          borderRadius: `${borderRadius}px`,
          border: realisticMode ? "none" : "1px solid #ddd",
          boxShadow: realisticMode ? "none" : "0 4px 8px rgba(0,0,0,0.1)",
          padding: `${padding}px`,
          fontFamily: `"${selectedFont}", sans-serif`,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {selectedProducts && selectedProducts.length > 0 ? (
          comboMode ? (
            // Modo combo
            <Box sx={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "10px",
              transition: comboAnimation ? "all 0.3s ease" : "none"
            }}>
              {/* Título del combo */}
              {comboTitle && (
                <Box sx={{ 
                  mb: 2, 
                  p: 2, 
                  bgcolor: "rgba(255,255,255,0.9)", 
                  borderRadius: 2,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
                }}>
                  <Typography
                    variant="h4"
                    sx={{
                      color: titleColor,
                      fontSize: `${Math.min(titleFontSize, 28)}px`,
                      fontFamily: `"${selectedFont}", sans-serif`,
                      textShadow: realisticMode ? "1px 1px 2px rgba(0,0,0,0.3)" : "none",
                      lineHeight: 1.2,
                      textAlign: "center",
                      fontWeight: "bold",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px"
                    }}
                  >
                    {comboTitle}
                  </Typography>
                </Box>
              )}

              {/* Contenedor de imágenes compuestas */}
              <Box sx={{
                position: "relative",
                width: "100%",
                height: "200px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "10px 0"
              }}>
                {comboLayers.length > 0 ? (
                  // Renderizar capas compuestas con posiciones IA
                  comboLayers.map((layer, index) => (
                    <img
                      key={index}
                      src={layer.src}
                      alt={`Producto ${index + 1}`}
                      style={{
                        position: "absolute",
                        left: `${layer.x}px`,
                        top: `${layer.y}px`,
                        width: `${layer.width}px`,
                        height: "auto",
                        objectFit: "contain",
                        zIndex: layer.z || index + 1,
                        filter: layer.shadow ? "drop-shadow(0 4px 8px rgba(0,0,0,0.3))" : "none",
                        transition: comboAnimation ? "all 0.3s ease" : "none",
                        transform: `rotate(${layer.rotation || 0}deg)`,
                        background: "transparent",
                        borderRadius: "0",
                        mixBlendMode: "normal",
                      }}
                    />
                  ))
                ) : (
                  // Fallback: layout tradicional
                  selectedProducts.map((product, index) => (
                    <Box 
                      key={index} 
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        textAlign: "center",
                        margin: "0 5px",
                        transition: comboAnimation ? "all 0.3s ease" : "none",
                      }}
                    >
                      <img
                        src={product.imagen || product.imagen_url}
                        alt={product.descripcion || "Sin imagen"}
                        style={{
                          width: selectedProducts.length === 1 ? "100%" : selectedProducts.length === 2 ? "45%" : "30%",
                          height: "auto",
                          objectFit: "contain",
                          borderRadius: realisticMode ? "0" : "5px",
                          background: realisticMode ? "transparent" : "white",
                          margin: "5px 0",
                          filter: realisticMode ? "drop-shadow(0 2px 4px rgba(0,0,0,0.2))" : "none",
                        }}
                      />
                    </Box>
                  ))
                )}
              </Box>

              {/* Información de cuotas del combo */}
              {comboTotalQuota > 0 && (
                <Box sx={{ 
                  mt: 3, 
                  p: 2, 
                  bgcolor: "rgba(76, 175, 80, 0.1)", 
                  borderRadius: 2,
                  border: "2px solid #4CAF50",
                  textAlign: "center"
                }}>
                  <Typography variant="h6" sx={{ fontWeight: "bold", color: "#000", mb: 1 }}>
                    {selectedQuota}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: "bold", color: "#4CAF50", mb: 1 }}>
                    Total sin interés de
                  </Typography>
                  <Typography
                    variant="h3"
                    sx={{
                      fontSize: `${Math.min(quotaFontSize, 36)}px`,
                      fontFamily: `"${selectedFont}", sans-serif`,
                      fontWeight: "bold",
                      color: "#4CAF50",
                      textShadow: realisticMode ? "1px 1px 2px rgba(0,0,0,0.3)" : "none",
                      textTransform: "uppercase",
                      letterSpacing: "1px"
                    }}
                  >
                    ${comboTotalQuota.toLocaleString("es-AR")}
                  </Typography>
                </Box>
              )}
            </Box>
          ) : (
            // Modo single
            <Box sx={{ textAlign: "center", padding: "20px" }}>
              <Typography
                variant="h2"
                sx={{
                  color: titleColor,
                  fontSize: `${titleFontSize}px`,
                  margin: "0 0 20px 0",
                  fontFamily: `"${selectedFont}", sans-serif`,
                  textShadow: realisticMode ? "1px 1px 2px rgba(0,0,0,0.3)" : "none",
                  lineHeight: 1.2,
                }}
              >
                {selectedProducts[0]?.descripcion}
              </Typography>

              <img
                src={selectedProducts[0]?.imagen || selectedProducts[0]?.imagen_url}
                alt={selectedProducts[0]?.descripcion || "Sin imagen"}
                style={{
                  width: "100%",
                  height: "auto",
                  objectFit: "contain",
                  borderRadius: realisticMode ? "0" : "5px",
                  background: realisticMode ? "transparent" : "white",
                  margin: "20px 0",
                  filter: realisticMode ? "drop-shadow(0 2px 4px rgba(0,0,0,0.2))" : "none",
                }}
              />

              <Box sx={{ marginTop: "20px" }}>
                <Typography variant="h6" sx={{ fontWeight: "bold", color: "#000", margin: "5px 0" }}>
                  {selectedQuota}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: "bold", color: "green", margin: 0 }}>
                  Sin interés de
                </Typography>
                <Typography
                  variant="h3"
                  sx={{
                    fontSize: `${quotaFontSize}px`,
                    fontFamily: `"${selectedFont}", sans-serif`,
                    fontWeight: "bold",
                    color: "green",
                    textAlign: "center",
                    textShadow: realisticMode ? "1px 1px 2px rgba(0,0,0,0.3)" : "none",
                  }}
                >
                  {customQuotaValue || "$0"}
                </Typography>
              </Box>
            </Box>
          )
        ) : (
          <Box sx={{ textAlign: "center", color: "#666", p: 4 }}>
            <CameraIcon sx={{ fontSize: 80, color: "grey.400", mb: 2 }} />
            <Typography variant="h6">
              Selecciona productos para comenzar
            </Typography>
            <Typography variant="body2">
              Usa el panel de la izquierda para seleccionar productos
            </Typography>
          </Box>
        )}
      </Card>
    </Box>
  );

  // Renderizar panel principal según el modo activo
  const renderMainPanel = () => {
    switch (activeMode) {
      case 'products':
        return renderProductsPanel();
      case 'collage':
        return renderCollagePanel();
      case 'design':
        return renderDesignPanel();
      default:
        return renderProductsPanel();
    }
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Paper sx={{ p: 2, borderRadius: 0, boxShadow: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
              <PremiumIcon />
            </Avatar>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                🎨 Placa Generator PRO
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Herramienta revolucionaria para emprendedoras
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              sx={{ bgcolor: 'success.main' }}
              onClick={onSave}
            >
              Guardar
            </Button>
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={captureImage}
              sx={{ bgcolor: 'primary.main' }}
            >
              Descargar
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Main Content */}
      <Box sx={{ flex: 1, display: 'flex' }}>
        {/* Sidebar */}
        <Paper sx={{ width: 350, p: 2, borderRadius: 0, boxShadow: 1, overflow: 'auto' }}>
          {/* Mode Tabs */}
          <Box sx={{ mb: 3 }}>
            <Grid container spacing={1}>
              <Grid item xs={4}>
                <Button
                  variant={activeMode === 'products' ? 'contained' : 'outlined'}
                  size="small"
                  fullWidth
                  onClick={() => setActiveMode('products')}
                  startIcon={<ViewComfyIcon />}
                >
                  Productos
                </Button>
              </Grid>
              <Grid item xs={4}>
                <Button
                  variant={activeMode === 'collage' ? 'contained' : 'outlined'}
                  size="small"
                  fullWidth
                  onClick={() => setActiveMode('collage')}
                  startIcon={<AutoAwesomeIcon />}
                >
                  Collage
                </Button>
              </Grid>
              <Grid item xs={4}>
                <Button
                  variant={activeMode === 'design' ? 'contained' : 'outlined'}
                  size="small"
                  fullWidth
                  onClick={() => setActiveMode('design')}
                  startIcon={<PaletteIcon />}
                >
                  Diseño
                </Button>
              </Grid>
            </Grid>
          </Box>

          {/* Panel Content */}
          <Box sx={{ maxHeight: 'calc(100vh - 200px)', overflow: 'auto' }}>
            {renderMainPanel()}
          </Box>
        </Paper>

        {/* Canvas Area */}
        <Box sx={{ flex: 1, p: 2 }}>
          {renderPlacaPreview()}
        </Box>
      </Box>
    </Box>
  );
};

export default PlacaGeneratorPro;