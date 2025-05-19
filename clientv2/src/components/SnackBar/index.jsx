import * as React from "react";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

export default function CustomizedSnackbars({ open, handleClose, message }) {
  return (
    <Snackbar
      open={open}
      autoHideDuration={3000}
      onClose={handleClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      message={message}
    >
      <Alert onClose={handleClose} severity="success" variant="filled">
        {message}
      </Alert>
    </Snackbar>
  );
}
