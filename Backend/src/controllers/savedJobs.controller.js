const SavedJob = require("../models/savedJob.model");
const mongoose = require("mongoose");

const sanitizeStr = (val) => (typeof val === "string" ? val.trim() : "");
const isInvalidType = (val) => val !== undefined && val !== null && typeof val !== "string";

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
        const body = req.body && typeof req.body === "object" ? req.body : {};
        const { title, company, location, url, applyLink, jobUrl, link, description, notes } = body;
        
        if (!title || typeof title !== "string" || !title.trim()) {
            return res.status(400).json({ message: "Job title is required and must be a string." });
        }

        const optionalFields = { company, location, url, applyLink, jobUrl, link, description, notes };
        for (const [key, val] of Object.entries(optionalFields)) {
            if (isInvalidType(val)) {
                return res.status(400).json({ message: `${key} must be a string.` });
            }
        }

        const job = await SavedJob.create({
            userId,
            title: title.trim(),
            company: sanitizeStr(company),
            location: sanitizeStr(location),
            url: sanitizeStr(url),
            applyLink: sanitizeStr(applyLink),
            jobUrl: sanitizeStr(jobUrl),
            link: sanitizeStr(link),
            description: sanitizeStr(description),
            notes: sanitizeStr(notes)
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
        const allowedFields = ["title", "company", "location", "url", "applyLink", "jobUrl", "link", "description", "notes"];
        
        for (const field of allowedFields) {
            if (Object.prototype.hasOwnProperty.call(req.body, field)) {
                if (typeof req.body[field] !== "string") {
                    return res.status(400).json({ message: `${field} must be a string.` });
                }
                updates[field] = req.body[field].trim();
            }
        }

        if (updates.title !== undefined && !updates.title) {
            return res.status(400).json({ message: "Job title cannot be empty." });
        }

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
