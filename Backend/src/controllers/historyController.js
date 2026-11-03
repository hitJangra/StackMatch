const ResumeAnalyses = require("../models/resumeAnalysis.model");
const interviewReportModel = require("../models/interviewReport.model");

/**
 * @route   GET /api/history
 * @desc    Fetch all resume scan analyses for the authenticated user,
 *          sorted by createdAt in descending order.
 * @access  Private (JWT)
 */
async function getHistoryController(req, res, next) {
    try {
        const userId = req.user.id || req.user._id;

        // Query the ResumeAnalyses MongoDB collection for the current user
        let history = await ResumeAnalyses.find({ user: userId })
            .sort({ createdAt: -1 })
            .select("-__v");

        // Graceful fallback: If ResumeAnalyses is empty, query InterviewReport
        // to ensure zero data loss from existing scans.
        if (!history || history.length === 0) {
            const fallbackReports = await interviewReportModel.find({ user: userId })
                .sort({ createdAt: -1 })
                .select("-__v");
            history = fallbackReports;
        }

        res.status(200).json({
            success: true,
            message: "History fetched successfully.",
            count: history.length,
            history
        });
    } catch (err) {
        next(err);
    }
}

module.exports = { getHistoryController };
