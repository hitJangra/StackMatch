// mongoose library
const mongoose = require('mongoose');

// sub-schema for technical questions
const technicalQuestionSchema = new mongoose.Schema({
    // the interview question text
    question: {
        type: String,
        required: [ true, "Technical question is required" ]
    },
    // why this question was selected
    intention: {
        type: String,
        required: [ true, "Intention is required" ]
    },
    // suggested response
    answer: {
        type: String,
        required: [ true, "Answer is required" ]
    }
}, {
    // don't create separate id
    _id: false
})

// sub-schema for behavioral questions
const behavioralQuestionSchema = new mongoose.Schema({
    // question text
    question: {
        type: String,
        required: [ true, "Behavioral question is required" ]
    },
    // reason for asking
    intention: {
        type: String,
        required: [ true, "Intention is required" ]
    },
    // sample answer
    answer: {
        type: String,
        required: [ true, "Answer is required" ]
    }
}, {
    // omit subdocument id
    _id: false
})

// sub-schema for identifying missing skills
const skillGapSchema = new mongoose.Schema({
    // the missing skill name
    skill: {
        type: String,
        required: [ true, "Skill is required" ]
    },
    // impact rating
    severity: {
        type: String,
        enum: [ "low", "medium", "high" ],
        required: [ true, "Severity is required" ]
    }
}, {
    // omit subdocument id
    _id: false
})

// sub-schema for day-wise prep schedule
const preparationPlanSchema = new mongoose.Schema({
    // day number (e.g. 1 to 5)
    day: {
        type: Number,
        required: [ true, "Day is required" ]
    },
    // focus topic for the day
    focus: {
        type: String,
        required: [ true, "Focus is required" ]
    },
    // list of actionable tasks
    tasks: [ {
        type: String,
        required: [ true, "Task is required" ]
    } ]
})

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
}, { _id: false })

// main schema for saved interview reports
const interviewReportSchema = new mongoose.Schema({
    jdKeywords: [{ type: String, trim: true }],
    tailoredResume: { type: tailoredResumeSchema, default: undefined },
    // target job description input
    jobDescription: {
        type: String,
        required: [ true, "Job description is required" ]
    },
    // parsed resume text
    resume: {
        type: String,
    },
    // ats match percentage (0-100)
    matchScore: {
        type: Number,
        min: 0,
        max: 100,
    },
    // generated questions, gaps, and study plan
    technicalQuestions: [ technicalQuestionSchema ],
    behavioralQuestions: [ behavioralQuestionSchema ],
    skillGaps: [ skillGapSchema ],
    preparationPlan: [ preparationPlanSchema ],
    // link back to the user who ran the report
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    },
    // job title inferred or passed
    title: {
        type: String,
        required: [ true, "Job title is required" ]
    }
}, {
    // include createdAt and updatedAt
    timestamps: true
})

// compound index for high-performance user history querying and sorting
interviewReportSchema.index({ user: 1, createdAt: -1 });

// compile interview report model
const interviewReportModel = mongoose.model("InterviewReport", interviewReportSchema);

// export model
module.exports = interviewReportModel;
