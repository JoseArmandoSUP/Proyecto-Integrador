CREATE DATABASE pi; 
USE pi; 

-- 1
CREATE TABLE categoria (
	id_categoria INT AUTO_INCREMENT PRIMARY KEY, 
    nombre_categoria VARCHAR(50) NOT NULL, 
    descripcion_categoria TEXT NOT NULL
);
-- 2
CREATE TABLE rol_usuario (
	id_rol INT AUTO_INCREMENT PRIMARY KEY, 
    nombre_rol VARCHAR(50) NOT NULL, 
    descripcion_rol TEXT NOT NULL
);
insert into rol_usuario (nombre_rol, descripcion_rol) values
('ADMINISTRADOR', 'Autorizacion a la gestion completa del inventario');
select * from rol_usuario;

-- 3
CREATE TABLE cliente (
	id_cliente INT AUTO_INCREMENT PRIMARY KEY, 
    nombre_cliente VARCHAR(40) NOT NULL, 
    apellido_p VARCHAR(40) NOT NULL, 
    apellido_m VARCHAR(40) NOT NULL, 
    no_telefono VARCHAR(20) NOT NULL, 
    direccion_cp VARCHAR(10) NOT NULL, 
    regimen_fiscal VARCHAR(80) NOT NULL, 
    rfc_cliente VARCHAR(13) UNIQUE NOT NULL, 
    correo_electronico VARCHAR(150) UNIQUE NOT NULL,
    cfdi TEXT NOT NULL
);
INSERT INTO cliente(nombre_cliente, apellido_p, apellido_m, no_telefono, direccion_cp, regimen_fiscal, rfc_cliente, correo_electronico, cfdi) VALUES 
('Cliente', 'De la Costa', 'Costosa', '1234567890', 'EnSe768229', 'Fisca', '1234567890123', 'cliente@gamil.com', 'Gasto');
select * from cliente;

-- 4
CREATE TABLE proveedor (
	id_proveedor INT AUTO_INCREMENT PRIMARY KEY, 
    contribuyente VARCHAR(100) NOT NULL,     -- En el MER aparece como nombre
    telefono VARCHAR(20) NOT NULL, 
    correo_electronico_proveedor VARCHAR(150) UNIQUE NOT NULL,
    rfc_proveedor VARCHAR(13) UNIQUE NOT NULL, 
    direccion TEXT
); 
-- 5
CREATE TABLE producto (
	id_producto INT AUTO_INCREMENT PRIMARY KEY,
    id_categoria INT NOT NULL,
    nombre_producto VARCHAR(100) NOT NULL, 
    descripcion_producto TEXT NOT NULL, 
    precio DECIMAL (10,2) NOT NULL, 
    cantidad_disponible INT NOT NULL, 
    codigo_de_barras VARCHAR (50) NOT NULL UNIQUE,
    stock_minimo INT DEFAULT 5,
    FOREIGN KEY (id_categoria) REFERENCES categoria (id_categoria)
);
select * from producto;
alter table producto add imagen_url varchar(255);

-- 6
CREATE TABLE usuario (
	id_usuario INT AUTO_INCREMENT PRIMARY KEY, 
    id_rol INT NOT NULL, 
    nombre_usuario VARCHAR(100) UNIQUE NOT NULL, 
    contraseña VARCHAR(150) NOT NULL, 
    correo_electronico_usuario VARCHAR(150) UNIQUE NOT NULL, 
    FOREIGN KEY (id_rol) REFERENCES rol_usuario (id_rol)
);
alter table usuario change contraseña user_password varchar(150);
select * from usuario;

-- 12
CREATE TABLE venta(
    id_venta INT AUTO_INCREMENT PRIMARY KEY,
    id_cliente INT NOT NULL,
    id_usuario INT NOT NULL,
    fecha_venta DATETIME NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (id_cliente) REFERENCES cliente(id_cliente),
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
);
select * from venta; 

-- 8
CREATE TABLE detalle_venta (
	id_detalle_venta INT AUTO_INCREMENT PRIMARY KEY, 
    id_producto INT NOT NULL, 
    id_venta INT NOT NULL,
    cantidad INT NOT NULL, 
    precio_unidad DECIMAL(10,2) NOT NULL, 
    subtotal DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (id_producto) REFERENCES producto (id_producto),
    FOREIGN KEY (id_venta) REFERENCES venta (id_venta) ON DELETE CASCADE
);
select * from detalle_venta;
 
-- 10
CREATE TABLE movimiento_inventario (
	id_movimiento INT AUTO_INCREMENT PRIMARY KEY NOT NULL, 
    id_producto INT NOT NULL, 
    id_proveedor INT, 
    id_usuario INT NOT NULL, 
    motivo VARCHAR(100), 
    movimiento_tipo ENUM('ENTRADA','SALIDA') NOT NULL,
    fecha_hora DATETIME NOT NULL, 
    cantidad DECIMAL(10,2) NOT NULL, 
    FOREIGN KEY (id_producto) REFERENCES producto (id_producto), 
    FOREIGN KEY (id_proveedor) REFERENCES proveedor (id_proveedor), 
    FOREIGN KEY (id_usuario) REFERENCES usuario (id_usuario)
); 
select * from movimiento_inventario;

-- 11
CREATE TABLE suministra (
	id_producto INT NOT NULL, 
    id_proveedor INT NOT NULL, 
    PRIMARY KEY (id_producto, id_proveedor), 
    FOREIGN KEY (id_producto) REFERENCES producto (id_producto), 
    FOREIGN KEY (id_proveedor) REFERENCES proveedor (id_proveedor)
);

-- 13
CREATE TABLE factura (
    id_factura INT AUTO_INCREMENT PRIMARY KEY,
    id_venta INT UNIQUE NOT NULL,
    rfc_emisor VARCHAR(13) NOT NULL,
    rfc_destinatario VARCHAR(13) NOT NULL,
    pdf_factura TEXT,
    fecha_factura DATETIME NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (id_venta) REFERENCES venta(id_venta)
);



INSERT INTO categoria (nombre_categoria, descripcion_categoria)
VALUES ('Bebidas', 'Refrescos');
SELECT * FROM categoria;