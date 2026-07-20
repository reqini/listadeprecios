// Configuración de la "familia A" de catálogos: mecánicamente idénticos
// salvo estos valores (confirmado con diffs reales entre catalogo9/15/18/20/24
// antes de consolidarlos en src/pages/Catalogo.js).
export const cuotasConfig = {
  "9": {
    cuota: "9",
    label: "9 cuotas sin interés",
    cuotaKey: "nueve_sin_interes",
    cuotasTexto: "9 cuotas",
    trackingLabel: "Catálogo 9",
    layoutKey: "catalogo9",
    route: "/catalogo9",
  },
  "15": {
    cuota: "15",
    label: "15 cuotas sin interés",
    cuotaKey: "quince_sin_interes",
    cuotasTexto: "15 cuotas",
    trackingLabel: "Catálogo 15",
    layoutKey: "catalogo15",
    route: "/catalogo15",
  },
  "18": {
    cuota: "18",
    label: "18 cuotas sin interés",
    cuotaKey: "dieciocho_sin_interes",
    cuotasTexto: "18 cuotas",
    trackingLabel: "Catálogo 18",
    layoutKey: "catalogo18",
    route: "/catalogo18",
  },
  "20": {
    cuota: "20",
    label: "20 cuotas sin interés",
    cuotaKey: "veinte_sin_interes",
    cuotasTexto: "20 cuotas",
    trackingLabel: "Catálogo 20",
    layoutKey: "catalogo20",
    route: "/catalogo20",
  },
  "24": {
    cuota: "24",
    label: "24 cuotas sin interés",
    cuotaKey: "veinticuatro_sin_interes",
    cuotasTexto: "24 cuotas",
    trackingLabel: "Catálogo 24",
    layoutKey: "catalogo24",
    route: "/catalogo24",
  },
};

export const cuotasConfigList = Object.values(cuotasConfig);
