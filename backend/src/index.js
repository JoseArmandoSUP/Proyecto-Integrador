const express = require('express');
const cors = require('cors');
require('dotenv').config();

const productoRoute = require('./routes/productoRoute'); // <---- Modulo de Productos
const usuarioRoute = require('./routes/usuarioRoute'); // <----- Modulo de Usuarios

const app = express();

app.use(cors());
app.use(express.json()); // <---- Midleware

app.use('/api/pi/productos', productoRoute); // <---- Modulo de Productos
app.use('/api/pi/usuarios', usuarioRoute); // <----- Modulo de Usuario

// Midleware 404 general
app.use((req, res) => {
    res.status(404).json({
        exito: false,
        msg: "Ruta no encontrada"
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {console.log(`Servidor Conectado en el puerto ${PORT}`)});