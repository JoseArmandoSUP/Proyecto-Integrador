const pool = require('../config/db');

const obtenerClientes = async (req, res) => {
    try{
        const [resultado] = await pool.query('SELECT * FROM cliente');
        res.json({
            exito: true,
            datos: resultado
        });
    }catch (error){
        res.status(500).json({
            exito: false,
            msg: "Error en el servidor Obtener Clientes",
            error: error.messange
        });
    }
};

const buscarCliente = async (req, res) => {
    try{
        const id_cliente = parseInt(req.params.id_cliente);
        const [resultado] = await pool.query('SELECT * FROM cliente WHERE id_cliente = ?', [id_cliente]);
        
        if(resultado.length === 0){
            return res.status(404).json({
                exito: false,
                msg: "Cliente no encontrado"
            });
        }

        res.json({
            exito: true,
            datos: resultado[0]
        });
    }catch (error){
        res.status(500).json({
            exito: false,
            msg: "Error del servidor",
            error: error.messange
        });
    }
};

const crearCliente = async (req, res) => {
    try{
        const nombre_cliente = req.body.nombre_cliente; 
        const apellido_p = req.body.apellido_p;
        const apellido_m = req.body.apellido_m;
        const no_telefono = req.body.no_telefono;
        const direccion_cp = req.body.direccion_cp;
        const regimen_fiscal = req.body.regimen_fiscal;
        const rfc_cliente = req.body.rfc_cliente;
        const correo_electronico = req.body.correo_electronico;
        const cfdi = req.body.cfdi;

        const [resultado] = await pool.query('INSERT INTO cliente (nombre_cliente, apellido_p, apellido_m, no_telefono, direccion_cp, regimen_fiscal, rfc_cliente,correo_electronico, cfdi) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', 
            [nombre_cliente, apellido_p, apellido_m, no_telefono, direccion_cp, regimen_fiscal, rfc_cliente,correo_electronico, cfdi]
        );

        res.status(201).json({
            exito: true,
            msg: "Cliente creado correctamente",
            id_cliente: resultado.insertId
        });
    }catch(error){
        res.status(500).json({
            exito: false,
            msg: "Error en servidor",
            error: error.messange
        });
    }
};

const editarCliente = async (req, res) => {
    try{
        const id_cliente = parseInt(req.params.id_cliente);
        const nombre_cliente = req.body.nombre_cliente;
        const apellido_p = req.body.apellido_p;
        const apellido_m = req.body.apellido_m;
        const no_telefono = req.body.no_telefono;
        const direccion_cp = req.body.direccion_cp;

        const [resultado] = await pool.query('UPDATE cliente SET nombre_cliente = ?, apellido_p = ?, apellido_m = ?, no_telefono = ?, direccion_cp = ? WHERE id_cliente = ?',
            [nombre_cliente, apellido_p, apellido_m, no_telefono, direccion_cp, id_cliente]
        );

        if(resultado.affectedRows === 0){
            return res.status(404).json({
                exto: false,
                msg: "Cliente no encontrado"
            });
        }

        res.json({
            exito: false,
            msg: "Cliente actualizado", 
            id_cliente: id_cliente,
            nombre_cliente: nombre_cliente, 
            apellido_p: apellido_p, 
            apellido_m: apellido_m, 
            no_telefono: no_telefono, 
            direccion_cp: direccion_cp
        });
    }catch (error){
        res.status(500).json({
            exito: false,
            msg: "Error en el servidor",
            error: error.messange
        });
    }
};

const borrarCliente = async (req, res) => {
    try{
        const id_cliente = parseInt(req.params.id_cliente);
        const [resultado] = await pool.query('DELETE FROM cliente WHERE id_cliente = ?', [id_cliente]);

        if(resultado.affectedRows === 0){
            return res.status(404).json({
                exito: false,
                msg: "Cliente no encontrado"
            });
        }

        res.json({
            exiti: true,
            msg: "Cliente eliminado",
            id_cliente: id_cliente
        });
    }catch(error){
        res.status(500).json({
            exito: false,
            msg: "Error en el servidor",
            error: error.messange
        });
    }
};

module.exports = {obtenerClientes, buscarCliente, crearCliente, editarCliente, borrarCliente};