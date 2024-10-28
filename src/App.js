import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Login from "./Login";
/* import Home from "./home"; */
import Mantenimiento from "./Mantenimiento";
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
            
            {/* <Route path="/home" element={<PrivateRoute component={Mantenimiento} />} /> */}
            {/* <Route path="/home" element={<PrivateRoute component={Home} />} /> */}
            <Route path="/catalogo" element={<Catalogo />} />  {/* Ruta libre */}
            <Route path="/catalogo3" element={<Catalogo3 />} />  {/* Ruta libre */}
            <Route path="/catalogo6" element={<Catalogo6 />} />  {/* Ruta libre */}
            <Route path="/catalogo9" element={<Catalogo9 />} />  {/* Ruta libre */}
            <Route path="/catalogo12" element={<Catalogo12 />} />  {/* Ruta libre */}
            <Route path="/catalogo18" element={<Catalogo18 />} />  {/* Ruta libre */}
            <Route path="/catalogo20" element={<Catalogo20 />} />  {/* Ruta libre */}
            <Route path="/catalogo24" element={<Catalogo24 />} />  {/* Ruta libre */}
            {/* <Route path="/" element={<Navigate to="/login" />} /> */}
            <Route path="/" element={<Mantenimiento />} />  {/* Ruta libre */}
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

// Ruta privada que solo permite el acceso si el usuario está autenticado
/* const PrivateRoute = ({ component: Component }) => {
  const { auth } = useAuth();

  if (!auth || !auth.token) {
    return <Navigate to="/login" />;
  }

  return <Component />;
}; */

// Ruta de login que redirige al usuario a "home" si ya está autenticado
const LoginRoute = () => {
  const { auth } = useAuth();

  if (auth && auth.token) {
    return <Navigate to="/home" />;
  }

  return <Login />;
};

export default App;
