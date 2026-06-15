const adminOnly = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'owner')) return next();
  res.status(403).json({ message: 'Admin access required' });
};

const ownerOnly = (req, res, next) => {
  if (req.user && req.user.role === 'owner') return next();
  res.status(403).json({ message: 'Owner access required' });
};

module.exports = { adminOnly, ownerOnly };
