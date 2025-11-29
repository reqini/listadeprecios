import React from "react";
import { Container, Box, Typography, Button } from "@mui/material";
import { useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

/**
 * Componente 404 personalizado para catálogos no encontrados
 */
const CatalogoNotFound = ({ title, message, slug, cuota }) => {
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>Catálogo no encontrado - Catálogo Essen</title>
      </Helmet>
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            gap: 3,
          }}
        >
          <ErrorOutlineIcon
            sx={{
              fontSize: 80,
              color: "error.main",
              opacity: 0.7,
            }}
          />

          <Typography variant="h4" component="h1" fontWeight={700}>
            {title || "Catálogo no encontrado"}
          </Typography>

          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 500 }}>
            {message ||
              `Lo sentimos, el catálogo solicitado no existe o no está disponible.`}
          </Typography>

          {slug && (
            <Typography variant="body2" color="text.secondary">
              Slug: <strong>{slug}</strong>
              {cuota && ` - Cuota: ${cuota}`}
            </Typography>
          )}

          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", justifyContent: "center" }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              component={Link}
              to="/home"
              sx={{ minWidth: 150 }}
            >
              Volver al inicio
            </Button>

            <Button
              variant="outlined"
              color="primary"
              size="large"
              onClick={() => navigate(-1)}
              sx={{ minWidth: 150 }}
            >
              Volver atrás
            </Button>
          </Box>
        </Box>
      </Container>
    </>
  );
};

export default CatalogoNotFound;

