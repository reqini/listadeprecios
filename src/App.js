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
import PerfilEmprendedora from "./pages/PerfilEmprendedora";
import LandingPage from "./pages/LandingPage";
import Capacitaciones from "./pages/Capacitaciones";
import PremiumRoute from "./components/PremiumRoute";
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
          <Route path="/home" element={
            <PrivateRoute>
              <PremiumRoute requiredPermission="canAccessHome">
                <Home />
              </PremiumRoute>
            </PrivateRoute>
          } />
          <Route path="/faqs" element={
            <PrivateRoute>
              <PremiumRoute requiredPermission="canAccessFaqs">
                <FaqScreen />
              </PremiumRoute>
            </PrivateRoute>
          } />
          <Route path="/preferencial" element={<Preferencial />} />
          <Route path="/catalogo3" element={
            <PremiumRoute requiredPermission="canAccessCatalogs">
              <Catalogo3 />
            </PremiumRoute>
          } />
          <Route path="/catalogo6" element={
            <PremiumRoute requiredPermission="canAccessCatalogs">
              <Catalogo6 />
            </PremiumRoute>
          } />
          <Route path="/catalogo9" element={
            <PremiumRoute requiredPermission="canAccessCatalogs">
              <Catalogo9 />
            </PremiumRoute>
          } />
          <Route path="/catalogo10" element={
            <PremiumRoute requiredPermission="canAccessCatalogs">
              <Catalogo10 />
            </PremiumRoute>
          } />
          <Route path="/catalogo12" element={
            <PremiumRoute requiredPermission="canAccessCatalogs">
              <Catalogo12 />
            </PremiumRoute>
          } />
          <Route path="/catalogo14" element={
            <PremiumRoute requiredPermission="canAccessCatalogs">
              <Catalogo14 />
            </PremiumRoute>
          } />
          <Route path="/catalogo18" element={
            <PremiumRoute requiredPermission="canAccessCatalogs">
              <Catalogo18 />
            </PremiumRoute>
          } />
          <Route path="/catalogo20" element={
            <PremiumRoute requiredPermission="canAccessCatalogs">
              <Catalogo20 />
            </PremiumRoute>
          } />
          <Route path="/catalogo24" element={
            <PremiumRoute requiredPermission="canAccessCatalogs">
              <Catalogo24 />
            </PremiumRoute>
          } />
          <Route path="/contado" element={<Contado />} />
          <Route path="/generarPlaca" element={
            <PrivateRoute>
              <PremiumRoute requiredPermission="canGeneratePlacas">
                <GeneradorDePlacas />
              </PremiumRoute>
            </PrivateRoute>
          } />
          <Route path="/emprendedoras" element={
            <PrivateRoute>
              <PremiumRoute requiredPermission="canAccessEmprendedoras">
                <Emprendedoras />
              </PremiumRoute>
            </PrivateRoute>
          } />
          <Route path="/ventas" element={
            <PrivateRoute>
              <PremiumRoute requiredPermission="canAccessVentas">
                <Ventas />
              </PremiumRoute>
            </PrivateRoute>
          } />
          <Route path="/perfil" element={<PrivateRoute><PerfilEmprendedora /></PrivateRoute>} />
          <Route path="/capacitaciones" element={
            <PrivateRoute>
              <PremiumRoute requiredPermission="canAccessCapacitaciones">
                <Capacitaciones />
              </PremiumRoute>
            </PrivateRoute>
          } />
          <Route path="/" element={<LandingPage />} />
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
