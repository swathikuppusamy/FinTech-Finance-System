const { z } = require('zod');

const createRecordSchema = z.object({
  amount: z.number({ invalid_type_error: 'Amount must be a number' }).positive('Amount must be positive'),
  type: z.enum(['income', 'expense'], { errorMap: () => ({ message: "Type must be 'income' or 'expense'" }) }),
  category: z.string().min(1, 'Category is required'),
  date: z.coerce.date({ errorMap: () => ({ message: 'Invalid date' }) }).optional(),
  notes: z.string().optional(),
});

const updateRecordSchema = z.object({
  amount: z.number().positive('Amount must be positive').optional(),
  type: z.enum(['income', 'expense']).optional(),
  category: z.string().min(1).optional(),
  date: z.coerce.date().optional(),
  notes: z.string().optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update',
});

const filterRecordSchema = z.object({
  type: z.enum(['income', 'expense']).optional(),
  category: z.string().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

module.exports = { createRecordSchema, updateRecordSchema, filterRecordSchema };
