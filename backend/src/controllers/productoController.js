const pool = require('../config/db');

const obtenerProductos = async (req, res) => {
    try{
        const [rows] = await pool.query('SELECT * FROM producto');
        res.json({
            exito: true,
            datos: rows,
            msg: "Peticion exitosa"
        });
    }catch (error){
        res.status(500).json({
            exito: false,
            msg: "Error al obtener productos",
            error: error.message
        });
    }
};

const crearProducto = async (req, res) => {
    try{
        const id_categoria = req.body.id_categoria;
        const nombre_producto = req.body.nombre_producto;
        const descripcion_producto = req.body.descripcion_producto;
        const precio = req.body.precio;
        const cantidad_disponible = req.body.cantidad_disponible;
        const codigo_de_barras = req.body.codigo_de_barras;
        const stock_minimo = req.body.stock_minimo;

        const [result] = await pool.query(
            'INSERT INTO producto (id_categoria, nombre_producto, descripcion_producto, precio, cantidad_disponible, codigo_de_barras, stock_minimo) VALUES (?,?,?,?,?,?,?)', 
            [id_categoria, nombre_producto, descripcion_producto, precio, cantidad_disponible, codigo_de_barras, stock_minimo]
        );
        
        if(result.affectedRows === 0){
            return res.status(400).json({ error: 'Error al insertar' });
        }

        res.status(201).json({
            exito: true,
            datos: { id_producto: result.insertId },
            msg: "Producto creado correctamente"
        });
    }catch(error){
        res.status(500).json({
            exito: false,
            msg: "Error al añadir producto",
            error: error.message
        });
    }
};

const editarProducto = async (req, res) => {
    try{
        const id_producto = parseInt(req.params.id_producto);
        const precio = req.body.precio;
        const cantidad_disponible = req.body.cantidad_disponible;
        
        const [result] = await pool.query('UPDATE producto SET precio = ?, cantidad_disponible = ? WHERE id_producto = ?', [precio, cantidad_disponible, id_producto]);
        
        if(result.affectedRows === 0){
            return res.status(404).json({ error: 'Error al editar' });
        }

        res.status(200).json({
            exito: true,
            datos: result,
            msg: "Producto editado correctamente"
        });
    }catch (error){
        res.status(500).json({
            exito: false,
            msg: "Error al editar producto",
            error: error.message
        });
    }
};

const borrarProducto = async (req, res) => {
    const id_producto = parseInt(req.params.id_producto);
    try{
        const [resultado] = await pool.query('DELETE FROM producto WHERE id_producto = ?', [id_producto]);
        if(resultado.affectedRows === 0){
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        res.status(200).json({ 
            exito: true,
            msg: 'Producto eliminado: ', 
            id_producto: id_producto
        });
    }catch (error){
        res.status(500).json({ 
            exito: false,
            msg: "Error al eliminar producto",
            error: error.message 
        });
    }
};

const alertaStockBajo = async (req, res) => {
    try{
        const [resultado] = await pool.query(
            `SELECT id_producto, nombre_producto, cantidad_disponible, stock_minimo FROM producto 
            WHERE cantidad_disponible <= stock_minimo`
        );

        res.json({
            exito: true,
            productos: resultado
        });
    }catch (error){
        res.status(500).json({
            exito: false,
            msg: "Error en el servidor en alerta de stock bajo",
            error: error.message
        });
    }
};

const buscarProducto = async (req, res) => {
    try{
        const busqueda = req.query.busqueda;

        const [resultado] = await pool.query(`
            SELECT 
                p.id_producto,
                p.nombre_producto,
                p.precio,
                p.cantidad_disponible,
                c.nombre_categoria
            FROM producto p
            JOIN categoria c ON p.id_categoria = c.id_categoria
            WHERE 
                p.nombre_producto LIKE ?
                OR p.codigo_de_barras LIKE ?
                OR c.nombre_categoria LIKE ?
        `, [`%${busqueda}%`, `%${busqueda}%`, `%${busqueda}%`]
        );

        res.json({
            exito: true,
            productos: resultado
        });
    }catch (error){
        res.status(500).json({
            exito: false, 
            msg: "Error en el servidor en buscar productos",
            error: error.message
        });
    }
};

module.exports = {obtenerProductos, crearProducto, editarProducto, borrarProducto, alertaStockBajo, buscarProducto};    