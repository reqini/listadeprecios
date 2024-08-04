// ShareButton.js
import React from 'react';
import { FaWhatsapp } from 'react-icons/fa';

const ShareButton = ({ title, description }) => {
  const handleShare = () => {
    const text = `¡Hola! Quiero este producto: ${title} - Linea: ${description}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <button onClick={handleShare} style={styles.button}>
      <FaWhatsapp style={styles.icon} />
      Compartir por WhatsApp
    </button>
  );
};

const styles = {
  button: {
    backgroundColor: '#25D366',
    width: '100%',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    padding: '10px 15px',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    marginRight: '8px',
  },
};

export default ShareButton;
