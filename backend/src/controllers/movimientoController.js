const pool = require('../config/db');

const registrarMovimiento = async (req, res) => {
    const connection = await pool.getConnection();
    try{
        await connection.beginTransaction();

        const id_producto = req.body.id_producto;
        const id_proveedor = req.body.id_proveedor;
        const movimiento_tipo = req.body.movimiento_tipo;
        const cantidad = req.body.cantidad;
        const motivo = req.body.motivo;
        const id_usuario = req.usuario.id_usuario;

        // Obtiene el producto actual
        const [productoRows] = await connection.query('SELECT cantidad_disponible FROM producto WHERE id_producto = ?', [id_producto]);

        if(productoRows.length === 0){
            await connection.rollback();
            return res.status(404).json({
                exito: false,
                msg: "Producto no encontrado"
            });
        }
        
        let stockActual = productoRows[0].cantidad_disponible;
        let stockNuevo = stockActual;

        if(movimiento_tipo === 'ENTRADA'){
            stockNuevo = stockNuevo + cantidad;
        }else if(movimiento_tipo === 'SALIDA'){
            if(stockActual < cantidad){
                await connection.rollback();
                return res.status(400).json({
                    exito: false,
                    msg: "Stock no suficiente"
                });
            }
            stockNuevo = stockNuevo - cantidad;
        }else{
            await connection.rollback();
            return res.status(400).json({
                exito: false,
                msg: "Tipo de movimiento inválido"
            }); 
        }

        // Actualiza el stock
        await connection.query('UPDATE producto SET cantidad_disponible = ? WHERE id_producto = ?', 
            [stockNuevo, id_producto]
        );

        // Insertar Movimiento
        await connection.query('INSERT INTO movimiento_inventario (id_producto, id_proveedor, id_usuario, motivo, movimiento_tipo, fecha_hora, cantidad) VALUES (?, ?, ?, ?, ?, NOW(), ?)', 
            [id_producto, id_proveedor, id_usuario, motivo, movimiento_tipo, cantidad]
        );

        await connection.commit();

        res.status(201).json({
            exito: true,
            msg: "Movimiento en Inventario registrado correctamente",
            stock_anterior: stockActual,
            stock_actual: stockNuevo
        });
    }catch (error){
        await connection.rollback();
        res.status(500).json({
            exito: false,
            msg: "Error al registrar movimiento",
            error: error.message
        });
    }finally{
        connection.release();
    }
};

module.exports = {registrarMovimiento};