const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db'); // Importamos la conexión a la BD

// ==========================================
// RUTA 1: INICIAR SESIÓN (LOGIN CON JWT)
// ==========================================
router.post('/login', async (req, res) => {
  try {
    const { correo, password } = req.body;

    if (!correo || !password) {
      return res.status(400).json({ success: false, message: 'Faltan datos' });
    }

    // 1. Buscamos en la tabla USUARIO
    const [rows] = await db.query('SELECT * FROM usuario WHERE correo_electronico_usuario = ?', [correo]);

    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Correo o contraseña incorrectos' });
    }

    const usuario = rows[0];
    
    // 2. Verificamos la contraseña
    const passwordValida = await bcrypt.compare(password, usuario.contraseña);

    if (!passwordValida) {
      return res.status(401).json({ success: false, message: 'Correo o contraseña incorrectos' });
    }

    // 🌟 NUEVO: 3. Buscamos si este usuario ya llenó sus datos en la tabla CLIENTE
    const [clienteRows] = await db.query('SELECT * FROM cliente WHERE id_usuario = ?', [usuario.id_usuario]);
    const tienePerfilCliente = clienteRows.length > 0; // Será true si ya llenó sus datos, false si no.
    const datosCliente = tienePerfilCliente ? clienteRows[0] : null;

    // 4. Generamos el Token
    const token = jwt.sign(
      { id: usuario.id_usuario, rol: usuario.id_rol },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Borramos la contraseña por seguridad antes de enviarlo a la app
    delete usuario.contraseña; 

    // 5. Enviamos todo a la App (incluyendo si ya tiene perfil de cliente)
    res.json({ 
      success: true, 
      message: 'Login exitoso', 
      token, 
      usuario, 
      tienePerfilCliente, // <-- La app sabrá si ya completó su RFC/Dirección
      datosCliente        // <-- Mandamos sus datos si es que ya existen
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
});

// ==========================================
// RUTA 2: REGISTRO (SOLO TABLA USUARIO)
// ==========================================
router.post('/registro', async (req, res) => {
  try {
    const { nombre_usuario, correo, password } = req.body;

    if (!nombre_usuario || !correo || !password) {
      return res.status(400).json({ success: false, message: 'Por favor llena todos los campos' });
    }

    // Verificamos que el correo no exista ya
    const [existente] = await db.query('SELECT id_usuario FROM usuario WHERE correo_electronico_usuario = ?', [correo]);

    if (existente.length > 0) {
      return res.status(409).json({ success: false, message: 'Ese correo ya está registrado' });
    }

    // Encriptamos contraseña
    const salt = await bcrypt.genSalt(10);
    const passwordHasheada = await bcrypt.hash(password, salt);

    // Guardamos en tabla USUARIO (id_rol = 1 por defecto para clientes)
    const query = `INSERT INTO usuario (id_rol, nombre_usuario, correo_electronico_usuario, contraseña) VALUES (?, ?, ?, ?)`;
    await db.query(query, [1, nombre_usuario, correo, passwordHasheada]);

    res.status(201).json({ success: true, message: 'Usuario creado exitosamente' });

  } catch (error) {
    console.error('Error al registrar:', error);
    res.status(500).json({ success: false, message: 'Error en el servidor al registrar' });
  }
});

module.exports = router;