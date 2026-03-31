const jwt = require('jsonwebtoken');

// 1. La fonction pour protéger les routes (anciennement ton module.exports)
exports.protect = (req, res, next) => {
  let token = req.header('x-auth-token');
  
  if (!token) {
    const authHeader = req.header('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.slice(7);
    }
  }

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

// 2. La nouvelle fonction pour restreindre selon le rôle (Admin, Agence, etc.)
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles est un tableau, ex: ['admin'] ou ['agency']
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: "Vous n'avez pas la permission d'effectuer cette action" 
      });
    }
    next();
  };
};