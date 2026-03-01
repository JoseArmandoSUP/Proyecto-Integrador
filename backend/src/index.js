const express = require('express');
const cors = require('cors');
require('dotenv').config();

// ----------------------------------------- CRUD's ----------------------------------------------------
const productoRoute = require('./routes/productoRoute'); // <---- Productos
const usuarioRoute = require('./routes/usuarioRoute'); // <----- Usuarios
const clienteRoute = require('./routes/clienteRoute'); // <----- Clientes
const categoriaRoute = require('./routes/categoriaRoute'); // <----- Categorias
const proveedorRoute = require('./routes/proveedorRoute') // <------ Proveedores

// ----------------------------------------- Modulos ---------------------------------------------------
const movimientoRoute = require('./routes/movimientoRoute'); // <------- Movimiento Inventario

const app = express();

app.use(cors());
app.use(express.json()); // <---- Midleware

app.use('/api/pi/productos', productoRoute); // <---- CRUD de Productos
app.use('/api/pi/usuarios', usuarioRoute); // <----- CRUD de Usuario
app.use('/api/pi/clientes', clienteRoute); // <----- CRUD de Clientes
app.use('/api/pi/categoria', categoriaRoute); // <----- CRUD de Categorias
app.use('/api/pi/proveedor', proveedorRoute); // <----- CRUD de Proveedores

app.use('/api/pi/movimiento', movimientoRoute); // <----- Modulo de Movimiento en el Inventario

// Midleware 404 general
app.use((req, res) => {
    res.status(404).json({
        exito: false,
        msg: "Ruta no encontrada"
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {console.log(`Servidor Conectado en el puerto ${PORT}`)});