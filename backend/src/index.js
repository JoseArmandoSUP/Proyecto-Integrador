const express = require('express');
const cors = require('cors');
require('dotenv').config();

const productoRoute = require('./routes/productoRoute'); // <---- Modulo de Productos

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/productos', productoRoute); // <---- Modulo de Productos

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {console.log(`Servidor Conectado en el puerto ${PORT}`)});