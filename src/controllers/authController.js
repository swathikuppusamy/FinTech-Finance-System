const authService = require('../services/authService');
const { registerSchema, loginSchema } = require('../validators/userValidators');
const { sendSuccess, sendError } = require('../utils/response');

const register = async (req, res, next) => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) throw parsed.error; // ZodError caught by errorHandler

    const { user, token } = await authService.register(parsed.data);
    return sendSuccess(res, { user, token }, 'Account created successfully', 201);
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) throw parsed.error;

    const { user, token } = await authService.login(parsed.data);
    return sendSuccess(res, { user, token }, 'Login successful');
  } catch (err) {
    next(err);
  }
};

const getMe = async (req, res) => {
  return sendSuccess(res, { user: req.user }, 'Current user fetched');
};

module.exports = { register, login, getMe };
