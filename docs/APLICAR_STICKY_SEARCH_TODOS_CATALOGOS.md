# 🔧 Aplicar Search Bar Fixed a TODOS los Catálogos

## ✅ Patrón a Aplicar (Basado en Entregaya.js y catalogo3.js)

### 1. Agregar imports necesarios:
```javascript
import React, { useEffect, useState, useMemo, useRef } from "react";
```

### 2. Agregar estados y refs:
```javascript
const [isSearchSticky, setIsSearchSticky] = useState(false);
const searchBarRef = useRef(null);
```

### 3. Agregar lógica de scroll (modificar handleScroll existente o crear nuevo):
```javascript
useEffect(() => {
  const handleScroll = () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    // Lógica existente (ej: setShowScrollTop, setIsSticky, etc.)
    
    // NUEVO: Hacer search bar sticky al hacer scroll
    if (searchBarRef.current) {
      const searchBarTop = searchBarRef.current.offsetTop;
      setIsSearchSticky(scrollTop > searchBarTop);
    }
  };

  handleScroll();
  window.addEventListener('scroll', handleScroll);
  return () => window.removeEventListener('scroll', handleScroll);
}, []);
```

### 4. Reemplazar el Box del search bar:
**ANTES:**
```javascript
<Box className="catalog-search-sticky">
  <ModernSearchBar ... />
</Box>
```

**DESPUÉS:**
```javascript
<Box
  ref={searchBarRef}
  sx={{
    position: isSearchSticky ? 'fixed' : 'relative',
    top: isSearchSticky ? 0 : 'auto',
    left: 0,
    right: 0,
    zIndex: isSearchSticky ? 1100 : 'auto',
    backgroundColor: isSearchSticky ? 'rgba(255, 255, 255, 0.95)' : 'transparent',
    backdropFilter: isSearchSticky ? 'blur(10px)' : 'none',
    boxShadow: isSearchSticky ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
    transition: 'all 0.3s ease',
  }}
>
  <ModernSearchBar
    value={searchTerm}
    onChange={(value) => {
      setSearchTerm(value);
    }}
    placeholder="Buscar productos por nombre, categoría o banco..."
    sx={{
      paddingX: { xs: 2, sm: 3 },
      paddingY: isSearchSticky ? { xs: 1.5, sm: 2 } : { xs: 2, sm: 2.5 },
      marginBottom: 0,
    }}
  />
</Box>
{/* Spacer para compensar el espacio cuando está fixed */}
{isSearchSticky && (
  <Box sx={{ height: { xs: '88px', sm: '96px' } }} />
)}
```

## 📋 Catálogos a Modificar

- [x] catalogo3.js ✅ (YA IMPLEMENTADO)
- [ ] catalogo6.js
- [ ] catalogo9.js
- [ ] catalogo10.js
- [ ] catalogo12.js
- [ ] catalogo14.js
- [ ] catalogo15.js
- [ ] catalogo18.js
- [ ] catalogo20.js
- [ ] catalogo24.js
- [ ] Preferencial.jsx
- [ ] contado.js

---

**Aplicar el mismo patrón a todos los catálogos listados arriba**

