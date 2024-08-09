import React, { useState, useEffect } from 'react';
import Tooltip from '@mui/material/Tooltip';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import ReportGmailerrorredIcon from '@mui/icons-material/ReportGmailerrorred';

const AlertComponent = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 968) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
    };

    // Run the function on initial render
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup event listener on component unmount
    return () => window.removeEventListener('resize', handleResize);
  }, []);


  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div>
      {!isVisible && (
        <Tooltip title="ver promos bancarias" placement="top">
          <ReportGmailerrorredIcon fontSize="small" color="primary" style={{ marginLeft: 5 }} />
        </Tooltip>
      )}
      {isVisible && (
        <>
          <Button style={{minWidth: 30}} size="small" onClick={handleClickOpen}>
            <ReportGmailerrorredIcon fontSize="small" color="primary" style={{ marginLeft: 5 }} />
          </Button>
          <Dialog onClose={handleClose} open={open}>
            <div style={{ padding: 20 }}>
              <p>Ver promos bancarias</p>
              <Button variant="contained" size="small" onClick={handleClose}>
                Cerrar
              </Button>
            </div>
          </Dialog>
        </>
      )}
    </div>
  );
};

export default AlertComponent;
