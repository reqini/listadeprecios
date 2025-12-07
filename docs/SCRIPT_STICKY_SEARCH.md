# 🔧 Script para Aplicar Search Bar Fixed a Todos los Catálogos

## Patrón a Aplicar

Basado en la implementación de `Entregaya.js`, todos los catálogos necesitan:

1. **Estados y refs**:
```javascript
const [isSearchSticky, setIsSearchSticky] = useState(false);
const searchBarRef = useRef(null);
```

2. **useEffect para scroll** (agregar a handleScroll existente):
```javascript
// Hacer search bar sticky al hacer scroll
if (searchBarRef.current) {
  const searchBarTop = searchBarRef.current.offsetTop;
  setIsSearchSticky(scrollTop > searchBarTop);
}
```

3. **Reemplazar el Box del search bar**:
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
  <ModernSearchBar ... />
</Box>
{isSearchSticky && <Box sx={{ height: { xs: '88px', sm: '96px' } }} />}
```

## Catálogos a Modificar

- [x] catalogo3.js
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

**Nota**: Este documento es una guía para aplicar los cambios de forma consistente.

