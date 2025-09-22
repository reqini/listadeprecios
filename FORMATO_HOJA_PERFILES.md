# 📊 FORMATO EXACTO - HOJA Perfiles_Emprendedoras

## 🎯 **INSTRUCCIONES PARA GOOGLE SHEETS**

### 1. **Crear Nueva Hoja**
- Abrir tu Google Sheets
- Hacer clic en "+" para crear nueva hoja
- Renombrar como: `Perfiles_Emprendedoras`

### 2. **Configurar Columnas (Fila 1 - Headers)**

| A | B | C | D | E | F | G | H |
|---|---|---|---|---|---|---|---|
| **username** | **email** | **phone** | **address** | **businessName** | **businessType** | **avatar** | **rango** |

| I | J | K | L | M | N | O | P |
|---|---|---|---|---|---|---|---|
| **fechaRegistro** | **totalVentas** | **clientesActivos** | **placasGeneradas** | **rating** | **notifications** | **darkMode** | **language** |

| Q |
|---|
| **theme** |

### 3. **Datos de Ejemplo (Fila 2)**

| A | B | C | D | E | F | G | H |
|---|---|---|---|---|---|---|---|
| cocinaty | cocinaty@ejemplo.com | +54 9 11 1234-5678 | Buenos Aires, Argentina | Cocina TY - Productos de Cocina | Venta de productos de cocina |  | Demostrador/a |

| I | J | K | L | M | N | O | P |
|---|---|---|---|---|---|---|---|
| 2024-01-15 | 1247 | 89 | 156 | 4.8 | true | false | es |

| Q |
|---|
| default |

### 4. **Más Usuarios de Ejemplo (Filas 3-5)**

**Fila 3 - Usuario lucho:**
```
lucho | lucho@ejemplo.com | +54 9 11 9876-5432 | Córdoba, Argentina | Lucho Emprendimientos | Consultoría empresarial |  | Supervisor/a | 2024-02-10 | 2350 | 142 | 89 | 4.9 | true | true | es | dark
```

**Fila 4 - Usuario maria:**
```
maria | maria@ejemplo.com | +54 9 11 5555-1234 | Rosario, Argentina | María's Kitchen | Gastronomía |  | Demostrador/a | 2024-03-05 | 890 | 67 | 234 | 4.7 | false | false | es | default
```

**Fila 5 - Usuario ana:**
```
ana | ana@ejemplo.com | +54 9 11 7777-8888 | Mendoza, Argentina | Ana Creativa | Diseño y marketing |  | Líder Regional | 2024-01-20 | 3200 | 198 | 312 | 4.9 | true | false | es | modern
```

## 📋 **TABLA COMPLETA DE REFERENCIA**

| Columna | Campo | Tipo | Ejemplo | Descripción |
|---------|-------|------|---------|-------------|
| A | username | Texto | cocinaty | Nombre de usuario único |
| B | email | Texto | cocinaty@ejemplo.com | Email de contacto |
| C | phone | Texto | +54 9 11 1234-5678 | Teléfono |
| D | address | Texto | Buenos Aires, Argentina | Dirección |
| E | businessName | Texto | Cocina TY - Productos de Cocina | Nombre del negocio |
| F | businessType | Texto | Venta de productos de cocina | Tipo de negocio |
| G | avatar | Texto | https://... | URL de foto de perfil |
| H | rango | Texto | Demostrador/a | Rango en la empresa |
| I | fechaRegistro | Fecha | 2024-01-15 | Fecha de registro |
| J | totalVentas | Número | 1247 | Total de ventas acumuladas |
| K | clientesActivos | Número | 89 | Número de clientes activos |
| L | placasGeneradas | Número | 156 | Placas generadas |
| M | rating | Número | 4.8 | Calificación promedio |
| N | notifications | Texto | true | Notificaciones habilitadas (true/false) |
| O | darkMode | Texto | false | Modo oscuro habilitado (true/false) |
| P | language | Texto | es | Idioma preferido |
| Q | theme | Texto | default | Tema preferido |

## ⚠️ **IMPORTANTE**

### **Formato de Datos:**
- **Booleanos**: Usar `true` o `false` (como texto)
- **Números**: Sin comillas, solo el número
- **Fechas**: Formato `YYYY-MM-DD`
- **Texto**: Sin comillas especiales

### **Permisos:**
- Asegúrate de que tu service account tenga acceso a esta hoja
- La hoja debe estar en el mismo Google Sheets que tu hoja de usuarios

### **Verificación:**
Después de crear la hoja, prueba el endpoint:
```bash
curl -X GET https://backend-catalogosimple.onrender.com/api/profile/cocinaty \
  -H "Authorization: Bearer <token>"
```

## 🎯 **RESULTADO ESPERADO**

Una vez creada la hoja con estos datos, el endpoint debería devolver:
```json
{
  "success": true,
  "data": {
    "username": "cocinaty",
    "email": "cocinaty@ejemplo.com",
    "phone": "+54 9 11 1234-5678",
    "address": "Buenos Aires, Argentina",
    "businessName": "Cocina TY - Productos de Cocina",
    "businessType": "Venta de productos de cocina",
    "avatar": "",
    "rango": "Demostrador/a",
    "fechaRegistro": "2024-01-15",
    "preferences": {
      "notifications": true,
      "darkMode": false,
      "language": "es",
      "theme": "default"
    }
  }
}
```

---

*Formato exacto para crear la hoja Perfiles_Emprendedoras en Google Sheets*
