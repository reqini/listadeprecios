import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Register from "./Registro";
import Login from "./Login";
import Home from "./home";
import Catalogo from "./catalogo";
import Catalogo3 from "./catalogo3";
import Catalogo6 from "./catalogo6";
import Catalogo9 from "./catalogo9";
import Catalogo12 from "./catalogo12";
import Catalogo18 from "./catalogo18";
import Catalogo20 from "./catalogo20";
import Catalogo24 from "./catalogo24";
import { AuthProvider, useAuth } from './AuthContext';

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

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginRoute />} />
            <Route path="/registro" element={<Register />} />
            <Route path="/home" element={<PrivateRoute component={Home} />} />
            <Route path="/catalogo" element={<PrivateRoute component={Catalogo} />} />
            <Route path="/catalogo3" element={<PrivateRoute component={Catalogo3} />} />
            <Route path="/catalogo6" element={<PrivateRoute component={Catalogo6} />} />
            <Route path="/catalogo9" element={<PrivateRoute component={Catalogo9} />} />
            <Route path="/catalogo12" element={<PrivateRoute component={Catalogo12} />} />
            <Route path="/catalogo18" element={<PrivateRoute component={Catalogo18} />} />
            <Route path="/catalogo20" element={<PrivateRoute component={Catalogo20} />} />
            <Route path="/catalogo24" element={<PrivateRoute component={Catalogo24} />} />
            <Route path="/" element={<Navigate to="/login" />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

// Ruta privada que solo permite el acceso si el usuario está autenticado
const PrivateRoute = ({ component: Component }) => {
  const { auth } = useAuth();

  if (!auth || !auth.token) {
    return <Navigate to="/login" />;
  }

  return <Component />;
};

// Ruta de login que redirige al usuario a "home" si ya está autenticado
const LoginRoute = () => {
  const { auth } = useAuth();

  if (auth && auth.token) {
    return <Navigate to="/home" />;
  }

  return <Login />;
};

export default App;
