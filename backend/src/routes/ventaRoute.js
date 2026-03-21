const express = require('express');
const router = express.Router();
const ventaController = require('../controllers/ventaController');
const verificarToken = require('../middlewares/authMiddleware');

router.post('/', verificarToken, ventaController.registrarVenta);
router.get('/', verificarToken, ventaController.obtenerVentas);
router.get('/:id_venta', verificarToken, ventaController.buscarVentas);
router.get('/reportes/masVendidos', verificarToken, ventaController.prooductosMasVendidos);
router.get('/reportes/cierreCaja', verificarToken, ventaController.cierreDeCaja);
router.get('/reportes/ventasMensuales', verificarToken, ventaController.ventasMensuales);

module.exports = router;