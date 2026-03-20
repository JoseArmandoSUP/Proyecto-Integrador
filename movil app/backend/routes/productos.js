const express = require('express');
const router = express.Router();
const db = require('../db');

// OBTENER TODOS LOS PRODUCTOS CON SU CATEGORÍA
router.get('/', async (req, res) => {
    try {
        // 🌟 Usamos LEFT JOIN para traer TODOS los productos, 
        // incluso si alguno por error no tiene categoría.
        const [rows] = await db.query(`
            SELECT p.*, c.nombre_categoria 
            FROM producto p
            LEFT JOIN categoria c ON p.id_categoria = c.id_categoria
        `);
        
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error("Error al obtener productos:", error);
        res.status(500).json({ success: false, message: 'Error en el servidor al obtener productos' });
    }
});

module.exports = router;