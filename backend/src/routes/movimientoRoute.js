const express = require('express');
const router = express.Router();
const movimientoController = require('../controllers/movimientoController');
const verificarToken = require('../middlewares/authMiddleware')

router.post('/', verificarToken, movimientoController.registrarMovimiento);

module.exports = router;