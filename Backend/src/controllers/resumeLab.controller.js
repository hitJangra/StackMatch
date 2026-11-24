// resume lab controller
const { PDFParse } = require("pdf-parse")
const { auditResumeContent, enhanceBulletContent } = require("../services/ai.service")

// audit full resume pdf or raw text
async function auditResumeController(req, res, next) {
    try {
        let resumeText = ""

        if (req.file && req.file.buffer) {
            const parser = new PDFParse({ data: req.file.buffer })
            const parsed = await parser.getText()
            await parser.destroy()
            resumeText = typeof parsed?.text === "string" ? parsed.text.trim() : ""
        } else if (req.body.resumeText) {
            resumeText = String(req.body.resumeText).trim()
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
        const { bullet, targetRole } = req.body

        if (!bullet || typeof bullet !== "string" || bullet.trim().length < 5) {
            return res.status(400).json({
                message: "Please provide a bullet point with at least 5 characters to enhance."
            })
        }

        const customApiKey = req.headers["x-ai-api-key"]
        const aiProvider = req.headers["x-ai-provider"] || "default"
        const aiModel = req.headers["x-ai-model"]

        const result = await enhanceBulletContent({
            bullet: bullet.trim(),
            targetRole: (targetRole || "").trim(),
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
