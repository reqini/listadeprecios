import React, { useState, useEffect } from "react";
import axios from "../utils/axios";
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import { Avatar, Divider, useMediaQuery } from "@mui/material";
import ListItemAvatar from '@mui/material/ListItemAvatar';
import { useTheme } from '@mui/material/styles';
import '../css/index.css';

export default function BancosDialog() {
  const [open, setOpen] = useState(false);
  const [bancos, setBancos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Detectar si la pantalla es mobile
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    const getData = async () => {
      try {
        const result = await axios.get(`/api/bancos`);
        /* console.log(result.data); */
        setBancos(result.data);
      } catch (error) {
        console.error("Error fetching bancos data:", error);
      } finally {
        setLoading(false);
      }
    };

    getData();
  }, []);

  if (loading) return <p>Cargando...</p>;

  return (
    <React.Fragment>
      {/* Botón fijo con ajuste dinámico en mobile y desktop */}
      <Button
        variant="contained"
        color="secondary"
        onClick={handleClickOpen}
        style={{
          width: 'auto',
          position: 'fixed',
          right: 20,
        }}
        className="fixed-btn"
      >
        Promociones Bancarias
      </Button>

      {/* Modal con la lista de bancos y promociones, fullscreen en mobile */}
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="bancos-dialog-title"
        fullScreen={fullScreen} // Se activa en pantallas pequeñas
      >
        <DialogTitle id="bancos-dialog-title">
          Promociones Bancarias
        </DialogTitle>
        <DialogContent>
          <List sx={{ width: '100%', minWidth: 300, bgcolor: 'background.paper' }}>
            {bancos.length > 0 ? (
              bancos.map((banco, index) => (
                <React.Fragment key={index}>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar src={banco.logo} alt={banco.nombre} />
                    </ListItemAvatar>
                    <ListItemText
                      primary={banco.banco}
                      secondary={
                        <div style={{ color: 'green' }}>
                          {banco.promocion && <p>{banco.promocion}</p>}
                          <ul>
                            {Object.entries({
                              tres: "3",
                              seis: "6",
                              nueve: "9",
                              doce: "12",
                              dieciocho: "18",
                              veinte: "20",
                              veinticuatro: "24"
                            }).map(([key, value]) => {
                              if (banco[key] === "SI" || banco[key] === "TLD") {
                                return (
                                  <li key={key}>
                                    {`${value} cuotas`}
                                  </li>
                                );
                              } else if (banco[key] === "VIGENCIA" && banco.vigencia) {
                                return (
                                  <li key={key}>
                                    <span style={{ color: 'green' }}>{`${value} cuotas:`}</span>
                                    <span style={{ color: 'black' }}> {banco.vigencia}</span>
                                  </li>
                                );
                              } else {
                                return null;
                              }
                            })}
                          </ul>
                        </div>
                      }
                    />
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))
            ) : (
              <p style={{ textAlign: "center", color: "red" }}>No hay promociones disponibles</p>
            )}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} autoFocus>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
