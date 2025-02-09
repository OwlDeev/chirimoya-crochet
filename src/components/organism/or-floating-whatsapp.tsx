import React from "react";
import "./or-floating-whatsapp.css"
import { FaWhatsapp } from "react-icons/fa"; // Importamos el ícono de WhatsApp

const FloatingWhatsApp = () => {
  const phoneNumber = "33758371043"; // Reemplaza con tu número de WhatsApp

  return (
    <a
      href={`https://wa.me/${phoneNumber}`}
      target="_blank"
      rel="noopener noreferrer"
      className="floating-whatsapp"
    >
      <FaWhatsapp />
    </a>
  );
};

export default FloatingWhatsApp;
