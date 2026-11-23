// crypto module for hashing cache keys
const crypto = require("crypto")
// pdf parser to extract text from uploaded resumes
const { PDFParse } = require("pdf-parse")
// ai service helpers for gemini/openai/groq prompts
const { generateInterviewReport, generateJobKeywords } = require("../services/ai.service")
// unified mongo models for report storage and caching
const interviewReportModel = require("../models/interviewReport.model")
const CachedScores = require("../models/cachedScores.model")

// create unique sha256 hash based on resume text and job desc
function generateScoreCacheKey({ resumeText, jobDescription, aiProvider = "default", aiModel = "default" }) {
    // strip extra whitespace and normalize line endings
    const normResume = (resumeText || "").trim().replace(/\r\n/g, "\n")
    const normJob = (jobDescription || "").trim().replace(/\r\n/g, "\n")
    const normProvider = (aiProvider || "default").toLowerCase().trim()
    const normModel = (aiModel || "default").toLowerCase().trim()

    // concatenate into single string
    const payload = `${normResume}:::${normJob}:::${normProvider}:::${normModel}`
    // generate hex digest
    return crypto.createHash("sha256").update(payload).digest("hex")
}

// controller to parse resume, score against job description, and generate prep report
async function generateInterViewReportController(req, res, next) {
    try {
        if (!req.file || !req.file.buffer) {
            return res.status(400).json({
                message: "Resume PDF file is required."
            })
        }

        // read file buffer into pdf parser
        const parser = new PDFParse({ data: req.file.buffer })
        // extract raw text from pdf
        const resumeContent = await parser.getText()
        // clean up parser instance
        await parser.destroy()

        const resumeText = typeof resumeContent?.text === "string"
            ? resumeContent.text.trim()
            : ""
        if (resumeText.length < 50) {
            return res.status(400).json({
                message: "This PDF appears to be a scanned image with no selectable text. Please upload a text-based PDF resume (exported from Word, Google Docs, or Overleaf)."
            })
        }

        // get job description from form body
        const { jobDescription } = req.body

        // read custom api key headers if user provided BYOK
        const customApiKey = req.headers["x-ai-api-key"] || req.headers["x-api-key"] || null
        const aiProvider = (req.headers["x-ai-provider"] || "default").toLowerCase()
        const aiModel = req.headers["x-ai-model"] || null

        // if job description is empty, run keyword recommendation mode
        if (!jobDescription || !jobDescription.trim()) {
            // call ai to extract search keywords from resume
            const recommendedJobKeywords = await generateJobKeywords({
                resume: resumeText,
                customApiKey,
                aiProvider,
                aiModel
            })

            // return extracted keywords directly
            return res.status(200).json({
                mode: "keyword_recommendation",
                recommendedJobKeywords
            })
        }

        // generate deterministic cache key for this scan
        const cacheKey = generateScoreCacheKey({
            resumeText,
            jobDescription,
            aiProvider,
            aiModel
        })

        let interViewReportByAi
        let isCached = false

        // check mongodb cache before making external ai call
        const cachedScore = await CachedScores.findOne({ cacheKey })

        if (cachedScore) {
            // cache hit: reuse saved score and questions
            isCached = true
            interViewReportByAi = {
                matchScore: cachedScore.matchScore,
                title: cachedScore.title,
                jdKeywords: cachedScore.jdKeywords || [],
                tailoredResume: cachedScore.tailoredResume,
                technicalQuestions: cachedScore.technicalQuestions,
                behavioralQuestions: cachedScore.behavioralQuestions,
                skillGaps: cachedScore.skillGaps,
                preparationPlan: cachedScore.preparationPlan
            }
        } else {
            // cache miss: call unified ai service (Gemini / OpenAI / Groq)
            interViewReportByAi = await generateInterviewReport({
                resume: resumeText,
                jobDescription,
                customApiKey,
                aiProvider,
                aiModel
            })

            // save result to cache with 24h ttl
            try {
                await CachedScores.findOneAndUpdate(
                    { cacheKey },
                    {
                        cacheKey,
                        matchScore: interViewReportByAi.matchScore,
                        title: interViewReportByAi.title,
                        jdKeywords: interViewReportByAi.jdKeywords || [],
                        tailoredResume: interViewReportByAi.tailoredResume,
                        technicalQuestions: interViewReportByAi.technicalQuestions,
                        behavioralQuestions: interViewReportByAi.behavioralQuestions,
                        skillGaps: interViewReportByAi.skillGaps,
                        preparationPlan: interViewReportByAi.preparationPlan,
                        createdAt: new Date()
                    },
                    { upsert: true, new: true, setDefaultsOnInsert: true }
                )
            } catch (cacheErr) {
                // log cache error without breaking request
                console.error("[interview/report] Failed to cache ATS score:", cacheErr.message)
            }
        }

        // save report to database under user's profile in unified InterviewReport model
        const interviewReport = await interviewReportModel.create({
            user: req.user.id,
            resume: resumeText,
            jobDescription,
            ...interViewReportByAi
        })

        // send response to client
        res.status(201).json({
            message: "Interview report generated successfully.",
            interviewReport,
            cached: isCached
        })
    } catch (err) {
        // forward errors to global error handler
        next(err)
    }
}

// fetch a single interview report by id
async function getInterviewReportByIdController(req, res, next) {
    try {
        // get report id from url params
        const { interviewId } = req.params

        // find report belonging to logged-in user in unified model
        const interviewReport = await interviewReportModel.findOne({ _id: interviewId, user: req.user.id })

        // return 404 if not found
        if (!interviewReport) {
            return res.status(404).json({
                message: "Interview report not found."
            })
        }

        // return report data
        res.status(200).json({
            message: "Interview report fetched successfully.",
            interviewReport
        })
    } catch (err) {
        // forward error
        next(err)
    }
}

// fetch summary list of all reports for user
async function getAllInterviewReportsController(req, res, next) {
    try {
        // query all reports for user from unified model, omit heavy fields
        const interviewReports = await interviewReportModel.find({ user: req.user.id })
            .sort({ createdAt: -1 }) // newest first
            .select("-resume -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan")

        // return list
        res.status(200).json({
            message: "Interview reports fetched successfully.",
            interviewReports
        })
    } catch (err) {
        // forward error
        next(err)
    }
}

// export controller methods
module.exports = { 
    generateInterViewReportController, 
    getInterviewReportByIdController, 
    getAllInterviewReportsController
}
