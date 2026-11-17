// mongoose library
const mongoose = require('mongoose');

// schema for standalone resume analyses / score records
const resumeAnalysisSchema = new mongoose.Schema({
    // owner user id reference
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    // position title
    title: {
        type: String,
        default: "Target Position"
    },
    // job description evaluated against
    jobDescription: {
        type: String,
        default: ""
    },
    // parsed raw resume text
    resume: {
        type: String
    },
    // ats score percentage
    matchScore: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },
    // list of technical questions
    technicalQuestions: {
        type: Array,
        default: []
    },
    // list of behavioral questions
    behavioralQuestions: {
        type: Array,
        default: []
    },
    // identified missing skills
    skillGaps: {
        type: Array,
        default: []
    },
    // day-by-day prep plan
    preparationPlan: {
        type: Array,
        default: []
    }
}, {
    // track creation and update dates
    timestamps: true,
    // explicit mongodb collection name
    collection: 'ResumeAnalyses'
});

// build model
const ResumeAnalyses = mongoose.model('ResumeAnalyses', resumeAnalysisSchema);

// export model
module.exports = ResumeAnalyses;
