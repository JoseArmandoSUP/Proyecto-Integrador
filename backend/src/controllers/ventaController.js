const pool = require('../config/db');

const registrarVenta = async (req, res) => {
    const connection = await pool.getConnection();
    try{
        await connection.beginTransaction();
        const id_cliente = req.body.id_cliente;
        const productos = req.body.productos;
        const id_usuario = req.usuario.id_usuario;

        let totalVenta = 0;

        // calcular el total
        for (let producto of productos){
            totalVenta = totalVenta + producto.cantidad * producto.precio_unitario;
        }

        // Inserta la venta en la BD
        const [resultado] = await connection.query('INSERT INTO venta (id_cliente, id_usuario, fecha_venta, total) VALUES(?, ?, NOW(), ?)', [id_cliente, id_usuario, totalVenta]);

        const id_venta = resultado.insertId;

        // Recorrer los productos vendidos
        for(let producto of productos){

            const id_producto = producto.id_producto;
            const cantidad = producto.cantidad;
            const precio_unitario = producto.precio_unitario;

            const subtotal = cantidad * precio_unitario;

            const [productoDB] = await connection.query(
                'SELECT cantidad_disponible FROM producto WHERE id_producto = ?',
                [id_producto]
            );

            if(productoDB.length === 0){
                throw new Error("Producto no encontrado");
            }

            let stockActual = productoDB[0].cantidad_disponible;

            if(stockActual < cantidad){
                throw new Error("Stock insuficiente");
            }

            let nuevoStock = stockActual - cantidad;

            await connection.query(
                'UPDATE producto SET cantidad_disponible = ? WHERE id_producto = ?',
                [nuevoStock, id_producto]
            );

            await connection.query(
                `INSERT INTO detalle_venta
                (id_venta, id_producto, cantidad, precio_unidad, subtotal)
                VALUES (?, ?, ?, ?, ?)`,
                [id_venta, id_producto, cantidad, precio_unitario, subtotal]
            );

            await connection.query(
                `INSERT INTO movimiento_inventario
                (id_producto, id_usuario, movimiento_tipo, cantidad, fecha_hora, motivo)
                VALUES (?, ?, 'SALIDA', ?, NOW(), 'Venta')`,
                [id_producto, id_usuario, cantidad]
            );
        }
        
        await connection.commit();

        res.status(201).json({
            exito: true,
            msg: "Venta registrada correctamente",
            id_venta: id_venta,
            total: totalVenta
        });

    }catch(error){
        
        await connection.rollback();
        res.status(500).json({
            exito: false,
            msg: "Error al registrar venta",
            error: error.message
        });

    }finally{
        connection.release();
    }
};

const obtenerVentas = async (req, res) => {
    try{
        const [resultado] = await pool.query(
            `SELECT v.id_venta, v.fecha_venta, v.total, c.nombre_cliente, c.apellido_p, c.apellido_m, u.nombre_usuario 
            FROM venta v JOIN cliente c ON v.id_cliente = c.id_cliente JOIN usuario u ON v.id_usuario = u.id_usuario 
            ORDER BY v.fecha_venta DESC`
        );

        res.json({
            exito: true,
            ventas: resultado
        });
    }catch (error){
        res.status(500).json({
            exito: false,
            msg: "Error en el servidor al obtener ventas",
            error: error.message
        });
    }
};

const buscarVentas = async (req, res) => {
    try{
        const id_venta = req.params.id_venta;

        // Obtiene los datos de la venta
        const [resultado] = await pool.query(`SELECT v.id_venta, v.fecha_venta, v.total, c.nombre_cliente, c.apellido_p, c.apellido_m, u.nombre_usuario 
            FROM venta v JOIN cliente c on v.id_cliente = c.id_cliente JOIN usuario u on v.id_usuario = u.id_usuario
            WHERE v.id_venta = ?`, [id_venta]
        );

        if(resultado.length === 0){
            return res.status(404).json({
                exito: false, 
                msg: "Venta no enctrada"
            });
        }

        // Obtiene el detalle del producto
        const [result] = await pool.query(
            `SELECT dv.id_producto, p.nombre_producto, dv.cantidad, dv.precio_unidad, dv.subtotal 
            FROM detalle_venta dv JOIN producto p ON dv.id_producto = p.id_producto 
            WHERE dv.id_venta = ?`, [id_venta]
        );

        res.json({
            exito: true,
            venta: resultado[0],
            detalle: result
        });

    }catch(error){
        res.status(500).json({
            exito: false,
            msg: "Error en el servidor al buscar venta",
            error: error.message
        });
    }
};

// Reporte de productos mas vendidos
const prooductosMasVendidos = async (req, res) => {
    try{
        const [result] = await pool.query(`SELECT p.id_producto, p.nombre_producto, SUM(dv.cantidad) 
            AS total_vendido FROM detalle_venta dv JOIN producto p ON dv.id_producto = p.id_producto
            GROUP BY dv.id_producto ORDER BY total_vendido DESC`
        );

        res.json({
            exito: true,
            reporte: result
        });
    }catch (error){
        res.status(500).json({
            exito: false, 
            msg: "Error en el servidor en productos mas vendidos",
            error: error.message
        });
    }
};

module.exports = {registrarVenta, obtenerVentas, buscarVentas, prooductosMasVendidos};