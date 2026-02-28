const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/clienteController');

router.get('/', clienteController.obtenerClientes);
router.get('/:id_cliente', clienteController.buscarCliente);
router.post('/', clienteController.crearCliente);
router.put('/:id_cliente', clienteController.editarCliente);
router.delete('/:id_cliente', clienteController.borrarCliente);

module.exports = router;