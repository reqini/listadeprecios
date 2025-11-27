import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  IconButton,
  Card,
  CardMedia,
  CardContent,
} from "@mui/material";
import {
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  FlashOn,
  Star,
} from "@mui/icons-material";
import { Link } from "react-router-dom";
// Animaciones simples
import { formatPrice, parsePrice } from "../utils/priceUtils";

const BannerCarousel = ({ productos = [], loading = false }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [masVendidos, setMasVendidos] = useState([]);
  const [ultimosAgregados, setUltimosAgregados] = useState([]);
  const [enPromocion, setEnPromocion] = useState([]);

  useEffect(() => {
    if (!productos || productos.length === 0) return;

    // Más vendidos (simulado por puntos o se puede obtener de analytics)
    const vendidos = [...productos]
      .filter(p => p.vigencia === "SI")
      .sort((a, b) => (b.puntos || 0) - (a.puntos || 0))
      .slice(0, 5);

    // Últimos agregados (por ID o fecha)
    const nuevos = [...productos]
      .filter(p => p.vigencia === "SI")
      .sort((a, b) => (b.Combo || 0) - (a.Combo || 0))
      .slice(0, 5);

    // En promoción (con descuento)
    const promos = [...productos]
      .filter(p => p.vigencia === "SI" && p.discount)
      .slice(0, 5);

    setMasVendidos(vendidos);
    setUltimosAgregados(nuevos);
    setEnPromocion(promos);
  }, [productos]);

  const banners = [
    {
      id: "mas-vendidos",
      title: "🔥 Más Vendidos",
      subtitle: "Los productos favoritos de nuestros clientes",
      icon: <TrendingUp sx={{ fontSize: 40 }} />,
      productos: masVendidos,
      color: "#FF5722",
    },
    {
      id: "ultimos-agregados",
      title: "✨ Últimos Agregados",
      subtitle: "Nuevos productos disponibles",
      icon: <FlashOn sx={{ fontSize: 40 }} />,
      productos: ultimosAgregados,
      color: "#4CAF50",
    },
    {
      id: "en-promocion",
      title: "🎯 En Promoción",
      subtitle: "Ofertas especiales por tiempo limitado",
      icon: <Star sx={{ fontSize: 40 }} />,
      productos: enPromocion,
      color: "#FFC107",
    },
  ].filter(banner => banner.productos.length > 0);

  useEffect(() => {
    if (banners.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [banners.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const currentBanner = banners[currentSlide];

  if (loading || banners.length === 0) {
    return null;
  }

  return (
    <Box
      sx={{
        width: "100%",
        mb: 4,
        position: "relative",
        borderRadius: 3,
        overflow: "hidden",
        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
      }}
    >
      {currentBanner && (
        <Box
          key={currentSlide}
          sx={{
            animation: 'slideIn 0.5s ease-out',
            '@keyframes slideIn': {
              from: { opacity: 0, transform: 'translateX(100px)' },
              to: { opacity: 1, transform: 'translateX(0)' },
            },
          }}
        >
          <Card
              sx={{
                background: `linear-gradient(135deg, ${currentBanner.color}15 0%, ${currentBanner.color}05 100%)`,
                border: `2px solid ${currentBanner.color}30`,
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mb: 2,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Box
                      sx={{
                        color: currentBanner.color,
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      {currentBanner.icon}
                    </Box>
                    <Box>
                      <Typography variant="h5" fontWeight={800}>
                        {currentBanner.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {currentBanner.subtitle}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Navegación */}
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <IconButton
                      onClick={prevSlide}
                      sx={{
                        backgroundColor: "rgba(255,255,255,0.9)",
                        "&:hover": { backgroundColor: "white" },
                      }}
                    >
                      <ChevronLeft />
                    </IconButton>
                    <IconButton
                      onClick={nextSlide}
                      sx={{
                        backgroundColor: "rgba(255,255,255,0.9)",
                        "&:hover": { backgroundColor: "white" },
                      }}
                    >
                      <ChevronRight />
                    </IconButton>
                  </Box>
                </Box>

                {/* Grid de productos destacados */}
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "repeat(auto-fill, minmax(120px, 1fr))",
                      sm: "repeat(auto-fill, minmax(150px, 1fr))",
                      md: "repeat(5, 1fr)",
                    },
                    gap: 2,
                  }}
                >
                  {currentBanner.productos.slice(0, 5).map((producto) => (
                    <Box
                      key={producto.codigo || producto.Combo}
                      sx={{
                        transition: 'transform 0.2s',
                        '&:hover': {
                          transform: 'scale(1.05)',
                        },
                      }}
                    >
                      <Card
                        sx={{
                          cursor: "pointer",
                          transition: "all 0.3s",
                          "&:hover": {
                            boxShadow: 4,
                          },
                        }}
                        component={Link}
                        to={`/home?producto=${producto.codigo || producto.Combo}`}
                      >
                        <CardMedia
                          component="img"
                          height="120"
                          image={producto.imagen || "../descarga.png"}
                          alt={producto.descripcion}
                          sx={{ objectFit: "cover" }}
                        />
                        <CardContent sx={{ p: 1.5 }}>
                          <Typography
                            variant="caption"
                            sx={{
                              fontSize: "0.7rem",
                              fontWeight: 600,
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                              mb: 0.5,
                            }}
                          >
                            {producto.descripcion}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              color: currentBanner.color,
                              fontWeight: 700,
                              fontSize: "0.75rem",
                            }}
                          >
                            {formatPrice(parsePrice(producto.precio_negocio || "0"))}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Box>
        )}

      {/* Indicadores */}
      <Box
        sx={{
          position: "absolute",
          bottom: 16,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: 1,
        }}
      >
        {banners.map((_, index) => (
          <Box
            key={index}
            onClick={() => setCurrentSlide(index)}
            sx={{
              width: currentSlide === index ? 32 : 8,
              height: 8,
              borderRadius: 4,
              backgroundColor:
                currentSlide === index
                  ? currentBanner?.color || "primary.main"
                  : "rgba(255,255,255,0.5)",
              cursor: "pointer",
              transition: "all 0.3s",
            }}
          />
        ))}
      </Box>
    </Box>
  );
};

export default BannerCarousel;
