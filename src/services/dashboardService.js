const FinancialRecord = require('../models/FinancialRecord');

/**
 * Returns total income, total expenses, and net balance.
 * Optionally filtered by a date range.
 */
const getSummary = async ({ startDate, endDate } = {}) => {
  const matchStage = {};
  if (startDate || endDate) {
    matchStage.date = {};
    if (startDate) matchStage.date.$gte = new Date(startDate);
    if (endDate) matchStage.date.$lte = new Date(endDate);
  }

  const result = await FinancialRecord.aggregate([
    { $match: { isDeleted: false, ...matchStage } },
    {
      $group: {
        _id: '$type',
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
  ]);

  const summary = { totalIncome: 0, totalExpenses: 0, incomeCount: 0, expenseCount: 0 };
  for (const item of result) {
    if (item._id === 'income') {
      summary.totalIncome = item.total;
      summary.incomeCount = item.count;
    } else if (item._id === 'expense') {
      summary.totalExpenses = item.total;
      summary.expenseCount = item.count;
    }
  }
  summary.netBalance = summary.totalIncome - summary.totalExpenses;

  return summary;
};

/**
 * Returns monthly income and expense totals for trend charts.
 */
const getMonthlyTrends = async ({ year } = {}) => {
  const matchStage = { isDeleted: false };
  if (year) {
    matchStage.date = {
      $gte: new Date(`${year}-01-01`),
      $lte: new Date(`${year}-12-31`),
    };
  }

  const result = await FinancialRecord.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: {
          year: { $year: '$date' },
          month: { $month: '$date' },
          type: '$type',
        },
        total: { $sum: '$amount' },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  // Reshape into { year, month, income, expense } per period
  const trendsMap = {};
  for (const item of result) {
    const key = `${item._id.year}-${String(item._id.month).padStart(2, '0')}`;
    if (!trendsMap[key]) {
      trendsMap[key] = { period: key, year: item._id.year, month: item._id.month, income: 0, expense: 0 };
    }
    trendsMap[key][item._id.type] = item.total;
  }

  return Object.values(trendsMap);
};

/**
 * Returns totals grouped by category, sorted by total descending.
 */
const getCategoryBreakdown = async ({ type } = {}) => {
  const matchStage = { isDeleted: false };
  if (type) matchStage.type = type;

  return FinancialRecord.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: { category: '$category', type: '$type' },
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        category: '$_id.category',
        type: '$_id.type',
        total: 1,
        count: 1,
      },
    },
    { $sort: { total: -1 } },
  ]);
};

/**
 * Returns the N most recent records.
 */
const getRecentActivity = async (limit = 5) => {
  return FinancialRecord.find()
    .populate('createdBy', 'name')
    .sort({ date: -1 })
    .limit(limit);
};

module.exports = { getSummary, getMonthlyTrends, getCategoryBreakdown, getRecentActivity };
