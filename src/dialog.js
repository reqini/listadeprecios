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
import { Avatar, Divider } from "@mui/material";
import ListItemAvatar from '@mui/material/ListItemAvatar';


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
                    <ListItemAvatar>
                        <Avatar src={bancos.logo} />
                    </ListItemAvatar>
                    <ListItemText primary={bancos.banco} secondary={
                        <p style={{color: 'green'}}>
                            {bancos.diesiocho === 'todos los dias' ? 
                            <i> 18 sin interes<br/></i> : bancos.diesiocho === 'vigencia' ?
                            <i>18 sin interes <span className="font-vigencia">{bancos.vigencia}</span><br/></i> : null
                            }
                            {bancos.dose === 'todos los dias' ? 
                            <i> 12 sin interes<br/></i> : bancos.dose === 'vigencia' ?
                            <i>12 sin interes <span className="font-vigencia">{bancos.vigencia}</span><br/></i> : null
                            }
                            {bancos.diez === 'todos los dias' ? 
                            <i> 10 sin interes<br/></i> : bancos.diez === 'vigencia' ?
                            <i>10 sin interes <span className="font-vigencia">{bancos.vigencia}</span><br/></i> : null
                            }
                            {bancos.nueve === 'todos los dias' ? 
                            <i> 9 sin interes<br/></i> : bancos.nueve === 'vigencia' ?
                            <i>9 sin interes <span className="font-vigencia">{bancos.vigencia}</span><br/></i> : null
                            }
                            {bancos.seis === 'todos los dias' ? 
                            <i> 6 sin interes<br/></i> : bancos.seis === 'vigencia' ?
                            <i>6 sin interes <span className="font-vigencia">{bancos.vigencia}</span><br/></i> : null
                            }
                            {bancos.tres === 'todos los dias' ? 
                            <i> 3 sin interes<br/></i> : bancos.tres === 'vigencia' ?
                            <i> 3 sin interes <span className="font-vigencia">{bancos.vigencia}</span><br/></i> : null
                            }
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
