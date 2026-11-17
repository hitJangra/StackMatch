// resume analysis model for history queries
const ResumeAnalyses = require("../models/resumeAnalysis.model");
// interview report model used as backward compatibility fallback
const interviewReportModel = require("../models/interviewReport.model");

// fetch scan history for the current logged in user
async function getHistoryController(req, res, next) {
    try {
        // extract user id from auth token
        const userId = req.user.id || req.user._id;

        // query resume analyses collection newest first
        let history = await ResumeAnalyses.find({ user: userId })
            .sort({ createdAt: -1 }) // newest scans first
            .select("-__v"); // exclude mongoose version key

        // fallback to interview reports collection if no analyses found
        if (!history || history.length === 0) {
            // check legacy interview reports
            const fallbackReports = await interviewReportModel.find({ user: userId })
                .sort({ createdAt: -1 })
                .select("-__v");
            // use fallback results
            history = fallbackReports;
        }

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
