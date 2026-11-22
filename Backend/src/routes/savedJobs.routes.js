const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const {
    getSavedJobs,
    createSavedJob,
    updateSavedJob,
    deleteSavedJob
} = require("../controllers/savedJobs.controller");

const savedJobsRouter = express.Router();

savedJobsRouter.get("/", authMiddleware.authUser, getSavedJobs);
savedJobsRouter.post("/", authMiddleware.authUser, createSavedJob);
savedJobsRouter.patch("/:id", authMiddleware.authUser, updateSavedJob);
savedJobsRouter.put("/:id", authMiddleware.authUser, updateSavedJob);
savedJobsRouter.delete("/:id", authMiddleware.authUser, deleteSavedJob);

module.exports = savedJobsRouter;
