require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// ==========================================
// 1. IMPORTAR LAS RUTAS
// ==========================================
const authRoutes = require('./routes/auth');
const productosRoutes = require('./routes/productos');
const cuentaRoutes = require('./routes/cuenta'); // 🌟 NUEVA RUTA PARA PERFIL Y TARJETAS

// ==========================================
// 2. ENCHUFAR LAS RUTAS
// ==========================================
app.use('/api', authRoutes); 
app.use('/api/productos', productosRoutes); 
app.use('/api/cuenta', cuentaRoutes); // 🌟 ENCHUFAMOS LA NUEVA RUTA

// ==========================================
// 3. ARRANCAR SERVIDOR
// ==========================================
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
});