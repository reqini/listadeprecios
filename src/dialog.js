import React, { useEffect, useState } from "react";
import axios from "axios";
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import { Divider } from "@mui/material";


export default function ResponsiveDialog() {
    const url = "https://backtest-production-7f88.up.railway.app";
    const [open, setOpen] = React.useState(false);
    const [bancosFiltrados, setBancosFiltrados] = useState([]);
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    const getData = async () => {
      const result = await axios.get(`${url}/api/bancos`);
      setBancosFiltrados(result.data);
    };

    getData();
  }, []);

  return (
    <React.Fragment>
      <Button variant="contained" color="secondary" onClick={handleClickOpen} style={{width: 'auto'}}> 
      Promociones Bancarias
      </Button>
      <Dialog
        fullScreen={fullScreen}
        open={open}
        onClose={handleClose}
        aria-labelledby="responsive-dialog-title"
      >
        <DialogTitle id="responsive-dialog-title">
          {"Promociones Bancarias"}
        </DialogTitle>
        <DialogContent>
            <List sx={{ width: '100%', minWidth: 300, bgcolor: 'background.paper' }}>
                {bancosFiltrados.map((bancos) => (
                <>
                <ListItem>
                    <ListItemText primary={bancos.banco} secondary={
                        <p style={{color: 'green'}}>
                            {`
                            ${bancos.diesiocho !== 'no' ? bancos.diesiocho + ' |' : ''} 
                            ${bancos.dose !== 'no' ? bancos.dose + ' |' : ''}
                            ${bancos.diez !== 'no' ? bancos.diez + ' |' : ''}
                            ${bancos.nueve !== 'no' ? bancos.nueve + ' |' : ''}
                            ${bancos.seis !== 'no' ? bancos.seis + ' |' : ''}
                            ${bancos.tres !== 'no' ? bancos.tres + ' |' : ''}
                            `}
                        </p>
                    } />
                </ListItem>
                <Divider />
                </>
                   ),
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
