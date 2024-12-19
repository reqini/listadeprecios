import React, { createContext, useState, useContext, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(() => {
    const token = localStorage.getItem("token");
    return token ? { token } : null; // Inicializar con el token si existe
  });

  const login = (token) => {
    setAuth({ token });
    localStorage.setItem("token", token); // Guardar el token en localStorage
  };

  const logout = () => {
    setAuth(null);
    localStorage.removeItem("token"); // Eliminar el token de localStorage
  };

  // Validar token y detectar si fue deslogueado desde otro dispositivo
  useEffect(() => {
    const token = localStorage.getItem("token");
    const interval = setInterval(() => {
      if (token) {
        try {
          const decoded = jwtDecode(token);
          const currentDeviceId = localStorage.getItem("deviceId");
          if (decoded.deviceId !== currentDeviceId) {
            // Si el token no coincide con el deviceId actual, cerrar sesión
            logout();
            alert("Fuiste deslogueado porque tu sesión se inició en otro dispositivo.");
          }
        } catch (error) {
          console.error("Error al decodificar el token:", error.message);
          logout(); // Si hay un error, cerramos sesión por seguridad
        }
      }
    }, 5000); // Verificar cada 5 segundos

    return () => clearInterval(interval); // Limpiar intervalo al desmontar
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
