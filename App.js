import React, { useEffect, useMemo } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import ReactGA from "react-ga4";

// Páginas y componentes
import Login from "./Login";
import Home from "./home";
import FaqScreen from "./components/FaqScreen";
import Catalogo3 from "./catalogo3";
import Catalogo6 from "./catalogo6";
import Catalogo9 from "./catalogo9";
import Catalogo10 from "./catalogo10";
import Catalogo12 from "./catalogo12";
import Catalogo14 from "./catalogo14";
import Catalogo15 from "./catalogo15";
import Catalogo18 from "./catalogo18";
import Catalogo20 from "./catalogo20";
import Catalogo24 from "./catalogo24";
import Register from "./Registro";
import Ventas from "./Ventas";
import Preferencial from "./Preferencial";
import Contado from "./contado";
import Activos from "./Activos";
import Emprendedoras from "./Emprendedoras";
import GeneradorDePlacas from "./GeneradorDePlacas";
import CatalogoIndividual from "./pages/CatalogoIndividual";
import { AuthProvider, useAuth } from "./AuthContext";

// Google Analytics
const TRACKING_ID = "G-5S2G3FYSPS";
ReactGA.initialize(TRACKING_ID);

// 🔐 Rutas protegidas
const PrivateRoute = ({ children }) => {
  const { auth } = useAuth();
  return auth?.token ? children : <Navigate to="/login" replace />;
};

const LoginRoute = () => {
  const { auth } = useAuth();
  return auth?.token ? <Navigate to="/home" replace /> : <Login />;
};

// 📈 Tracker para Analytics
const AnalyticsTracker = () => {
  const location = useLocation();
  useEffect(() => {
    ReactGA.send({ hitType: "pageview", page: location.pathname });
  }, [location]);
  return null;
};

const AppContent = () => {
  const theme = useMemo(() => {
    const primary = localStorage.getItem("userPrimary") || "#A47A9E";
    const secondary = localStorage.getItem("userSecondary") || "#FFC43C";
    return createTheme({
      palette: {
        primary: { main: primary },
        secondary: { main: secondary },
      },
    });
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <Router>
        <AnalyticsTracker />
        <Routes>
          <Route path="/activos" element={<Activos />} />
          <Route path="/login" element={<LoginRoute />} />
          <Route path="/registro" element={< Register/>} />
          <Route path="/home" element={<PrivateRoute><Home /></PrivateRoute>} />
          <Route path="/faqs" element={<PrivateRoute><FaqScreen /></PrivateRoute>} />
          <Route path="/preferencial" element={<Preferencial />} />
          
          {/* Rutas normales sin switch (NO muestran carrusel) */}
          <Route path="/catalogo3" element={<Catalogo3 />} />
          <Route path="/catalogo6" element={<Catalogo6 />} />
          <Route path="/catalogo9" element={<Catalogo9 />} />
          <Route path="/catalogo10" element={<Catalogo10 />} />
          <Route path="/catalogo12" element={<Catalogo12 />} />
          <Route path="/catalogo14" element={<Catalogo14 />} />
          <Route path="/catalogo15" element={<Catalogo15 />} />
          <Route path="/catalogo18" element={<Catalogo18 />} />
          <Route path="/catalogo20" element={<Catalogo20 />} />
          <Route path="/catalogo24" element={<Catalogo24 />} />
          <Route path="/contado" element={<Contado />} />
          
          <Route path="/generarPlaca" element={<PrivateRoute><GeneradorDePlacas /></PrivateRoute>} />
          <Route path="/emprendedoras" element={<PrivateRoute><Emprendedoras /></PrivateRoute>} />
          <Route path="/ventas" element={<PrivateRoute><Ventas /></PrivateRoute>} />
          
          {/* Ruta dinámica para catálogos individuales: /{slug}/{cuota} */}
          {/* IMPORTANTE: Esta ruta debe ir DESPUÉS de todas las rutas específicas */}
          {/* Maneja TODAS las URLs tipo /cocinaty/12, /carlaessen/18, etc. */}
          <Route path="/:slug/:cuota" element={<CatalogoIndividual />} />
          
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

const App = () => {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistration().then((registration) => {
        if (registration) {
          registration.onupdatefound = () => {
            const installingWorker = registration.installing;
            if (installingWorker) {
              installingWorker.onstatechange = () => {
                if (installingWorker.state === "installed" && navigator.serviceWorker.controller) {
                  alert("Nueva versión disponible. Se actualizará automáticamente.");
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
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
