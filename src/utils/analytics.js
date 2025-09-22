import ReactGA from "react-ga4";

// Utilidades simples para centralizar eventos de Analytics

export const trackPageView = (path, params = {}) => {
  try {
    ReactGA.send({ hitType: "pageview", page: path, ...params });
  } catch (_) {
    // noop
  }
};

export const trackEvent = (category, action, label, value) => {
  try {
    ReactGA.event({ category, action, label, value });
  } catch (_) {
    // noop
  }
};

// Eventos específicos de Catálogo
export const trackCatalogView = (catalogName, cuotasLabel) => {
  trackEvent("Catalogo", "Vista", `${catalogName} - ${cuotasLabel}`);
};

export const trackCatalogSearch = (catalogName, term) => {
  if (!term) return;
  trackEvent("Catalogo", "Busqueda", `${catalogName} - ${term.toLowerCase()}`);
};

export const trackAddToCart = (catalogName, product) => {
  const label = `${catalogName} - ${product?.codigo || product?.id || "sin_codigo"}`;
  const value = Number(product?.precio_lista || product?.precio || 0) || undefined;
  trackEvent("Catalogo", "Agregar al carrito", label, value);
};

export const trackToggleFavorite = (catalogName, product, isNowFavorite) => {
  const label = `${catalogName} - ${product?.codigo || product?.id || "sin_codigo"}`;
  trackEvent("Catalogo", isNowFavorite ? "Agregar a favoritos" : "Quitar de favoritos", label);
};


