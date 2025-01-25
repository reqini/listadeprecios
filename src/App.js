import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Login from "./Login";
import Home from "./home";
import Registro from "./Registro";
import Catalogo from "./catalogo";
import { AuthProvider, useAuth } from "./AuthContext";
import axios from "axios";

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

  if (!auth || !auth.token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Ruta para login
const LoginRoute = () => {
  const { auth } = useAuth();

  if (auth && auth.token) {
    return <Navigate to="/home" replace />;
  }

  return <Login />;
};

const App = () => {
  const [dynamicRoutes, setDynamicRoutes] = useState([]);

  useEffect(() => {
    const fetchDynamicRoutes = async () => {
      try {
        const { data } = await axios.get("http://localhost:3001/api/dynamic-urls");
        if (data.success && data.urls) {
          setDynamicRoutes(data.urls);
        } else {
          console.error("Error: respuesta inesperada del backend", data);
        }
      } catch (error) {
        console.error("Error fetching dynamic routes:", error);
      }
    };

    fetchDynamicRoutes();
  }, []);

  useEffect(() => {
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
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistration().then((registration) => {
        if (registration) {
          registration.onupdatefound = () => {
            const installingWorker = registration.installing;
            if (installingWorker) {
              installingWorker.onstatechange = () => {
                if (installingWorker.state === "installed" && navigator.serviceWorker.controller) {
                  alert("Hay una nueva versión disponible. La aplicación se actualizará automáticamente.");
                  window.location.reload();
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
            <Route path="/catalogo" element={<Catalogo />} />
            {dynamicRoutes.map((route, index) => {
              const path = new URL(route).pathname; // Extraer el path de la URL dinámica
              return <Route key={index} path={path} element={<Catalogo />} />;
            })}
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;