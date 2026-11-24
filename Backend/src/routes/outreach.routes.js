// express router for outreach hub
const express = require("express")
const { authUser } = require("../middlewares/auth.middleware")
const { generateOutreachController } = require("../controllers/outreach.controller")
const { aiScraperLimiter } = require("../middlewares/rateLimit.middleware")

const outreachRouter = express.Router()

// generate personalized outreach copy
outreachRouter.post("/generate", authUser, aiScraperLimiter, generateOutreachController)

module.exports = outreachRouter
