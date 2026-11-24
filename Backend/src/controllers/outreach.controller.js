// outreach controller using unified ai service
const { generateOutreachContent } = require("../services/ai.service")

async function generateOutreachController(req, res, next) {
    try {
        const {
            type,
            company,
            role,
            jobDescription,
            resumeText,
            tone,
            customQuestion
        } = req.body

        // Validate type
        const validTypes = ["referral_dm", "cold_email", "cover_letter", "app_qa"]
        if (!type || !validTypes.includes(type)) {
            return res.status(400).json({
                message: `type must be one of: ${validTypes.join(", ")}`
            })
        }

        // Read optional custom BYOK credentials from headers
        const customApiKey = req.headers["x-ai-api-key"]
        const aiProvider = req.headers["x-ai-provider"] || "default"
        const aiModel = req.headers["x-ai-model"]

        const result = await generateOutreachContent({
            type,
            company: (company || "").trim(),
            role: (role || "").trim(),
            jobDescription: (jobDescription || "").trim(),
            resumeText: (resumeText || "").trim(),
            tone: tone || "Direct",
            customQuestion: (customQuestion || "").trim(),
            customApiKey,
            aiProvider,
            aiModel
        })

        return res.status(200).json({
            success: true,
            subject: result.subject || "",
            content: result.content
        })
    } catch (err) {
        next(err)
    }
}

module.exports = {
    generateOutreachController
}
