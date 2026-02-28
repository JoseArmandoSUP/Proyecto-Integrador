const jwt = require('jsonwebtoken');

const verificarToken = async (req, res, next) => {
    const token = req.header('Authorization');

    if(!token){
        return res.status(401).json({
            exito: false,
            msg: "Acceso denegado, el token es requerido"
        });
    }

    try{
        const tokenNuevo = token.replace('Bearer ', '');
        const decoded = jwt.verify(tokenNuevo, procces.env.JWT_SECRET);

        req.usuario = decoded;
        next();
    }catch(error){
        res.status(401).json({
            exito: false,
            msg: "Token inválido" 
        });
    }
};

module.exports = verificarToken;