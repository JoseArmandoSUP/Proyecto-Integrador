const pool = require('../config/db');
const { borrarCliente } = require('./clienteController');

const obtenerCategorias = async (req, res) => {
    try{
        const [resultado] = await pool.query('SELECT * FROM categoria');
        res.json({
            exito: true,
            datos: resultado
        });
    }catch(error){
        res.status(500).json({
            exito: false,
            msg: "Error en el servidor",
            error: error.message
        });
    }
};

const buscarCategoria = async (req, res) => {
    try{
        const id_categoria = parseInt(req.params.id_categoria);
        const [resultado] = await pool.query('SELECT * FROM categoria WHERE id_categoria = ?', [id_categoria]);
        
        if(resultado.affectedRows === 0){
            return res.status(404).json({
                exito: false,
                msg: "Categoria no encontrada"
            });
        }

        res.json({
            exito: true,
            datos: resultado[0]
        });
    }catch(error){
        res.status(500).json({
            exito: false,
            msg: "Error del servidor",
            error: error.message
        });
    }
};

const crearCategoria = async (req, res) => {
    try{
        const nombre_categoria = req.body.nombre_categoria;
        const descripcion_categoria = req.body.descripcion_categoria;

        const [resultado] = await pool.query('INSERT INTO categoria (nombre_categoria, descripcion_categoria) VALUES (?, ?)',
            [nombre_categoria, descripcion_categoria]
        );

        res.status(201).json({
            exito: true,
            msg: "Categoria añadida",
            id_categoria: resultado.insertId
        });
    }catch(error){
        res.status(500).json({
            exito: false,
            msg: "Error en el servidor",
            error: error.message
        });
    }
};

const editarCategoria = async (req, res) => {
    try{
        const id_categoria = parseInt(req.params.id_categoria);
        const nombre_categoria = req.body.nombre_categoria;
        const descripcion_categoria = req.body.descripcion_categoria;

        const [resultado] = await pool.query('UPDATE categoria SET nombre_categoria = ?, descripcion_categoria = ? WHERE id_categoria = ?', 
            [nombre_categoria, descripcion_categoria, id_categoria]
        );

        if(resultado.affectedRows === 0){
            return res.status(404).json({
                exito: false,
                msg: "Categoria no encontrada"
            });
        }

        res.json({
            exito: true,
            msg: "Categoria modificada"
        });
    }catch(error){
        res.status(500).json({
            exito: false,
            msg: "Error del servidor",
            error: error.message
        });
    }
};

const eliminarCategoria = async (req, res) => {
    try{
        const id_categoria = parseInt(req.params.id_categoria);
        const [resultado] = await pool.query('DELETE FROM categoria WHERE id_categoria = ?', [id_categoria]);

        if(resultado.affectedRows === 0){
            return res.status(404).json({
                exito: false,
                msg: "Categoria no encontrada"
            });
        }

        res.json({
            exito: true,
            msg: "Categoria eliminada"
        });
    }catch(error){
        res.status(500).json({
            exito: false,
            msg: "Error en el servidor",
            error: error.message
        });
    }
};

module.exports = {obtenerCategorias, buscarCategoria, crearCategoria, editarCategoria, eliminarCategoria};