import React, { createContext, useState, useContext, useEffect } from "react";

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

  // Validar token al cargar la app
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setAuth(null); // Si no hay token, cerrar sesión
    } else if (!auth) {
      setAuth({ token }); // Si el estado está vacío, restaurar la sesión
    }
  }, []);

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
