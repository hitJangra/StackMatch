// resume lab controller
const { PDFParse } = require("pdf-parse")
const { auditResumeContent, enhanceBulletContent } = require("../services/ai.service")

const sanitizeStr = (val) => (typeof val === "string" ? val.trim() : "")
const isInvalidType = (val) => val !== undefined && val !== null && typeof val !== "string"

// audit full resume pdf or raw text
async function auditResumeController(req, res, next) {
    try {
        let resumeText = ""

        if (req.body && isInvalidType(req.body.resumeText)) {
            return res.status(400).json({
                message: "resumeText must be a string."
            })
        }

        if (req.file && req.file.buffer) {
            const parser = new PDFParse({ data: req.file.buffer })
            const parsed = await parser.getText()
            await parser.destroy()
            resumeText = typeof parsed?.text === "string" ? parsed.text.trim() : ""
        } else if (req.body && req.body.resumeText) {
            resumeText = sanitizeStr(req.body.resumeText)
        }

        if (!resumeText || resumeText.length < 50) {
            return res.status(400).json({
                message: "Please upload a valid text-based PDF resume or supply at least 50 characters of resume text."
            })
        }

        const customApiKey = req.headers["x-ai-api-key"]
        const aiProvider = req.headers["x-ai-provider"] || "default"
        const aiModel = req.headers["x-ai-model"]

        const audit = await auditResumeContent({
            resumeText,
            customApiKey,
            aiProvider,
            aiModel
        })

        return res.status(200).json({
            success: true,
            audit
        })
    } catch (err) {
        next(err)
    }
}

// enhance a single bullet point
async function enhanceBulletController(req, res, next) {
    try {
        const body = req.body && typeof req.body === "object" ? req.body : {}
        const { bullet, targetRole } = body

        if (!bullet || typeof bullet !== "string" || bullet.trim().length < 5) {
            return res.status(400).json({
                message: "Please provide a bullet point with at least 5 characters to enhance."
            })
        }

        if (isInvalidType(targetRole)) {
            return res.status(400).json({
                message: "targetRole must be a string."
            })
        }

        const customApiKey = req.headers["x-ai-api-key"]
        const aiProvider = req.headers["x-ai-provider"] || "default"
        const aiModel = req.headers["x-ai-model"]

        const result = await enhanceBulletContent({
            bullet: bullet.trim(),
            targetRole: sanitizeStr(targetRole),
            customApiKey,
            aiProvider,
            aiModel
        })

        return res.status(200).json({
            success: true,
            rewrites: result.rewrites || []
        })
    } catch (err) {
        next(err)
    }
}

module.exports = {
    auditResumeController,
    enhanceBulletController
}
