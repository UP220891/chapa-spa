const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.JWT_SECRET;

function verificarToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ mensaje: 'Token requerido' });
  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ mensaje: 'Token inválido' });
    req.user = user;
    next();
  });
}

module.exports = {
  verificarToken
};
