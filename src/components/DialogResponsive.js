import React, { useState } from "react";
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, IconButton, useMediaQuery } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useTheme } from "@mui/material/styles";
import CardGenerator from "./CardGenerator"; // Asegúrate de que la ruta sea correcta

const DialogResponsive = ({ 
  selectedProduct,
  selectedQuota,
  customQuotaValue,
  selectedBank,
  titleColor,
  selectedFont,
  titleFontSize,
  quotaFontSize
}) => {
  const [open, setOpen] = useState(false);
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm")); // Detecta si está en mobile

  const handleOpen = () => {
    setOpen(true);
    setTimeout(() => {
        window.dispatchEvent(new Event("resize")); // Forzar re-render en mobile
    }, 300);
    };

  const handleClose = () => {
    setOpen(false);
  };

  // Validar si hay una placa generada (un producto seleccionado)
  const isDisabled = !selectedProduct;

  return (
    <>
      {/* Botón para abrir el Dialog, deshabilitado si no hay producto */}
      <Button 
        size="large" 
        className="mobile fixed-float" 
        variant="contained" 
        color="secondary" 
        onClick={handleOpen}
        disabled={isDisabled} // Bloquea el botón si no hay producto
      >
        Vista Previa
      </Button>

      {/* Dialog Responsive */}
      <Dialog open={open} onClose={handleClose} fullScreen={fullScreen} fullWidth maxWidth="sm">
        <DialogTitle>
          Vista Previa
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers className="flex flex-direction items-center">
          {/* CardGenerator dentro del Dialog */}
          <CardGenerator
            selectedProducts={[selectedProduct]}
            selectedQuota={selectedQuota}
            customQuotaValue={customQuotaValue}
            selectedBank={selectedBank}
            titleColor={titleColor}
            selectedFont={selectedFont}
            titleFontSize={titleFontSize}
            quotaFontSize={quotaFontSize}
          />
        </DialogContent>

        <DialogActions>
          <Button variant="outlined" onClick={handleClose}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DialogResponsive;
