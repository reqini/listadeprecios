import React, { useState } from "react";
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, IconButton, useMediaQuery } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useTheme } from "@mui/material/styles";

const DialogResponsive = ({ 
  disabled,
  selectedDesign,
  handleApply,
  designs = []
}) => {
  const [open, setOpen] = useState(false);
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const handleOpen = () => {
    setOpen(true);
    setTimeout(() => window.dispatchEvent(new Event("resize")), 300); // Fix slick en mobile
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Button 
        size="large" 
        className="mobile fixed-float" 
        variant="contained" 
        color="secondary" 
        onClick={handleOpen}
        disabled={disabled}
      >
        Vista Previa
      </Button>

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

        <DialogContent dividers style={{ padding: 0 }}>
          {designs.map((component, idx) => (
              <div key={idx}>{component}</div>
            ))}
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
