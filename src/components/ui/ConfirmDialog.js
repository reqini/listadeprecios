import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";

/**
 * Diálogo de confirmación genérico para acciones destructivas o
 * irreversibles (ej. vaciar el carrito).
 */
const ConfirmDialog = ({
  open,
  title,
  message,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  onConfirm,
  onCancel,
  destructive = true,
}) => (
  <Dialog open={open} onClose={onCancel} aria-labelledby="confirm-dialog-title">
    <DialogTitle id="confirm-dialog-title">{title}</DialogTitle>
    <DialogContent>
      <DialogContentText>{message}</DialogContentText>
    </DialogContent>
    <DialogActions>
      <Button onClick={onCancel}>{cancelLabel}</Button>
      <Button
        onClick={onConfirm}
        color={destructive ? "error" : "primary"}
        variant="contained"
        autoFocus
      >
        {confirmLabel}
      </Button>
    </DialogActions>
  </Dialog>
);

export default ConfirmDialog;
