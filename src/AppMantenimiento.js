import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Mantenimiento from "./Mantenimiento";
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
import Preferencial from "./Preferencial";
import Home from "./home";
import { AuthProvider } from './AuthContext';

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

const AppMantenimiento = () => {
  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Mantenimiento />} />
            <Route path="/pruebas" element={<Home />} />
            <Route path="/home" element={<Mantenimiento />} />
            <Route path="/preferencial" element={<Preferencial />} />
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
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default AppMantenimiento;
