const pool = require('../config/db');

const obtenerProvedores = async (req, res) => {
    try{
        const [resultado] = await pool.query('SELECT * FROM proveedor');

        res.json({
            exito: true,
            datos: resultado
        });
    }catch (error){
        res.status(500).json({
            exito: false,
            msg: "Error del servidor",
            error: error.message
        });
    }
};

const buscarProveedor = async (req, res) => {
    try{
        const id_proveedor = parseInt(req.params.id_proveedor);
        const [resultado] = await pool.query('SELECT * FROM proveedor WHERE id_proveedor = ?', [id_proveedor]);

        if(resultado.affectedRows === 0){
            return res.status(404).json({
                exito: false,
                msg: "Proveedor no encontrado"
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

const crearProveedor = async (req, res) => {
    try{
        const contribuyente = req.body.contribuyente;
        const telefono = req.body.telefono;
        const correo_electronico_proveedor = req.body.correo_electronico_proveedor;
        const rfc_proveedor = req.body.rfc_proveedor;
        const direccion = req.body.direccion;

        const [resultado] = await pool.query('INSERT INTO proveedor (contribuyente, telefono, correo_electronico_proveedor, rfc_proveedor, direccion) VALUES (?,?,?,?,?)',
            [contribuyente, telefono, correo_electronico_proveedor, rfc_proveedor, direccion]
        );

        res.status(201).json({
            exito: true,
            msg: "Proveedor añadido",
            id_proveedor: resultado.insertId
        });
    }catch (error){
        res.status(500).json({
            exito: false,
            msg: "Error del servidor",
            error: error.message
        });
    }
};

const editarProveedor = async (req, res) => {
    try{
        const id_proveedor = parseInt(req.params.id_proveedor);
        const contribuyente = req.body.contribuyente;
        const telefono = req.body.telefono;
        const correo_electronico_proveedor = req.body.correo_electronico_proveedor;
        const direccion = req.body.direccion;

        const [resultado] = await pool.query('UPDATE proveedor SET contribuyente = ?, telefono = ?, correo_electronico_proveedor = ?, direccion = ? WHERE id_proveedor = ?',
            [contribuyente, telefono, correo_electronico_proveedor, direccion, id_proveedor]
        );

        if(resultado.affectedRows === 0){
            return res.status(404).json({
                exito: false,
                msg: "Proveedor no encontrado"
            });
        }

        res.json({
            exito: true,
            msg: "Proveedor modificado",
            id_proveedor: id_proveedor,
            contribuyente: contribuyente,
            telefono: telefono, 
            correo_electronico_proveedor: correo_electronico_proveedor,
            direccion: direccion
        });
    }catch(error){
        res.status(500).json({
            exito: false,
            msg: "Error del servidor",
            error: error.message
        });
    }
};

const borrarProveedor = async (req, res) => {
    try{
        const id_proveedor = parseInt(req.params.id_proveedor);

        const [resultado] = await pool.query('DELETE FROM proveedor WHERE id_proveedor = ?', [id_proveedor]);

        if(resultado.affectedRows === 0){
            return res.status(404).json({
                exito: false,
                msg: "Proveedor no encontrado"
            }); 
        }

        res.json({
            exito: true,
            msg: "Producto eliminado",
            id_proveedor: id_proveedor
        });
    }catch (error){
        res.status(500).json({
            exito: false,
            msg: "Error del servidor",
            error: error.message
        });
    }
};

module.exports = {obtenerProvedores, buscarProveedor, crearProveedor, editarProveedor, borrarProveedor};