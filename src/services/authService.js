const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

const register = async ({ name, email, password, role }) => {
  const existing = await User.findOne({ email });
  if (existing) {
    const err = new Error('Email already in use');
    err.statusCode = 409;
    throw err;
  }

  const user = await User.create({
    name,
    email,
    passwordHash: password, // pre-save hook will hash it
    role: role || 'viewer',
  });

  const token = generateToken(user._id);
  return { user, token };
};

const login = async ({ email, password }) => {
  // Explicitly select passwordHash since it's excluded by default
  const user = await User.findOne({ email }).select('+passwordHash');

  if (!user) {
    const err = new Error('Invalid email or password');
    err.statusCode = 401;
    throw err;
  }

  if (user.status === 'inactive') {
    const err = new Error('Your account has been deactivated');
    err.statusCode = 403;
    throw err;
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    const err = new Error('Invalid email or password');
    err.statusCode = 401;
    throw err;
  }

  const token = generateToken(user._id);
  return { user, token };
};

module.exports = { register, login };
