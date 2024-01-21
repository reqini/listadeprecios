// server.js
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors()); // Configura CORS para permitir solicitudes desde el frontend

app.get('/api/productos', (req, res) => {
  const productos = [
    {
      "id": 1,
      "name": "Cacerola",
      "extent": "18cm",
      "price": 154.312,
      "color": "Aqua",
      "points": 200,
      "category": "Cacerolas",
      "brand": "Essen"
    },
    {
      "id": 2,
      "name": "Sartén",
      "extent": "24cm",
      "price": 154.312,
      "color": "Aqua",
      "points": 200,
      "category": "Sarten",
      "brand": "Essen"
    },
    {
      "id": 3,
      "name": "Cacerola con mango",
      "extent": "18cm",
      "price": 154.312,
      "color": "Aqua",
      "points": 200,
      "category": "Cacerola",
      "brand": "Essen"
    },
    {
      "id": 4,
      "name": "Bifera con asas",
      "extent": "30cm",
      "price": 154.312,
      "color": "Aqua",
      "points": 200,
      "category": "Bifera",
      "brand": "Essen"
    },
    {
      "id": 5,
      "name": "Cacerola Cuadrada",
      "extent": "24cm",
      "price": 154.312,
      "color": "Aqua",
      "points": 200,
      "category": "Cacerola",
      "brand": "Essen"
    },
    {
      "id": 6,
      "name": "Cacerola",
      "extent": "28cm",
      "price": 154.312,
      "color": "Aqua",
      "points": 200,
      "category": "Cacerola",
      "brand": "Essen"
    },
    {
      "id": 7,
      "name": "Bifera Ejemplo",
      "extent": "30cm",
      "price": 154.312,
      "color": "Aqua",
      "points": 200,
      "category": "Bifera",
      "brand": "Essen"
    },
    {
      "id": 8,
      "name": "Cacerola Ejemplo",
      "extent": "24cm",
      "price": 154.312,
      "color": "Aqua",
      "points": 200,
      "category": "Cacerola",
      "brand": "Essen"
    },
    {
      "id": 9,
      "name": "Cacerola Ejemplo 2",
      "extent": "28cm",
      "price": 154.312,
      "color": "Aqua",
      "points": 200,
      "category": "Cacerola",
      "brand": "Essen"
    }
  ];

  res.json(productos);
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Servidor API en http://localhost:${PORT}`);
});
