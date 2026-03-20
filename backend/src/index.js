const express = require('express');
const cors = require('cors');
require('dotenv').config();

// ----------------------------------------- CRUD's ----------------------------------------------------
const productoRoute = require('./routes/productoRoute'); // <---- Productos
const usuarioRoute = require('./routes/usuarioRoute'); // <----- Usuarios
const clienteRoute = require('./routes/clienteRoute'); // <----- Clientes
const categoriaRoute = require('./routes/categoriaRoute'); // <----- Categorias
const proveedorRoute = require('./routes/proveedorRoute') // <------ Proveedores

// ----------------------------------------- Módulos ---------------------------------------------------
const movimientoRoute = require('./routes/movimientoRoute'); // <------- Movimiento Inventario
const ventaRoute = require('./routes/ventaRoute'); // <------- Ventas

const app = express();

app.use(cors()); // <---- Midleware
app.use(express.json()); // <---- Midleware

app.use('/api/pi/productos', productoRoute); // <---- CRUD de Productos
app.use('/api/pi/usuarios', usuarioRoute); // <----- CRUD de Usuario
app.use('/api/pi/clientes', clienteRoute); // <----- CRUD de Clientes
app.use('/api/pi/categoria', categoriaRoute); // <----- CRUD de Categorias
app.use('/api/pi/proveedor', proveedorRoute); // <----- CRUD de Proveedores

app.use('/api/pi/movimiento', movimientoRoute); // <----- Módulo de Movimiento en el Inventario
app.use('/api/pi/ventas', ventaRoute); // <----- Módulo de Ventas

// Midleware 404 general
app.use((req, res) => {
    res.status(404).json({
        exito: false,
        msg: "Ruta no encontrada"
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {console.log(`Servidor Conectado en el puerto ${PORT}`)});