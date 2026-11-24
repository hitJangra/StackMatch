// resume lab routes
const express = require("express")
const { authUser } = require("../middlewares/auth.middleware")
const upload = require("../middlewares/file.middleware")
const { aiScraperLimiter } = require("../middlewares/rateLimit.middleware")
const { auditResumeController, enhanceBulletController } = require("../controllers/resumeLab.controller")

const resumeLabRouter = express.Router()

// audit full resume pdf (or raw text)
resumeLabRouter.post("/audit", authUser, aiScraperLimiter, upload.single("resume"), auditResumeController)

// enhance single bullet point into 3 quantified bullets
resumeLabRouter.post("/enhance-bullet", authUser, aiScraperLimiter, enhanceBulletController)

module.exports = resumeLabRouter
