/* eslint-disable */
import React, { useEffect, useState } from "react";
import { useParams, Navigate, useLocation, useNavigate } from "react-router-dom";
import { Container, Box, Typography, LinearProgress, Alert } from "@mui/material";
import { Helmet } from "react-helmet";
import axios from "../utils/axios";
import CarouselEntregaInmediata from "../components/CarouselEntregaInmediata";
import CatalogoNotFound from "../components/CatalogoNotFound";

// Mapeo de cuotas a componentes de catálogo
import Catalogo3 from "../catalogo3";
import Catalogo6 from "../catalogo6";
import Catalogo9 from "../catalogo9";
import Catalogo10 from "../catalogo10";
import Catalogo12 from "../catalogo12";
import Catalogo14 from "../catalogo14";
import Catalogo15 from "../catalogo15";
import Catalogo18 from "../catalogo18";
import Catalogo20 from "../catalogo20";
import Catalogo24 from "../catalogo24";

const CATALOGO_COMPONENTS = {
  "3": Catalogo3,
  "6": Catalogo6,
  "9": Catalogo9,
  "10": Catalogo10,
  "12": Catalogo12,
  "14": Catalogo14,
  "15": Catalogo15,
  "18": Catalogo18,
  "20": Catalogo20,
  "24": Catalogo24,
};

/**
 * Catálogo Individual por Usuaria
 * Ruta dinámica: /{slug}/{cuota}
 * Ejemplo: /cocinaty/12, /carlaessen/18
 */
const CatalogoIndividual = () => {
  const { slug, cuota } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [productosEntrega, setProductosEntrega] = useState([]);

  // Validar y corregir URL mal formada
  useEffect(() => {
    const pathname = location.pathname;
    
    // Si la URL está mal formada (ej: /cocinaty12), redirigir
    const malformedMatch = pathname.match(/^\/([^/]+)(\d+)$/);
    if (malformedMatch && malformedMatch[1] !== 'catalogo') {
      const correctedSlug = malformedMatch[1];
      const correctedCuota = malformedMatch[2];
      const correctUrl = `/${correctedSlug}/${correctedCuota}`;
      console.log(`URL mal formada detectada: ${pathname} → ${correctUrl}`);
      navigate(correctUrl, { replace: true });
      return;
    }
  }, [location.pathname, navigate]);

  // Obtener componente de catálogo según cuota
  const CatalogoComponent = CATALOGO_COMPONENTS[cuota];

  // Cargar datos del usuario por slug
  useEffect(() => {
    const loadUsuario = async () => {
      try {
        setLoading(true);
        setError(null);

        // Intentar obtener usuario desde API
        let userData = null;
        let response;
        
        try {
          response = await axios.get(`/api/user/by-slug/${slug}`);
          if (response.data && response.data.success) {
            userData = response.data.data;
          }
        } catch (apiError) {
          // Fallback: buscar en usuarios generales
          console.log('Intentando fallback desde /api/user/all...');
          const usuariosResponse = await axios.get('/api/user/all');
          const usuarios = usuariosResponse.data || [];
          const usuarioEncontrado = usuarios.find(u => 
            u.slug === slug || 
            u.username === slug ||
            u.identificador_unico === slug
          );
          
          if (usuarioEncontrado) {
            userData = {
              id: usuarioEncontrado.id || usuarioEncontrado._id,
              username: usuarioEncontrado.username,
              nombre: usuarioEncontrado.nombre || usuarioEncontrado.username,
              slug: usuarioEncontrado.slug || usuarioEncontrado.username,
              cuotas: usuarioEncontrado.cuotas || ["3", "6", "12", "18"],
              entregaInmediata: usuarioEncontrado.entregaInmediata || usuarioEncontrado.entrega_inmediata || [],
              activo: usuarioEncontrado.activo !== false,
              ...usuarioEncontrado
            };
          }
        }
        
        if (userData) {
          // Validar que la cuota esté habilitada para este usuario
          const cuotasHabilitadas = userData.cuotas || [];
          const cuotaNum = cuota.toString();
          
          // Si el usuario tiene cuotas configuradas, validar
          if (cuotasHabilitadas.length > 0 && !cuotasHabilitadas.includes(cuotaNum)) {
            setError({
              type: "cuota_invalida",
              message: `La cuota ${cuota} no está habilitada para ${userData.nombre || slug}`,
            });
            setLoading(false);
            return;
          }

          setUsuario(userData);
          
          // Cargar productos de entrega inmediata si tiene configurados
          if (userData.entregaInmediata && userData.entregaInmediata.length > 0) {
            loadProductosEntrega(userData.entregaInmediata);
          } else {
            // Si no tiene productos configurados, cargar todos los de entrega inmediata
            loadProductosEntrega([]);
          }
        } else {
          // Si no se encuentra el usuario, crear uno básico con el slug
          // Esto permite que las rutas funcionen incluso sin datos del usuario
          const usuarioBasico = {
            id: slug,
            username: slug,
            nombre: slug.charAt(0).toUpperCase() + slug.slice(1), // Capitalizar primera letra
            slug: slug,
            cuotas: ["3", "6", "9", "10", "12", "14", "15", "18", "20", "24"], // Todas las cuotas por defecto
            entregaInmediata: [],
            activo: true,
          };
          setUsuario(usuarioBasico);
          
          // Cargar productos de entrega inmediata automáticamente
          loadProductosEntrega([]);
        }
      } catch (err) {
        console.error("Error al cargar usuario:", err);
        // Si hay error, crear usuario básico para que la ruta funcione igual
        const usuarioBasico = {
          id: slug,
          username: slug,
          nombre: slug.charAt(0).toUpperCase() + slug.slice(1),
          slug: slug,
          cuotas: ["3", "6", "9", "10", "12", "14", "15", "18", "20", "24"],
          entregaInmediata: [],
          activo: true,
        };
        setUsuario(usuarioBasico);
        
        // Cargar productos de entrega inmediata automáticamente
        loadProductosEntrega([]);
      } finally {
        setLoading(false);
      }
    };

    if (slug && cuota) {
      loadUsuario();
    }
  }, [slug, cuota]);

  // Cargar productos de entrega inmediata
  const loadProductosEntrega = async (productosIds = []) => {
    try {
      const response = await axios.get("/api/productos");
      const todosProductos = response.data || [];

      // Filtrar productos por IDs o tags de entrega inmediata
      const productosFiltrados = todosProductos.filter((producto) => {
        // Excluir repuestos y productos no vigentes
        const linea = (producto?.linea || '').toLowerCase();
        const vigencia = (producto?.vigencia || '').toLowerCase();
        if (linea === 'repuestos' || vigencia === 'no') {
          return false;
        }

        // Si tiene IDs específicos configurados, priorizar esos
        if (productosIds && productosIds.length > 0) {
          const tieneId = productosIds.some((id) => 
            producto.id === id || 
            producto.codigo === id ||
            producto._id === id ||
            String(producto.id) === String(id) ||
            String(producto.codigo) === String(id)
          );
          if (tieneId) return true;
        }

        // Filtrar por flags de entrega inmediata
        const tieneFlagEntrega = 
          producto.entrega_ya === "si" ||
          producto.entrega_ya === "Sí" ||
          producto.entrega_ya === true ||
          producto.entrega_ya === "SI" ||
          producto.entrega_inmediata === "si" ||
          producto.entrega_inmediata === "Sí" ||
          producto.entrega_inmediata === true ||
          producto.entrega_inmediata === "SI" ||
          producto.envio_inmediato === "si" ||
          producto.envio_inmediato === "Sí" ||
          producto.envio_inmediato === "SI" ||
          producto.hoja === "entrega_ya" ||
          producto.hoja === "entrega_inmediata";

        return tieneFlagEntrega;
      });

      // Limitar a máximo 10 productos para el carrusel
      setProductosEntrega(productosFiltrados.slice(0, 10));
    } catch (err) {
      console.error("Error al cargar productos de entrega:", err);
      // En caso de error, intentar cargar productos básicos
      setProductosEntrega([]);
    }
  };

  // Validaciones iniciales
  // Si no hay slug o cuota en los params, mostrar 404
  if (!slug || !cuota) {
    return (
      <CatalogoNotFound
        title="Ruta no válida"
        message="La URL no es válida. Debe ser del formato: /{usuario}/{cuota}"
      />
    );
  }

  if (!CatalogoComponent) {
    return (
      <CatalogoNotFound
        title="Cuota no válida"
        message={`La cuota ${cuota} no es válida. Cuotas disponibles: 3, 6, 9, 10, 12, 14, 15, 18, 20, 24`}
        slug={slug}
      />
    );
  }

  if (loading) {
    return (
      <>
        <Helmet>
          <title>Cargando catálogo...</title>
        </Helmet>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <LinearProgress />
          <Typography variant="body1" sx={{ mt: 2, textAlign: "center" }}>
            Cargando catálogo...
          </Typography>
        </Container>
      </>
    );
  }

  // Solo mostrar error si es de cuota inválida
  if (error && error.type === "cuota_invalida") {
    return (
      <CatalogoNotFound
        title="Cuota no habilitada"
        message={error.message}
        slug={slug}
        cuota={cuota}
      />
    );
  }

  // Siempre tener un usuario disponible (si no hay, usar datos básicos del slug)
  const usuarioFinal = usuario || {
    id: slug,
    username: slug,
    nombre: slug.charAt(0).toUpperCase() + slug.slice(1),
    slug: slug,
    cuotas: ["3", "6", "9", "10", "12", "14", "15", "18", "20", "24"],
    entregaInmediata: [],
    activo: true,
  };

  // Metadata dinámica para SEO
  const nombreUsuario = usuarioFinal.nombre || usuarioFinal.username || slug;
  const title = `${nombreUsuario} - Catálogo Oficial Essen - ${cuota} cuotas sin interés`;
  const description = `Catálogo personalizado de ${nombreUsuario} con ${cuota} cuotas sin interés. Productos Essen con entrega inmediata.`;
  const canonicalUrl = `${window.location.origin}/${slug}/${cuota}`;

  return (
    <>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={canonicalUrl} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        
        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={canonicalUrl} />
        <meta property="twitter:title" content={title} />
        <meta property="twitter:description" content={description} />
      </Helmet>

      {/* Guardar última cuota vista en localStorage */}
      <Box sx={{ display: "none" }}>
        {localStorage.setItem(`lastCuota_${slug}`, cuota)}
      </Box>

      {/* Carrusel de Entrega Inmediata - Siempre intentar mostrar si hay productos */}
      {productosEntrega.length > 0 && (
        <Box sx={{ width: '100%', mb: 2 }}>
          <CarouselEntregaInmediata
            productos={productosEntrega}
            cuotaActual={parseInt(cuota)}
            nombreUsuario={nombreUsuario}
          />
        </Box>
      )}

      {/* Componente de catálogo correspondiente */}
      <CatalogoComponent />
    </>
  );
};

export default CatalogoIndividual;

