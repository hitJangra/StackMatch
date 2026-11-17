// express framework
const express = require("express");
// auth middleware
const authMiddleware = require("../middlewares/auth.middleware");
// history controller handler
const { getHistoryController } = require("../controllers/historyController");

// create router instance
const resumeRouter = express.Router();

// get scan and report history for authenticated user
resumeRouter.get("/history", authMiddleware.authUser, getHistoryController);

// export resume router
module.exports = resumeRouter;
