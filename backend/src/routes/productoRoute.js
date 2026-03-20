const express = require('express');
const router = express.Router();
const productoController = require('../controllers/productoController');
const verificarToken = require('../middlewares/authMiddleware');

router.get('/', verificarToken, productoController.obtenerProductos);
router.post('/', verificarToken, productoController.crearProducto);
router.put('/:id_producto', verificarToken, productoController.editarProducto);
router.delete('/:id_producto', verificarToken, productoController.borrarProducto);
router.get('/reportes/stockBajo', verificarToken, productoController.alertaStockBajo);

module.exports = router;