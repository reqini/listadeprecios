# QA - Switch de Carrusel para Cocinaty

## 📋 Resumen de Funcionalidad

Sistema de switch que permite al usuario "cocinaty" habilitar/deshabilitar el carrusel de productos destacados con un timer de 1 hora.

## ✅ Checklist de QA

### 1. Visibilidad del Switch

- [ ] El switch **NO** se muestra para usuarios que no son "cocinaty"
- [ ] El switch **SÍ** se muestra solo para el usuario "cocinaty"
- [ ] El switch es visible en todos los catálogos (catalogo3, catalogo6, catalogo9, catalogo12, contado)

### 2. Funcionalidad del Switch

- [ ] El switch está **desactivado** por defecto
- [ ] Al activar el switch, el carrusel aparece inmediatamente
- [ ] Al desactivar el switch, el carrusel desaparece inmediatamente
- [ ] El estado del switch se guarda en localStorage con timestamp

### 3. Timer de 1 Hora

- [ ] Al activar el switch, muestra un contador de tiempo restante (formato MM:SS)
- [ ] El contador cuenta hacia atrás correctamente
- [ ] Después de 1 hora, el switch se desactiva automáticamente
- [ ] Cuando expira, muestra chip "⏰ Expirado"
- [ ] Al expirar, limpia el localStorage y oculta el carrusel

### 4. Persistencia en URL

- [ ] Al activar el switch, agrega `?carousel=enabled` a la URL
- [ ] Al desactivar el switch, remueve el parámetro de la URL
- [ ] Si compartes una URL con `?carousel=enabled`, el carrusel aparece para cualquier usuario
- [ ] La URL compartida funciona incluso sin estar logueado como cocinaty

### 5. Sincronización

- [ ] El switch y el carrusel están sincronizados
- [ ] Si el switch está activo, el carrusel se muestra
- [ ] Si el switch está inactivo, el carrusel no se muestra
- [ ] El estado persiste al recargar la página (si no ha expirado)

### 6. Integración con Catálogos

- [ ] Switch visible en catalogo3
- [ ] Switch visible en catalogo6
- [ ] Switch visible en catalogo9
- [ ] Switch visible en catalogo12
- [ ] Switch visible en contado

### 7. Casos Especiales

- [ ] Si el switch expira mientras estás en la página, se desactiva automáticamente
- [ ] Si cambias de usuario, el switch desaparece
- [ ] Si el localStorage está corrupto, el switch maneja el error correctamente
- [ ] El switch funciona con diferentes formatos de username (mayúsculas/minúsculas)

## 🧪 Tests Automatizados

Ejecutar tests con:
```bash
npm test -- CarouselSwitch.test.js
```

Tests incluidos:
- ✅ Visibilidad para diferentes usuarios
- ✅ Funcionalidad del switch (activar/desactivar)
- ✅ Timer de 1 hora
- ✅ Sincronización con URL
- ✅ Persistencia en localStorage

## 🔍 Comandos de Verificación

### 1. Verificar que el switch solo aparece para cocinaty
```javascript
// En consola del navegador
localStorage.setItem('activeSession', 'cocinaty');
// Recargar página - debe aparecer el switch

localStorage.setItem('activeSession', 'otro_usuario');
// Recargar página - NO debe aparecer el switch
```

### 2. Verificar timer
```javascript
// Activar switch y verificar en localStorage
JSON.parse(localStorage.getItem('carousel_switch_cocinaty'));
// Debe tener timestamp actual

// Simular expiración (1 hora + 1 segundo)
const data = {
  enabled: true,
  timestamp: Date.now() - (60 * 60 * 1000 + 1000)
};
localStorage.setItem('carousel_switch_cocinaty', JSON.stringify(data));
// Recargar página - switch debe estar desactivado y mostrar "Expirado"
```

### 3. Verificar URL compartida
```
1. Activar switch como cocinaty
2. Copiar URL (debe tener ?carousel=enabled)
3. Abrir en modo incógnito o con otro usuario
4. El carrusel debe aparecer sin necesidad de estar logueado como cocinaty
```

## 🐛 Issues Conocidos

Ninguno en este momento.

## 📝 Notas de Implementación

- El switch usa `localStorage.getItem('activeSession')` para verificar el usuario
- El timer se actualiza cada segundo
- El estado se sincroniza con la URL usando query params
- La clave de localStorage es `carousel_switch_cocinaty`
- La duración del timer es de 1 hora (60 * 60 * 1000 ms)

## 🚀 Próximos Pasos

1. ✅ Switch implementado
2. ✅ Timer de 1 hora funcionando
3. ✅ Integración con catálogos completa
4. ✅ Tests creados
5. ⏳ QA manual en progreso

