# 📚 Documentación: Sistema de Catálogos Individuales

## 🎯 Objetivo

Sistema completo para crear catálogos personalizados por usuaria/emprendedora con URLs únicas tipo:
- `/{slug}/{cuota}` 
- Ejemplos: `/cocinaty/12`, `/cocinaty/18`, `/carlaessen/3`

Cada catálogo muestra un carrusel de productos de "Entrega Inmediata" arriba del catálogo principal.

---

## 🏗️ Arquitectura Implementada

### 1. Rutas Dinámicas

**Archivo:** `App.js`
```jsx
<Route path="/:slug/:cuota" element={<CatalogoIndividual />} />
```

Esta ruta captura cualquier combinación de `slug` y `cuota`, ejemplo:
- `/cocinaty/12` → slug="cocinaty", cuota="12"
- `/carlaessen/18` → slug="carlaessen", cuota="18"

### 2. Componente Principal

**Archivo:** `src/pages/CatalogoIndividual.js`

**Responsabilidades:**
- Obtener usuario por slug
- Validar que la cuota esté habilitada
- Cargar productos de entrega inmediata
- Renderizar el catálogo correspondiente
- Manejar errores y 404

**Flujo:**
1. Extrae `slug` y `cuota` de la URL
2. Busca usuario en API: `/api/user/by-slug/{slug}`
3. Valida que la cuota esté en `usuario.cuotas`
4. Si todo OK, muestra:
   - Carrusel de entrega inmediata (si hay productos)
   - Catálogo correspondiente a la cuota

### 3. Componente Carrusel

**Archivo:** `src/components/CarouselEntregaInmediata.js`

**Características:**
- Estilo MercadoLibre (fondo amarillo claro, cards compactas)
- Scroll horizontal suave
- Flechas de navegación
- Indicadores de posición
- Responsive mobile-first
- Skeleton loading

**Props:**
```jsx
<CarouselEntregaInmediata
  productos={Array}        // Array de productos
  cuotaActual={Number}     // Cuota actual (3, 6, 12, etc.)
  nombreUsuario={String}   // Nombre del usuario (opcional)
/>
```

### 4. Componente 404

**Archivo:** `src/components/CatalogoNotFound.js`

Muestra pantalla de error personalizada con:
- Mensaje de error claro
- Botón "Volver al inicio"
- Botón "Volver atrás"

---

## 📊 Estructura de Datos Esperada

### Backend API: `/api/user/by-slug/{slug}`

**Respuesta exitosa:**
```json
{
  "success": true,
  "data": {
    "id": "u239",
    "username": "cocinaty",
    "nombre": "Cocina Ty",
    "slug": "cocinaty",
    "cuotas": ["3", "6", "12", "18"],
    "entregaInmediata": ["p15", "p7", "p22"],
    "activo": true,
    "rango": "Demostrador/a"
  }
}
```

**Respuesta error:**
```json
{
  "success": false,
  "message": "Usuario no encontrado"
}
```

### Google Sheets: Hoja `Usuarios` o `Emprendedoras`

| Columna | Descripción | Ejemplo |
|---------|-------------|---------|
| `username` | Username único | `cocinaty` |
| `slug` | Identificador único para URL | `cocinaty` |
| `nombre` | Nombre completo | `Cocina Ty` |
| `cuotas` | JSON array o string separado por comas | `["3","6","12","18"]` o `"3,6,12,18"` |
| `entregaInmediata` | JSON array de IDs de productos | `["p15","p7","p22"]` |
| `activo` | Si está activo | `true` o `"si"` |

---

## 🔄 Flujo Completo

### Escenario 1: URL válida
1. Usuario accede a `/cocinaty/12`
2. Sistema busca usuario con slug "cocinaty"
3. Valida que cuota "12" esté en `cuotas`
4. Carga productos de entrega inmediata
5. Muestra carrusel + catálogo 12 cuotas

### Escenario 2: Slug no existe
1. Usuario accede a `/usuariofalso/12`
2. Sistema busca usuario → No encontrado
3. Muestra pantalla 404 con mensaje personalizado

### Escenario 3: Cuota no habilitada
1. Usuario accede a `/cocinaty/99`
2. Sistema encuentra usuario
3. Cuota "99" no está en `cuotas`
4. Muestra pantalla 404: "Cuota no habilitada"

### Escenario 4: Sin productos de entrega
1. Usuario accede a `/cocinaty/12`
2. Sistema carga correctamente
3. No hay productos de entrega inmediata
4. Carrusel se oculta automáticamente (no rompe UI)

---

## 🎨 Características del Carrusel

### Estilo Visual
- **Fondo:** Amarillo claro (`#FFF9E6`) estilo MercadoLibre
- **Cards:** Compactas (160px mobile, 200px desktop)
- **Badge:** "Entrega Inmediata" verde en cada card
- **Flechas:** Botones redondos con sombra

### Funcionalidades
- ✅ Scroll horizontal suave
- ✅ Flechas aparecen/desaparecen según posición
- ✅ Indicadores de posición (dots)
- ✅ Click en card → Abre detalle (TODO: implementar)
- ✅ Responsive mobile-first
- ✅ Skeleton loading mientras carga

---

## 🔍 SEO y Metadata

Cada catálogo tiene metadata dinámica:

```html
<title>{nombreUsuario} - Catálogo Oficial Essen - {cuota} cuotas sin interés</title>
<meta name="description" content="Catálogo personalizado...">
<link rel="canonical" href="https://dominio.com/{slug}/{cuota}">
```

**Open Graph y Twitter Cards** incluidos para compartir en redes sociales.

---

## 📱 Persistencia de Sesión

Al cargar un catálogo, se guarda en localStorage:
```javascript
localStorage.setItem(`lastCuota_${slug}`, cuota);
```

Esto permite recordar la última cuota vista por cada usuaria.

---

## 🧪 Tests Recomendados

### Tests Manuales
- [ ] `/cocinaty/12` carga correctamente
- [ ] Carrusel aparece con productos reales
- [ ] No hay errores en consola
- [ ] `/usuariofalso/12` muestra 404
- [ ] `/cocinaty/99` muestra error de cuota inválida
- [ ] Si no hay productos, carrusel no aparece (no rompe)
- [ ] Scroll mobile funciona correctamente
- [ ] Flechas aparecen/desaparecen correctamente

### Tests Automatizados (TODO)
```javascript
// Ejemplo de test
test('CatalogoIndividual carga usuario correctamente', async () => {
  // Mock API response
  // Renderizar componente
  // Verificar que se muestra correctamente
});
```

---

## 🚀 Cómo Agregar una Nueva Usuaria

### 1. En Google Sheets (Backend)
Agregar fila en hoja `Usuarios`:

```
username: carlaessen
slug: carlaessen
nombre: Carla Essen
cuotas: ["3","6","12"]
entregaInmediata: ["p15","p7"]
activo: true
```

### 2. Configurar Productos
Marcar productos en hoja de productos con:
- `entrega_inmediata: "si"`
- O agregar IDs en `entregaInmediata` del usuario

### 3. Acceder
Una vez configurado, el catálogo estará disponible en:
- `/carlaessen/3`
- `/carlaessen/6`
- `/carlaessen/12`

---

## 📋 Endpoints Backend Necesarios

### GET `/api/user/by-slug/{slug}`
Obtener usuario por slug único.

**Request:**
```
GET /api/user/by-slug/cocinaty
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "u239",
    "username": "cocinaty",
    "nombre": "Cocina Ty",
    "slug": "cocinaty",
    "cuotas": ["3", "6", "12", "18"],
    "entregaInmediata": ["p15", "p7", "p22"],
    "activo": true
  }
}
```

---

## 🔧 Troubleshooting

### El carrusel no aparece
1. Verificar que el usuario tenga `entregaInmediata` configurado
2. Verificar que los productos tengan flag `entrega_inmediata: "si"`
3. Revisar consola del navegador para errores

### La ruta no funciona
1. Verificar que la ruta dinámica esté antes de las rutas estáticas en `App.js`
2. Verificar que el slug coincida exactamente (case-sensitive)

### Error 404 inesperado
1. Verificar que el slug existe en la base de datos
2. Verificar que la cuota esté en el array `cuotas` del usuario

---

## 📝 Notas de Implementación

- ✅ Ruta dinámica implementada
- ✅ Componente CatalogoIndividual creado
- ✅ Carrusel estilo ML implementado
- ✅ 404 personalizado implementado
- ✅ SEO y metadata dinámica implementada
- ⏳ Tests automatizados (pendiente)
- ⏳ Endpoint backend `/api/user/by-slug/{slug}` (pendiente backend)

---

## 🎉 Próximos Pasos

1. **Backend:** Implementar endpoint `/api/user/by-slug/{slug}`
2. **Google Sheets:** Agregar columna `slug` y `entregaInmediata` en hoja de usuarios
3. **Tests:** Crear tests automatizados completos
4. **UI:** Mejorar interacción al click en producto del carrusel (modal/detalle)
5. **Compartir:** Implementar botón de compartir con preview personalizado

---

**Creado:** 2024
**Versión:** 1.0.0

