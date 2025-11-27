# 💳 Administración de Promos de Bancos y Logos

## 📍 Dónde Administrar Actualmente

### 1. **Panel de Administración** (Solo Costos)
- **URL**: `/administrador`
- **Usuario**: `cocinaty`
- **Estado**: Solo gestiona costos de envío y plan canje

### 2. **Promos de Bancos** (Actual)
Las promos actualmente se administran de estas formas:

#### Opción A: Google Sheets (Recomendado)
Crear una hoja llamada `Promos_Bancos` con estas columnas:

| banco | descripcion_promo | logo_url | activa | banco_codigo | desde | hasta |
|-------|-------------------|----------|--------|--------------|-------|-------|
| BANCO DE LA NACION ARGENTINA | 12 cuotas sin interés | https://... | si | 11 | 2024-01-01 | 2024-12-31 |
| BANCO DE GALICIA | 6 cuotas sin interés | /logos-bancos/galicia.png | si | 7 | 2024-01-01 | 2024-12-31 |

#### Opción B: Backend API
Endpoint: `/api/bancos-promos`

**GET** `/api/bancos-promos` - Obtener todas las promos
**POST** `/api/bancos-promos` - Crear nueva promo
**PUT** `/api/bancos-promos/:id` - Actualizar promo
**DELETE** `/api/bancos-promos/:id` - Eliminar promo

### 3. **Logos de Bancos**

#### Opción A: Assets locales
Subir logos a: `/public/logos-bancos/`

Nombres sugeridos:
- `nacion.png`
- `galicia.png`
- `santander.png`
- `bbva.png`
- `macro.png`
- `patagonia.png`
- `naranja.png`
- `default-bank.png`

#### Opción B: URLs externas
Agregar `logo_url` en la promoción con la URL completa del logo.

---

## 🚀 Cómo Agregar Promos Actualmente

### Desde Google Sheets (Recomendado)

1. Abrir Google Sheets del backend
2. Crear hoja `Promos_Bancos` (si no existe)
3. Agregar columnas:
   - `banco` (texto)
   - `descripcion_promo` (texto)
   - `logo_url` (texto, opcional)
   - `activa` (si/no)
   - `banco_codigo` (número, opcional)
   - `desde` (fecha, opcional)
   - `hasta` (fecha, opcional)
4. Agregar filas con las promos
5. El backend debe leer esta hoja y exponerla en `/api/bancos-promos`

### Desde Backend API

Si ya tienes el endpoint configurado:

```bash
# Agregar nueva promo
curl -X POST https://backend-catalogosimple.onrender.com/api/bancos-promos \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "banco": "BANCO DE LA NACION ARGENTINA",
    "descripcion_promo": "12 cuotas sin interés",
    "logo_url": "https://ejemplo.com/logo.png",
    "activa": "si",
    "banco_codigo": 11
  }'
```

---

## 📝 Próximo Paso: Interfaz Visual

Se puede agregar una sección al panel `/administrador` para:
- ✅ Ver todas las promos activas
- ✅ Agregar/editar/eliminar promos
- ✅ Subir logos de bancos
- ✅ Activar/desactivar promos
- ✅ Asignar promos a productos

**¿Quieres que agregue esta interfaz visual al panel de administración?**

---

## 🔗 Referencias

- `src/utils/bankPromosAPI.js` - Funciones para obtener promos
- `src/components/BankPromoBadge.js` - Componente que muestra las promos
- `docs/FUNCIONALIDADES_FAVORITOS_OFERTAS_PROMOS.md` - Documentación completa

