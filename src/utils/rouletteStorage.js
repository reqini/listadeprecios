/**
 * Utilidades para gestionar el estado de la ruleta por dispositivo/usuario
 */

/**
 * Genera un ID único del dispositivo basado en características del navegador
 * @returns {string} ID único del dispositivo
 */
export function getDeviceId() {
  // Intentar obtener un ID existente
  let deviceId = localStorage.getItem("deviceId");
  
  if (!deviceId) {
    // Generar un ID único basado en características del navegador
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    ctx.textBaseline = "top";
    ctx.font = "14px 'Arial'";
    ctx.textBaseline = "alphabetic";
    ctx.fillText("Device fingerprint", 2, 2);
    
    const fingerprint = canvas.toDataURL();
    const userAgent = navigator.userAgent;
    const language = navigator.language;
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    // Crear hash simple
    const hash = btoa(fingerprint + userAgent + language + timezone)
      .substring(0, 32)
      .replace(/[^a-zA-Z0-9]/g, "");
    
    deviceId = `device_${hash}`;
    localStorage.setItem("deviceId", deviceId);
  }
  
  return deviceId;
}

/**
 * Verifica si el usuario ya jugó la ruleta
 * @param {string} username - Username del usuario (opcional)
 * @returns {boolean} true si ya jugó, false si no
 */
export function hasPlayedRoulette(username = null) {
  const deviceId = getDeviceId();
  const key = username 
    ? `roulettePlayed_${username}_${deviceId}` 
    : `roulettePlayed_${deviceId}`;
  
  return localStorage.getItem(key) === "true";
}

/**
 * Marca que el usuario ya jugó la ruleta
 * @param {string} username - Username del usuario (opcional)
 */
export function markRouletteAsPlayed(username = null) {
  const deviceId = getDeviceId();
  const key = username 
    ? `roulettePlayed_${username}_${deviceId}` 
    : `roulettePlayed_${deviceId}`;
  
  localStorage.setItem(key, "true");
}

/**
 * Resetea el estado de la ruleta (útil para testing)
 * @param {string} username - Username del usuario (opcional)
 */
export function resetRoulette(username = null) {
  const deviceId = getDeviceId();
  const key = username 
    ? `roulettePlayed_${username}_${deviceId}` 
    : `roulettePlayed_${deviceId}`;
  
  localStorage.removeItem(key);
}

/**
 * Verifica si está en modo desarrollo/testing
 * Permite jugar múltiples veces en local
 * @returns {boolean} true si está en modo desarrollo
 */
export function isDevelopmentMode() {
  // Verificar si está en localhost o si hay un parámetro especial
  const isLocalhost = window.location.hostname === "localhost" || 
                      window.location.hostname === "127.0.0.1" ||
                      window.location.hostname === "";
  
  // Verificar si hay un parámetro ?test=true en la URL
  const urlParams = new URLSearchParams(window.location.search);
  const isTestMode = urlParams.get("test") === "true" || urlParams.get("roulette") === "test";
  
  return isLocalhost || isTestMode;
}


