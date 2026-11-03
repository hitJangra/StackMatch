const express = require("express")
const authMiddleware = require("../middlewares/auth.middleware")
const { recommendJobsController } = require("../controllers/jobs.controller")

const jobsRouter = express.Router()

/**
 * @route  POST /api/jobs/recommend
 * @desc   Accepts an array of job keywords derived from the user's resume and
 *         returns matching job listings scraped via Apify.
 * @access Private
 * @body   { keywords: string[] }
 */
jobsRouter.post("/recommend", authMiddleware.authUser, recommendJobsController)

module.exports = jobsRouter
