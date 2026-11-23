// mongoose library
const mongoose = require("mongoose");

// schema for technical interview questions
const technicalQuestionSchema = new mongoose.Schema(
    {
        // the interview question text
        question: {
            type: String,
            required: [true, "Technical question is required"]
        },
        // why the interviewer asks this
        intention: {
            type: String,
            required: [true, "Intention is required"]
        },
        // ideal model answer or key points
        answer: {
            type: String,
            required: [true, "Answer is required"]
        }
    },
    // omit subdocument id
    { _id: false }
);

// schema for behavioral interview questions
const behavioralQuestionSchema = new mongoose.Schema(
    {
        // behavioral question prompt
        question: {
            type: String,
            required: [true, "Behavioral question is required"]
        },
        // what quality the interviewer is testing
        intention: {
            type: String,
            required: [true, "Intention is required"]
        },
        // STAR format guidance or answer
        answer: {
            type: String,
            required: [true, "Answer is required"]
        }
    },
    // omit subdocument id
    { _id: false }
);

// schema for missing candidate skills
const skillGapSchema = new mongoose.Schema(
    {
        // name of missing skill or technology
        skill: {
            type: String,
            required: [true, "Skill is required"]
        },
        // how critical the gap is: low, medium, or high
        severity: {
            type: String,
            enum: ["low", "medium", "high"],
            required: [true, "Severity is required"]
        }
    },
    // omit subdocument id
    { _id: false }
);

// schema for day-by-day prep plan
const preparationPlanSchema = new mongoose.Schema(
    {
        // day index: 1, 2, 3...
        day: {
            type: Number,
            required: [true, "Day number is required"]
        },
        // topic or focus area for the day
        focus: {
            type: String,
            required: [true, "Focus area is required"]
        },
        // action items or study tasks
        tasks: [
            {
                type: String,
                required: [true, "Task description is required"]
            }
        ]
    },
    // omit subdocument id
    { _id: false }
);

const tailoredResumeSchema = new mongoose.Schema({
    name: { type: String, default: "" },
    contact: {
        email: { type: String, default: "" },
        phone: { type: String, default: "" },
        location: { type: String, default: "" },
        linkedin: { type: String, default: "" },
        website: { type: String, default: "" }
    },
    summary: { type: String, default: "" },
    education: [{
        institution: { type: String, default: "" },
        degree: { type: String, default: "" },
        location: { type: String, default: "" },
        dates: { type: String, default: "" },
        details: [{ type: String }]
    }],
    experience: [{
        title: { type: String, default: "" },
        organization: { type: String, default: "" },
        location: { type: String, default: "" },
        dates: { type: String, default: "" },
        bullets: [{ type: String }]
    }],
    projects: [{
        name: { type: String, default: "" },
        technologies: [{ type: String }],
        dates: { type: String, default: "" },
        bullets: [{ type: String }]
    }],
    skills: [{
        category: { type: String, default: "" },
        items: [{ type: String }]
    }]
}, { _id: false });

// schema to cache full ai interview and ats scores
const cachedScoresSchema = new mongoose.Schema(
    {
        jdKeywords: [{ type: String, trim: true }],
        tailoredResume: { type: tailoredResumeSchema, default: undefined },
        // deterministic sha256 hash of resume + job description
        cacheKey: {
            type: String,
            required: [true, "Cache key is required"],
            unique: true,
            trim: true,
            index: true
        },
        // calculated match percentage 0-100
        matchScore: {
            type: Number,
            min: 0,
            max: 100,
            required: [true, "Match score is required"]
        },
        // target job title
        title: {
            type: String,
            required: [true, "Job title is required"],
            trim: true
        },
        // generated questions and study plan
        technicalQuestions: [technicalQuestionSchema],
        behavioralQuestions: [behavioralQuestionSchema],
        skillGaps: [skillGapSchema],
        preparationPlan: [preparationPlanSchema]
    },
    {
        // record timestamps
        timestamps: true
    }
);

// expire cached score entry after 24 hours (86400 seconds)
cachedScoresSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });

// build cached scores model
const CachedScores = mongoose.model("CachedScores", cachedScoresSchema);

// export model
module.exports = CachedScores;
