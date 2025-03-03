import React, { useState, useEffect } from "react";
import {
  Container,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import axios from "./utils/axios";
import Navbar from "./components/Navbar";

const Emprendedoras = () => {
  const [bancos, setBancos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [bancoFilter, setBancoFilter] = useState("");
  const [openAddClientDialog, setOpenAddClientDialog] = useState(false);

  // Estados para el formulario de agregar cliente
  const [newName, setNewName] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [newBank, setNewBank] = useState("");
  const [newPhone, setNewPhone] = useState(""); // Usamos "phone" en lugar de "telefono"

  // Estados para el formulario de edición
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editingClientIndex, setEditingClientIndex] = useState(null);
  const [editName, setEditName] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editBank, setEditBank] = useState("");
  const [editPhone, setEditPhone] = useState("");

  useEffect(() => {
    fetchClientes();
    fetchBancos();
  }, []);

  // 📌 OBTENER CLIENTES
  const fetchClientes = async () => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get("/api/clientes", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data && Array.isArray(data.clientes)) {
        // Asegurate de que la data que llega tiene la propiedad "phone"
        setClientes(data.clientes);
      } else {
        console.error("⚠️ La estructura de la respuesta de clientes no es la esperada:", data);
      }
    } catch (error) {
      console.error("🚨 Error al obtener clientes:", error);
    }
  };

  // 📌 OBTENER BANCOS
  const fetchBancos = async () => {
    try {
      const response = await axios.get("/api/bancos");
      setBancos(response.data);
    } catch (error) {
      console.error("🚨 Error al obtener bancos:", error);
    }
  };

  // 📌 AGREGAR NUEVO CLIENTE Y ACTUALIZAR LA TABLA
  const handleAddClient = async () => {
    if (!newName.trim() || !newAddress.trim() || !newBank.trim() || !newPhone.trim()) {
      alert("Por favor, completa todos los campos.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "/api/clientes",
        {
          nombre: newName,
          direccion: newAddress,
          banco: newBank,
          phone: newPhone, // Enviamos "phone"
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        alert("Cliente agregado con éxito");

        // Actualizamos la tabla con la propiedad "phone"
        setClientes((prevClientes) => [
          ...prevClientes,
          {
            nombre: newName,
            direccion: newAddress,
            banco: newBank,
            phone: newPhone,
          },
        ]);

        // Limpiamos campos y cerramos modal
        setOpenAddClientDialog(false);
        setNewName("");
        setNewAddress("");
        setNewBank("");
        setNewPhone("");
      } else {
        alert(`Error al agregar cliente: ${response.data.message}`);
      }
    } catch (error) {
      console.error("🚨 Error al guardar cliente:", error);
      alert("Error al guardar cliente. Revisa la consola.");
    }
  };

  // 📌 ABRIR DIALOG DE EDICIÓN PARA UN CLIENTE
  const openEditClientDialog = (client, index) => {
    setEditingClientIndex(index);
    setEditName(client.nombre);
    setEditAddress(client.direccion);
    setEditBank(client.banco);
    setEditPhone(client.phone); // Usamos "phone"
    setOpenEditDialog(true);
  };

  // 📌 ACTUALIZAR CLIENTE (a nivel local; agregar endpoint si lo necesitás)
  const handleUpdateClient = async () => {
    if (!editName.trim() || !editAddress.trim() || !editBank.trim() || !editPhone.trim()) {
      alert("Por favor, completa todos los campos.");
      return;
    }

    try {
      // Si contás con un endpoint para actualizar, se llama acá (ej: axios.put(...))

      // Actualizamos el estado local
      setClientes((prevClientes) => {
        const newClientes = [...prevClientes];
        newClientes[editingClientIndex] = {
          nombre: editName,
          direccion: editAddress,
          banco: editBank,
          phone: editPhone,
        };
        return newClientes;
      });

      setOpenEditDialog(false);
    } catch (error) {
      console.error("Error al actualizar cliente:", error);
      alert("Error al actualizar cliente. Revisa la consola.");
    }
  };

  return (
    <>
      <Navbar
        title="Mi Dashboard"
        onLogout={() => {}}
        user={{ username: localStorage.getItem("activeSession") || "" }}
      />

      <Container style={{ marginTop: 30 }}>
        <div style={{ display: "flex", gap: 20, marginBottom: 20 }}>
          <Button variant="contained" onClick={() => setOpenAddClientDialog(true)}>
            Agregar nuevo cliente
          </Button>
        </div>

        {/* 📌 FILTRAR CLIENTES POR BANCO */}
        <FormControl style={{ minWidth: 200 }}>
          <InputLabel>Filtrar por Banco</InputLabel>
          <Select value={bancoFilter} onChange={(e) => setBancoFilter(e.target.value)}>
            <MenuItem value="">-- Todos --</MenuItem>
            {bancos.map((bancoObj, index) => (
              <MenuItem key={index} value={bancoObj.banco}>
                {bancoObj.banco}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* 📌 TABLA DE CLIENTES */}
        <TableContainer component={Paper} style={{ marginTop: 20 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Nombre</strong></TableCell>
                <TableCell><strong>Dirección</strong></TableCell>
                <TableCell><strong>Banco</strong></TableCell>
                <TableCell><strong>Phone</strong></TableCell>
                <TableCell><strong>Acciones</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {clientes
                .filter((cliente) => (bancoFilter ? cliente.banco === bancoFilter : true))
                .map((cliente, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{cliente.nombre}</TableCell>
                    <TableCell>{cliente.direccion}</TableCell>
                    <TableCell>{cliente.banco}</TableCell>
                    <TableCell>{cliente.phone || ""}</TableCell>
                    <TableCell>
                      <Button variant="outlined" onClick={() => openEditClientDialog(cliente, idx)}>
                        Editar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* 📌 MODAL PARA AGREGAR CLIENTE */}
        <Dialog open={openAddClientDialog} onClose={() => setOpenAddClientDialog(false)}>
          <DialogTitle>Agregar Cliente</DialogTitle>
          <DialogContent style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <TextField
              label="Nombre"
              fullWidth
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <TextField
              label="Dirección"
              fullWidth
              value={newAddress}
              onChange={(e) => setNewAddress(e.target.value)}
            />
            <FormControl fullWidth>
              <InputLabel>Banco</InputLabel>
              <Select
                value={newBank}
                onChange={(e) => setNewBank(e.target.value)}
                label="Banco"
              >
                {bancos.map((bancoObj, index) => (
                  <MenuItem key={index} value={bancoObj.banco}>
                    {bancoObj.banco}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Phone"
              fullWidth
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenAddClientDialog(false)}>Cancelar</Button>
            <Button onClick={handleAddClient} variant="contained">
              Guardar
            </Button>
          </DialogActions>
        </Dialog>

        {/* 📌 MODAL PARA EDITAR CLIENTE */}
        <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)}>
          <DialogTitle>Editar Cliente</DialogTitle>
          <DialogContent style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <TextField
              label="Nombre"
              fullWidth
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
            />
            <TextField
              label="Dirección"
              fullWidth
              value={editAddress}
              onChange={(e) => setEditAddress(e.target.value)}
            />
            <FormControl fullWidth>
              <InputLabel>Banco</InputLabel>
              <Select value={editBank} onChange={(e) => setEditBank(e.target.value)} label="Banco">
                {bancos.map((bancoObj, index) => (
                  <MenuItem key={index} value={bancoObj.banco}>
                    {bancoObj.banco}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Phone"
              fullWidth
              value={editPhone}
              onChange={(e) => setEditPhone(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenEditDialog(false)}>Cancelar</Button>
            <Button onClick={handleUpdateClient} variant="contained">
              Guardar cambios
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
};

export default Emprendedoras;
