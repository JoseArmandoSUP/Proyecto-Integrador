const express = require('express');
const router = express.Router();
const categoriaController = require('../controllers/categoriaController');
const verificarToken = require('../middlewares/authMiddleware');

router.get('/', verificarToken, categoriaController.obtenerCategorias);
router.get('/:id_categoria', verificarToken, categoriaController.buscarCategoria);
router.post('/', verificarToken, categoriaController.crearCategoria);
router.put('/:id_categoria', verificarToken, categoriaController.editarCategoria);
router.delete('/:id_categoria', verificarToken, categoriaController.eliminarCategoria);

module.exports = router;