/* eslint-disable */
import React, { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Box,
  Grid,
  Alert,
  CircularProgress,
  Skeleton,
  Snackbar,
} from "@mui/material";
import { Helmet } from "react-helmet";
import EntregaYaCard from "../components/EntregaYaCard";
import ModernSearchBar from "../components/ModernSearchBar";
import ModernCartBottomSheet from "../components/ModernCartBottomSheet";
import { getEntregaYaProducts } from "../utils/entregaYaAPI";
import { filterAllProducts } from "../utils/filterProducts";
import { trackCatalogView, trackAddToCart, trackToggleFavorite } from "../utils/analytics";
import { useAuth } from "../AuthContext";
import { parsePrice } from "../utils/priceUtils";
import { useColumnLayout } from "../hooks/useColumnLayout";
import ColumnLayoutToggle from "../components/ColumnLayoutToggle";

/**
 * Catálogo de Entrega Ya
 * Muestra todos los productos de la hoja "entrega-ya" de Google Sheets
 * 
 * Esta página consume exclusivamente productos de la hoja "entrega-ya"
 * y los renderiza en cards modernas y vistosas.
 */
const Entregaya = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  
  // Hook para manejar el layout de columnas en mobile
  const { mobileColumns, toggleColumns } = useColumnLayout('entregaya', 1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [productos, setProductos] = useState([]);
  const [productosOriginales, setProductosOriginales] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [favorites, setFavorites] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [isSearchSticky, setIsSearchSticky] = useState(false);
  const searchBarRef = useRef(null);

  // Cargar favoritos al iniciar
  useEffect(() => {
    const savedFavorites = localStorage.getItem('favorites');
    if (savedFavorites) {
      try {
        const favs = JSON.parse(savedFavorites);
        setFavorites(favs);
      } catch (error) {
        console.error('Error cargando favoritos:', error);
      }
    }
  }, []);

  // Cargar productos de entrega-ya
  useEffect(() => {
    console.log('🎯 PÁGINA ENTREGAYA: Iniciando carga de productos...');
    trackCatalogView("Catálogo", "Entrega Ya");
    
    const loadProductos = async () => {
      try {
        console.log('⏳ PÁGINA: Estableciendo loading = true');
        setLoading(true);
        setError(null);
        
        console.log('📞 PÁGINA: Llamando a getEntregaYaProducts()...');
        const productosData = await getEntregaYaProducts();
        console.log('📥 PÁGINA: Productos recibidos de API:', productosData.length);
        console.log('📋 PÁGINA: Primeros 3 productos recibidos:', productosData.slice(0, 3));
        
        // Filtrar solo productos válidos (con precio)
        console.log('🔍 PÁGINA: Filtrando productos válidos...');
        const productosValidos = productosData.filter((producto) => {
          const tienePrecio = producto.precio > 0 || producto.precio_negocio > 0 || producto.precio_contado > 0 || producto.precio_lista > 0;
          const vigente = producto.vigente !== false;
          
          if (!tienePrecio) {
            console.warn('⚠️ PÁGINA: Producto sin precio:', {
              codigo: producto.codigo,
              nombre: producto.nombre,
              precio: producto.precio,
              precio_negocio: producto.precio_negocio,
              precio_contado: producto.precio_contado,
            });
          }
          
          const esValido = tienePrecio && vigente;
          if (!esValido) {
            console.log('❌ PÁGINA: Producto rechazado:', {
              codigo: producto.codigo,
              nombre: producto.nombre,
              tienePrecio,
              vigente,
            });
          }
          
          return esValido;
        });
        
        console.log(`✅ PÁGINA: Productos válidos de entregas-ya: ${productosValidos.length} de ${productosData.length} totales`);
        
        console.log('💾 PÁGINA: Guardando productos en estado...');
        setProductosOriginales(productosValidos);
        setProductos(productosValidos);
        
        if (productosValidos.length === 0) {
          console.error('❌ PÁGINA: No se encontraron productos válidos en la hoja entregas-ya');
          console.log('💡 PÁGINA: Verificar:');
          console.log('   1. Que la hoja se llame exactamente "entregas-ya" en Google Sheets');
          console.log('   2. Que los productos tengan precio válido');
          console.log('   3. Que los productos tengan vigencia = "SI"');
        } else {
          console.log('✅ PÁGINA: Productos listos para mostrar:', productosValidos.length);
          console.log('📋 PÁGINA: Lista de productos a renderizar:');
          productosValidos.forEach((p, idx) => {
            console.log(`   ${idx + 1}. ${p.nombre || p.descripcion || 'Sin nombre'} | Código: ${p.codigo} | Precio: $${p.precio || p.precio_negocio || 'N/A'} | Imagen: ${p.imagen ? 'Sí' : 'No'}`);
          });
        }
      } catch (err) {
        console.error('❌ PÁGINA: Error al cargar productos de entrega-ya:', err);
        console.error('❌ PÁGINA: Stack trace:', err.stack);
        setError({
          message: 'No pudimos cargar los productos, intentá nuevamente más tarde.',
          details: err.message || 'Error desconocido'
        });
      } finally {
        console.log('⏳ PÁGINA: Estableciendo loading = false');
        setLoading(false);
      }
    };

    loadProductos();
  }, []);

  // Agregar al carrito
  const handleAddToCart = (product) => {
    // Usar precio_negocio como precio principal (es el precio de entregas-ya)
    const precioBase = product.precio_negocio || product.precio || product.precio_contado || product.precio_preferencial || 0;
    
    // Asegurarse de que el precio sea un número válido
    const precioNumerico = typeof precioBase === 'number' ? precioBase : parsePrice(String(precioBase));
    
    const productWithCuota = {
      ...product,
      // Asegurar que todos los campos de precio estén presentes
      precio: precioNumerico,
      precio_negocio: product.precio_negocio || precioNumerico,
      precio_contado: product.precio_contado || precioNumerico,
      // Para entrega ya, usamos contado por defecto
      selectedCuotaKey: 'contado',
      selectedCuotaValue: precioNumerico, // Precio numérico para el carrito
      selectedCuotaLabel: 'Contado',
      cantidad: 1,
    };
    
    console.log('🛒 Agregando al carrito:', {
      codigo: product.codigo,
      nombre: product.nombre,
      precioNumerico,
      precio_negocio: product.precio_negocio,
      precio: product.precio,
      selectedCuotaValue: productWithCuota.selectedCuotaValue,
    });

    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex(
        (item) => item.codigo === product.codigo || item.id === product.id
      );
      
      if (existingIndex >= 0) {
        const updatedCart = [...prevCart];
        updatedCart[existingIndex] = {
          ...updatedCart[existingIndex],
          cantidad: (updatedCart[existingIndex].cantidad || 1) + 1,
          // Asegurar que el precio se mantenga
          precio: updatedCart[existingIndex].precio || precioNumerico,
          precio_negocio: updatedCart[existingIndex].precio_negocio || precioNumerico,
          selectedCuotaValue: updatedCart[existingIndex].selectedCuotaValue || precioNumerico,
        };
        return updatedCart;
      } else {
        return [...prevCart, productWithCuota];
      }
    });
    
    trackAddToCart("Entrega Ya", product);
    setSnackbarMessage('Producto agregado al carrito');
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
  };

  // Toggle favorito
  const handleToggleFavorite = (product) => {
    try {
      const savedFavorites = localStorage.getItem('favorites');
      let currentFavorites = savedFavorites ? JSON.parse(savedFavorites) : [];
      
      const exists = currentFavorites.some(
        f => (f.codigo === product.codigo) || (f.id === product.id)
      );
      
      if (exists) {
        currentFavorites = currentFavorites.filter(
          f => (f.codigo !== product.codigo) && (f.id !== product.id)
        );
      } else {
        currentFavorites.push(product);
      }
      
      localStorage.setItem('favorites', JSON.stringify(currentFavorites));
      setFavorites(currentFavorites);
      trackToggleFavorite("Entrega Ya", product);
      
      // Notificar a otros componentes
      window.dispatchEvent(new Event('favoritesUpdated'));
    } catch (error) {
      console.error('Error al guardar favoritos:', error);
    }
  };

  // Verificar si un producto es favorito
  const isFavorite = (product) => {
    return favorites.some(
      f => (f.codigo === product.codigo) || (f.id === product.id)
    );
  };

  // Manejar clic en producto
  const handleProductClick = (product) => {
    // Aquí puedes agregar lógica para mostrar detalles del producto
    console.log('Producto clickeado:', product);
  };

  // Filtrar productos según búsqueda
  const productosFiltrados = useMemo(() => {
    if (!searchTerm || searchTerm.trim() === '') {
      return productos;
    }
    return filterAllProducts(productos, searchTerm);
  }, [productos, searchTerm]);

  // Actualizar productos cuando cambia el filtro
  useEffect(() => {
    if (!searchTerm || searchTerm.trim() === '') {
      setProductos(productosOriginales);
    } else {
      const filtrados = filterAllProducts(productosOriginales, searchTerm);
      setProductos(filtrados);
    }
  }, [searchTerm, productosOriginales]);

  // Hacer search bar sticky al hacer scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      if (searchBarRef.current) {
        const searchBarTop = searchBarRef.current.offsetTop;
        setIsSearchSticky(scrollTop > searchBarTop);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Verificar estado inicial

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <Helmet>
        <title>Entrega Ya - Productos Disponibles - Catálogo Simple</title>
        <meta 
          name="description" 
          content="Productos listos para entrega inmediata. Consultá disponibilidad y recibí tu pedido lo antes posible." 
        />
        <link rel="canonical" href={`${window.location.origin}/entregaya`} />
      </Helmet>

      {/* Search Bar - Sticky al hacer scroll */}
      <Box
        ref={searchBarRef}
        sx={{
          position: isSearchSticky ? 'fixed' : 'relative',
          top: isSearchSticky ? 0 : 'auto',
          left: 0,
          right: 0,
          zIndex: isSearchSticky ? 1100 : 'auto',
          backgroundColor: isSearchSticky ? 'rgba(255, 255, 255, 0.95)' : 'transparent',
          backdropFilter: isSearchSticky ? 'blur(10px)' : 'none',
          boxShadow: isSearchSticky ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
          transition: 'all 0.3s ease',
        }}
      >
        <ModernSearchBar
          value={searchTerm}
          onChange={(value) => {
            setSearchTerm(value);
          }}
          placeholder="Buscar productos por nombre, categoría o banco..."
          sx={{
            paddingX: { xs: 2, sm: 3 },
            paddingY: isSearchSticky ? { xs: 1.5, sm: 2 } : { xs: 2, sm: 2.5 },
            marginBottom: 0,
          }}
        />
      </Box>
      
      {/* Spacer para compensar el espacio cuando está sticky */}
      {isSearchSticky && (
        <Box sx={{ height: { xs: '88px', sm: '96px' } }} />
      )}

      <Container 
        maxWidth="lg" 
        sx={{
          paddingTop: { xs: 3, sm: 4 },
          paddingBottom: { xs: 4, sm: 5 },
        }}
      >
        {/* Header */}
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography 
            variant="h3" 
            component="h1" 
            gutterBottom 
            sx={{ 
              fontWeight: 800,
              color: 'primary.main',
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
              mb: 1,
            }}
          >
            🚀 Entrega Ya
          </Typography>
          <Typography 
            variant="h6" 
            color="text.secondary"
            sx={{
              fontSize: { xs: '0.95rem', sm: '1.1rem' },
              fontWeight: 400,
            }}
          >
            Productos listos para entrega inmediata
          </Typography>
        </Box>

        {/* Loading State */}
        {loading && (
          <Box>
            <Grid container spacing={3}>
              {[...Array(8)].map((_, idx) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={idx}>
                  <Skeleton
                    variant="rectangular"
                    height={450}
                    sx={{ borderRadius: 3 }}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Error State */}
        {error && !loading && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 4,
              borderRadius: 2,
            }}
          >
            <Typography variant="h6" gutterBottom>
              {error.message}
            </Typography>
            {process.env.NODE_ENV === 'development' && (
              <Typography variant="body2" color="text.secondary">
                {error.details}
              </Typography>
            )}
          </Alert>
        )}

        {/* Empty State */}
        {!loading && !error && productos.length === 0 && (
          <Box
            sx={{
              textAlign: 'center',
              py: 8,
              px: 2,
            }}
          >
            <Typography 
              variant="h5" 
              color="text.secondary" 
              gutterBottom
              sx={{ mb: 2 }}
            >
              Por el momento no hay productos con entrega inmediata
            </Typography>
            <Typography 
              variant="body1" 
              color="text.secondary"
              sx={{ mb: 3 }}
            >
              Vuelve pronto para ver nuevos productos disponibles para entrega ya
            </Typography>
            <Box
              component="img"
              src="/empty-state.svg"
              alt="Sin productos"
              sx={{
                maxWidth: 300,
                width: '100%',
                height: 'auto',
                mx: 'auto',
                opacity: 0.5,
              }}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </Box>
        )}

        {/* Productos Grid */}
        {!loading && !error && productos.length > 0 && (
          <>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                {productos.length} {productos.length === 1 ? 'producto disponible' : 'productos disponibles'}
              </Typography>
              
              {/* Toggle de columnas - Solo visible en mobile */}
              <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
                <ColumnLayoutToggle
                  mobileColumns={mobileColumns}
                  onToggle={toggleColumns}
                  variant="icons"
                  size="small"
                />
              </Box>
            </Box>
            
            <Grid container spacing={3}>
              {productos.map((producto, index) => {
                // Log para cada producto renderizado
                if (index < 3) {
                  console.log(`🎨 PÁGINA: Renderizando producto ${index + 1}:`, {
                    codigo: producto.codigo,
                    nombre: producto.nombre,
                    precio: producto.precio,
                    tieneImagen: !!producto.imagen,
                  });
                }
                
                return (
                  <Grid 
                    item 
                    xs={mobileColumns === 1 ? 12 : 6}
                    sm={6} 
                    md={4} 
                    lg={4} 
                    key={producto.id || producto.codigo || `producto-${index}`}
                  >
                    <EntregaYaCard
                      product={producto}
                      onAddToCart={handleAddToCart}
                      onToggleFavorite={handleToggleFavorite}
                      isFavorite={isFavorite(producto)}
                      onProductClick={handleProductClick}
                    />
                  </Grid>
                );
              })}
            </Grid>
            {console.log(`✅ PÁGINA: Total de productos renderizados: ${productos.length}`)}
          </>
        )}
      </Container>

      {/* Carrito */}
      <ModernCartBottomSheet cart={cart} setCart={setCart} />

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
    </>
  );
};

export default Entregaya;
