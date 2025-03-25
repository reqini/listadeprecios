import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  Box
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import Navbar from "./Navbar";

const preguntas = [
  {
    pregunta: "¿Cómo instalar la app desde el navegador en iOS o Android?",
    respuesta: `👉 En Android: abrí el catálogo en Chrome, tocá los tres puntos y seleccioná "Agregar a pantalla de inicio".
👉 En iOS: usá Safari, tocá el ícono de compartir y seleccioná "Agregar a pantalla de inicio". ¡Listo!`,
  },
  {
    pregunta: "¿Dónde encuentro los catálogos para copiarlos?",
    respuesta: "Desde el panel de emprendedoras podés copiar cualquier catálogo tocando el ícono 📋 que lo guarda en tu portapapeles.",
  },
  {
    pregunta: "¿Cómo crear una placa paso a paso?",
    respuesta: `1. Ingresá a "Crear placa".  
        2. Elegí los productos.  
        3. Seleccioná cuota o precio contado.  
        4. Agregá texto si querés.  
        5. Exportá en JPG listo para redes.`,
  },
  {
    pregunta: "¿Cómo cambiar mi clave de usuario?",
    respuesta: "Desde tu perfil, tocá 'Cambiar contraseña', ingresá la actual y luego la nueva. Guardá los cambios.",
  },
  {
    pregunta: "¿Teléfono de soporte?",
    respuesta: "📞 +54 9 11 51347453 (también WhatsApp) – Horario: Lunes a Viernes de 9 a 18hs. Correo: soporte@addicad.com",
  },
  {
    pregunta: "Quiero enviar una reseña, ¿cómo hago?",
    respuesta: "Podés enviarla por WhatsApp al +54 9 11 51347453con nombre o ig + la reseña que queres compartir",
  },
];

const FaqScreen = () => {
    const [busqueda, setBusqueda] = useState("");
    const navigate = useNavigate();
    
const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("activeSession");
    navigate("/login");
  };

  const preguntasFiltradas = preguntas.filter((item) =>
    item.pregunta.toLowerCase().includes(busqueda.toLowerCase()) ||
    item.respuesta.toLowerCase().includes(busqueda.toLowerCase())
  );

    return (
      <>
      <Navbar
        title="Preguntas Frecuentes"
        onLogout={handleLogout}
        user={{ username: localStorage.getItem("activeSession") || "" }}
      />
    <Container maxWidth="md" sx={{ pt: 4, pb: 6 }}>
      <Box textAlign="center" mb={4}>
        <HelpOutlineIcon sx={{ fontSize: 48, color: '#1976d2' }} />
        <Typography variant="subtitle1" color="textSecondary">
          Resolvé tus dudas más comunes al usar el catálogo
        </Typography>
      </Box>

      <TextField
        fullWidth
        label="Buscar una pregunta..."
        variant="outlined"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        sx={{ mb: 4 }}
      />

      {preguntasFiltradas.length > 0 ? (
        preguntasFiltradas.map((faq, index) => (
          <Accordion key={index}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1" fontWeight={500}>
                {faq.pregunta}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" style={{ whiteSpace: 'pre-line' }}>
                {faq.respuesta}
              </Typography>
            </AccordionDetails>
          </Accordion>
        ))
      ) : (
        <Typography variant="body2" color="textSecondary" align="center">
          No se encontraron resultados para tu búsqueda.
        </Typography>
      )}
    </Container>
</>
  );
};

export default FaqScreen;
