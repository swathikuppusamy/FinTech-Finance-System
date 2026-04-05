const { z } = require('zod');

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['viewer', 'analyst', 'admin']).optional(),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const updateUserSchema = z.object({
  role: z.enum(['viewer', 'analyst', 'admin']).optional(),
  status: z.enum(['active', 'inactive']).optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: 'At least one field (role or status) must be provided',
});

module.exports = { registerSchema, loginSchema, updateUserSchema };
