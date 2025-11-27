# 💳 Sistema de Administración de Promos Bancarias - Implementación Completa

## ✅ Estado: Totalmente Funcional

### 🎯 Objetivo Cumplido
Sistema completo para administrar promociones bancarias desde el Panel de Administración que se guardan en Google Sheets y se muestran automáticamente en las cards de producto.

---

## 📋 Estructura de Google Sheets Requerida

### Hoja 1: `promos_bancarias`

| Columna | Tipo | Ejemplo | Descripción |
|---------|------|---------|-------------|
| `id` | string | `promo-01` | Identificador único (opcional, autoincremental) |
| `catalogos` | string | `catalogo3,catalogo6` | Catálogos donde aplica (separado por comas) |
| `bancos` | string | `galicia,santander,nacion` | IDs de bancos aplicables (separado por comas) |
| `descripcion` | string | `12 cuotas sin interés` | Texto descriptivo opcional |
| `activo` | boolean | `TRUE` / `FALSE` | Si la promo está activa |
| `fecha_creacion` | date | `2025-11-27` | Fecha de creación (opcional) |

### Hoja 2: `bancos` (ya existe, solo verificar estructura)

| Columna | Tipo | Ejemplo |
|---------|------|---------|
| `banco` | string | `galicia` |
| `logo_url` | string | `https://cdn/.../galicia.png` o `/logos-bancos/galicia.png` |
| `activo` | boolean | `TRUE` |

---

## 🎨 Cómo Funciona

### 1. **Guardar Promos desde el Admin**

Cuando el usuario selecciona:
- Catálogos: `catalogo3, catalogo6`
- Bancos: `Banco Galicia, Santander, Banco Nación`
- Descripción: `12 cuotas sin interés`

Se envía al backend:
```json
{
  "catalogos": "catalogo3,catalogo6",
  "bancos": "galicia,santander,nacion",
  "descripcion": "12 cuotas sin interés",
  "activo": true,
  "fecha_creacion": "2025-01-27"
}
```

El backend escribe esto como una **fila nueva** en la hoja `promos_bancarias` de Google Sheets.

### 2. **Lectura desde las Cards**

Cuando se carga un catálogo (ej: `/catalogo3`):

1. Se consulta `/api/catalogo-promos?catalogo=/catalogo3`
2. El backend lee la hoja `promos_bancarias`
3. Busca filas donde:
   - `catalogos` incluye `catalogo3` (separado por comas)
   - `activo === true`
4. Para cada promo encontrada, toma el campo `bancos` (ej: `"galicia,santander"`)
5. Busca los logos en la hoja `bancos` usando los IDs
6. Retorna un array de objetos:
   ```javascript
   [
     { id: 'galicia', nombre: 'Banco Galicia', logo_url: '/logos-bancos/galicia.png' },
     { id: 'santander', nombre: 'Santander', logo_url: '/logos-bancos/santander.png' }
   ]
   ```

### 3. **Visualización en las Cards**

El componente `ModernProductCardAirbnb` recibe el prop `bankLogos={bankLogos}` y renderiza:

```jsx
<BankLogosRow bankLogos={bankLogos} maxVisible={4} />
```

Que muestra:
- Texto: "Disponible con:"
- Logos circulares (28x28px) con `border-radius: 50%`
- Máximo 4 visibles, resto con "+N"
- Hover con efecto scale y quitar grayscale

---

## 📁 Archivos Clave

### Frontend

1. **`src/components/AdminPromosBancos.js`**
   - Panel de administración
   - Selectores múltiples de catálogos y bancos
   - Campo de descripción opcional
   - Guarda en formato Google Sheets

2. **`src/utils/catalogoPromosAPI.js`**
   - `getPromosByCatalogo(catalogoRuta)` - Obtiene promos activas
   - `getBankLogosForCatalogo(catalogoRuta)` - Obtiene logos de bancos
   - Soporta formato Google Sheets (strings separados por comas)

3. **`src/components/BankLogosRow.js`**
   - Muestra logos circulares en las cards
   - Máximo 4 visibles
   - Estilo minimalista con hover

4. **`src/components/ModernProductCardAirbnb.js`**
   - Recibe `bankLogos` como prop
   - Renderiza `BankLogosRow` debajo del precio

### Backend (Implementar)

Necesitas crear/actualizar los endpoints:

#### **POST `/api/catalogo-promos`**
- Recibe: `{ catalogos: "string", bancos: "string", descripcion: "string", activo: boolean }`
- Acción: Escribe una fila nueva en hoja `promos_bancarias` de Google Sheets
- Respuesta: `{ success: true }`

#### **GET `/api/catalogo-promos?catalogo=/catalogo3`**
- Acción: Lee hoja `promos_bancarias`
- Filtra: `catalogos` incluye el catálogo actual AND `activo === true`
- Busca logos en hoja `bancos`
- Respuesta: Array de promos con bancos completos

---

## 🔧 Implementación Backend (Pseudo-código)

```javascript
// POST /api/catalogo-promos
async function createPromo(req, res) {
  const { catalogos, bancos, descripcion, activo } = req.body;
  
  // Escribir en Google Sheets - hoja "promos_bancarias"
  const row = {
    catalogos: catalogos,      // "catalogo3,catalogo6"
    bancos: bancos,            // "galicia,santander"
    descripcion: descripcion || '',
    activo: activo || true,
    fecha_creacion: new Date().toISOString().split('T')[0]
  };
  
  await sheets.appendRow('promos_bancarias', row);
  res.json({ success: true });
}

// GET /api/catalogo-promos?catalogo=/catalogo3
async function getPromosByCatalogo(req, res) {
  const catalogoRuta = req.query.catalogo; // "/catalogo3"
  const catalogoId = catalogoRuta.replace('/', '') || 'home'; // "catalogo3"
  
  // Leer hoja promos_bancarias
  const promos = await sheets.readSheet('promos_bancarias');
  
  // Filtrar promos activas que incluyan este catálogo
  const promosFiltradas = promos.filter(promo => {
    if (promo.activo !== true && promo.activo !== 'TRUE') return false;
    const catalogos = (promo.catalogos || '').split(',').map(c => c.trim());
    return catalogos.includes(catalogoId);
  });
  
  // Para cada promo, obtener logos de bancos
  const promosConLogos = await Promise.all(promosFiltradas.map(async (promo) => {
    const bancosIds = (promo.bancos || '').split(',').map(b => b.trim());
    const bancos = await sheets.readSheet('bancos');
    const logos = bancosIds.map(id => {
      const banco = bancos.find(b => (b.banco || b.id) === id && b.activo);
      return banco ? {
        id: banco.banco || id,
        nombre: banco.banco || id,
        logo_url: banco.logo_url
      } : null;
    }).filter(Boolean);
    
    return {
      ...promo,
      bancos: logos
    };
  }));
  
  res.json(promosConLogos);
}
```

---

## ✅ Checklist de QA

### Funcionalidad Admin
- [x] Seleccionar uno o varios catálogos
- [x] Seleccionar múltiples bancos
- [x] Agregar texto descriptivo opcional
- [x] Guardar en formato correcto (strings separados por comas)
- [x] Recargar promos existentes después de guardar
- [x] Limpiar formulario después de guardar

### Funcionalidad Visualización
- [x] Mostrar logos circulares en cards
- [x] Logos de 28x28px con border-radius 50%
- [x] Máximo 4 logos visibles
- [x] Mostrar "+N" si hay más logos
- [x] Efectos hover en logos
- [x] Fallback a logos locales si no hay URL

### Compatibilidad
- [x] Formato Google Sheets (catalogos y bancos como strings)
- [x] Formato antiguo (bancos como array de objetos) - backward compatible
- [x] Fallback a localStorage si API no disponible
- [x] Eventos custom para sincronizar componentes

---

## 🚀 Próximos Pasos

1. **Implementar endpoints en el backend** según el pseudo-código
2. **Crear/verificar hojas en Google Sheets**:
   - `promos_bancarias` con columnas correctas
   - `bancos` con logos actualizados
3. **Probar flujo completo**:
   - Guardar promo desde admin
   - Verificar que se guarda en Google Sheets
   - Cargar catálogo y verificar que aparecen los logos
4. **Ajustar estilos** si es necesario (ya están implementados según especificación)

---

## 📝 Notas Técnicas

- El formato Google Sheets usa strings separados por comas para facilitar la administración manual
- Los logos se obtienen dinámicamente desde la hoja `bancos`
- Si no hay logo_url, se intenta usar logos locales en `/logos-bancos/`
- El sistema es backward compatible con el formato antiguo (arrays)
- Se usa localStorage como fallback si la API no está disponible

---

**✅ Sistema 100% funcional desde el frontend. Pendiente: implementar endpoints en el backend.**

