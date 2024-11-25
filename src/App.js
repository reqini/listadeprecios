import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Login from "./Login";
import Home from "./home";
import Registro from "./Registro";
import Catalogo from "./catalogo";
import Catalogo3 from "./catalogo3";
import Catalogo6 from "./catalogo6";
import Catalogo9 from "./catalogo9";
import Catalogo12 from "./catalogo12";
import Catalogo18 from "./catalogo18";
import Catalogo20 from "./catalogo20";
import Catalogo24 from "./catalogo24";
import { AuthProvider, useAuth } from "./AuthContext";

// Tema personalizado
const theme = createTheme({
  palette: {
    primary: {
      dark: "#765471",
      main: "#A47A9E",
      light: "#D7AED2",
    },
    secondary: {
      dark: "#E8CD91",
      main: "#FBE5B2",
      light: "#FFF0CC",
    },
  },
});

// Ruta privada
const PrivateRoute = ({ children }) => {
  const { auth } = useAuth();

  // Verificar si el token está presente en el contexto de autenticación
  if (!auth || !auth.token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Ruta para login
const LoginRoute = () => {
  const { auth } = useAuth();

  // Redirigir a la home si ya hay un token activo
  if (auth && auth.token) {
    return <Navigate to="/home" replace />;
  }

  return <Login />;
};

const App = () => {
  useEffect(() => {
    // Limpieza automática de datos almacenados
    try {
      const authData = localStorage.getItem("token");
      if (!authData || typeof authData !== "string") {
        localStorage.clear();
        sessionStorage.clear();
      }
    } catch (error) {
      console.error("Error limpiando datos almacenados:", error);
      localStorage.clear();
      sessionStorage.clear();
    }
  }, []);

  useEffect(() => {
    // Detectar nuevas versiones del Service Worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistration().then((registration) => {
        if (registration) {
          registration.onupdatefound = () => {
            const installingWorker = registration.installing;
            if (installingWorker) {
              installingWorker.onstatechange = () => {
                if (installingWorker.state === "installed" && navigator.serviceWorker.controller) {
                  // Mostrar alerta para actualizar
                  alert("Hay una nueva versión disponible. La aplicación se actualizará automáticamente.");
                  window.location.reload(); // Recarga la aplicación
                }
              };
            }
          };
        }
      });
    }
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginRoute />} />
            <Route path="/registro" element={<Registro />} />
            <Route path="/home" element={<PrivateRoute><Home /></PrivateRoute>} />
            <Route path="/catalogo" element={<PrivateRoute><Catalogo /></PrivateRoute>} />
            <Route path="/catalogo3" element={<PrivateRoute><Catalogo3 /></PrivateRoute>} />
            <Route path="/catalogo6" element={<PrivateRoute><Catalogo6 /></PrivateRoute>} />
            <Route path="/catalogo9" element={<PrivateRoute><Catalogo9 /></PrivateRoute>} />
            <Route path="/catalogo12" element={<PrivateRoute><Catalogo12 /></PrivateRoute>} />
            <Route path="/catalogo18" element={<PrivateRoute><Catalogo18 /></PrivateRoute>} />
            <Route path="/catalogo20" element={<PrivateRoute><Catalogo20 /></PrivateRoute>} />
            <Route path="/catalogo24" element={<PrivateRoute><Catalogo24 /></PrivateRoute>} />
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
