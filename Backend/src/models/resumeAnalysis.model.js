const mongoose = require('mongoose');

const resumeAnalysisSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    title: {
        type: String,
        default: "Target Position"
    },
    jobDescription: {
        type: String,
        default: ""
    },
    resume: {
        type: String
    },
    matchScore: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },
    technicalQuestions: {
        type: Array,
        default: []
    },
    behavioralQuestions: {
        type: Array,
        default: []
    },
    skillGaps: {
        type: Array,
        default: []
    },
    preparationPlan: {
        type: Array,
        default: []
    }
}, {
    timestamps: true,
    collection: 'ResumeAnalyses'
});

const ResumeAnalyses = mongoose.model('ResumeAnalyses', resumeAnalysisSchema);

module.exports = ResumeAnalyses;
