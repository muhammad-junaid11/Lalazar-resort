import React from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from "@mui/material";

const ConfirmDialog = ({ open, onClose, title, description, onConfirm, confirmText = "Yes", cancelText = "No", color = "error" }) => {
  return (
    <Dialog open={open} onClose={() => onClose(false)} maxWidth="xs" fullWidth>
      {title && <DialogTitle>{title}</DialogTitle>}
      <DialogContent>
        <Typography>{description}</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClose(false)} variant="outlined">
          {cancelText}
        </Button>
        <Button
          onClick={() => {
            onConfirm();
            onClose(false);
          }}
          variant="contained"
          color={color}
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;
