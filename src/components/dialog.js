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
import { Avatar, Divider } from "@mui/material";
import ListItemAvatar from '@mui/material/ListItemAvatar';

export default function BancosDialog() {
  const [open, setOpen] = useState(false);
  const [bancos, setBancos] = useState([]);
  const [loading, setLoading] = useState(true);

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
       /*  console.log(result.data);  */
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
      <Button variant="contained" color="secondary" onClick={handleClickOpen} style={{ width: 'auto' }}>
        Promociones Bancarias
      </Button>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="bancos-dialog-title"
      >
        <DialogTitle id="bancos-dialog-title">
          Promociones Bancarias
        </DialogTitle>
        <DialogContent>
          <List sx={{ width: '100%', minWidth: 300, bgcolor: 'background.paper' }}>
            {bancos.map((banco, index) => (
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
                              // Muestra las cuotas que tienen "SI" o "TLD"
                              return (
                                <li key={key}>
                                  {`${value} cuotas`}
                                </li>
                              );
                            } else if (banco[key] === "VIGENCIA" && banco.vigencia) {
                              // Muestra las cuotas que tienen "VIGENCIA" con el texto adicional
                              return (
                                <li key={key}>
                                  <span style={{ color: 'green' }}>{`${value} cuotas:`}</span>
                                  <span style={{ color: 'black' }}> {banco.vigencia}</span>
                                </li>
                              );
                            } else {
                              return null; // No mostrar si no es "SI", "TLD", o "VIGENCIA"
                            }
                          })}
                        </ul>
                      </div>
                    }
                  />
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
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
