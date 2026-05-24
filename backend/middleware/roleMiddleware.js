// This middleware checks if the logged-in user has the required permission
const checkRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Permission denied. Required roles: [${roles.join(', ')}]` 
      });
    }

    next();
  };
};

module.exports = checkRole;
