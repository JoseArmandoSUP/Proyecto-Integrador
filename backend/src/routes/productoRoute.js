const express = require('express');
const router = express.Router();
const productoController = require('../controllers/productoController');
// const verificarToken = require('../middlewares/authMiddleware');

router.get('/', productoController.obtenerProductos);
router.post('/', productoController.crearProducto);
router.put('/:id_producto', productoController.editarProducto);
router.delete('/:id_producto', productoController.borrarProducto);

module.exports = router;