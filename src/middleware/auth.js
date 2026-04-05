const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendError } = require('../utils/response');

/**
 * authenticate — verifies JWT and attaches req.user
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 'Authentication token missing', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);

    if (!user) {
      return sendError(res, 'User no longer exists', 401);
    }

    if (user.status === 'inactive') {
      return sendError(res, 'Your account has been deactivated', 403);
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return sendError(res, 'Invalid token', 401);
    }
    if (err.name === 'TokenExpiredError') {
      return sendError(res, 'Token expired', 401);
    }
    next(err);
  }
};

/**
 * authorize — role-based access control
 * Usage: authorize('admin') or authorize('analyst', 'admin')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return sendError(
        res,
        `Access denied. Required role: ${roles.join(' or ')}`,
        403
      );
    }
    next();
  };
};

module.exports = { authenticate, authorize };
