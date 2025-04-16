import React, { useRef, useState } from "react";
import { Button, Box, Typography } from "@mui/material";
import UploadIcon from "@mui/icons-material/Upload";

const FancyFileInput = ({ onFileSelect }) => {
  const fileInputRef = useRef(null);
  const [fileName, setFileName] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setPreviewUrl(URL.createObjectURL(file));
    if (onFileSelect) onFileSelect(file);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2}}>
      <Button
        variant="outlined"
        color="primary"
        style={{maxWidth: 300}}
        startIcon={<UploadIcon />}
        onClick={() => fileInputRef.current.click()}
      >
        Subir imagen de fondo
      </Button>

      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
      />

      {fileName && (
        <Typography variant="body2" color="textSecondary">
          Archivo seleccionado: <strong>{fileName}</strong>
        </Typography>
      )}

      {previewUrl && (
        <Box
          sx={{
            border: "1px dashed #ccc",
            borderRadius: 2,
            overflow: "hidden",
            width: "100%",
            maxHeight: 240,
            objectFit: "cover",
          }}
        >
          <img
            src={previewUrl}
            alt="preview"
            style={{ width: "100%", height: "auto" }}
          />
        </Box>
      )}
    </Box>
  );
};

export default FancyFileInput;
