const { GoogleGenAI } = require("@google/genai")
const { z } = require("zod")
const { zodToJsonSchema } = require("zod-to-json-schema")
const puppeteer = require("puppeteer")

// Default system AI client fallback
const defaultAi = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY
})

const interviewReportSchema = z.object({
    matchScore: z.number().describe("A score between 0 and 100 indicating how well the candidate's profile matches the job describe"),
    technicalQuestions: z.array(z.object({
        question: z.string().describe("The technical question can be asked in the interview"),
        intention: z.string().describe("The intention of interviewer behind asking this question"),
        answer: z.string().describe("How to answer this question, what points to cover, what approach to take etc.")
    })).describe("Technical questions that can be asked in the interview along with their intention and how to answer them"),
    behavioralQuestions: z.array(z.object({
        question: z.string().describe("The technical question can be asked in the interview"),
        intention: z.string().describe("The intention of interviewer behind asking this question"),
        answer: z.string().describe("How to answer this question, what points to cover, what approach to take etc.")
    })).describe("Behavioral questions that can be asked in the interview along with their intention and how to answer them"),
    skillGaps: z.array(z.object({
        skill: z.string().describe("The skill which the candidate is lacking"),
        severity: z.enum([ "low", "medium", "high" ]).describe("The severity of this skill gap, i.e. how important is this skill for the job and how much it can impact the candidate's chances")
    })).describe("List of skill gaps in the candidate's profile along with their severity"),
    preparationPlan: z.array(z.object({
        day: z.number().describe("The day number in the preparation plan, starting from 1"),
        focus: z.string().describe("The main focus of this day in the preparation plan, e.g. data structures, system design, mock interviews etc."),
        tasks: z.array(z.string()).describe("List of tasks to be done on this day to follow the preparation plan, e.g. read a specific book or article, solve a set of problems, watch a video etc.")
    })).describe("A day-wise preparation plan for the candidate to follow in order to prepare for the interview effectively"),
    title: z.string().describe("The title of the job for which the interview report is generated"),
})

const keywordsSchema = z.object({
    recommendedJobKeywords: z.array(z.string())
        .length(3)
        .describe(
            "Exactly 3 job title / role keywords derived from the resume. " +
            "Each keyword should be a concrete, searchable job title a recruiter " +
            "would use (e.g. 'React Developer', 'Frontend Engineer', 'UI/UX Designer')."
        )
})

/**
 * @description Helper for OpenAI Chat Completions API.
 */
async function callOpenAiChatCompletion({ prompt, apiKey, model, schemaDescription }) {
    const key = apiKey || process.env.OPENAI_API_KEY
    if (!key) {
        throw new Error("OpenAI API key is required when using the OpenAI provider.")
    }
    const selectedModel = model || "gpt-4o-mini"

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${key}`
        },
        body: JSON.stringify({
            model: selectedModel,
            messages: [
                {
                    role: "system",
                    content: `You are an expert technical recruiter and interview strategist. You must strictly output only a valid JSON object matching this schema description:\n${schemaDescription}`
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            response_format: { type: "json_object" },
            temperature: 0.3
        })
    })

    if (!response.ok) {
        const errBody = await response.text()
        throw new Error(`OpenAI API Error (${response.status}): ${errBody}`)
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content
    return JSON.parse(content)
}

/**
 * @description Helper to execute OpenAI-compatible Chat Completion requests for Groq Cloud.
 */
async function callGroqChatCompletion({ prompt, apiKey, model, schemaDescription }) {
    const key = apiKey || process.env.GROQ_API_KEY
    if (!key) {
        throw new Error("Groq API key is required when using the Groq provider.")
    }
    const selectedModel = model || "llama-3.3-70b-versatile"

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${key}`
        },
        body: JSON.stringify({
            model: selectedModel,
            messages: [
                {
                    role: "system",
                    content: `You are an expert technical recruiter and interview strategist. You must strictly output only a valid JSON object with no markdown fences, matching this schema:\n${schemaDescription}`
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            response_format: { type: "json_object" }
        })
    })

    if (!response.ok) {
        const errBody = await response.text()
        throw new Error(`Groq API Error (${response.status}): ${errBody}`)
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content
    return JSON.parse(content)
}

/**
 * @description Generates an interview report across OpenAI, Groq, Gemini or Default.
 */
async function generateInterviewReport({ resume, selfDescription, jobDescription, customApiKey, aiProvider = 'default', aiModel }) {
    const prompt = `Generate an interview report for a candidate with the following details:
Resume: ${resume}
Self Description: ${selfDescription}
Job Description: ${jobDescription}
`

    const schemaText = `
{
  "matchScore": number (0-100),
  "title": string (target job title),
  "technicalQuestions": [ { "question": string, "intention": string, "answer": string } ],
  "behavioralQuestions": [ { "question": string, "intention": string, "answer": string } ],
  "skillGaps": [ { "skill": string, "severity": "low" | "medium" | "high" } ],
  "preparationPlan": [ { "day": number, "focus": string, "tasks": [ string ] } ]
}`

    // ── OpenAI BYOK Provider ─────────────────────────────────────────────────
    if (aiProvider === 'openai') {
        return await callOpenAiChatCompletion({
            prompt,
            apiKey: customApiKey,
            model: aiModel,
            schemaDescription: schemaText
        })
    }

    // ── Groq BYOK Provider ───────────────────────────────────────────────────
    if (aiProvider === 'groq') {
        return await callGroqChatCompletion({
            prompt,
            apiKey: customApiKey,
            model: aiModel,
            schemaDescription: schemaText
        })
    }

    // ── Gemini / Default Provider ───────────────────────────────────────────
    const client = customApiKey 
        ? new GoogleGenAI({ apiKey: customApiKey })
        : defaultAi

    const selectedModel = aiModel || "gemini-2.5-flash"

    const response = await client.models.generateContent({
        model: selectedModel,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: zodToJsonSchema(interviewReportSchema),
        }
    })

    return JSON.parse(response.text)
}

/**
 * @description Analyzes a parsed resume and returns an array of 3 recommended job keywords.
 */
async function generateJobKeywords({ resume, customApiKey, aiProvider = 'default', aiModel }) {
    const prompt = `You are a senior technical recruiter.
Analyze the following resume and identify the 3 most relevant job titles / role keywords that best match the candidate's experience, skills, and background.
Return ONLY a JSON object with a field "recommendedJobKeywords" containing an array of exactly 3 short, searchable job title strings.

Resume:
${resume}`

    // ── OpenAI BYOK Provider ─────────────────────────────────────────────────
    if (aiProvider === 'openai') {
        const result = await callOpenAiChatCompletion({
            prompt,
            apiKey: customApiKey,
            model: aiModel,
            schemaDescription: `{ "recommendedJobKeywords": ["string", "string", "string"] }`
        })
        return result.recommendedJobKeywords
    }

    // ── Groq BYOK Provider ───────────────────────────────────────────────────
    if (aiProvider === 'groq') {
        const result = await callGroqChatCompletion({
            prompt,
            apiKey: customApiKey,
            model: aiModel,
            schemaDescription: `{ "recommendedJobKeywords": ["string", "string", "string"] }`
        })
        return result.recommendedJobKeywords
    }

    // ── Gemini / Default Provider ───────────────────────────────────────────
    const client = customApiKey 
        ? new GoogleGenAI({ apiKey: customApiKey })
        : defaultAi

    const selectedModel = aiModel || "gemini-2.5-flash"

    const response = await client.models.generateContent({
        model: selectedModel,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: zodToJsonSchema(keywordsSchema),
        }
    })

    const parsed = JSON.parse(response.text)
    return parsed.recommendedJobKeywords
}

async function generatePdfFromHtml(htmlContent) {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    await page.setContent(htmlContent, { waitUntil: "networkidle0" })

    const pdfBuffer = await page.pdf({
        format: "A4", margin: {
            top: "20mm",
            bottom: "20mm",
            left: "15mm",
            right: "15mm"
        }
    })

    await browser.close()
    return pdfBuffer
}

async function generateResumePdf({ resume, selfDescription, jobDescription, customApiKey, aiProvider = 'default', aiModel }) {
    const resumePdfSchema = z.object({
        html: z.string().describe("The HTML content of the resume which can be converted to PDF using any library like puppeteer")
    })

    const prompt = `Generate resume for a candidate with the following details:
Resume: ${resume}
Self Description: ${selfDescription}
Job Description: ${jobDescription}

The response should be a JSON object with a single field "html" containing ATS-friendly HTML content formatted professionally.
`

    let jsonContent

    if (aiProvider === 'openai') {
        jsonContent = await callOpenAiChatCompletion({
            prompt,
            apiKey: customApiKey,
            model: aiModel,
            schemaDescription: `{ "html": "string with HTML resume content" }`
        })
    } else if (aiProvider === 'groq') {
        jsonContent = await callGroqChatCompletion({
            prompt,
            apiKey: customApiKey,
            model: aiModel,
            schemaDescription: `{ "html": "string with HTML resume content" }`
        })
    } else {
        const client = customApiKey ? new GoogleGenAI({ apiKey: customApiKey }) : defaultAi
        const selectedModel = aiModel || "gemini-2.5-flash"

        const response = await client.models.generateContent({
            model: selectedModel,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: zodToJsonSchema(resumePdfSchema),
            }
        })
        jsonContent = JSON.parse(response.text)
    }

    const pdfBuffer = await generatePdfFromHtml(jsonContent.html)
    return pdfBuffer
}

module.exports = { 
    generateInterviewReport, 
    generateResumePdf, 
    generateJobKeywords 
}
