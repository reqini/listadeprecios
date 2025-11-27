# 📋 Plan de Actualización de Catálogos

## ✅ Catálogos Actualizados (Estilo Airbnb)

- ✅ `catalogo3.js` - COMPLETADO
- ✅ `catalogo6.js` - COMPLETADO  
- ✅ `catalogo12.js` - COMPLETADO

## ⏳ Catálogos Pendientes

- ⏳ `catalogo9.js` - 9 cuotas sin interés
- ⏳ `catalogo10.js` - 10 cuotas sin interés
- ⏳ `catalogo14.js` - 14 cuotas sin interés
- ⏳ `catalogo15.js` - 15 cuotas sin interés
- ⏳ `catalogo18.js` - 18 cuotas sin interés
- ⏳ `catalogo20.js` - 20 cuotas sin interés
- ⏳ `catalogo24.js` - 24 cuotas sin interés
- ⏳ `home.js` - Catálogo principal

## 🔧 Cambios a Aplicar en Cada Catálogo

### 1. Imports
**Reemplazar:**
```javascript
import ProductsCalatogo from "./components/productsCalatogo";
import ShoppingCartCatalogo from "./components/ShoppingCartCatalogo";
import TextField from "@mui/material/TextField";
import logo from './assets/logo.png';
```

**Por:**
```javascript
import ModernProductCardAirbnb from "./components/ModernProductCardAirbnb";
import StickySearchBar from "./components/StickySearchBar";
import ModernCartBottomSheet from "./components/ModernCartBottomSheet";
import LinearProgress from "@mui/material/LinearProgress";
import { trackCatalogView, trackCatalogSearch, trackAddToCart, trackToggleFavorite } from "./utils/analytics";
import { Snackbar, Alert, Typography, Box } from "@mui/material";
```

### 2. Agregar Analytics
En `useEffect` inicial:
```javascript
trackCatalogView("Catálogo", "X cuotas sin interés");
```

En filtro:
```javascript
trackCatalogSearch("Catálogo X", filtro);
```

En addToCart:
```javascript
trackAddToCart("Catálogo X", product);
```

En toggleFavorite:
```javascript
trackToggleFavorite("Catálogo X", product, !exists);
```

### 3. Reemplazar JSX

**Buscador viejo:**
```javascript
<div className={`header-catalogo flex-center pad10 ${isSticky ? "sticky" : ""}`}>
  <TextField ... />
</div>
```

**Por StickySearchBar:**
```javascript
<StickySearchBar
  value={filtro}
  onChange={(e) => {
    setFiltro(e.target.value);
    trackCatalogSearch("Catálogo X", e.target.value);
  }}
  placeholder="Buscar Producto"
/>
```

**Layout viejo:**
```javascript
<ul className="lista-prod-catalog w-100">
  {productos.map(...)}
</ul>
```

**Por layout moderno:**
```javascript
<Box sx={{ display: 'grid', gridTemplateColumns: {...}, gap: {...} }}>
  {productos.map(...)}
</Box>
```

**Card vieja:**
```javascript
<ProductsCalatogo
  product={product}
  selectedCuota={'X cuotas sin interés'}
  ...
/>
```

**Por card moderna:**
```javascript
<ModernProductCardAirbnb
  product={product}
  selectedCuota={'X cuotas sin interés'}
  onAddToCart={...}
  isContado={false}
/>
```

**Carrito viejo:**
```javascript
<ShoppingCartCatalogo cart={cart} setCart={setCart} cuotaKey="..." />
```

**Por carrito moderno:**
```javascript
<ModernCartBottomSheet 
  cart={cart} 
  setCart={setCart} 
  cuotaKey="..." 
  cuotasTexto="X cuotas" 
/>
```

### 4. Mapeo de Cuotas

| Catálogo | selectedCuota | cuotaKey | cuotasTexto |
|----------|---------------|----------|-------------|
| catalogo3 | "3 cuotas sin interés" | "tres_sin_interes" | "3 cuotas" |
| catalogo6 | "6 cuotas sin interés" | "seis_sin_interes" | "6 cuotas" |
| catalogo9 | "9 cuotas sin interés" | "nueve_sin_interes" | "9 cuotas" |
| catalogo10 | "10 cuotas sin interés" | "diez_sin_interes" | "10 cuotas" |
| catalogo12 | "12 cuotas sin interés" | "doce_sin_interes" | "12 cuotas" |
| catalogo14 | "14 cuotas sin interés" | "catorce_sin_interes" | "14 cuotas" |
| catalogo15 | "15 cuotas sin interés" | "quince_sin_interes" | "15 cuotas" |
| catalogo18 | "18 cuotas sin interés" | "dieciocho_sin_interes" | "18 cuotas" |
| catalogo20 | "20 cuotas sin interés" | "veinte_sin_interes" | "20 cuotas" |
| catalogo24 | "24 cuotas sin interés" | "veinticuatro_sin_interes" | "24 cuotas" |

---

**Próximo paso**: Actualizar catalogo9.js, catalogo10.js, etc. siguiendo este patrón.

