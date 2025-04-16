import React from "react";
import { Fab } from "@mui/material";
import { FaWhatsapp } from "react-icons/fa";

const WhatsAppFloatButton = () => {
  const whatsappChannelUrl = "https://whatsapp.com/channel/0029VawID571t90UuObI5340";

  return (
    <Fab
      href={whatsappChannelUrl}
      target="_blank"
      color="primary"
      style={{
        position: "fixed",
        bottom: 20,
        right: 20,
        backgroundColor: "#25D366",
        color: "white",
        fontWeight: "bold",
        textTransform: "none",
      }}
    >
      <FaWhatsapp size={24} style={{ marginRight: 8 }} />
      Unite
    </Fab>
  );
};

export default WhatsAppFloatButton;
