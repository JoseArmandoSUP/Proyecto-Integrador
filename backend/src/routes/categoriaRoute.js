const express = require('express');
const router = express.Router();
const categoriaController = require('../controllers/categoriaController');

router.get('/', categoriaController.obtenerCategorias);
router.get('/:id_categoria', categoriaController.buscarCategoria);
router.post('/', categoriaController.crearCategoria);
router.put('/:id_categoria', categoriaController.editarCategoria);
router.delete('/:id_categoria', categoriaController.eliminarCategoria);

module.exports = router;