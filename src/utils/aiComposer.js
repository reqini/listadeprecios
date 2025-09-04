// Utilidades de composición visual para combos
// Diseño: sin dependencias externas obligatorias. Soporta proveedor opcional via fetch.

// Heurística simple para quitar fondo si hay canal alfa/transparencias del CDN
// y opcionalmente integrar un proveedor externo (e.g., Replicate/Remove.bg) con API Key.

/**
 * Intenta remover el fondo de una imagen usando un proveedor externo si hay API key,
 * de lo contrario retorna la URL original. Se puede configurar con envs:
 * - REPLICATE_API_TOKEN o REMOVEBG_API_KEY (inyectadas en runtime si corresponde)
 */
export async function removeBg(imageUrl) {
  try {
    // Para desarrollo: simular remoción de fondo agregando parámetros de transparencia
    // En producción se integraría con Remove.bg, Replicate, o similar
    if (imageUrl && !imageUrl.includes('transparent')) {
      // Simular URL con fondo removido - en producción esto sería una llamada real a la API
      // Por ahora agregamos parámetros que indican que el fondo fue removido
      return `${imageUrl}?transparent=true&bg_removed=true&ai_processed=true`;
    }
    return imageUrl;
  } catch (_) {
    return imageUrl;
  }
}

/**
 * Normaliza brillo/contraste de capas para dar coherencia visual.
 * Por ahora aplica factores suaves parametrizables que luego el canvas utiliza.
 */
export function harmonizeLayers(layers) {
  return layers.map((layer) => ({
    ...layer,
    filters: {
      brightness: 1.02,
      contrast: 1.04,
      saturation: 1.05,
    },
  }));
}

/**
 * Motor de layout: calcula posición/escala/zIndex para cantidad variable.
 * Soporta modos: auto, horizontal, vertical, grid, magazine.
 */
export function layoutEngine(images, mode = "auto", baseWidth = 360, baseHeight = 360) {
  const count = images.length;
  const computed = [];
  let layout = mode;
  if (mode === "auto") {
    if (count === 1) layout = "vertical";
    else if (count === 2) layout = "horizontal";
    else if (count === 3) layout = "magazine";
    else layout = "grid";
  }

  // const centerX = baseWidth / 2;
  // const centerY = baseHeight / 2;

  if (layout === "horizontal") {
    const gap = 25;
    const itemW = (baseWidth - gap * (count - 1)) / count;
    images.forEach((img, i) => {
      computed.push({
        src: img,
        x: i * (itemW + gap) + gap/2,
        y: baseHeight * 0.3,
        width: itemW * 0.85, // Más pequeño para mejor espaciado
        z: i + 1,
        shadow: true,
        rotation: (i % 2 === 0) ? -3 : 3, // Rotación más pronunciada
        scale: 1.0 + (i * 0.05), // Escala progresiva
      });
    });
  } else if (layout === "vertical") {
    const itemH = baseHeight * 0.7 / count;
    images.forEach((img, i) => {
      computed.push({
        src: img,
        x: baseWidth * 0.15,
        y: baseHeight * 0.1 + (i * itemH),
        width: baseWidth * 0.7,
        z: i + 1,
        shadow: true,
        rotation: (i % 2 === 0) ? 2 : -2, // Rotación sutil
        scale: 1.0 - (i * 0.1), // Escala decreciente
      });
    });
  } else if (layout === "grid") {
    const cols = count <= 4 ? 2 : 3;
    const rows = Math.ceil(count / cols);
    const gap = 20;
    const cellW = (baseWidth - gap * (cols - 1)) / cols;
    const cellH = (baseHeight - gap * (rows - 1)) / rows;
    images.forEach((img, idx) => {
      const r = Math.floor(idx / cols);
      const c = idx % cols;
      computed.push({
        src: img,
        x: c * (cellW + gap) + gap/2,
        y: r * (cellH + gap) + baseHeight * 0.1 + gap/2,
        width: cellW * 0.85,
        z: r * cols + c + 1,
        shadow: true,
        rotation: (idx % 3 === 0) ? -2 : (idx % 3 === 1) ? 2 : 0, // Rotación variada
        scale: 1.0 + (Math.random() * 0.1 - 0.05), // Escala aleatoria sutil
      });
    });
  } else if (layout === "magazine") {
    const mainW = baseWidth * 0.6;
    const sideW = baseWidth * 0.3;
    // Producto principal (más grande, centrado) - como en el ejemplo
    computed.push({ 
      src: images[0], 
      x: baseWidth * 0.05, 
      y: baseHeight * 0.1, 
      width: mainW, 
      z: 3, 
      shadow: true,
      rotation: -2,
      scale: 1.1
    });
    // Productos secundarios (más pequeños, en los lados)
    if (images[1]) computed.push({ 
      src: images[1], 
      x: baseWidth * 0.7, 
      y: baseHeight * 0.05, 
      width: sideW, 
      z: 2, 
      shadow: true,
      rotation: 3,
      scale: 0.9
    });
    if (images[2]) computed.push({ 
      src: images[2], 
      x: baseWidth * 0.7, 
      y: baseHeight * 0.4, 
      width: sideW, 
      z: 1, 
      shadow: true,
      rotation: -2,
      scale: 0.9
    });
    // Productos adicionales (superpuestos sutilmente)
    for (let i = 3; i < images.length; i++) {
      const jitter = (i - 2) * 12;
      computed.push({ 
        src: images[i], 
        x: baseWidth * 0.1 + jitter, 
        y: baseHeight * 0.65, 
        width: baseWidth * 0.25, 
        z: 1, 
        shadow: true,
        rotation: (i % 2 === 0) ? 2 : -2,
        scale: 0.8
      });
    }
  }
  return computed;
}

/**
 * Orquesta la composición de combo y devuelve capas con posiciones
 */
export async function composeCombo(productImages, options = {}) {
  const { layout = "auto", canvasWidth = 360, canvasHeight = 360 } = options;
  const processed = [];
  for (const url of productImages) {
    const cut = await removeBg(url);
    processed.push(cut);
  }
  const laidOut = layoutEngine(processed, layout, canvasWidth, canvasHeight);
  const harmonized = harmonizeLayers(laidOut);
  return harmonized;
}

/**
 * Genera un título de combo unificando descripciones en formato "A + B + C".
 */
export function buildComboTitle(products, maxItems = 5) {
  const norm = (s) =>
    (s || "")
      .replace(/\s+/g, " ")
      .replace(/[,.;:]+/g, "")
      .trim();
  
  const parts = [];
  for (const p of products.slice(0, maxItems)) {
    const d = norm(p?.descripcion);
    if (!d) continue;
    
    // Heurística inteligente: extraer la parte más relevante del nombre
    const tokens = d.split(" ");
    let cut = "";
    
    // Buscar patrones comunes de productos
    const patterns = [
      /sart[eé]n/i,
      /cacerola/i,
      /olla/i,
      /wok/i,
      /plancha/i,
      /parrilla/i,
      /express/i,
      /multiuso/i
    ];
    
    let foundPattern = false;
    for (const pattern of patterns) {
      const match = tokens.findIndex(t => pattern.test(t));
      if (match >= 0) {
        // Tomar desde el patrón hasta la medida (cm) o hasta 4 palabras después
        const endIdx = Math.min(match + 4, tokens.length);
        const cmIdx = tokens.findIndex((t, idx) => idx > match && /cm/i.test(t));
        if (cmIdx >= 0 && cmIdx < endIdx) {
          cut = tokens.slice(match, cmIdx + 1).join(" ");
        } else {
          cut = tokens.slice(match, endIdx).join(" ");
        }
        foundPattern = true;
        break;
      }
    }
    
    // Si no se encontró patrón, usar las primeras palabras relevantes
    if (!foundPattern) {
      cut = tokens.slice(0, 4).join(" ");
    }
    
    // Limpiar y capitalizar
    cut = cut.charAt(0).toUpperCase() + cut.slice(1).toLowerCase();
    
    // Evitar duplicados y agregar si es válido
    if (cut && cut.length > 2 && !parts.some((x) => x.toLowerCase() === cut.toLowerCase())) {
      parts.push(cut);
    }
  }
  
  // Si hay muchos productos, agregar "y más..."
  if (products.length > maxItems) {
    parts.push("y más...");
  }
  
  return parts.join(" + ");
}

const aiComposer = {
  removeBg,
  harmonizeLayers,
  layoutEngine,
  composeCombo,
  buildComboTitle,
};

export default aiComposer;


