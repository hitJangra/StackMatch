// express framework
const express = require("express")
// token verification middleware
const authMiddleware = require("../middlewares/auth.middleware")
// interview logic handlers
const interviewController = require("../controllers/interview.controller")
// file upload parser for resume pdf
const upload = require("../middlewares/file.middleware")
// rate limiter middleware
const { aiScraperLimiter } = require("../middlewares/rateLimit.middleware")

// create interview router
const interviewRouter = express.Router()

// submit resume and job description to get analysis & prep report (rate limited: 15 per hour)
interviewRouter.post("/", authMiddleware.authUser, aiScraperLimiter, upload.single("resume"), interviewController.generateInterViewReportController)

// get single report by its mongo id
interviewRouter.get("/report/:interviewId", authMiddleware.authUser, interviewController.getInterviewReportByIdController)

// get list of all interview reports for current user
interviewRouter.get("/", authMiddleware.authUser, interviewController.getAllInterviewReportsController)

// export interview router
module.exports = interviewRouter
