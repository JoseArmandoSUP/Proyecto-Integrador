const express = require('express');
const router = express.Router();
const proveedorController = require('../controllers/proveedorController');
const verificarToken = require('../middlewares/authMiddleware');

router.get('/', verificarToken, proveedorController.obtenerProvedores);
router.get('/:id_proveedor', verificarToken, proveedorController.buscarProveedor);
router.post('/', verificarToken, proveedorController.crearProveedor);
router.put('/:id_proveedor', verificarToken, proveedorController.editarProveedor);
router.delete('/:id_proveedor', verificarToken, proveedorController.borrarProveedor);

module.exports = router;