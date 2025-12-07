# 🚀 Comandos para Levantar la App en Local

## ✅ Estado Actual

La app **ya está corriendo** desde el 29 de noviembre.

---

## 📋 Comandos Útiles

### Iniciar la app:
```bash
npm start
```

### Iniciar en otro puerto (si el 3000 está ocupado):
```bash
PORT=3001 npm start
```

### Ver procesos corriendo:
```bash
lsof -ti:3000
ps aux | grep react-scripts
```

### Detener la app:
```bash
# Encontrar el proceso
lsof -ti:3000

# Matar el proceso (reemplazar PID con el número)
kill -9 [PID]
```

### Reinstalar dependencias (si es necesario):
```bash
npm install
```

---

## 🌐 Acceso Local

Una vez iniciada, la app estará disponible en:
- **http://localhost:3000** (puerto por defecto)
- O el puerto que indique en la consola

---

## ⚠️ Solución de Problemas

### Puerto ocupado:
```bash
# Ver qué está usando el puerto 3000
lsof -i :3000

# Usar otro puerto
PORT=3001 npm start
```

### Error de dependencias:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Error de compilación:
```bash
npm run build
# Revisar errores en la salida
```

---

**Última actualización**: 2024-12-20

