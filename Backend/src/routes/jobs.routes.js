// express framework
const express = require("express")
// token verification middleware
const authMiddleware = require("../middlewares/auth.middleware")
// scraper controller handlers
const { recommendJobsController, getPastRecommendationsController } = require("../controllers/jobs.controller")
// rate limiter middleware
const { aiScraperLimiter } = require("../middlewares/rateLimit.middleware")

// create router for jobs
const jobsRouter = express.Router()

// scrape and recommend jobs based on extracted resume keywords (rate limited: 15 per hour)
jobsRouter.post("/recommend", authMiddleware.authUser, aiScraperLimiter, recommendJobsController)

// get all past recommended jobs for authenticated user
jobsRouter.get("/past-recommendations", authMiddleware.authUser, getPastRecommendationsController)

// export jobs router
module.exports = jobsRouter
