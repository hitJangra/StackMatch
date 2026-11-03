const { PDFParse } = require("pdf-parse")
const { generateInterviewReport, generateResumePdf, generateJobKeywords } = require("../services/ai.service")
const interviewReportModel = require("../models/interviewReport.model")

/**
 * @description Controller to generate interview report based on user self description, resume and job description.
 *              Supports BYOK custom API keys (Gemini / Groq) via request headers:
 *              `x-ai-api-key`, `x-ai-provider`, `x-ai-model`.
 *              Falls back dynamically to system process.env credentials.
 */
async function generateInterViewReportController(req, res, next) {
    try {
        const parser = new PDFParse({ data: req.file.buffer })
        const resumeContent = await parser.getText()
        await parser.destroy()

        const { selfDescription, jobDescription } = req.body

        // Extract BYOK headers
        const customApiKey = req.headers["x-ai-api-key"] || req.headers["x-api-key"] || null
        const aiProvider = (req.headers["x-ai-provider"] || "default").toLowerCase()
        const aiModel = req.headers["x-ai-model"] || null

        // ── Keyword-recommendation mode ────────────────────────────────────────
        if (!jobDescription || !jobDescription.trim()) {
            const recommendedJobKeywords = await generateJobKeywords({
                resume: resumeContent.text,
                customApiKey,
                aiProvider,
                aiModel
            })

            return res.status(200).json({
                mode: "keyword_recommendation",
                recommendedJobKeywords
            })
        }

        // ── Full interview-report mode ─────────────────────────────────────────
        const interViewReportByAi = await generateInterviewReport({
            resume: resumeContent.text,
            selfDescription,
            jobDescription,
            customApiKey,
            aiProvider,
            aiModel
        })

        const interviewReport = await interviewReportModel.create({
            user: req.user.id,
            resume: resumeContent.text,
            selfDescription,
            jobDescription,
            ...interViewReportByAi
        })

        res.status(201).json({
            message: "Interview report generated successfully.",
            interviewReport
        })
    } catch (err) {
        next(err)
    }
}

/**
 * @description Controller to get interview report by interviewId.
 */
async function getInterviewReportByIdController(req, res, next) {
    try {
        const { interviewId } = req.params

        const interviewReport = await interviewReportModel.findOne({ _id: interviewId, user: req.user.id })

        if (!interviewReport) {
            return res.status(404).json({
                message: "Interview report not found."
            })
        }

        res.status(200).json({
            message: "Interview report fetched successfully.",
            interviewReport
        })
    } catch (err) {
        next(err)
    }
}

/** 
 * @description Controller to get all interview reports of logged in user.
 */
async function getAllInterviewReportsController(req, res, next) {
    try {
        const interviewReports = await interviewReportModel.find({ user: req.user.id })
            .sort({ createdAt: -1 })
            .select("-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan")

        res.status(200).json({
            message: "Interview reports fetched successfully.",
            interviewReports
        })
    } catch (err) {
        next(err)
    }
}

/**
 * @description Controller to generate resume PDF based on user self description, resume and job description.
 */
async function generateResumePdfController(req, res, next) {
    try {
        const { interviewReportId } = req.params

        const interviewReport = await interviewReportModel.findById(interviewReportId)

        if (!interviewReport) {
            return res.status(404).json({
                message: "Interview report not found."
            })
        }

        const customApiKey = req.headers["x-ai-api-key"] || req.headers["x-api-key"] || null
        const aiProvider = (req.headers["x-ai-provider"] || "default").toLowerCase()
        const aiModel = req.headers["x-ai-model"] || null

        const { resume, jobDescription, selfDescription } = interviewReport

        const pdfBuffer = await generateResumePdf({ 
            resume, 
            jobDescription, 
            selfDescription,
            customApiKey,
            aiProvider,
            aiModel
        })

        res.set({
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename=resume_${interviewReportId}.pdf`
        })

        res.send(pdfBuffer)
    } catch (err) {
        next(err)
    }
}

module.exports = { 
    generateInterViewReportController, 
    getInterviewReportByIdController, 
    getAllInterviewReportsController, 
    generateResumePdfController 
}
