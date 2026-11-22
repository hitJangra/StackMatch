const mongoose = require("mongoose");

const savedJobSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
            required: true,
            index: true
        },
        title: { type: String, required: true, trim: true },
        company: { type: String, default: "", trim: true },
        location: { type: String, default: "", trim: true },
        url: { type: String, default: "", trim: true },
        applyLink: { type: String, default: "", trim: true },
        jobUrl: { type: String, default: "", trim: true },
        link: { type: String, default: "", trim: true },
        description: { type: String, default: "" },
        notes: { type: String, default: "", trim: true }
    },
    { timestamps: true }
);

savedJobSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("SavedJob", savedJobSchema);
