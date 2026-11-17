// unified interview report model for scan history
const interviewReportModel = require("../models/interviewReport.model");

// fetch scan history for the current logged in user
async function getHistoryController(req, res, next) {
    try {
        // extract user id from auth token
        const userId = req.user.id || req.user._id;

        // query unified interview reports collection newest first
        const history = await interviewReportModel.find({ user: userId })
            .sort({ createdAt: -1 })
            .select("-__v");

        // return history list and count
        res.status(200).json({
            success: true,
            message: "History fetched successfully.",
            count: history.length,
            history
        });
    } catch (err) {
        // forward error to error handler
        next(err);
    }
}

// export controller method
module.exports = { getHistoryController };
