import React, { useState } from "react";
import { Box, Container, Paper, TextField, Button, Typography, Alert } from "@mui/material";
import { useAdminAuth } from "../AdminAuthContext";
import logo from "../assets/logo.png";

const AdminLogin = () => {
  const { loginAdmin } = useAdminAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await loginAdmin(email, password);
    } catch (err) {
      if (!err.status) {
        setError("Error de conexión. Verificá tu conexión a internet e intentá nuevamente.");
      } else if (err.status === 400) {
        setError("Email o contraseña incorrectos.");
      } else {
        setError("Error inesperado. Intentá nuevamente en unos momentos.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        px: 2,
        py: 6,
      }}
    >
      <Container maxWidth="xs" disableGutters>
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <img src={logo} alt="logo" height="88" />
          <Typography variant="h6" sx={{ mt: 1.5, color: "text.secondary" }}>
            Acceso administrador
          </Typography>
        </Box>

        <Paper sx={{ p: 4 }}>
          <form onSubmit={handleSubmit}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
              <TextField
                label="Email"
                type="email"
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
                required
              />
              <TextField
                label="Contraseña"
                type="password"
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
              {error && <Alert severity="error">{error}</Alert>}
              <Button type="submit" variant="contained" fullWidth size="large" disabled={submitting}>
                {submitting ? "Ingresando..." : "Ingresar"}
              </Button>
            </Box>
          </form>
        </Paper>
      </Container>
    </Box>
  );
};

export default AdminLogin;
