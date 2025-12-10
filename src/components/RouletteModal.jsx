import React, { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Button,
  Typography,
  Box,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { spinRoulette, wheelPrizes } from "../utils/rouletteEngine";
import { markRouletteAsPlayed, isDevelopmentMode } from "../utils/rouletteStorage";

/**
 * Modal de ruleta de premios con animación visual tipo bingo mejorada
 */
export default function RouletteModal({ onWin, onClose }) {
  const [open, setOpen] = useState(true);
  const [result, setResult] = useState(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [selectedPrize, setSelectedPrize] = useState(null);
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  // Función helper para ajustar brillo de color
  const adjustBrightness = (color, percent) => {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.min(255, Math.max(0, (num >> 16) + amt));
    const G = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amt));
    const B = Math.min(255, Math.max(0, (num & 0x0000FF) + amt));
    return "#" + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
  };

  // Colores vibrantes y atractivos para cada tipo de premio
  const prizeTypeColors = {
    "discount": {
      5: ["#FF6B6B", "#FF8787"], // Rojo coral con variación
      10: ["#FFE66D", "#FFF4A3"], // Amarillo dorado con variación
    },
    "gift": {
      "asas": ["#4ECDC4", "#7FD8D1"], // Turquesa con variación
      "mate": ["#95E1D3", "#B8F0E8"], // Verde agua con variación
    },
  };

  // Obtener color para un premio específico
  const getPrizeColor = (prize, index) => {
    if (prize.type === "discount") {
      const colors = prizeTypeColors.discount[prize.value];
      return colors[index % colors.length];
    } else {
      const colors = prizeTypeColors.gift[prize.value];
      return colors[index % colors.length];
    }
  };

  // Dibujar ruleta mejorada en canvas
  useEffect(() => {
    if (!canvasRef.current || result) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 15;

    const drawWheel = (currentRotation = 0) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const anglePerPrize = (2 * Math.PI) / wheelPrizes.length;
      const startAngle = -Math.PI / 2 + currentRotation;

      wheelPrizes.forEach((prize, index) => {
        const angle = index * anglePerPrize;
        const start = startAngle + angle;
        const end = startAngle + angle + anglePerPrize;

        // Gradiente para cada sección con color del premio
        const gradient = ctx.createRadialGradient(
          centerX, centerY, radius * 0.3,
          centerX, centerY, radius
        );
        const baseColor = prize.color || "#CCCCCC";
        const darkerColor = adjustBrightness(baseColor, -15);
        gradient.addColorStop(0, baseColor);
        gradient.addColorStop(1, darkerColor);

        // Dibujar sección con gradiente
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, start, end);
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.fill();

        // Borde brillante
        ctx.strokeStyle = "#FFFFFF";
        ctx.lineWidth = 4;
        ctx.stroke();

        // Sombra interna para profundidad
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius - 2, start, end);
        ctx.closePath();
        ctx.clip();
        ctx.fillStyle = "rgba(255,255,255,0.2)";
        ctx.fillRect(centerX - radius, centerY - radius, radius, radius * 0.5);
        ctx.restore();

        // Texto mejorado
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(start + anglePerPrize / 2);
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        // Sombra del texto
        ctx.fillStyle = "rgba(0,0,0,0.3)";
        ctx.font = "bold 16px Arial";
        ctx.fillText(prize.name, radius * 0.65 + 2, 2);

        // Texto principal
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "bold 16px Arial";
        ctx.shadowColor = "rgba(0,0,0,0.5)";
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 2;
        ctx.fillText(prize.name, radius * 0.65, 0);

        ctx.restore();
      });

      // Círculo central con efecto 3D
      const centerGradient = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, 30
      );
      centerGradient.addColorStop(0, "#FFFFFF");
      centerGradient.addColorStop(1, "#E0E0E0");
      ctx.beginPath();
      ctx.arc(centerX, centerY, 30, 0, 2 * Math.PI);
      ctx.fillStyle = centerGradient;
      ctx.fill();
      ctx.strokeStyle = "#CCCCCC";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Dibujar flecha indicadora mejorada
      ctx.save();
      ctx.translate(centerX, centerY - radius - 15);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-20, -25);
      ctx.lineTo(20, -25);
      ctx.closePath();
      const arrowGradient = ctx.createLinearGradient(0, 0, 0, -25);
      arrowGradient.addColorStop(0, "#FF0000");
      arrowGradient.addColorStop(1, "#CC0000");
      ctx.fillStyle = arrowGradient;
      ctx.fill();
      ctx.strokeStyle = "#FFFFFF";
      ctx.lineWidth = 3;
      ctx.stroke();

      // Brillo en la flecha
      ctx.beginPath();
      ctx.moveTo(0, -5);
      ctx.lineTo(-10, -15);
      ctx.lineTo(10, -15);
      ctx.closePath();
      ctx.fillStyle = "rgba(255,255,255,0.4)";
      ctx.fill();
      ctx.restore();
    };

    drawWheel(rotation);
  }, [rotation, result]);

  const handleSpin = () => {
    setIsSpinning(true);
    setResult(null);
    setSelectedPrize(null);

    // Animación de giro mejorada
    let currentRotation = 0;
    let speed = 0.3;
    const targetRotations = 6 + Math.random() * 4; // 6-10 vueltas completas
    let totalRotation = 0;

    const spin = () => {
      currentRotation += speed;
      totalRotation += speed;
      setRotation(currentRotation);

      // Acelerar y luego desacelerar de forma más realista
      if (totalRotation < targetRotations * Math.PI * 2 * 0.4) {
        speed = Math.min(speed + 0.025, 0.6);
      } else {
        speed = Math.max(speed - 0.018, 0.03);
      }

      if (totalRotation < targetRotations * Math.PI * 2) {
        animationRef.current = requestAnimationFrame(spin);
      } else {
        // Determinar premio ganador basado en probabilidades reales
        const prize = spinRoulette();

        setResult(prize);
        setSelectedPrize(prize);
        setIsSpinning(false);

        // Marcar como jugado (solo si no está en modo desarrollo)
        if (!isDevelopmentMode()) {
          const username = localStorage.getItem("activeSession") || null;
          markRouletteAsPlayed(username);
        }

        // Notificar al componente padre
        if (onWin) {
          if (prize.type === "discount") {
            onWin({ discount: prize.value });
          } else {
            onWin({ gift: prize.value });
          }
        }
      }
    };

    animationRef.current = requestAnimationFrame(spin);
  };

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const handleClose = () => {
    setOpen(false);
    if (onClose) onClose();
  };

  const handleAccept = () => {
    setOpen(false);
    if (onClose) onClose();
  };

  if (!open) return null;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          padding: 4,
          textAlign: "center",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
          position: "relative",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.1) 0%, transparent 50%)",
            pointerEvents: "none",
          },
        },
      }}
      sx={{
        zIndex: 9999,
      }}
    >
      <DialogTitle sx={{ position: "relative", pb: 1 }}>
        <IconButton
          onClick={handleClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: "#FFFFFF",
            backgroundColor: "rgba(255,255,255,0.2)",
            "&:hover": {
              backgroundColor: "rgba(255,255,255,0.3)",
            },
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        {!result && (
          <>
            <Typography
              variant="h3"
              sx={{
                mb: 1,
                fontWeight: 800,
                color: "#FFFFFF",
                textShadow: "3px 3px 6px rgba(0,0,0,0.4)",
                fontSize: { xs: "1.8rem", sm: "2.2rem" },
              }}
            >
              🎡 Probá tu suerte
            </Typography>
            <Typography
              variant="body1"
              sx={{
                mb: 4,
                color: "rgba(255,255,255,0.95)",
                fontSize: { xs: "0.95rem", sm: "1.1rem" },
              }}
            >
              Girá la ruleta y ganá un premio especial
            </Typography>

            {/* Ruleta visual mejorada */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                mb: 4,
                position: "relative",
              }}
            >
              <Box
                sx={{
                  position: "relative",
                  width: { xs: 280, sm: 340 },
                  height: { xs: 280, sm: 340 },
                  borderRadius: "50%",
                  overflow: "visible",
                  boxShadow: "0 15px 50px rgba(0,0,0,0.5), 0 0 30px rgba(255,255,255,0.1)",
                  border: "10px solid #FFFFFF",
                  backgroundColor: "#FFFFFF",
                }}
              >
                <canvas
                  ref={canvasRef}
                  width={340}
                  height={340}
                  style={{
                    width: "100%",
                    height: "100%",
                    transform: `rotate(${rotation}rad)`,
                    transition: isSpinning ? "none" : "transform 0.1s ease-out",
                  }}
                />
                {/* Efecto de brillo giratorio mejorado */}
                {isSpinning && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background:
                        "radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 70%)",
                      borderRadius: "50%",
                      animation: "spin 1.5s linear infinite",
                      pointerEvents: "none",
                      "@keyframes spin": {
                        "0%": { transform: "rotate(0deg)" },
                        "100%": { transform: "rotate(360deg)" },
                      },
                    }}
                  />
                )}
                {/* Partículas de brillo durante el giro */}
                {isSpinning && (
                  <>
                    {[...Array(8)].map((_, i) => (
                      <Box
                        key={i}
                        sx={{
                          position: "absolute",
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          backgroundColor: "rgba(255,255,255,0.8)",
                          top: "50%",
                          left: "50%",
                          transform: `translate(-50%, -50%) rotate(${i * 45}deg) translateY(-170px)`,
                          animation: `sparkle ${1 + Math.random()}s ease-in-out infinite`,
                          animationDelay: `${i * 0.1}s`,
                          "@keyframes sparkle": {
                            "0%, 100%": { opacity: 0, transform: `translate(-50%, -50%) rotate(${i * 45}deg) translateY(-170px) scale(0)` },
                            "50%": { opacity: 1, transform: `translate(-50%, -50%) rotate(${i * 45}deg) translateY(-170px) scale(1)` },
                          },
                        }}
                      />
                    ))}
                  </>
                )}
              </Box>
            </Box>

            <Button
              variant="contained"
              onClick={handleSpin}
              disabled={isSpinning}
              sx={{
                py: 2.5,
                px: 8,
                fontSize: { xs: "1.1rem", sm: "1.3rem" },
                fontWeight: 700,
                borderRadius: 3,
                backgroundColor: "#FFD700",
                color: "#000",
                boxShadow: "0 10px 30px rgba(255,215,0,0.5)",
                textTransform: "none",
                "&:hover": {
                  backgroundColor: "#FFC700",
                  transform: "translateY(-3px)",
                  boxShadow: "0 15px 40px rgba(255,215,0,0.6)",
                },
                "&:disabled": {
                  backgroundColor: "#CCCCCC",
                  color: "#666",
                  transform: "none",
                },
                transition: "all 0.3s ease",
                position: "relative",
                overflow: "hidden",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: "-100%",
                  width: "100%",
                  height: "100%",
                  background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
                  transition: "left 0.5s",
                },
                "&:hover::before": {
                  left: "100%",
                },
              }}
            >
              {isSpinning ? "🎡 Girando..." : "🎡 ¡Girar ruleta!"}
            </Button>
          </>
        )}

        {result && (
          <>
            {/* Efecto de confeti mejorado */}
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                pointerEvents: "none",
                overflow: "hidden",
                borderRadius: 4,
              }}
            >
              {[...Array(30)].map((_, i) => (
                <Box
                  key={i}
                  sx={{
                    position: "absolute",
                    width: { xs: 8, sm: 12 },
                    height: { xs: 8, sm: 12 },
                    backgroundColor: [
                      "#FF6B6B",
                      "#4ECDC4",
                      "#FFE66D",
                      "#95E1D3",
                      "#FF6B9D",
                      "#FFD93D",
                    ][i % 6],
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    borderRadius: Math.random() > 0.5 ? "50%" : "0%",
                    animation: `confetti ${1.5 + Math.random()}s ease-out forwards`,
                    animationDelay: `${Math.random() * 0.5}s`,
                    "@keyframes confetti": {
                      "0%": {
                        transform: "translateY(0) rotate(0deg) scale(1)",
                        opacity: 1,
                      },
                      "100%": {
                        transform: `translateY(300px) rotate(${720 + Math.random() * 360}deg) scale(0)`,
                        opacity: 0,
                      },
                    },
                  }}
                />
              ))}
            </Box>

            <Typography
              variant="h2"
              sx={{
                mb: 2,
                fontWeight: 800,
                color: "#FFFFFF",
                textShadow: "3px 3px 6px rgba(0,0,0,0.4)",
                animation: "bounce 0.6s ease",
                fontSize: { xs: "2rem", sm: "2.5rem" },
                "@keyframes bounce": {
                  "0%, 100%": { transform: "translateY(0)" },
                  "50%": { transform: "translateY(-25px)" },
                },
              }}
            >
              🎉 ¡Felicitaciones!
            </Typography>
            <Box
              sx={{
                backgroundColor: "rgba(255,255,255,0.98)",
                borderRadius: 4,
                padding: { xs: 3, sm: 4 },
                mb: 3,
                boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
                border: "3px solid",
                borderColor: result.color || wheelPrizes.find(p => p.name === result.name)?.color || "#000",
              }}
            >
              <Typography
                variant="h3"
                sx={{
                  mb: 1,
                  fontWeight: 800,
                  color: result.color || wheelPrizes.find(p => p.name === result.name)?.color || "#000",
                  fontSize: { xs: "1.5rem", sm: "2rem" },
                }}
              >
                {result.name}
              </Typography>
              {result.type === "discount" && (
                <Typography
                  variant="body1"
                  sx={{
                    color: "#666",
                    fontSize: { xs: "0.9rem", sm: "1rem" },
                  }}
                >
                  Tu descuento se aplicará automáticamente al carrito
                </Typography>
              )}
              {result.type === "gift" && (
                <Typography
                  variant="body1"
                  sx={{
                    color: "#666",
                    fontSize: { xs: "0.9rem", sm: "1rem" },
                  }}
                >
                  Tu regalo se agregará automáticamente al carrito
                </Typography>
              )}
            </Box>
            <Button
              variant="contained"
              onClick={handleAccept}
              sx={{
                py: 2.5,
                px: 8,
                fontSize: { xs: "1.1rem", sm: "1.3rem" },
                fontWeight: 700,
                borderRadius: 3,
                backgroundColor: "#2e7d32",
                color: "#FFFFFF",
                boxShadow: "0 10px 30px rgba(46,125,50,0.5)",
                textTransform: "none",
                "&:hover": {
                  backgroundColor: "#1b5e20",
                  transform: "translateY(-3px)",
                  boxShadow: "0 15px 40px rgba(46,125,50,0.6)",
                },
                transition: "all 0.3s ease",
              }}
            >
              ¡Genial! 🎁
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
