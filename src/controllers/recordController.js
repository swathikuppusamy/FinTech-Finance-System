const recordService = require('../services/recordService');
const { createRecordSchema, updateRecordSchema, filterRecordSchema } = require('../validators/recordValidators');
const { sendSuccess } = require('../utils/response');

const createRecord = async (req, res, next) => {
  try {
    const parsed = createRecordSchema.safeParse(req.body);
    if (!parsed.success) throw parsed.error;

    const record = await recordService.createRecord(parsed.data, req.user._id);
    return sendSuccess(res, { record }, 'Record created', 201);
  } catch (err) {
    next(err);
  }
};

const getRecords = async (req, res, next) => {
  try {
    const parsed = filterRecordSchema.safeParse(req.query);
    if (!parsed.success) throw parsed.error;

    const { page, limit, ...filters } = parsed.data;
    const result = await recordService.getRecords(filters, { page, limit });
    return sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
};

const getRecordById = async (req, res, next) => {
  try {
    const record = await recordService.getRecordById(req.params.id);
    return sendSuccess(res, { record });
  } catch (err) {
    next(err);
  }
};

const updateRecord = async (req, res, next) => {
  try {
    const parsed = updateRecordSchema.safeParse(req.body);
    if (!parsed.success) throw parsed.error;

    const record = await recordService.updateRecord(req.params.id, parsed.data);
    return sendSuccess(res, { record }, 'Record updated');
  } catch (err) {
    next(err);
  }
};

const deleteRecord = async (req, res, next) => {
  try {
    await recordService.softDeleteRecord(req.params.id);
    return sendSuccess(res, null, 'Record deleted');
  } catch (err) {
    next(err);
  }
};

module.exports = { createRecord, getRecords, getRecordById, updateRecord, deleteRecord };
