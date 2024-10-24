import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(() => {
    // Obtener el token desde localStorage al iniciar la app
    const token = localStorage.getItem('token');
    return token ? { token } : null;
  });

  const login = (token) => {
    setAuth({ token });
    localStorage.setItem('token', token); // Guardar el token en localStorage
  };

  const logout = () => {
    setAuth(null);
    localStorage.removeItem('token'); // Limpiar el token
  };

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
