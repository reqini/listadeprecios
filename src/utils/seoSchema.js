// Utilidades para generar schema.org markup para SEO ecommerce

/**
 * Genera schema.org JSON-LD para un producto individual
 */
export const generateProductSchema = (product) => {
  const parsePrice = (price) => {
    if (!price) return 0;
    if (typeof price === 'number') return price;
    return parseFloat(price.replace(/[^\d.]/g, '')) || 0;
  };

  const precioNegocio = parsePrice(product.precio_negocio);

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.descripcion || "Producto Essen",
    "description": `${product.descripcion} - Línea ${product.linea || 'Essen'}`,
    "image": product.imagen || "",
    "brand": {
      "@type": "Brand",
      "name": "Essen"
    },
    "offers": {
      "@type": "Offer",
      "url": window.location.href,
      "priceCurrency": "ARS",
      "price": precioNegocio,
      "priceValidUntil": new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 días
      "availability": product.vigencia === "SI" 
        ? "https://schema.org/InStock" 
        : "https://schema.org/OutOfStock",
      "itemCondition": "https://schema.org/NewCondition",
      "seller": {
        "@type": "Organization",
        "name": "Catálogo Simple"
      }
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.5",
      "reviewCount": "100"
    }
  };
};

/**
 * Genera schema.org JSON-LD para una lista de productos
 */
export const generateItemListSchema = (products, title = "Catálogo de Productos Essen") => {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": title,
    "description": "Lista completa de productos Essen disponibles",
    "itemListElement": products.slice(0, 50).map((product, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Product",
        "name": product.descripcion,
        "image": product.imagen,
        "offers": {
          "@type": "Offer",
          "priceCurrency": "ARS",
          "price": parseFloat(product.precio_negocio?.replace(/[^\d.]/g, '')) || 0
        }
      }
    }))
  };
};

/**
 * Genera schema.org JSON-LD para una organización
 */
export const generateOrganizationSchema = () => {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Catálogo Simple",
    "url": window.location.origin,
    "logo": `${window.location.origin}/logo512.png`,
    "description": "La herramienta Nº1 de ventas para emprendedoras Essen",
    "sameAs": [
      "https://www.linkedin.com/in/lucianorecchini/"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "Customer Service",
      "availableLanguage": "Spanish"
    }
  };
};

/**
 * Inyecta schema JSON-LD en el head del documento
 */
export const injectSchema = (schema) => {
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.text = JSON.stringify(schema);
  script.id = `schema-${Date.now()}`;
  
  // Remover schemas anteriores del mismo tipo si existe
  const existing = document.querySelector(`script[data-schema-type="${schema['@type']}"]`);
  if (existing) {
    existing.remove();
  }
  
  script.setAttribute('data-schema-type', schema['@type']);
  document.head.appendChild(script);
};

/**
 * Limpia todos los schemas inyectados
 */
export const clearSchemas = () => {
  const scripts = document.querySelectorAll('script[data-schema-type]');
  scripts.forEach(script => script.remove());
};

const seoSchemaUtils = {
  generateProductSchema,
  generateItemListSchema,
  generateOrganizationSchema,
  injectSchema,
  clearSchemas
};

export default seoSchemaUtils;

