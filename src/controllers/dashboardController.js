const dashboardService = require('../services/dashboardService');
const { sendSuccess } = require('../utils/response');

const getSummary = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const summary = await dashboardService.getSummary({ startDate, endDate });
    return sendSuccess(res, summary);
  } catch (err) {
    next(err);
  }
};

const getMonthlyTrends = async (req, res, next) => {
  try {
    const { year } = req.query;
    const trends = await dashboardService.getMonthlyTrends({ year });
    return sendSuccess(res, { trends });
  } catch (err) {
    next(err);
  }
};

const getCategoryBreakdown = async (req, res, next) => {
  try {
    const { type } = req.query;
    const categories = await dashboardService.getCategoryBreakdown({ type });
    return sendSuccess(res, { categories });
  } catch (err) {
    next(err);
  }
};

const getRecentActivity = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const records = await dashboardService.getRecentActivity(limit);
    return sendSuccess(res, { records });
  } catch (err) {
    next(err);
  }
};

module.exports = { getSummary, getMonthlyTrends, getCategoryBreakdown, getRecentActivity };
