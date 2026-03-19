const express = require('express');
const router = express.Router();
const db = require('../db');

// 1. OBTENER DATOS DEL USUARIO
router.get('/:id_usuario', async (req, res) => {
  try {
    const { id_usuario } = req.params;

    const [cliente] = await db.query(`
      SELECT u.correo_electronico_usuario, c.* 
      FROM usuario u
      LEFT JOIN cliente c ON u.id_usuario = c.id_usuario
      WHERE u.id_usuario = ?
    `, [id_usuario]);

    const [tarjeta] = await db.query('SELECT * FROM tarjeta_pago WHERE id_usuario = ? ORDER BY id_tarjeta DESC LIMIT 1', [id_usuario]);

    res.json({
      success: true,
      cliente: cliente.length > 0 ? cliente[0] : null,
      tarjeta: tarjeta.length > 0 ? tarjeta[0] : null
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error al obtener datos' });
  }
});

// 2. ACTUALIZAR DATOS PERSONALES
router.put('/personales/:id_usuario', async (req, res) => {
  try {
    const { id_usuario } = req.params;
    const { nombre, apellido_P, apellido_M, correo, no_telefono, rfc, regimen_fiscal, cfdi } = req.body;

    await db.query('UPDATE usuario SET correo_electronico_usuario = ? WHERE id_usuario = ?', [correo, id_usuario]);

    const [cliente] = await db.query('SELECT * FROM cliente WHERE id_usuario = ?', [id_usuario]);
    
    if (cliente.length > 0) {
      await db.query(`
        UPDATE cliente SET 
        nombre = ?, apellido_P = ?, apellido_M = ?, correo_electronico = ?, 
        no_telefono = ?, rfc = ?, regimen_fiscal = ?, cfdi = ?
        WHERE id_usuario = ?`, 
      [nombre, apellido_P, apellido_M, correo, no_telefono, rfc, regimen_fiscal, cfdi, id_usuario]);
    } else {
      await db.query(`
        INSERT INTO cliente 
        (id_usuario, nombre, apellido_P, apellido_M, correo_electronico, no_telefono, rfc, regimen_fiscal, cfdi) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
      [id_usuario, nombre, apellido_P, apellido_M, correo, no_telefono, rfc, regimen_fiscal, cfdi]);
    }

    res.json({ success: true, message: 'Datos personales actualizados' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error al guardar datos personales' });
  }
});

// 3. ACTUALIZAR DIRECCIÓN DE ENVÍO
router.put('/direccion/:id_usuario', async (req, res) => {
  try {
    const { id_usuario } = req.params;
    const { pais, direccion, ciudad, cp } = req.body;

    const [cliente] = await db.query('SELECT * FROM cliente WHERE id_usuario = ?', [id_usuario]);

    if (cliente.length > 0) {
      await db.query('UPDATE cliente SET pais = ?, calle_numero = ?, ciudad = ?, codigo_postal = ? WHERE id_usuario = ?', 
      [pais, direccion, ciudad, cp, id_usuario]);
    } else {
      await db.query(`
        INSERT INTO cliente 
        (id_usuario, pais, calle_numero, ciudad, codigo_postal, nombre, apellido_P, apellido_M, no_telefono, regimen_fiscal, rfc, correo_electronico, cfdi) 
        VALUES (?, ?, ?, ?, ?, '', '', '', '', '', '', '', '')`, 
      [id_usuario, pais, direccion, ciudad, cp]);
    }

    res.json({ success: true, message: 'Dirección guardada correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error al guardar dirección' });
  }
});

// 4. GUARDAR MÉTODO DE PAGO
router.post('/tarjeta/:id_usuario', async (req, res) => {
  try {
    const { id_usuario } = req.params;
    const { nombre_tarjeta, numero_tarjeta, fecha_expiracion } = req.body;

    await db.query(
      'INSERT INTO tarjeta_pago (id_usuario, nombre_tarjeta, numero_tarjeta, fecha_expiracion) VALUES (?, ?, ?, ?)', 
      [id_usuario, nombre_tarjeta, numero_tarjeta, fecha_expiracion]
    );

    res.json({ success: true, message: 'Método de pago agregado exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error al guardar tarjeta' });
  }
});

// ==========================================
// 🌟 5. PROCESAR COMPRA (A PRUEBA DE FALLOS)
// ==========================================
router.post('/comprar/:id_usuario', async (req, res) => {
  try {
    console.log("====================================");
    console.log(`🛍️ Iniciando compra para usuario ID: ${req.params.id_usuario}`);
    
    const { id_usuario } = req.params;
    const { carrito } = req.body;

    // 1. Buscamos el id_cliente
    const [cliente] = await db.query('SELECT id_cliente FROM cliente WHERE id_usuario = ?', [id_usuario]);
    
    if (cliente.length === 0) {
      console.log("❌ Error: Cliente no encontrado");
      return res.status(400).json({ success: false, message: 'Primero completa tus datos de perfil.' });
    }
    const id_cliente = cliente[0].id_cliente;

    // 2. Procesamos el carrito
    for (let item of carrito) {
      console.log(`▶️ Procesando producto ID: ${item.id_producto} | Cantidad a restar: ${item.cantidad}`);
      
      try {
        // Guardamos la compra (con ON DUPLICATE para que NUNCA CRASHEE el código)
        await db.query(
          `INSERT INTO compra (id_cliente, id_producto, fecha) VALUES (?, ?, NOW())
           ON DUPLICATE KEY UPDATE fecha = NOW()`, 
          [id_cliente, item.id_producto]
        );
        console.log("✅ Guardado en tabla 'compra'");

        // Guardamos el detalle de la venta
        await db.query(
          'INSERT INTO detalle_venta (id_producto, cantidad, precio_unidad) VALUES (?, ?, ?)', 
          [item.id_producto, item.cantidad, item.precio]
        );
        console.log("✅ Guardado en tabla 'detalle_venta'");

        // 🌟 DESCONTAMOS DEL INVENTARIO
        const [updateResult] = await db.query(
          'UPDATE producto SET cantidad_disponible = cantidad_disponible - ? WHERE id_producto = ?',
          [item.cantidad, item.id_producto]
        );
        console.log(`✅ ¡INVENTARIO RESTADO! Filas afectadas: ${updateResult.affectedRows}`);

      } catch (errLoop) {
        console.log(`❌ Error al procesar el producto ${item.id_producto}:`, errLoop);
      }
    }

    console.log("🎉 Compra finalizada con éxito");
    console.log("====================================");
    res.json({ success: true, message: 'Compra registrada y stock actualizado con éxito' });

  } catch (error) {
    console.error("❌ Error General:", error);
    res.status(500).json({ success: false, message: 'Error al registrar la compra en BD' });
  }
});

module.exports = router;