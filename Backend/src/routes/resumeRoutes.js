const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const { getHistoryController } = require("../controllers/historyController");

const resumeRouter = express.Router();

/**
 * @route   GET /api/history
 * @desc    Get user's past resume scan and interview analyses
 * @access  Private
 */
resumeRouter.get("/history", authMiddleware.authUser, getHistoryController);

module.exports = resumeRouter;
