const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  
  const token = req.header('x-auth-token');

  
  if (!token) {
    return res.status(401).json({ message: 'Pas de token, autorisation refusée' });
  }

  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_provisoire');
    req.user = decoded; 
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token non valide' });
  }
};