const userService = require('../services/userService');
const { updateUserSchema } = require('../validators/userValidators');
const { sendSuccess } = require('../utils/response');

const getAllUsers = async (req, res, next) => {
  try {
    const users = await userService.getAllUsers();
    return sendSuccess(res, { users });
  } catch (err) {
    next(err);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.params.id);
    return sendSuccess(res, { user });
  } catch (err) {
    next(err);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const parsed = updateUserSchema.safeParse(req.body);
    if (!parsed.success) throw parsed.error;

    const user = await userService.updateUser(req.params.id, parsed.data);
    return sendSuccess(res, { user }, 'User updated successfully');
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllUsers, getUserById, updateUser };
