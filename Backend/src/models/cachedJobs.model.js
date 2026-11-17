// mongoose library
const mongoose = require("mongoose");

// schema for each individual job item in results
const cachedJobItemSchema = new mongoose.Schema(
    {
        // job position title
        title: {
            type: String,
            default: "N/A"
        },
        // hiring company name
        company: {
            type: String,
            default: "N/A"
        },
        // job location or remote
        location: {
            type: String,
            default: "N/A"
        },
        // direct application or linkedin link
        url: {
            type: String,
            default: "#"
        },
        // short snippet or job description
        description: {
            type: String,
            default: ""
        }
    },
    // don't generate separate _id for subdocuments
    { _id: false }
);

// schema to cache apify scraper results with filter-aware query keys
const cachedJobsSchema = new mongoose.Schema(
    {
        // reference to the user who requested the recommendation
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
            index: true
        },
        // human-readable filter-aware lookup slug
        // e.g. "react-developer::india::fresher::internship"
        queryKey: {
            type: String,
            required: [true, "Query key is required"],
            unique: true,
            trim: true,
            index: true
        },
        // legacy normalized keywords-only cache key (kept for backward compat)
        cacheKey: {
            type: String,
            trim: true,
            sparse: true,
            index: true
        },
        // list of keywords queried
        keywords: [
            {
                type: String,
                required: true,
                trim: true
            }
        ],
        // filter params captured at time of cache
        filters: {
            location: { type: String, default: "India" },
            experience: { type: String, default: "any" },
            type: { type: String, default: "any" }
        },
        // array of scraped job listings
        jobs: [cachedJobItemSchema]
    },
    {
        // track creation and update time
        timestamps: true
    }
);

// auto-expire cached jobs after 24 hours (86400 seconds) using createdAt TTL index
cachedJobsSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });

// create cached jobs model
const CachedJobs = mongoose.model("CachedJobs", cachedJobsSchema);

// export model
module.exports = CachedJobs;
