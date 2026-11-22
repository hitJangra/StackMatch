const SavedJob = require("../models/savedJob.model");
const mongoose = require("mongoose");

function getUserId(req) {
    return req.user?.id || req.user?._id;
}

async function getSavedJobs(req, res, next) {
    try {
        const userId = getUserId(req);
        const jobs = await SavedJob.find({ userId }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, jobs });
    } catch (error) {
        next(error);
    }
}

async function createSavedJob(req, res, next) {
    try {
        const userId = getUserId(req);
        const { title, company, location, url, applyLink, jobUrl, link, description, notes } = req.body;
        if (!title || !title.trim()) {
            return res.status(400).json({ message: "Job title is required." });
        }

        const job = await SavedJob.create({
            userId,
            title: title.trim(),
            company: company || "",
            location: location || "",
            url: url || "",
            applyLink: applyLink || "",
            jobUrl: jobUrl || "",
            link: link || "",
            description: description || "",
            notes: notes || ""
        });
        res.status(201).json({ success: true, job });
    } catch (error) {
        next(error);
    }
}

async function updateSavedJob(req, res, next) {
    try {
        const userId = getUserId(req);
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(404).json({ message: "Saved job not found." });
        }
        const updates = {};
        ["title", "company", "location", "url", "applyLink", "jobUrl", "link", "description", "notes"].forEach((field) => {
            if (Object.prototype.hasOwnProperty.call(req.body, field)) updates[field] = req.body[field];
        });

        const job = await SavedJob.findOneAndUpdate(
            { _id: req.params.id, userId },
            { $set: updates },
            { new: true, runValidators: true }
        );
        if (!job) return res.status(404).json({ message: "Saved job not found." });
        res.status(200).json({ success: true, job });
    } catch (error) {
        next(error);
    }
}

async function deleteSavedJob(req, res, next) {
    try {
        const userId = getUserId(req);
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(404).json({ message: "Saved job not found." });
        }
        const job = await SavedJob.findOneAndDelete({ _id: req.params.id, userId });
        if (!job) return res.status(404).json({ message: "Saved job not found." });
        res.status(200).json({ success: true, message: "Saved job deleted." });
    } catch (error) {
        next(error);
    }
}

module.exports = { getSavedJobs, createSavedJob, updateSavedJob, deleteSavedJob };
