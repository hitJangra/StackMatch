// google gen ai sdk
const { GoogleGenAI } = require("@google/genai")
// zod for schema validation
const { z } = require("zod")
// convert zod to json schema for structured gemini output
const { zodToJsonSchema } = require("zod-to-json-schema")

// fallback gemini instance with default system key
const defaultAi = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY
})

// zod schema for interview report structure
const interviewReportSchema = z.object({
    // match score between 0 and 100
    matchScore: z.number().describe("A score between 0 and 100 indicating how well the candidate's profile matches the job description"),
    // technical interview questions
    technicalQuestions: z.array(z.object({
        question: z.string().describe("The technical question can be asked in the interview"),
        intention: z.string().describe("The intention of interviewer behind asking this question"),
        answer: z.string().describe("How to answer this question, what points to cover, what approach to take etc.")
    })).describe("Technical questions that can be asked in the interview along with their intention and how to answer them"),
    // behavioral interview questions
    behavioralQuestions: z.array(z.object({
        question: z.string().describe("The behavioral question can be asked in the interview"),
        intention: z.string().describe("The intention of interviewer behind asking this question"),
        answer: z.string().describe("How to answer this question, what points to cover, what approach to take etc.")
    })).describe("Behavioral questions that can be asked in the interview along with their intention and how to answer them"),
    // candidate's missing skills
    skillGaps: z.array(z.object({
        skill: z.string().describe("The skill which the candidate is lacking"),
        severity: z.enum([ "low", "medium", "high" ]).describe("The severity of this skill gap, i.e. how important is this skill for the job and how much it can impact the candidate's chances")
    })).describe("List of skill gaps in the candidate's profile along with their severity"),
    // step by step study plan
    preparationPlan: z.array(z.object({
        day: z.number().describe("The day number in the preparation plan, starting from 1"),
        focus: z.string().describe("The main focus of this day in the preparation plan, e.g. data structures, system design, mock interviews etc."),
        tasks: z.array(z.string()).describe("List of tasks to be done on this day to follow the preparation plan, e.g. read a specific book or article, solve a set of problems, watch a video etc.")
    })).describe("A day-wise preparation plan for the candidate to follow in order to prepare for the interview effectively"),
    // target position title
    title: z.string().describe("The title of the job for which the interview report is generated"),
})

// zod schema for extracting 3 job search keywords
const keywordsSchema = z.object({
    recommendedJobKeywords: z.array(z.string())
        .length(3)
        .describe(
            "Exactly 3 job title / role keywords derived from the resume. " +
            "Each keyword should be a concrete, searchable job title a recruiter " +
            "would use (e.g. 'React Developer', 'Frontend Engineer', 'UI/UX Designer')."
        )
})

// helper to query openai completions api
async function callOpenAiChatCompletion({ prompt, apiKey, model, schemaDescription }) {
    // pick user key or system env key
    const key = apiKey || process.env.OPENAI_API_KEY
    if (!key) {
        throw new Error("OpenAI API key is required when using the OpenAI provider.")
    }
    // default to gpt-4o-mini
    const selectedModel = model || "gpt-4o-mini"

    // send post request to openai
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
            response_format: { type: "json_object" }, // force json output
            temperature: 0.3 // keep output deterministic
        })
    })

    // handle error response
    if (!response.ok) {
        const errBody = await response.text()
        throw new Error(`OpenAI API Error (${response.status}): ${errBody}`)
    }

    // parse json result
    const data = await response.json()
    const content = data.choices[0]?.message?.content
    return JSON.parse(content)
}

// helper to query groq completions api
async function callGroqChatCompletion({ prompt, apiKey, model, schemaDescription }) {
    // pick user key or system env key
    const key = apiKey || process.env.GROQ_API_KEY
    if (!key) {
        throw new Error("Groq API key is required when using the Groq provider.")
    }
    // default to llama-3.3-70b
    const selectedModel = model || "llama-3.3-70b-versatile"

    // send request to groq endpoint
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

    // throw if groq responds with error
    if (!response.ok) {
        const errBody = await response.text()
        throw new Error(`Groq API Error (${response.status}): ${errBody}`)
    }

    // parse returned json
    const data = await response.json()
    const content = data.choices[0]?.message?.content
    return JSON.parse(content)
}

// generate interview preparation report
async function generateInterviewReport({ resume, jobDescription, customApiKey, aiProvider = 'default', aiModel }) {
    // construct prompt string without redundant self-description
    const prompt = `Generate an interview report for a candidate with the following details:
Resume: ${resume}
Job Description: ${jobDescription}
`

    // expected json schema text for prompt
    const schemaText = `
{
  "matchScore": number (0-100),
  "title": string (target job title),
  "technicalQuestions": [ { "question": string, "intention": string, "answer": string } ],
  "behavioralQuestions": [ { "question": string, "intention": string, "answer": string } ],
  "skillGaps": [ { "skill": string, "severity": "low" | "medium" | "high" } ],
  "preparationPlan": [ { "day": number, "focus": string, "tasks": [ string ] } ]
}`

    // use openai provider if requested
    if (aiProvider === 'openai') {
        return await callOpenAiChatCompletion({
            prompt,
            apiKey: customApiKey,
            model: aiModel,
            schemaDescription: schemaText
        })
    }

    // use groq provider if requested
    if (aiProvider === 'groq') {
        return await callGroqChatCompletion({
            prompt,
            apiKey: customApiKey,
            model: aiModel,
            schemaDescription: schemaText
        })
    }

    // use gemini provider (default)
    const client = customApiKey 
        ? new GoogleGenAI({ apiKey: customApiKey }) // custom byok key
        : defaultAi // system api key

    // select model or default to gemini 2.5 flash
    const selectedModel = aiModel || "gemini-2.5-flash"

    // request structured json from gemini
    const response = await client.models.generateContent({
        model: selectedModel,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: zodToJsonSchema(interviewReportSchema),
        }
    })

    // parse and return json
    return JSON.parse(response.text)
}

// analyze resume and extract 3 targeted job keywords
async function generateJobKeywords({ resume, customApiKey, aiProvider = 'default', aiModel }) {
    // prompt for keyword extraction
    const prompt = `You are a senior technical recruiter.
Analyze the following resume and identify the 3 most relevant job titles / role keywords that best match the candidate's experience, skills, and background.
Return ONLY a JSON object with a field "recommendedJobKeywords" containing an array of exactly 3 short, searchable job title strings.

Resume:
${resume}`

    // use openai if selected
    if (aiProvider === 'openai') {
        const result = await callOpenAiChatCompletion({
            prompt,
            apiKey: customApiKey,
            model: aiModel,
            schemaDescription: `{ "recommendedJobKeywords": ["string", "string", "string"] }`
        })
        return result.recommendedJobKeywords
    }

    // use groq if selected
    if (aiProvider === 'groq') {
        const result = await callGroqChatCompletion({
            prompt,
            apiKey: customApiKey,
            model: aiModel,
            schemaDescription: `{ "recommendedJobKeywords": ["string", "string", "string"] }`
        })
        return result.recommendedJobKeywords
    }

    // gemini default
    const client = customApiKey 
        ? new GoogleGenAI({ apiKey: customApiKey })
        : defaultAi

    // model fallback
    const selectedModel = aiModel || "gemini-2.5-flash"

    const response = await client.models.generateContent({
        model: selectedModel,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: zodToJsonSchema(keywordsSchema),
        }
    })

    // extract and return keywords array
    const parsed = JSON.parse(response.text)
    return parsed.recommendedJobKeywords
}

// export ai functions
module.exports = { 
    generateInterviewReport, 
    generateJobKeywords 
}
