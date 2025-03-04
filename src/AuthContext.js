import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "./utils/axios"; // Importación de axios

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(() => {
    const token = localStorage.getItem("token");
    return token ? { token } : null; // Inicializar con el token si existe
  });

  const login = (token, deviceId) => {
    setAuth({ token });
    localStorage.setItem("token", token); // Guardar el token en localStorage
    localStorage.setItem("deviceId", deviceId); // Guardar deviceId en localStorage
  };

  const logout = () => {
    setAuth(null);
    localStorage.removeItem("token"); // Eliminar el token de localStorage
    localStorage.removeItem("deviceId"); // Eliminar el deviceId de localStorage
  };

  // Validar token y detectar si fue deslogueado desde otro dispositivo
// Validar token y detectar si fue deslogueado desde otro dispositivo
useEffect(() => {
  const validateSession = async () => {
    const token = localStorage.getItem("token");
    const currentDeviceId = localStorage.getItem("deviceId");

    if (token) {
      try {
        await axios.post("/api/validate-session", { token, deviceId: currentDeviceId });
        // Se elimina la lógica que desloguea y muestra el mensaje
        // if (!response.data.valid) {
        //   logout();
        //   alert("Fuiste deslogueado porque tu sesión se inició en otro dispositivo.");
        // }
      } catch (error) {
        console.error("Error al validar la sesión:", error.message);
        // Si deseas, también puedes quitar el logout aquí
        // logout();
      }
    }
  };

  const interval = setInterval(validateSession, 5000); // Validar cada 5 segundos

  return () => clearInterval(interval);
}, [auth]);


  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const useAuth = () => {
  return useContext(AuthContext);
};
