import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "./utils/axios";
import DialogResponsive from "./components/DialogResponsive";
import { 
  Autocomplete, 
  TextField, 
  Button, 
  MenuItem, 
  Select, 
  FormControl, 
  InputLabel, 
  Typography, 
  Grid, 
  Divider,
  Card,
  CardContent,
  Chip,
  Box,
  Slider,
  Alert,
  Snackbar,
  Tabs,
  Tab,
  Paper,
  Switch,
  FormControlLabel,
  IconButton
} from "@mui/material";
import {
  Palette as PaletteIcon,
  Save as SaveIcon,
  AutoAwesome as AutoAwesomeIcon,
  Lightbulb as LightbulbIcon,
  Download as DownloadIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  DragIndicator as DragIcon,
  Visibility as PreviewIcon,
  Shuffle as ShuffleIcon,
  Speed as SpeedIcon,
  // Star as StarIcon, // Temporalmente oculto
} from "@mui/icons-material";
import CardGenerator from "./components/CardGenerator";
// import PlacaGeneratorPro from "./components/PlacaGeneratorPro"; // Temporalmente oculto hasta estar al 100%
import WebFont from "webfontloader";
import Navbar from "./components/Navbar";
import { buildComboTitle, composeCombo } from "./utils/aiComposer";

const GeneradorDePlacas = () => {
  // Estados principales
  const [products, setProducts] = useState(() => []);
  const [banks, setBanks] = useState(() => []);
  const [selectedQuota, setSelectedQuota] = useState("3 cuotas");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState(() => []); // Nuevo: múltiples productos
  
  // Memoizar el valor para asegurar que siempre sea un array
  const safeSelectedProducts = useMemo(() => {
    return Array.isArray(selectedProducts) ? selectedProducts : [];
  }, [selectedProducts]);
  const [selectedBanks, setSelectedBanks] = useState(() => []);
  const [customQuotaValue, setCustomQuotaValue] = useState("");
  const [showCard, setShowCard] = useState(false);
  
  // Estados de diseño
  const [titleColor, setTitleColor] = useState("#8A2BE2");
  const [selectedFont, setSelectedFont] = useState("Roboto");
  const [titleFontSize, setTitleFontSize] = useState(35);
  const [quotaFontSize, setQuotaFontSize] = useState(35);
  const [backgroundColor, setBackgroundColor] = useState("#FFFFFF");
  const [borderRadius, setBorderRadius] = useState(10);
  const [padding, setPadding] = useState(10);
  
  // Estados de IA y templates
  const [activeTab, setActiveTab] = useState(0);
  const [aiSuggestions, setAiSuggestions] = useState(() => []);
  const [savedDesigns, setSavedDesigns] = useState(() => []);
  const [autoOptimize, setAutoOptimize] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // Estados para combos y IA avanzada
  const [comboMode, setComboMode] = useState(false);
  const [aiComboSuggestions, setAiComboSuggestions] = useState(() => []);
  const [realisticMode, setRealisticMode] = useState(false); // Siempre arranca en false
  const [aiLayoutOptimization, setAiLayoutOptimization] = useState(false);
  const [aiColorHarmony, setAiColorHarmony] = useState(false);
  
  // Estados para UX mejorada del modo combo
  const [showComboPreview, setShowComboPreview] = useState(false);
  const [comboLayout, setComboLayout] = useState("auto"); // auto, horizontal, vertical, grid
  const [comboSpacing, setComboSpacing] = useState(15);
  const [comboAnimation] = useState(true);
  const [comboTitle, setComboTitle] = useState("");
  const [comboLayers, setComboLayers] = useState([]);
  const [comboTotalQuota, setComboTotalQuota] = useState(0);
  
  // Estados para modo PRO - Temporalmente oculto
  // const [proMode, setProMode] = useState(false);
  // const [showProFeatures, setShowProFeatures] = useState(false);
  
  // Estados de UI
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const navigate = useNavigate();

  // Templates predefinidos de diseño
  const designTemplates = useMemo(() => [
    {
      id: "modern",
      name: "Moderno",
      colors: { primary: "#2196F3", secondary: "#FFC107", background: "#FFFFFF" },
      fonts: { title: "Roboto", quota: "Montserrat" },
      sizes: { title: 40, quota: 32 },
      borderRadius: 15,
      padding: 15
    },
    {
      id: "elegant",
      name: "Elegante",
      colors: { primary: "#9C27B0", secondary: "#FF9800", background: "#FAFAFA" },
      fonts: { title: "Playfair Display", quota: "Lato" },
      sizes: { title: 45, quota: 30 },
      borderRadius: 8,
      padding: 20
    },
    {
      id: "bold",
      name: "Audaz",
      colors: { primary: "#F44336", secondary: "#4CAF50", background: "#FFFFFF" },
      fonts: { title: "Oswald", quota: "Roboto" },
      sizes: { title: 50, quota: 35 },
      borderRadius: 5,
      padding: 12
    },
    {
      id: "minimal",
      name: "Minimalista",
      colors: { primary: "#212121", secondary: "#757575", background: "#FFFFFF" },
      fonts: { title: "Roboto", quota: "Roboto" },
      sizes: { title: 35, quota: 28 },
      borderRadius: 0,
      padding: 25
    }
  ], []);

  // Templates específicos para combos
  const comboDesignTemplates = useMemo(() => [
    {
      id: "combo-horizontal",
      name: "Combo Horizontal",
      description: "Perfecto para 2-3 productos",
      layout: "horizontal",
      colors: { primary: "#2196F3", secondary: "#FFC107", background: "#FFFFFF" },
      spacing: 20,
      sizes: { title: 30, quota: 25 },
      borderRadius: 12,
      padding: 15
    },
    {
      id: "combo-grid",
      name: "Combo Grid",
      description: "Ideal para 4+ productos",
      layout: "grid",
      colors: { primary: "#4CAF50", secondary: "#FF9800", background: "#F5F5F5" },
      spacing: 15,
      sizes: { title: 25, quota: 20 },
      borderRadius: 8,
      padding: 12
    },
    {
      id: "combo-vertical",
      name: "Combo Vertical",
      description: "Elegante para productos premium",
      layout: "vertical",
      colors: { primary: "#9C27B0", secondary: "#E91E63", background: "#FFFFFF" },
      spacing: 25,
      sizes: { title: 35, quota: 28 },
      borderRadius: 15,
      padding: 20
    },
    {
      id: "combo-magazine",
      name: "Estilo Revista",
      description: "Layout asimétrico moderno",
      layout: "magazine",
      colors: { primary: "#F44336", secondary: "#FFC107", background: "#FFFFFF" },
      spacing: 18,
      sizes: { title: 32, quota: 26 },
      borderRadius: 10,
      padding: 16
    }
  ], []);

  // Paleta de colores sugeridos
  const colorPalettes = useMemo(() => [
    { name: "Azul Profesional", colors: ["#1976D2", "#42A5F5", "#90CAF9"] },
    { name: "Verde Naturaleza", colors: ["#388E3C", "#66BB6A", "#A5D6A7"] },
    { name: "Púrpura Creativo", colors: ["#7B1FA2", "#AB47BC", "#CE93D8"] },
    { name: "Naranja Energía", colors: ["#F57C00", "#FF9800", "#FFB74D"] },
    { name: "Rosa Moderno", colors: ["#C2185B", "#E91E63", "#F48FB1"] }
  ], []);

  // Mapa de cuotas con useMemo para evitar recreación
  const cuotasMap = useMemo(() => ({
    "3 cuotas": "tres_sin_interes",
    "6 cuotas": "seis_sin_interes",
    "10 cuotas": "diez_sin_interes",
    "12 cuotas": "doce_sin_interes",
    "14 cuotas": "catorce_sin_interes",
    "18 cuotas": "dieciocho_sin_interes",
    "24 cuotas": "veinticuatro_sin_interes"
  }), []);

  // Cargar fuentes web
  useEffect(() => {
  WebFont.load({
    google: {
      families: [
        "Roboto",
        "Montserrat",
        "Lato",
        "Poppins",
        "Playfair Display",
        "Oswald",
        "Raleway",
        "Lobster",
          "Inter",
          "Source Sans Pro"
      ],
    },
  });
}, []);

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
        
        // Asegurar que selectedProducts siempre sea un array
        setSelectedProducts(prev => prev || []);
      } catch (error) {
        console.error("Error al obtener datos:", error);
        showSnackbar("Error al cargar datos", "error");
      }
    };

    fetchData();
  }, []);

  // Cargar diseños guardados
  useEffect(() => {
    const saved = localStorage.getItem("savedPlacaDesigns");
    if (saved) {
      try {
        setSavedDesigns(JSON.parse(saved));
      } catch (error) {
        console.error("Error al cargar diseños guardados:", error);
      }
    }

    // Asegurar que selectedProducts siempre sea un array
    setSelectedProducts(prev => prev || []);
  }, []);

  // Actualizar combo title y capas cuando cambien los productos seleccionados
  useEffect(() => {
    if (comboMode && safeSelectedProducts.length > 0) {
      // Generar título del combo
      const title = buildComboTitle(safeSelectedProducts);
      setComboTitle(title);

      // Generar capas compuestas
      const productImages = safeSelectedProducts.map(p => p.imagen || p.imagen_url).filter(Boolean);
      if (productImages.length > 0) {
        composeCombo(productImages, { layout: comboLayout })
          .then(layers => setComboLayers(layers))
          .catch(error => console.error("Error generando capas:", error));
      }
    } else {
      setComboTitle("");
      setComboLayers([]);
    }
  }, [comboMode, safeSelectedProducts, comboLayout]);

  // Función para calcular el total de cuotas en modo combo
  const calculateComboTotalQuota = useCallback((products, quota) => {
    if (!comboMode || !products || products.length === 0 || !quota) return 0;
    
    let total = 0;
    products.forEach(product => {
      const cuotaKey = cuotasMap[quota];
      if (cuotaKey && product[cuotaKey] && product[cuotaKey] !== "NO") {
        try {
          // Limpiar el valor y convertir a número
          const cleanValue = product[cuotaKey].toString()
            .replace(/[^\d.,]/g, '') // Remover todo excepto dígitos, comas y puntos
            .replace(',', '.'); // Convertir coma decimal a punto
          
          const numericValue = parseFloat(cleanValue);
          if (!isNaN(numericValue) && numericValue > 0) {
            total += numericValue;
          }
        } catch (error) {
          console.warn('Error parsing quota value:', product[cuotaKey], error);
        }
      }
    });
    
    // Redondear a 2 decimales para evitar errores de precisión
    return Math.round(total * 100) / 100;
  }, [comboMode, cuotasMap]);

  // Actualizar total de cuotas del combo
  useEffect(() => {
    if (comboMode && safeSelectedProducts.length > 0 && selectedQuota) {
      const total = calculateComboTotalQuota(safeSelectedProducts, selectedQuota);
      setComboTotalQuota(total);
    } else {
      setComboTotalQuota(0);
    }
  }, [comboMode, safeSelectedProducts, selectedQuota, calculateComboTotalQuota]);

  // Funciones auxiliares (definidas primero para evitar errores de hoisting)
  const formatPrice = useCallback((value) => {
    if (!value) return "$0";
    let numericValue = parseFloat(value.toString().replace(/[^0-9.-]/g, ""));
    return `$${numericValue.toLocaleString("es-AR")}`;
  }, []);

  const getQuotaValue = useCallback((product, quota) => {
    if (!product || !quota) return "";
    const cuotaKey = cuotasMap[quota];
    if (cuotaKey && product[cuotaKey] && product[cuotaKey] !== "NO") {
      try {
        return formatPrice(product[cuotaKey]);
      } catch {
        return "";
      }
    }
    return "";
  }, [cuotasMap, formatPrice]);

  // Función para mostrar notificaciones
  const showSnackbar = (message, severity = "success") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  // Función para aplicar template
  const applyTemplate = useCallback((template) => {
    setTitleColor(template.colors.primary);
    setBackgroundColor(template.colors.background);
    setSelectedFont(template.fonts.title);
    setTitleFontSize(template.sizes.title);
    setQuotaFontSize(template.sizes.quota);
    setBorderRadius(template.borderRadius);
    setPadding(template.padding);
    showSnackbar(`Template "${template.name}" aplicado`, "success");
  }, []);

  // Función para generar sugerencias de IA
  const generateAISuggestions = useCallback(() => {
    if (!selectedProduct && (selectedProducts || []).length === 0) {
      showSnackbar("Selecciona al menos un producto primero", "warning");
      return;
    }

    const suggestions = [];
    const productsToAnalyze = comboMode ? safeSelectedProducts : [selectedProduct];
    
    productsToAnalyze.forEach(product => {
      if (!product) return;
      
      // Sugerencia basada en el tipo de producto
      if (product.linea?.toLowerCase().includes("cocina")) {
        suggestions.push({
          type: "color",
          message: `Para ${product.descripcion}, considera colores cálidos como naranja o rojo`,
          colors: ["#FF5722", "#FF9800", "#F44336"],
          productId: product.id
        });
      }

      // Sugerencia basada en el precio
      const price = parseFloat(product[cuotasMap[selectedQuota]] || 0);
      if (price > 100000) {
        suggestions.push({
          type: "font",
          message: `Para ${product.descripcion} (premium), usa fuentes elegantes`,
          fonts: ["Playfair Display", "Lora", "Merriweather"],
          productId: product.id
        });
      }

      // Sugerencia basada en la cuota
      if (selectedQuota.includes("24")) {
        suggestions.push({
          type: "layout",
          message: `Para ${product.descripcion} con cuotas largas, destaca el beneficio`,
          colors: ["#4CAF50", "#8BC34A", "#CDDC39"],
          productId: product.id
        });
      }
    });

    setAiSuggestions(suggestions);
    setShowSuggestions(true);
    showSnackbar("Sugerencias de IA generadas", "info");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProduct, safeSelectedProducts, selectedQuota, cuotasMap, comboMode]);

  // Función para generar sugerencias de combos con IA
  const generateAIComboSuggestions = useCallback(() => {
    if (safeSelectedProducts.length < 2) {
      showSnackbar("Selecciona al menos 2 productos para generar sugerencias de combo", "warning");
      return;
    }

    const suggestions = [];
    
    // Análisis de compatibilidad de productos
    const productTypes = safeSelectedProducts.map(p => p.linea?.toLowerCase() || "");
    const hasCocina = productTypes.some(type => type.includes("cocina"));
    const hasLimpieza = productTypes.some(type => type.includes("limpieza"));
    const hasHogar = productTypes.some(type => type.includes("hogar"));

    // Sugerencias de layout para combos
    if (hasCocina && hasLimpieza) {
      suggestions.push({
        type: "layout",
        message: "Combo Cocina + Limpieza: Usa layout horizontal con separación visual",
        layout: "horizontal",
        colors: ["#FF5722", "#2196F3", "#FFC107"]
      });
    }

    if (hasHogar && safeSelectedProducts.length >= 3) {
      suggestions.push({
        type: "layout",
        message: "Combo Hogar múltiple: Layout en grid con jerarquía visual",
        layout: "grid",
        colors: ["#9C27B0", "#4CAF50", "#FF9800", "#2196F3"]
      });
    }

    // Sugerencias de colores armónicos
    if (safeSelectedProducts.length >= 2) {
      suggestions.push({
        type: "color",
        message: "Paleta armónica para combo: Colores complementarios y análogos",
        colors: generateHarmoniousColors(safeSelectedProducts.length),
        layout: "complementary"
      });
    }

    setAiComboSuggestions(suggestions);
    showSnackbar("Sugerencias de combo con IA generadas", "info");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safeSelectedProducts]);

  // Función para generar colores armónicos
  const generateHarmoniousColors = useCallback((count) => {
    const baseColors = [
      "#2196F3", "#FF9800", "#4CAF50", "#9C27B0", "#F44336",
      "#00BCD4", "#FFC107", "#8BC34A", "#E91E63", "#795548"
    ];
    
    if (count <= baseColors.length) {
      return baseColors.slice(0, count);
    }

    // Generar colores armónicos adicionales
    const additionalColors = [];
    for (let i = 0; i < count - baseColors.length; i++) {
      const hue = (i * 137.5) % 360; // Número áureo para distribución armónica
      const saturation = 60 + (i % 20);
      const lightness = 50 + (i % 15);
      additionalColors.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
    }

    return [...baseColors, ...additionalColors];
  }, []);

  // Función para optimización automática de layout con IA
  const optimizeLayoutWithAI = useCallback(() => {
    if (safeSelectedProducts.length === 0) return;

    const productCount = safeSelectedProducts.length;
    let optimalLayout = "vertical";
    let optimalSpacing = 20;
    let optimalFontSizes = { title: 35, quota: 28 };

    // IA determina el mejor layout basado en cantidad y tipos de productos
    if (productCount === 1) {
      optimalLayout = "centered";
      optimalFontSizes = { title: 40, quota: 32 };
    } else if (productCount === 2) {
      optimalLayout = "horizontal";
      optimalSpacing = 15;
      optimalFontSizes = { title: 35, quota: 28 };
    } else if (productCount === 3) {
      optimalLayout = "triangle";
      optimalSpacing = 12;
      optimalFontSizes = { title: 30, quota: 25 };
    } else if (productCount >= 4) {
      optimalLayout = "grid";
      optimalSpacing = 10;
      optimalFontSizes = { title: 28, quota: 22 };
    }

    // Aplicar optimizaciones
    setTitleFontSize(optimalFontSizes.title);
    setQuotaFontSize(optimalFontSizes.quota);
    setPadding(optimalSpacing);

    // Optimizar colores para el layout
    if (aiColorHarmony) {
      const harmoniousColors = generateHarmoniousColors(productCount);
      setTitleColor(harmoniousColors[0]);
      if (harmoniousColors.length > 1) {
        setBackgroundColor(harmoniousColors[1]);
      }
    }

    showSnackbar(`Layout optimizado con IA: ${optimalLayout}`, "success");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safeSelectedProducts, aiColorHarmony, generateHarmoniousColors]);

  // Función para guardar diseño
  const saveDesign = useCallback(() => {
    if (!selectedProduct) {
      showSnackbar("Selecciona un producto primero", "warning");
      return;
    }

    const design = {
      id: Date.now(),
      name: `Diseño ${selectedProduct.descripcion?.substring(0, 20)}...`,
      product: selectedProduct,
      quota: selectedQuota,
      colors: { title: titleColor, background: backgroundColor },
      fonts: { title: selectedFont, quota: "Roboto" },
      sizes: { title: titleFontSize, quota: quotaFontSize },
      borderRadius,
      padding,
      timestamp: new Date().toISOString()
    };

    const updatedDesigns = [...savedDesigns, design];
    setSavedDesigns(updatedDesigns);
    localStorage.setItem("savedPlacaDesigns", JSON.stringify(updatedDesigns));
    showSnackbar("Diseño guardado exitosamente", "success");
  }, [selectedProduct, selectedQuota, titleColor, backgroundColor, selectedFont, titleFontSize, quotaFontSize, borderRadius, padding, savedDesigns]);

  // Función para cargar diseño guardado
  const loadDesign = useCallback((design) => {
    setSelectedProduct(design.product);
    setSelectedQuota(design.quota);
    setTitleColor(design.colors.title);
    setBackgroundColor(design.colors.background);
    setSelectedFont(design.fonts.title);
    setTitleFontSize(design.sizes.title);
    setQuotaFontSize(design.sizes.quota);
    setBorderRadius(design.borderRadius);
    setPadding(design.padding);
    setCustomQuotaValue(getQuotaValue(design.product, design.quota));
    showSnackbar(`Diseño "${design.name}" cargado`, "success");
  }, [getQuotaValue]);

  // Función para optimización automática
  const autoOptimizeDesign = useCallback(() => {
    if (!selectedProduct) return;

    // Optimización automática basada en el producto
    const productType = selectedProduct.linea?.toLowerCase();
    const price = parseFloat(selectedProduct[cuotasMap[selectedQuota]] || 0);

    if (productType?.includes("cocina")) {
      setTitleColor("#FF5722");
      setBackgroundColor("#FFF3E0");
    } else if (productType?.includes("limpieza")) {
      setTitleColor("#2196F3");
      setBackgroundColor("#E3F2FD");
    } else if (price > 100000) {
      setTitleColor("#9C27B0");
      setSelectedFont("Playfair Display");
      setTitleFontSize(45);
    }

    showSnackbar("Diseño optimizado automáticamente", "success");
  }, [selectedProduct, selectedQuota, cuotasMap]);



  const handleQuotaChange = (event) => {
    const newQuota = event.target.value;
    setSelectedQuota(newQuota);
    setCustomQuotaValue(getQuotaValue(selectedProduct, newQuota));
    setShowCard(false);
  };

  const handleSelectProduct = (event, newValue) => {
    setSelectedProduct(newValue);
    setCustomQuotaValue(getQuotaValue(newValue, selectedQuota));
    setShowCard(false);
    
    // Aplicar optimización automática si está habilitada
    if (autoOptimize) {
      setTimeout(autoOptimizeDesign, 500);
    }
  };

  // Función para manejar selección múltiple de productos (modo combo)
  const handleSelectMultipleProducts = (event, newValues) => {
    // Asegurar que newValues sea siempre un array
    const validValues = newValues || [];
    setSelectedProducts(validValues);
    setShowCard(false);
    
    // Si solo hay un producto seleccionado, también actualizar selectedProduct
    if (validValues.length === 1) {
      setSelectedProduct(validValues[0]);
      setCustomQuotaValue(getQuotaValue(validValues[0], selectedQuota));
    } else if (validValues.length === 0) {
      setSelectedProduct(null);
      setCustomQuotaValue("");
    }
    
    // Aplicar optimización automática de layout si está habilitada
    if (aiLayoutOptimization && validValues.length > 0) {
      setTimeout(optimizeLayoutWithAI, 500);
    }
  };

  // Función para alternar entre modo single y combo
  const toggleComboMode = () => {
    setComboMode(!comboMode);
    if (!comboMode) {
      // Cambiar a modo combo
      setSelectedProducts(selectedProduct ? [selectedProduct] : []);
      setShowComboPreview(true);
      showSnackbar("Modo combo activado - Selecciona múltiples productos", "info");
    } else {
      // Cambiar a modo single
      setSelectedProduct(safeSelectedProducts.length > 0 ? safeSelectedProducts[0] : null);
      setSelectedProducts([]);
      setShowComboPreview(false);
      showSnackbar("Modo single activado", "info");
    }
    setShowCard(false);
  };

  // Función para aplicar template de combo
  const applyComboTemplate = useCallback((template) => {
    setComboLayout(template.layout);
    setComboSpacing(template.spacing);
    setTitleColor(template.colors.primary);
    setBackgroundColor(template.colors.background);
    setTitleFontSize(template.sizes.title);
    setQuotaFontSize(template.sizes.quota);
    setBorderRadius(template.borderRadius);
    setPadding(template.padding);
    
    showSnackbar(`Template "${template.name}" aplicado`, "success");
  }, []);

  // Función para reordenar productos en combo (para uso futuro)
  // const reorderComboProducts = useCallback((fromIndex, toIndex) => {
  //   const newProducts = [...safeSelectedProducts];
  //   const [movedProduct] = newProducts.splice(fromIndex, 1);
  //   newProducts.splice(toIndex, 0, movedProduct);
  //   setSelectedProducts(newProducts);
  //   showSnackbar("Productos reordenados", "info");
  // }, [safeSelectedProducts]);

  // Función para remover producto del combo
  const removeFromCombo = useCallback((productIndex) => {
    const newProducts = safeSelectedProducts.filter((_, index) => index !== productIndex);
    setSelectedProducts(newProducts);
    showSnackbar("Producto removido del combo", "info");
  }, [safeSelectedProducts]);

  // Función para generar layout automático
  const generateAutoLayout = useCallback(() => {
    const productCount = safeSelectedProducts.length;
    let newLayout = "auto";
    
    if (productCount === 1) {
      newLayout = "vertical";
    } else if (productCount === 2) {
      newLayout = "horizontal";
    } else if (productCount === 3) {
      newLayout = "triangle";
    } else if (productCount >= 4) {
      newLayout = "grid";
    }
    
    setComboLayout(newLayout);
    showSnackbar(`Layout automático: ${newLayout}`, "info");
  }, [safeSelectedProducts]);

  const handleBankChange = (event, newValue) => {
    setSelectedBanks(newValue);
    setShowCard(false);
  };

  const handleApply = () => {
    const hasProducts = comboMode ? safeSelectedProducts.length > 0 : selectedProduct;
    
    if (hasProducts) {
    setShowCard(true);
      showSnackbar(
        comboMode 
          ? `Vista previa de combo con ${safeSelectedProducts.length} productos generada` 
          : "Vista previa generada", 
        "success"
      );
    } else {
      showSnackbar(
        comboMode 
          ? "Selecciona al menos un producto para el combo" 
          : "Selecciona un producto primero", 
        "warning"
      );
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("activeSession");
    navigate("/login");
  };

  // Modo PRO temporalmente oculto hasta estar al 100%
  // if (proMode) {
  //   return (
  //     <>
  //       <Navbar
  //         title="🎨 Placa Generator PRO - Herramienta Revolucionaria"
  //         onLogout={handleLogout}
  //         user={{ username: localStorage.getItem("activeSession") || "" }}
  //       />
  //       <PlacaGeneratorPro 
  //         products={products}
  //         banks={banks}
  //         onSave={() => showSnackbar("Placa guardada exitosamente", "success")}
  //         onExport={() => showSnackbar("Placa exportada exitosamente", "success")}
  //       />
  //     </>
  //   );
  // }

  return (
    <>
      <Navbar
        title="Generador de Placas Inteligente"
        onLogout={handleLogout}
        user={{ username: localStorage.getItem("activeSession") || "" }}
      />
      
      <Box sx={{ maxWidth: 1400, margin: "0 auto", padding: "20px" }}>
        <Grid container spacing={3}>
          {/* Panel de Control */}
          <Grid item xs={12} md={5}>
            <Paper elevation={3} sx={{ p: 3, height: "fit-content" }}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                <Typography variant="h5" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <AutoAwesomeIcon color="primary" />
                  Panel de Control
                </Typography>
                {/* Botón PRO temporalmente oculto */}
                {/* <Button
                  variant={proMode ? "contained" : "outlined"}
                  color="warning"
                  startIcon={<StarIcon />}
                  onClick={() => setProMode(!proMode)}
                  sx={{
                    bgcolor: proMode ? "linear-gradient(45deg, #FFD700 30%, #FFA500 90%)" : "transparent",
                    color: proMode ? "white" : "warning.main",
                    fontWeight: "bold",
                    "&:hover": {
                      bgcolor: proMode ? "linear-gradient(45deg, #FFA500 30%, #FF8C00 90%)" : "warning.50"
                    }
                  }}
                >
                  {proMode ? "MODO PRO ACTIVO" : "ACTIVAR MODO PRO"}
                </Button> */}
              </Box>

              {/* Alert PRO temporalmente oculto */}
              {/* {proMode && (
                <Alert 
                  severity="success" 
                  sx={{ mb: 2, bgcolor: "linear-gradient(45deg, #4CAF50 30%, #45a049 90%)", color: "white" }}
                >
                  <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
                    🚀 MODO PRO ACTIVADO - EXPERIENCIA REVOLUCIONARIA
                  </Typography>
                  <Typography variant="body2">
                    • IA Avanzada para composición automática<br/>
                    • Efectos visuales profesionales<br/>
                    • Templates premium<br/>
                    • Herramientas de diseño avanzadas<br/>
                    • Exportación en alta calidad
                  </Typography>
                </Alert>
              )} */}
              
              <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 2 }}>
                <Tab label="Producto" />
                <Tab label="Diseño" />
                <Tab label="IA Avanzada" />
                <Tab label={comboMode ? "Templates Combo" : "Templates"} />
                <Tab label="Guardados" />
              </Tabs>

              {/* Tab: Producto */}
              {activeTab === 0 && (
                <Box>
                  {/* Toggle para modo combo con indicador visual */}
                  <Paper elevation={2} sx={{ p: 2, mb: 2, bgcolor: comboMode ? "#E3F2FD" : "#FAFAFA" }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={comboMode}
                          onChange={toggleComboMode}
                          color="primary"
                          size="medium"
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
                              label={`${safeSelectedProducts.length} productos`} 
                              size="small" 
                              color="primary" 
                              variant="outlined"
                            />
                          )}
                        </Box>
                      }
                    />
                    {comboMode && (
                      <Box sx={{ mt: 1, display: "flex", gap: 1, flexWrap: "wrap" }}>
                        <Chip 
                          icon={<PreviewIcon />}
                          label="Preview" 
                          size="small" 
                          color={showComboPreview ? "primary" : "default"}
                          onClick={() => setShowComboPreview(!showComboPreview)}
                          variant={showComboPreview ? "filled" : "outlined"}
                        />
                        <Chip 
                          icon={<ShuffleIcon />}
                          label="Auto Layout" 
                          size="small" 
                          color="secondary"
                          onClick={generateAutoLayout}
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
                    )}
                  </Paper>

                  {comboMode ? (
                    // Modo combo - selección múltiple mejorada
                    <Box>
          <Autocomplete
                        multiple
            options={products || []}
            fullWidth
            getOptionLabel={(option) => option?.descripcion || ""}
                        onChange={handleSelectMultipleProducts}
                        value={safeSelectedProducts}
                        renderInput={(params) => (
                          <TextField 
                            {...params} 
                            label="Selecciona Productos para el Combo" 
                            variant="outlined" 
                            fullWidth 
                            sx={{ mb: 2 }}
                            helperText={`${safeSelectedProducts.length} productos seleccionados`}
                          />
                        )}
                        renderTags={(value, getTagProps) =>
                          (value || []).map((option, index) => (
                            <Chip
                              key={option?.id || index}
                              label={(option?.descripcion || "Sin descripción")?.substring(0, 20) + "..."}
                              {...getTagProps({ index })}
                              color="primary"
                              variant="outlined"
                              deleteIcon={<RemoveIcon />}
                              onDelete={() => removeFromCombo(index)}
                            />
                          ))
                        }
                      />
                      
                      {/* Lista de productos seleccionados con controles */}
                      {safeSelectedProducts.length > 0 && (
                        <Paper elevation={1} sx={{ p: 2, mt: 2, bgcolor: "#F8F9FA" }}>
                          <Typography variant="subtitle2" gutterBottom color="primary">
                            Productos en el Combo ({safeSelectedProducts.length})
            </Typography>
                          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                            {safeSelectedProducts.map((product, index) => (
                              <Box 
                                key={product?.id || index}
                                sx={{ 
          display: "flex",
                                  alignItems: "center", 
                                  gap: 1, 
                                  p: 1, 
                                  bgcolor: "white", 
                                  borderRadius: 1,
                                  border: "1px solid #E0E0E0"
                                }}
                              >
                                <DragIcon color="disabled" />
                                <Box sx={{ flex: 1 }}>
                                  <Typography variant="body2" noWrap>
                                    {product?.descripcion || "Sin descripción"}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {product?.linea || "Sin categoría"}
                                  </Typography>
                                </Box>
                                <Chip 
                                  label={`#${index + 1}`} 
                                  size="small" 
                                  color="primary" 
                                  variant="outlined"
                                />
                                <IconButton 
                                  size="small" 
                                  onClick={() => removeFromCombo(index)}
                                  color="error"
                                >
                                  <RemoveIcon />
                                </IconButton>
                              </Box>
                            ))}
                          </Box>
                        </Paper>
                      )}
                    </Box>
                  ) : (
                    // Modo single - selección única
          <Autocomplete
            options={products || []}
            fullWidth
            getOptionLabel={(option) => option?.descripcion || ""}
            onChange={handleSelectProduct}
                      renderInput={(params) => (
                        <TextField 
                          {...params} 
                          label="Selecciona un Producto" 
                          variant="outlined" 
                          fullWidth 
                          sx={{ mb: 2 }}
                        />
                      )}
                    />
                  )}
                  
                  <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={6}>
                      <FormControl fullWidth>
                        <InputLabel>Cuotas</InputLabel>
                <Select value={selectedQuota} onChange={handleQuotaChange} variant="outlined">
                  {Object.keys(cuotasMap).map((label) => (
                            <MenuItem key={label} value={label}>{label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Valor de la cuota"
                variant="outlined"
                fullWidth
                value={customQuotaValue}
                onChange={(event) => setCustomQuotaValue(event.target.value)}
                placeholder="$0.00"
              />
            </Grid>
          </Grid>
      
              <Autocomplete
                multiple
                options={banks || []}
                fullWidth
                getOptionLabel={(option) => option?.banco || ""}
                onChange={handleBankChange}
                value={selectedBanks}
                renderInput={(params) => (
                  <TextField
                    {...params}
                        label="Bancos"
                    variant="outlined"
                    fullWidth
                        sx={{ mb: 2 }}
                      />
                    )}
                  />

                  <FormControlLabel
                    control={
                      <Switch
                        checked={autoOptimize}
                        onChange={(e) => setAutoOptimize(e.target.checked)}
                      />
                    }
                    label="Optimización automática con IA"
                    sx={{ mb: 2 }}
                  />

                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    onClick={handleApply}
                    startIcon={<AutoAwesomeIcon />}
                    sx={{ mb: 2 }}
                  >
                    Generar Vista Previa
                  </Button>
                </Box>
              )}

              {/* Tab: Diseño */}
              {activeTab === 1 && (
                <Box>
                  <Typography variant="h6" gutterBottom>Colores</Typography>
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={6}>
                      <TextField
                        label="Color del título"
                        type="color"
                        value={titleColor}
                        onChange={(e) => setTitleColor(e.target.value)}
                        fullWidth
                        InputProps={{
                          startAdornment: <PaletteIcon sx={{ mr: 1 }} />
                        }}
              />      
            </Grid>
                    <Grid item xs={6}>
                      <TextField
                        label="Color de fondo"
                        type="color"
                        value={backgroundColor}
                        onChange={(e) => setBackgroundColor(e.target.value)}
                        fullWidth
              />      
          </Grid>
          </Grid>

                  <Typography variant="h6" gutterBottom>Tipografía</Typography>
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Fuente del título</InputLabel>
                  <Select
                    value={selectedFont}
                    onChange={(e) => setSelectedFont(e.target.value)}
                    variant="outlined"
                  >
                    {["Roboto", "Montserrat", "Lato", "Poppins", "Playfair Display", "Oswald", "Raleway", "Lobster"].map((font) => (
                      <MenuItem key={font} value={font} style={{ fontFamily: font }}>
                        {font}
                      </MenuItem>
                    ))}
                  </Select>
              </FormControl>

                  <Typography variant="h6" gutterBottom>Tamaños</Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography gutterBottom>Título: {titleFontSize}px</Typography>
                    <Slider
                      value={titleFontSize}
                      onChange={(e, value) => setTitleFontSize(value)}
                      min={12}
                      max={80}
                      step={1}
                      marks={[
                        { value: 12, label: '12' },
                        { value: 40, label: '40' },
                        { value: 80, label: '80' }
                      ]}
                    />
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography gutterBottom>Cuota: {quotaFontSize}px</Typography>
                    <Slider
                      value={quotaFontSize}
                      onChange={(e, value) => setQuotaFontSize(value)}
                      min={12}
                      max={80}
                      step={1}
                      marks={[
                        { value: 12, label: '12' },
                        { value: 40, label: '40' },
                        { value: 80, label: '80' }
                      ]}
                    />
                  </Box>

                  <Typography variant="h6" gutterBottom>Layout</Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography gutterBottom>Bordes: {borderRadius}px</Typography>
                    <Slider
                      value={borderRadius}
                      onChange={(e, value) => setBorderRadius(value)}
                      min={0}
                      max={30}
                      step={1}
                    />
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography gutterBottom>Padding: {padding}px</Typography>
                    <Slider
                      value={padding}
                      onChange={(e, value) => setPadding(value)}
                      min={5}
                      max={50}
                      step={1}
                    />
                  </Box>

                  <Divider sx={{ my: 2 }} />
                  
                  <Typography variant="h6" gutterBottom>IA Avanzada</Typography>
                  
                  <FormControlLabel
                    control={
                      <Switch
                        checked={realisticMode}
                        onChange={(e) => setRealisticMode(e.target.checked)}
                        color="secondary"
                      />
                    }
                    label="Modo Realista (Sin fondo)"
                    sx={{ mb: 1 }}
                  />
                  
                  <FormControlLabel
                    control={
                      <Switch
                        checked={aiLayoutOptimization}
                        onChange={(e) => setAiLayoutOptimization(e.target.checked)}
                        color="secondary"
                      />
                    }
                    label="Optimización Automática de Layout"
                    sx={{ mb: 1 }}
                  />
                  
                  <FormControlLabel
                    control={
                      <Switch
                        checked={aiColorHarmony}
                        onChange={(e) => setAiColorHarmony(e.target.checked)}
                        color="secondary"
                      />
                    }
                    label="Armonía de Colores con IA"
                    sx={{ mb: 1 }}
                  />
                </Box>
              )}

              {/* Tab: IA Avanzada */}
              {activeTab === 2 && (
                <Box>
                  <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <AutoAwesomeIcon color="primary" />
                    Inteligencia Artificial Avanzada
                  </Typography>
                  
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12}>
                      <Button
                        fullWidth
                        variant="contained"
                        color="primary"
                        onClick={generateAISuggestions}
                        startIcon={<LightbulbIcon />}
                        sx={{ mb: 2 }}
                      >
                        Generar Sugerencias de IA
                      </Button>
            </Grid>
                    
                    {comboMode && (
                      <Grid item xs={12}>
                        <Button
                          fullWidth
                          variant="outlined"
                          color="secondary"
                          onClick={generateAIComboSuggestions}
                          startIcon={<AutoAwesomeIcon />}
                          sx={{ mb: 2 }}
                        >
                          Sugerencias de Combo con IA
                        </Button>
          </Grid>
                    )}
                    
                    <Grid item xs={12}>
                      <Button
                        fullWidth
                        variant="outlined"
                        color="success"
                        onClick={optimizeLayoutWithAI}
                        startIcon={<AutoAwesomeIcon />}
                        disabled={safeSelectedProducts.length === 0 && !selectedProduct}
                        sx={{ mb: 2 }}
                      >
                        Optimizar Layout con IA
            </Button>
          </Grid>
          </Grid>

                  {/* Sugerencias de IA */}
                  {aiSuggestions.length > 0 && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="h6" gutterBottom color="primary">
                        Sugerencias de IA
                      </Typography>
                      {aiSuggestions.map((suggestion, index) => (
                        <Alert key={index} severity="info" sx={{ mb: 1 }}>
                          {suggestion.message}
                          {suggestion.colors && (
                            <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                              {suggestion.colors.map((color, colorIndex) => (
                                <Chip
                                  key={colorIndex}
                                  label=""
                                  sx={{
                                    width: 25,
                                    height: 25,
                                    backgroundColor: color,
                                    cursor: "pointer"
                                  }}
                                  onClick={() => setTitleColor(color)}
                                />
                              ))}
                            </Box>
                          )}
                          {suggestion.fonts && (
                            <Box sx={{ mt: 1 }}>
                              {suggestion.fonts.map((font, fontIndex) => (
                                <Chip
                                  key={fontIndex}
                                  label={font}
                                  variant="outlined"
                                  sx={{ mr: 1, mb: 1 }}
                                  onClick={() => setSelectedFont(font)}
                                />
                              ))}
                            </Box>
                          )}
                        </Alert>
                      ))}
                    </Box>
                  )}

                  {/* Sugerencias de Combo */}
                  {aiComboSuggestions.length > 0 && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="h6" gutterBottom color="secondary">
                        Sugerencias de Combo
                      </Typography>
                      {aiComboSuggestions.map((suggestion, index) => (
                        <Alert key={index} severity="success" sx={{ mb: 1 }}>
                          {suggestion.message}
                          {suggestion.colors && (
                            <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                              {suggestion.colors.map((color, colorIndex) => (
                                <Chip
                                  key={colorIndex}
                                  label=""
                                  sx={{
                                    width: 25,
                                    height: 25,
                                    backgroundColor: color,
                                    cursor: "pointer"
                                  }}
                                  onClick={() => setTitleColor(color)}
                                />
                              ))}
                            </Box>
                          )}
                        </Alert>
                      ))}
                    </Box>
                  )}

                  {/* Estadísticas de IA */}
                  <Box sx={{ mt: 3, p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Productos analizados:</strong> {comboMode ? safeSelectedProducts.length : (selectedProduct ? 1 : 0)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Modo:</strong> {comboMode ? "Combo" : "Single"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>IA activa:</strong> {aiLayoutOptimization || aiColorHarmony ? "Sí" : "No"}
                    </Typography>
                  </Box>
                </Box>
              )}

              {/* Tab: Templates */}
              {activeTab === 3 && (
                <Box>
                  <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <PaletteIcon color="primary" />
                    {comboMode ? "Templates para Combos" : "Templates Predefinidos"}
                  </Typography>
                  
                  {comboMode ? (
                    // Templates específicos para combos
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Templates optimizados para múltiples productos con layouts inteligentes
                      </Typography>
                      <Grid container spacing={2}>
                        {comboDesignTemplates.map((template) => (
                          <Grid item xs={12} sm={6} md={4} key={template.id}>
                            <Card 
                              sx={{ 
                                cursor: "pointer",
                                border: "2px solid transparent",
                                "&:hover": { 
                                  borderColor: template.colors.primary,
                                  transform: "translateY(-2px)",
                                  boxShadow: 4
                                },
                                transition: "all 0.3s ease"
                              }}
                              onClick={() => applyComboTemplate(template)}
                            >
                              <CardContent sx={{ p: 2 }}>
                                <Typography variant="h6" gutterBottom color="primary">
                                  {template.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                  {template.description}
                                </Typography>
                                <Box
                                  sx={{
                                    width: "100%",
                                    height: 60,
                                    background: `linear-gradient(45deg, ${template.colors.primary}, ${template.colors.secondary})`,
                                    borderRadius: template.borderRadius,
                                    mb: 1,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center"
                                  }}
                                >
                                  <Typography variant="caption" sx={{ color: "white", fontWeight: "bold" }}>
                                    {template.layout.toUpperCase()}
                                  </Typography>
                                </Box>
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                  <Typography variant="caption" color="text.secondary">
                                    Layout: {template.layout}
                                  </Typography>
                                  <Chip 
                                    label={`${template.sizes.title}px`} 
                                    size="small" 
                                    color="primary" 
                                    variant="outlined"
                                  />
                                </Box>
                              </CardContent>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  ) : (
                    // Templates normales
                    <Grid container spacing={2}>
                      {designTemplates.map((template) => (
                        <Grid item xs={6} key={template.id}>
                          <Card 
                            sx={{ 
                              cursor: "pointer",
                              border: "2px solid transparent",
                              "&:hover": { borderColor: "primary.main" }
                            }}
                            onClick={() => applyTemplate(template)}
                          >
                            <CardContent sx={{ p: 2, textAlign: "center" }}>
                              <Box
                                sx={{
                                  width: "100%",
                                  height: 60,
                                  background: `linear-gradient(45deg, ${template.colors.primary}, ${template.colors.secondary})`,
                                  borderRadius: template.borderRadius,
                                  mb: 1
                                }}
                              />
                              <Typography variant="body2" fontWeight="bold">
                                {template.name}
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  )}

                  <Divider sx={{ my: 3 }} />
                  
                  <Typography variant="h6" gutterBottom>Paletas de Colores</Typography>
                  <Grid container spacing={2}>
                    {colorPalettes.map((palette) => (
                      <Grid item xs={12} key={palette.name}>
                        <Card sx={{ cursor: "pointer" }} onClick={() => setTitleColor(palette.colors[0])}>
                          <CardContent sx={{ p: 2 }}>
                            <Typography variant="body2" gutterBottom>{palette.name}</Typography>
                            <Box sx={{ display: "flex", gap: 1 }}>
                              {palette.colors.map((color, index) => (
                                <Box
                                  key={index}
                                  sx={{
                                    width: 30,
                                    height: 30,
                                    backgroundColor: color,
                                    borderRadius: "50%",
                                    border: "2px solid white",
                                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                                  }}
                                />
                              ))}
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}

              {/* Tab: Guardados */}
              {activeTab === 4 && (
                <Box>
                  <Typography variant="h6" gutterBottom>Diseños Guardados</Typography>
                  {savedDesigns.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", py: 4 }}>
                      No hay diseños guardados
                    </Typography>
                  ) : (
                    <Box sx={{ maxHeight: 400, overflowY: "auto" }}>
                      {savedDesigns.map((design) => (
                        <Card key={design.id} sx={{ mb: 2, cursor: "pointer" }} onClick={() => loadDesign(design)}>
                          <CardContent sx={{ p: 2 }}>
                            <Typography variant="body2" fontWeight="bold" gutterBottom>
                              {design.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(design.timestamp).toLocaleDateString()}
                            </Typography>
                            <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                              <Box
                                sx={{
                                  width: 20,
                                  height: 20,
                                  backgroundColor: design.colors.title,
                                  borderRadius: "50%"
                                }}
                              />
                              <Typography variant="caption">
                                {design.fonts.title} - {design.sizes.title}px
                              </Typography>
                            </Box>
                          </CardContent>
                        </Card>
                      ))}
                    </Box>
                  )}
                </Box>
              )}

              {/* Botones de acción */}
              <Divider sx={{ my: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={generateAISuggestions}
                    startIcon={<LightbulbIcon />}
                  >
                    Sugerencias IA
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={saveDesign}
                    startIcon={<SaveIcon />}
                  >
                    Guardar
            </Button>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Vista Previa */}
          <Grid item xs={12} md={7}>
            <Paper elevation={3} sx={{ p: 3, minHeight: 700 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Typography variant="h5">Vista Previa</Typography>
            {showCard && (
                  <Button
                    variant="contained"
                    startIcon={<DownloadIcon />}
                    onClick={() => {/* Función de descarga */}}
                  >
                    Descargar
                  </Button>
                )}
              </Box>
              
              <Box
                sx={{
                  border: "2px dashed #ccc",
                  borderRadius: 2,
                  minHeight: 700,
                  background: "#f5f5f5",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative"
                }}
              >
                {!showCard ? (
                  <Box sx={{ textAlign: "center" }}>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      Selecciona un producto y genera la vista previa
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Usa el panel de control para personalizar tu placa
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ width: "100%", maxWidth: 360 }}>
                <CardGenerator
                       selectedProducts={comboMode ? safeSelectedProducts : [selectedProduct]}
                  selectedQuota={selectedQuota}
                  customQuotaValue={customQuotaValue}
                  selectedBanks={selectedBanks}
                  titleColor={titleColor}
                  selectedFont={selectedFont}
                  titleFontSize={titleFontSize}
                  quotaFontSize={quotaFontSize}
                       backgroundColor={realisticMode ? "transparent" : backgroundColor}
                       borderRadius={borderRadius}
                       padding={padding}
                       realisticMode={realisticMode}
                       comboMode={comboMode}
                       comboLayout={comboLayout}
                       comboSpacing={comboSpacing}
                       comboAnimation={comboAnimation}
                       comboTitle={comboTitle}
                       comboLayers={comboLayers}
                       comboTotalQuota={comboTotalQuota}
                     />
                  </Box>
                )}
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Sugerencias de IA */}
        {showSuggestions && aiSuggestions.length > 0 && (
          <Paper elevation={3} sx={{ mt: 3, p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <LightbulbIcon color="warning" />
              Sugerencias de IA
            </Typography>
            <Grid container spacing={2}>
              {aiSuggestions.map((suggestion, index) => (
                <Grid item xs={12} md={4} key={index}>
                  <Alert severity="info" sx={{ mb: 1 }}>
                    {suggestion.message}
                  </Alert>
                  {suggestion.colors && (
                    <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                      {suggestion.colors.map((color, colorIndex) => (
                        <Chip
                          key={colorIndex}
                          label=""
                          sx={{
                            width: 30,
                            height: 30,
                            backgroundColor: color,
                            cursor: "pointer"
                          }}
                          onClick={() => setTitleColor(color)}
                        />
                      ))}
                    </Box>
                  )}
                  {suggestion.fonts && (
                    <Box sx={{ mt: 1 }}>
                      {suggestion.fonts.map((font, fontIndex) => (
                        <Chip
                          key={fontIndex}
                          label={font}
                          variant="outlined"
                          sx={{ mr: 1, mb: 1 }}
                          onClick={() => setSelectedFont(font)}
                        />
                      ))}
                    </Box>
                  )}
                </Grid>
              ))}
            </Grid>
            <Button
              variant="outlined"
              onClick={() => setShowSuggestions(false)}
              sx={{ mt: 2 }}
            >
              Cerrar Sugerencias
            </Button>
          </Paper>
        )}

        {/* Vista móvil */}
        <Box sx={{ display: { xs: "block", md: "none" }, mt: 3 }}>
    {showCard && (
   <DialogResponsive
  designs={[
    <CardGenerator
                   key="mobile-preview"
                                          selectedProducts={comboMode ? safeSelectedProducts : [selectedProduct]}
      selectedQuota={selectedQuota}
      customQuotaValue={customQuotaValue}
      selectedBanks={selectedBanks}
      titleColor={titleColor}
      selectedFont={selectedFont}
      titleFontSize={titleFontSize}
      quotaFontSize={quotaFontSize}
                       backgroundColor={realisticMode ? "transparent" : backgroundColor}
                       borderRadius={borderRadius}
                       padding={padding}
                       realisticMode={realisticMode}
                       comboMode={comboMode}
                       comboLayout={comboLayout}
                       comboSpacing={comboSpacing}
                       comboAnimation={comboAnimation}
                       comboTitle={comboTitle}
                       comboLayers={comboLayers}
                       comboTotalQuota={comboTotalQuota}
    />
  ]}
/>
          )}
        </Box>
      </Box>

      {/* Snackbar para notificaciones */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default GeneradorDePlacas;
