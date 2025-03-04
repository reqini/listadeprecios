import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  Card,
  CardContent,
  CardActions,
  Typography,
  Checkbox,
  FormControlLabel,
  Stack,
  Alert,
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
  const [newPhone, setNewPhone] = useState("");

  // Estados para el formulario de edición
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editingClientIndex, setEditingClientIndex] = useState(null);
  const [editName, setEditName] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editBank, setEditBank] = useState("");
  const [editPhone, setEditPhone] = useState("");

  // Estado para manejo de selección de clientes
  const [selectedClientes, setSelectedClientes] = useState([]);

  // Estado para el modal de WhatsApp
  const [openWhatsappModal, setOpenWhatsappModal] = useState(false);
  const [whatsappMessage, setWhatsappMessage] = useState("Hola, te contacto desde mi dashboard...");

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("activeSession");
    navigate("/login");
  };

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

  // 📌 AGREGAR NUEVO CLIENTE
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
          phone: newPhone,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        alert("Cliente agregado con éxito");
        setClientes((prevClientes) => [
          ...prevClientes,
          { nombre: newName, direccion: newAddress, banco: newBank, phone: newPhone },
        ]);
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

  // 📌 EDITAR CLIENTE
  const openEditClientDialog = (client, index) => {
    setEditingClientIndex(index);
    setEditName(client.nombre_del_cliente);
    setEditAddress(client.direccion);
    setEditBank(client.banco);
    setEditPhone(client.phone);
    setOpenEditDialog(true);
  };

  const handleUpdateClient = async () => {
  const safeEditName = editName ?? "";
  const safeEditAddress = editAddress ?? "";
  const safeEditBank = editBank ?? "";
  const safeEditPhone = editPhone ?? "";
  
  if (
    !safeEditName.trim() ||
    !safeEditAddress.trim() ||
    !safeEditBank.trim() ||
    !safeEditPhone.trim()
  ) {
    alert("Por favor, completa todos los campos.");
    return;
  }
  
  try {
    setClientes((prevClientes) => {
      const newClientes = [...prevClientes];
      newClientes[editingClientIndex] = {
        nombre: safeEditName,
        direccion: safeEditAddress,
        banco: safeEditBank,
        phone: safeEditPhone,
      };
      return newClientes;
    });
    setOpenEditDialog(false);
  } catch (error) {
    console.error("Error al actualizar cliente:", error);
    alert("Error al actualizar cliente. Revisa la consola.");
  }
};
  // 📌 ELIMINAR CLIENTE
  const handleDeleteClient = async (client, index) => {
    if (!window.confirm("¿Seguro que deseas eliminar este cliente?")) return;
    try {
      const token = localStorage.getItem("token");
      const response = await axios.delete("/api/clientes", {
        headers: { Authorization: `Bearer ${token}` },
        data: client,
      });
      if (response.data.success) {
        alert("Cliente eliminado correctamente");
        setClientes((prevClientes) => {
          const newClientes = [...prevClientes];
          newClientes.splice(index, 1);
          return newClientes;
        });
        setSelectedClientes((prevSelected) =>
          prevSelected.filter((c) => c.nombre !== client.nombre)
        );
      } else {
        alert("Error al eliminar el cliente: " + response.data.message);
      }
    } catch (error) {
      console.error("Error al eliminar cliente:", error);
      alert("Error al eliminar cliente. Revisa la consola.");
    }
  };

  // Selección individual
  const handleToggleSelect = (client) => {
    setSelectedClientes((prevSelected) => {
      const exists = prevSelected.some((c) => c.nombre === client.nombre);
      if (exists) {
        return prevSelected.filter((c) => c.nombre !== client.nombre);
      } else {
        return [...prevSelected, client];
      }
    });
  };

  // Selección masiva: todos los filtrados
  const handleSelectAll = () => {
    const filteredClientes = clientes.filter((cliente) =>
      bancoFilter ? cliente.banco === bancoFilter : true
    );
    if (filteredClientes.every((client) =>
      selectedClientes.some((c) => c.nombre === client.nombre)
    )) {
      setSelectedClientes((prevSelected) =>
        prevSelected.filter(
          (c) => !filteredClientes.some((client) => client.nombre === c.nombre)
        )
      );
    } else {
      const nuevosSeleccionados = filteredClientes.filter(
        (client) => !selectedClientes.some((c) => c.nombre === client.nombre)
      );
      setSelectedClientes((prevSelected) => [...prevSelected, ...nuevosSeleccionados]);
    }
  };

  // Filtrar clientes según banco
  const filteredClientes = clientes.filter((cliente) =>
    bancoFilter ? cliente.banco === bancoFilter : true
  );

  // Función para enviar el mensaje de WhatsApp a los clientes seleccionados
  const handleSendWhatsapp = () => {
    if (selectedClientes.length === 0) {
      alert("No hay clientes seleccionados.");
      return;
    }
    // Abrir modal para confirmar/editar el mensaje
    setOpenWhatsappModal(true);
  };

  // Función para confirmar el envío del mensaje
  const confirmSendWhatsapp = () => {
    // Iterar sobre cada cliente seleccionado y abrir el enlace de WhatsApp
    selectedClientes.forEach((client, idx) => {
      // Suponiendo que el número de teléfono está en formato correcto
      const phone = client.phone;
      const url = `https://wa.me/${phone}?text=${encodeURIComponent(whatsappMessage)}`;
      // Abrir con un delay para minimizar bloqueos por pop-ups
      setTimeout(() => {
        window.open(url, "_blank");
      }, idx * 500);
    });
    setOpenWhatsappModal(false);
  };

  return (
    <>
      <Navbar
        title="Mi Dashboard"
        onLogout={handleLogout}
        user={{ username: localStorage.getItem("activeSession") || "" }}
      />
      <Container sx={{ mt: 3 }}>
        <Stack spacing={2}>
          <div className="bt-responsive-emp">
            <Button fullWidth variant="outlined" onClick={() => navigate("/home")} style={{marginRight: 20}}>
              Volver a Home
            </Button>
            <Button fullWidth variant="contained" onClick={() => setOpenAddClientDialog(true)}>
              Agregar nuevo cliente
            </Button>
          </div>
          {bancoFilter && (
            <Button variant="outlined" onClick={handleSelectAll}>
              {filteredClientes.every((client) =>
                selectedClientes.some((c) => c.nombre === client.nombre)
              )
                ? "Deseleccionar todos"
                : "Seleccionar todos"}
            </Button>
          )}
          {selectedClientes.length > 0 && (
            <Button variant="contained" color="success" onClick={handleSendWhatsapp}>
              Enviar WhatsApp a {selectedClientes.length} seleccionado
            </Button>
          )}
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Filtrar por Banco</InputLabel>
            <Select value={bancoFilter} onChange={(e) => setBancoFilter(e.target.value)} label="Filtrar por Banco">
              <MenuItem value="">-- Todos --</MenuItem>
              {bancos.map((bancoObj, index) => (
                <MenuItem key={index} value={bancoObj.banco}>
                  {bancoObj.banco}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {filteredClientes.length > 0 ? (
            filteredClientes.map((cliente, idx) => (
              <Card key={idx} variant="outlined" sx={{ mb: 2, p: 1 }}>
                <CardContent>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={selectedClientes.some((c) => c.nombre === cliente.nombre)}
                        onChange={() => handleToggleSelect(cliente)}
                      />
                    }
                    label=""
                  />
                  <Typography variant="body1"><strong>Dirección:</strong> {cliente.direccion}</Typography>
                  <Typography variant="subtitle1"><strong>Banco:</strong> {cliente.banco}</Typography>
                  <Typography variant="body2"><strong>Phone:</strong> {cliente.phone}</Typography>
                </CardContent>
                <CardActions>
                  <Button size="small" onClick={() => openEditClientDialog(cliente, idx)}>Editar</Button>
                  <Button size="small" color="error" onClick={() => handleDeleteClient(cliente, idx)}>
                    Eliminar
                  </Button>
                </CardActions>
              </Card>
            ))
          ) : (
            <Alert severity="info">No hay clientes para mostrar.</Alert>
          )}
        </Stack>

        {/* Modal Agregar Cliente */}
        <Dialog open={openAddClientDialog} onClose={() => setOpenAddClientDialog(false)}>
          <DialogTitle>Agregar Cliente</DialogTitle>
          <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField label="Nombre" fullWidth value={newName} onChange={(e) => setNewName(e.target.value)} />
            <TextField label="Dirección" fullWidth value={newAddress} onChange={(e) => setNewAddress(e.target.value)} />
            <FormControl fullWidth>
              <InputLabel>Banco</InputLabel>
              <Select value={newBank} onChange={(e) => setNewBank(e.target.value)} label="Banco">
                {bancos.map((bancoObj, index) => (
                  <MenuItem key={index} value={bancoObj.banco}>
                    {bancoObj.banco}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField label="Phone" fullWidth value={newPhone} onChange={(e) => setNewPhone(e.target.value)} />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenAddClientDialog(false)}>Cancelar</Button>
            <Button onClick={handleAddClient} variant="contained">Guardar</Button>
          </DialogActions>
        </Dialog>

        {/* Modal Editar Cliente */}
        <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)}>
          <DialogTitle>Editar Cliente</DialogTitle>
          <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField label="Nombre" fullWidth value={editName} onChange={(e) => setEditName(e.target.value)} />
            <TextField label="Dirección" fullWidth value={editAddress} onChange={(e) => setEditAddress(e.target.value)} />
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
            <TextField label="Phone" fullWidth value={editPhone} onChange={(e) => setEditPhone(e.target.value)} />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenEditDialog(false)}>Cancelar</Button>
            <Button onClick={handleUpdateClient} variant="contained">Guardar cambios</Button>
          </DialogActions>
        </Dialog>

        {/* Modal WhatsApp */}
        <Dialog open={openWhatsappModal} onClose={() => setOpenWhatsappModal(false)}>
          <DialogTitle>Mensaje de WhatsApp</DialogTitle>
          <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="Mensaje"
              multiline
              rows={4}
              fullWidth
              value={whatsappMessage}
              onChange={(e) => setWhatsappMessage(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenWhatsappModal(false)}>Cancelar</Button>
            <Button onClick={confirmSendWhatsapp} variant="contained">Enviar</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
};

export default Emprendedoras;
