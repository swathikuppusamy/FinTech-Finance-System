const FinancialRecord = require('../models/FinancialRecord');

const createRecord = async (data, userId) => {
  return FinancialRecord.create({ ...data, createdBy: userId });
};

const getRecords = async (filters, { page = 1, limit = 20 } = {}) => {
  const query = {};

  if (filters.type) query.type = filters.type;
  if (filters.category) query.category = new RegExp(filters.category, 'i');
  if (filters.startDate || filters.endDate) {
    query.date = {};
    if (filters.startDate) query.date.$gte = filters.startDate;
    if (filters.endDate) query.date.$lte = filters.endDate;
  }

  const skip = (page - 1) * limit;
  const [records, total] = await Promise.all([
    FinancialRecord.find(query)
      .populate('createdBy', 'name email')
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit),
    FinancialRecord.countDocuments(query),
  ]);

  return {
    records,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getRecordById = async (id) => {
  const record = await FinancialRecord.findById(id).populate('createdBy', 'name email');
  if (!record) {
    const err = new Error('Record not found');
    err.statusCode = 404;
    throw err;
  }
  return record;
};

const updateRecord = async (id, updates) => {
  const record = await FinancialRecord.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  });
  if (!record) {
    const err = new Error('Record not found');
    err.statusCode = 404;
    throw err;
  }
  return record;
};

const softDeleteRecord = async (id) => {
  const record = await FinancialRecord.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true }
  );
  if (!record) {
    const err = new Error('Record not found');
    err.statusCode = 404;
    throw err;
  }
  return record;
};

module.exports = { createRecord, getRecords, getRecordById, updateRecord, softDeleteRecord };
