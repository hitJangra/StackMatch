// outreach controller using unified ai service
const { generateOutreachContent } = require("../services/ai.service")

const sanitizeStr = (val) => (typeof val === "string" ? val.trim() : "")
const isInvalidType = (val) => val !== undefined && val !== null && typeof val !== "string"

async function generateOutreachController(req, res, next) {
    try {
        const body = req.body && typeof req.body === "object" ? req.body : {}
        const {
            type,
            company,
            role,
            jobDescription,
            resumeText,
            tone,
            customQuestion
        } = body

        // Validate type
        const validTypes = ["referral_dm", "cold_email", "cover_letter", "app_qa"]
        if (!type || typeof type !== "string" || !validTypes.includes(type)) {
            return res.status(400).json({
                message: `type must be one of: ${validTypes.join(", ")}`
            })
        }

        // Validate that string fields, if passed, are strings (guard against {"$gt": ""} NoSQL objects)
        if (
            isInvalidType(company) ||
            isInvalidType(role) ||
            isInvalidType(jobDescription) ||
            isInvalidType(resumeText) ||
            isInvalidType(tone) ||
            isInvalidType(customQuestion)
        ) {
            return res.status(400).json({
                message: "Text fields (company, role, jobDescription, resumeText, tone, customQuestion) must be strings."
            })
        }

        // Read optional custom BYOK credentials from headers
        const customApiKey = req.headers["x-ai-api-key"]
        const aiProvider = req.headers["x-ai-provider"] || "default"
        const aiModel = req.headers["x-ai-model"]

        const result = await generateOutreachContent({
            type,
            company: sanitizeStr(company),
            role: sanitizeStr(role),
            jobDescription: sanitizeStr(jobDescription),
            resumeText: sanitizeStr(resumeText),
            tone: sanitizeStr(tone) || "Direct",
            customQuestion: sanitizeStr(customQuestion),
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
