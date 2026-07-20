import { createTheme } from "@mui/material/styles";

// Formaliza el lenguaje visual que ya usaban los componentes "Modern*"
// (ModernCartBottomSheet, ModernProductCardAirbnb): cards con borde
// redondeado, sombra suave que se profundiza en hover, y un lift sutil
// (translateY) en vez de inventar un lenguaje nuevo.
const SOFT_SHADOW = "0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)";
const SOFT_SHADOW_HOVER = "0 4px 12px rgba(0,0,0,0.15), 0 2px 4px rgba(0,0,0,0.1)";
const TRANSITION = "all 0.2s ease";

export function buildAppTheme() {
  const primary = localStorage.getItem("userPrimary") || "#666666";
  const secondary = localStorage.getItem("userSecondary") || "#FFC43C";

  return createTheme({
    palette: {
      primary: { main: primary },
      secondary: { main: secondary },
    },
    shape: {
      borderRadius: 12,
    },
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      h1: { fontWeight: 700, fontSize: "2.5rem" },
      h2: { fontWeight: 700, fontSize: "2rem" },
      h3: { fontWeight: 600, fontSize: "1.75rem" },
      h4: { fontWeight: 600, fontSize: "1.5rem" },
      h5: { fontWeight: 600, fontSize: "1.25rem" },
      h6: { fontWeight: 600, fontSize: "1.1rem" },
      body1: { fontSize: "1rem", lineHeight: 1.5 },
      body2: { fontSize: "0.875rem", lineHeight: 1.43 },
      button: { fontWeight: 600, textTransform: "none" },
    },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            boxShadow: SOFT_SHADOW,
            transition: TRANSITION,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          rounded: {
            borderRadius: 12,
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            textTransform: "none",
            transition: TRANSITION,
          },
          contained: {
            boxShadow: SOFT_SHADOW,
            "&:hover": {
              boxShadow: SOFT_SHADOW_HOVER,
              transform: "translateY(-1px)",
            },
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            transition: TRANSITION,
          },
        },
      },
      MuiTextField: {
        defaultProps: {
          variant: "outlined",
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: {
            borderRadius: 8,
          },
        },
      },
    },
  });
}
