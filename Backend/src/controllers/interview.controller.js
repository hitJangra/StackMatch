// crypto module for hashing cache keys
const crypto = require("crypto")
// pdf parser to extract text from uploaded resumes
const { PDFParse } = require("pdf-parse")
// ai service helpers for gemini prompts and pdf rendering
const { generateInterviewReport, generateResumePdf, generateJobKeywords } = require("../services/ai.service")
// mongo models for report storage and caching
const interviewReportModel = require("../models/interviewReport.model")
const CachedScores = require("../models/cachedScores.model")

// create unique sha256 hash based on resume text and job desc
function generateScoreCacheKey({ resumeText, jobDescription, selfDescription = "", aiProvider = "default", aiModel = "default" }) {
    // strip extra whitespace and normalize line endings
    const normResume = (resumeText || "").trim().replace(/\r\n/g, "\n")
    const normJob = (jobDescription || "").trim().replace(/\r\n/g, "\n")
    const normSelf = (selfDescription || "").trim().replace(/\r\n/g, "\n")
    const normProvider = (aiProvider || "default").toLowerCase().trim()
    const normModel = (aiModel || "default").toLowerCase().trim()

    // concatenate into single string
    const payload = `${normResume}:::${normJob}:::${normSelf}:::${normProvider}:::${normModel}`
    // generate hex digest
    return crypto.createHash("sha256").update(payload).digest("hex")
}

// controller to parse resume, score against job description, and generate prep report
async function generateInterViewReportController(req, res, next) {
    try {
        // read file buffer into pdf parser
        const parser = new PDFParse({ data: req.file.buffer })
        // extract raw text from pdf
        const resumeContent = await parser.getText()
        // clean up parser instance
        await parser.destroy()

        // get user input from form body
        const { selfDescription, jobDescription } = req.body

        // read custom api key headers if user provided BYOK
        const customApiKey = req.headers["x-ai-api-key"] || req.headers["x-api-key"] || null
        const aiProvider = (req.headers["x-ai-provider"] || "default").toLowerCase()
        const aiModel = req.headers["x-ai-model"] || null

        // if job description is empty, run keyword recommendation mode
        if (!jobDescription || !jobDescription.trim()) {
            // call ai to extract search keywords from resume
            const recommendedJobKeywords = await generateJobKeywords({
                resume: resumeContent.text,
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
            resumeText: resumeContent.text,
            jobDescription,
            selfDescription,
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
                technicalQuestions: cachedScore.technicalQuestions,
                behavioralQuestions: cachedScore.behavioralQuestions,
                skillGaps: cachedScore.skillGaps,
                preparationPlan: cachedScore.preparationPlan
            }
        } else {
            // cache miss: call gemini ai service
            interViewReportByAi = await generateInterviewReport({
                resume: resumeContent.text,
                selfDescription,
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

        // save report to database under user's profile
        const interviewReport = await interviewReportModel.create({
            user: req.user.id,
            resume: resumeContent.text,
            selfDescription,
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

        // find report belonging to logged-in user
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
        // query all reports for user, omit heavy fields
        const interviewReports = await interviewReportModel.find({ user: req.user.id })
            .sort({ createdAt: -1 }) // newest first
            .select("-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan")

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

// generate optimized resume pdf
async function generateResumePdfController(req, res, next) {
    try {
        // grab report id from params
        const { interviewReportId } = req.params

        // find report
        const interviewReport = await interviewReportModel.findById(interviewReportId)

        // return 404 if not found
        if (!interviewReport) {
            return res.status(404).json({
                message: "Interview report not found."
            })
        }

        // check custom api key headers
        const customApiKey = req.headers["x-ai-api-key"] || req.headers["x-api-key"] || null
        const aiProvider = (req.headers["x-ai-provider"] || "default").toLowerCase()
        const aiModel = req.headers["x-ai-model"] || null

        // unpack report fields
        const { resume, jobDescription, selfDescription } = interviewReport

        // generate pdf binary buffer
        const pdfBuffer = await generateResumePdf({ 
            resume, 
            jobDescription, 
            selfDescription,
            customApiKey,
            aiProvider,
            aiModel
        })

        // set response headers for file download
        res.set({
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename=resume_${interviewReportId}.pdf`
        })

        // send pdf binary data
        res.send(pdfBuffer)
    } catch (err) {
        // forward error
        next(err)
    }
}

// export controller methods
module.exports = { 
    generateInterViewReportController, 
    getInterviewReportByIdController, 
    getAllInterviewReportsController, 
    generateResumePdfController 
}
