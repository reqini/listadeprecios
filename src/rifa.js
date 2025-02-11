import React, { useEffect, useState, useCallback } from "react";
import axios from "./utils/axios";
import { Container, Button, TextField } from "@mui/material";

const Rifa = () => {
  const usuarioActual = localStorage.getItem("username");
  const [rifas, setRifas] = useState([]);
  const [nuevaRifa, setNuevaRifa] = useState({
    nombre: "",
    montoNumero: "",
    premio: "",
    fechaSorteo: "",
  });

  // ✅ Función para obtener rifas del usuario autenticado
  const obtenerRifas = useCallback(async () => {
    if (!usuarioActual) {
      console.error("Error: Usuario no encontrado en localStorage.");
      return;
    }

    try {
      const response = await axios.get(`/api/rifas?usuario=${usuarioActual}`);
      setRifas(response.data);
    } catch (error) {
      console.error("❌ Error al obtener rifas:", error.message);
    }
  }, [usuarioActual]); 

  // ✅ Cargar rifas al montar el componente
  useEffect(() => {
    obtenerRifas();
  }, [obtenerRifas]);

  // ✅ Función para crear una nueva rifa
  const crearRifa = async () => {
    if (!nuevaRifa.nombre || !nuevaRifa.montoNumero || !nuevaRifa.premio || !nuevaRifa.fechaSorteo) {
      alert("⚠️ Todos los campos son obligatorios.");
      return;
    }

    try {
      await axios.post("/api/rifas", {
        usuario: usuarioActual,
        ...nuevaRifa,
      });

      setNuevaRifa({ nombre: "", montoNumero: "", premio: "", fechaSorteo: "" }); // Limpiar formulario
      obtenerRifas(); // 🔹 Refrescar la lista
    } catch (error) {
      console.error("❌ Error al crear rifa:", error.message);
    }
  };

  // ✅ Función para eliminar una rifa
  const eliminarRifa = async (id) => {
    if (!window.confirm("¿Seguro que quieres eliminar esta rifa?")) return;

    try {
      await axios.delete(`/api/rifas/${id}`);
      obtenerRifas(); // 🔹 Refrescar la lista
    } catch (error) {
      console.error("❌ Error al eliminar rifa:", error.message);
    }
  };

  return (
    <Container>
      <h2>🎟️ Mis Rifas</h2>
      {rifas.length === 0 ? (
        <p>No tienes rifas creadas.</p>
      ) : (
        rifas.map((rifa) => (
          <div key={rifa._id} style={{ border: "1px solid #ddd", padding: "10px", marginBottom: "10px", borderRadius: "5px" }}>
            <h3>{rifa.nombre}</h3>
            <p><strong>🏆 Premio:</strong> {rifa.premio}</p>
            <p><strong>💰 Monto:</strong> ${rifa.montoNumero}</p>
            <p><strong>📅 Sorteo:</strong> {new Date(rifa.fechaSorteo).toLocaleDateString("es-AR")}</p>
            <Button onClick={() => eliminarRifa(rifa._id)} variant="outlined" color="error">Eliminar</Button>
          </div>
        ))
      )}

      <h2>➕ Crear Nueva Rifa</h2>
      <TextField fullWidth label="Título" value={nuevaRifa.nombre} onChange={(e) => setNuevaRifa({ ...nuevaRifa, nombre: e.target.value })} />
      <TextField fullWidth label="Monto por Número" type="number" value={nuevaRifa.montoNumero} onChange={(e) => setNuevaRifa({ ...nuevaRifa, montoNumero: e.target.value })} />
      <TextField fullWidth label="Premio" value={nuevaRifa.premio} onChange={(e) => setNuevaRifa({ ...nuevaRifa, premio: e.target.value })} />
      <TextField fullWidth label="Fecha de Sorteo" type="date" value={nuevaRifa.fechaSorteo} onChange={(e) => setNuevaRifa({ ...nuevaRifa, fechaSorteo: e.target.value })} />
      <Button onClick={crearRifa} variant="contained" color="primary">Crear</Button>
    </Container>
  );
};

export default Rifa;
