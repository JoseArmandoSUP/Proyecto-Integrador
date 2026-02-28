const express = require('express');
const router = express.Router();
const proveedorController = require('../controllers/proveedorController');

router.get('/', proveedorController.obtenerProvedores);
router.get('/:id_proveedor', proveedorController.buscarProveedor);
router.post('/', proveedorController.crearProveedor);
router.put('/:id_proveedor', proveedorController.editarProveedor);
router.delete('/:id_proveedor', proveedorController.borrarProveedor);

module.exports = router;