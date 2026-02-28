const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const registrar = async (req, res) => {
    try{
        const id_rol = req.body.id_rol; 
        const nombre_usuario = req.body.nombre_usuario; 
        const user_password = req.body.user_password; 
        const correo_electronico_usuario = req.body.correo_electronico_usuario;

        // Verifica si ya existe el usuario
        const [resultado] = await pool.query('SELECT * FROM usuario WHERE correo_electronico_usuario = ?', [correo_electronico_usuario]);

        if(resultado.length > 0){
            return res.status(400).json({
                exito: false,
                msg: `El usuario ${nombre_usuario} ya existe`
            });
        }

        //ENcripta la contraseña
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(user_password, salt);

        const [result] = await pool.query('INSERT INTO usuario (id_rol, nombre_usuario, user_password, correo_electronico_usuario) VALUES (?, ?, ?, ?)', [id_rol, nombre_usuario, passwordHash, correo_electronico_usuario]);
        
        if(result.affectedRows === 0){
            return res.status(400).json({ error: 'Error al insertar usuario' });
        }

        res.status(201).json({
            exito: true,
            msg: "Usuario registrado correctamente",
            id_usuario: result.insertId
        });
    }catch (error){
        res.status(500).json({
            exito: false,
            msg: "Error en el servidor"
        });
    }
};

const login = async (req, res) => {
    try{
        const correo_electronico_usuario = req.body.correo_electronico_usuario;
        const user_password = req.body.user_password;

        const [resultado] = await pool.query('SELECT * FROM usuario WHERE correo_electronico_usuario = ?', [correo_electronico_usuario]);

        if(resultado.length === 0){
            return res.status(400).json({
                exito: false,
                msg: "Credenciales invalidas (emali)"
            });
        }

        const usuario = resultado[0];

        const isMatch = await bcrypt.compare(user_password, usuario.user_password);

        if(!isMatch){
            return res.status(400).json({
                exito: false,
                msg: "Credenciales invalidas (contraseña)"
            });
        }

        const payload = {
            id_usuario: usuario.id_usuario,
            id_rol: usuario.id_rol,
            nombre_usuario: usuario.nombre_usuario
        };

        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({
            exito: true,
            msg: "Bienvenido",
            token: token
        });

    }catch (error) {
        res.status(500).json({
            exito: false,
            msg: "Error en el servidor",
            error: error.message
        });
    }
};

module.exports = {registrar, login};