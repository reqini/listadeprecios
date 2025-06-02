import React, { useEffect, useState } from "react";
import axios from "./utils/axios";
import {
  Container,
  Typography,
  MenuItem,
  Select,
  Grid,
  Paper,
  FormControl,
  InputLabel,
  CircularProgress,
  Snackbar,
  Alert
} from "@mui/material";

const Activos = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState(false);

  const fetchUsuarios = async () => {
    try {
      const { data } = await axios.get("/api/usuarios");
      setUsuarios(data);
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = async (username, value) => {
    try {
      await axios.post("/api/usuarios/actualizar-activo", {
        username,
        activo: value,
      });
      setUsuarios(prev =>
        prev.map(u =>
          u.username === username ? { ...u, activo: value } : u
        )
      );
      setSnackbar(true);
    } catch (error) {
      console.error("Error al actualizar activo:", error);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Gestión de usuarios activos
      </Typography>
      {loading ? (
        <CircularProgress />
      ) : (
        <Grid container spacing={2}>
          {usuarios.map((usuario) => (
            <Grid item xs={12} key={usuario.username}>
              <Paper sx={{ p: 2 }}>
                <Typography><b>Usuario:</b> {usuario.username}</Typography>
                <FormControl fullWidth margin="normal">
                  <InputLabel>¿Activo?</InputLabel>
                  <Select
                    value={usuario.activo || ""}
                    onChange={(e) => handleChange(usuario.username, e.target.value)}
                    label="¿Activo?"
                  >
                    <MenuItem value="SI">Sí</MenuItem>
                    <MenuItem value="NO">No</MenuItem>
                  </Select>
                </FormControl>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
      <Snackbar
        open={snackbar}
        autoHideDuration={2500}
        onClose={() => setSnackbar(false)}
      >
        <Alert severity="success">Campo actualizado correctamente</Alert>
      </Snackbar>
    </Container>
  );
};

export default Activos;
