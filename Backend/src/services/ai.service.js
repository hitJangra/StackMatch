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

// in-memory concurrency queue (max 2 simultaneous AI requests)
class ConcurrencyQueue {
    constructor(maxConcurrent = 2) {
        this.maxConcurrent = maxConcurrent;
        this.currentRunning = 0;
        this.queue = [];
    }

    async run(task) {
        if (this.currentRunning >= this.maxConcurrent) {
            await new Promise((resolve) => this.queue.push(resolve));
        }
        this.currentRunning++;
        try {
            return await task();
        } finally {
            this.currentRunning--;
            if (this.queue.length > 0) {
                const next = this.queue.shift();
                next();
            }
        }
    }
}

const aiConcurrencyQueue = new ConcurrencyQueue(2);

// helper to sleep with backoff + jitter
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function isTransientError(err) {
    if (!err) return false;
    const status = err.status || err.statusCode || err.response?.status || (err.error && err.error.code);
    if (status === 503 || status === 429 || status === 500) return true;

    const msg = String(err.message || "").toLowerCase();
    return (
        msg.includes("503") ||
        msg.includes("429") ||
        msg.includes("500") ||
        msg.includes("unavailable") ||
        msg.includes("resource_exhausted") ||
        msg.includes("rate limit") ||
        msg.includes("overloaded") ||
        msg.includes("high traffic") ||
        msg.includes("econnreset") ||
        msg.includes("etimedout")
    );
}

const RETRY_DELAYS = [1000, 2500, 5000];

// helper to execute gemini calls with retries (backoff+jitter) and automatic model fallback
async function callWithRetryAndFallback({
    client,
    primaryModel,
    contents,
    config
}) {
    // Model fallback chain: primary model -> gemini-2.0-flash -> gemini-2.0-flash-lite
    const modelChain = Array.from(new Set([
        primaryModel || "gemini-2.5-flash",
        "gemini-2.0-flash",
        "gemini-2.0-flash-lite"
    ]));

    let lastError = null;

    for (let mIdx = 0; mIdx < modelChain.length; mIdx++) {
        const currentModel = modelChain[mIdx];

        for (let attempt = 0; attempt <= RETRY_DELAYS.length; attempt++) {
            try {
                // execute call within concurrency queue (max 2 concurrent)
                const response = await aiConcurrencyQueue.run(async () => {
                    return await client.models.generateContent({
                        model: currentModel,
                        contents,
                        config
                    });
                });
                return response;
            } catch (err) {
                lastError = err;
                const isTransient = isTransientError(err);
                console.warn(
                    `[AI Service] Attempt ${attempt + 1} with model "${currentModel}" failed: ${err.message}`
                );

                if (!isTransient) {
                    // Non-transient error (e.g. invalid auth or bad schema request), rethrow immediately
                    throw err;
                }

                // If retries remain for current model, wait with exponential backoff + jitter
                if (attempt < RETRY_DELAYS.length) {
                    const delay = RETRY_DELAYS[attempt] + Math.floor(Math.random() * 300);
                    await wait(delay);
                } else {
                    // Retries exhausted for this model; break to fall back to next model
                    console.warn(
                        `[AI Service] Retries exhausted for model "${currentModel}". Falling back to next model if available.`
                    );
                    break;
                }
            }
        }
    }

    // All retries and model fallbacks exhausted; throw clean 503 error
    console.error("[AI Service] All AI retries and model fallbacks exhausted.", lastError?.message);
    const trafficError = new Error("AI engine is experiencing high traffic. Please retry in a few seconds.");
    trafficError.status = 503;
    trafficError.statusCode = 503;
    throw trafficError;
}

// sanitize raw LLM text by stripping markdown code fences (e.g. ```json ... ```)
function parseAiJson(rawText) {
    if (!rawText || typeof rawText !== "string") {
        throw new Error("Invalid or empty response received from AI model.")
    }
    // strip leading/trailing ```json, ```JSON, or generic ``` markdown code fences
    const cleaned = rawText
        .trim()
        .replace(/^```(?:json|JSON)?\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim()

    return JSON.parse(cleaned)
}

// zod schema for interview report structure
const interviewReportSchema = z.object({
    jdKeywords: z.array(z.string()).min(10).max(20).describe("10-20 concise hard skills or role competencies extracted from the job description"),
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
    tailoredResume: z.object({
        name: z.string(),
        contact: z.object({
            email: z.string().optional().default(""),
            phone: z.string().optional().default(""),
            location: z.string().optional().default(""),
            linkedin: z.string().optional().default(""),
            website: z.string().optional().default("")
        }),
        summary: z.string(),
        education: z.array(z.object({
            institution: z.string(),
            degree: z.string(),
            location: z.string().optional().default(""),
            dates: z.string().optional().default(""),
            details: z.array(z.string()).optional().default([])
        })),
        experience: z.array(z.object({
            title: z.string(),
            organization: z.string(),
            location: z.string().optional().default(""),
            dates: z.string().optional().default(""),
            bullets: z.array(z.string())
        })),
        projects: z.array(z.object({
            name: z.string(),
            technologies: z.array(z.string()).optional().default([]),
            dates: z.string().optional().default(""),
            bullets: z.array(z.string())
        })),
        skills: z.array(z.object({
            category: z.string(),
            items: z.array(z.string())
        }))
    }).describe("Structured, truthful tailored resume using real candidate details; tailor only summary and bullet points")
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
                    content: `You are an expert cross-industry recruiter and interview strategist. You must strictly output only a valid JSON object matching this schema description:\n${schemaDescription}`
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

    // parse json result with code-fence sanitization
    const data = await response.json()
    const content = data.choices[0]?.message?.content
    return parseAiJson(content)
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
                    content: `You are an expert cross-industry recruiter and interview strategist. You must strictly output only a valid JSON object with no markdown fences, matching this schema:\n${schemaDescription}`
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

    // parse returned json with code-fence sanitization
    const data = await response.json()
    const content = data.choices[0]?.message?.content
    return parseAiJson(content)
}

// generate interview preparation report
async function generateInterviewReport({ resume, jobDescription, customApiKey, aiProvider = 'default', aiModel }) {
    // construct domain-agnostic prompt
    const prompt = `Generate an interview report for a candidate applying to any profession or industry.
Resume: ${resume}
Job Description: ${jobDescription}

Rules:
- Adapt questions and preparation to the actual profession and industry. Do not assume software engineering.
- Extract 10-20 concise 1-3 word hard skills or role competencies into jdKeywords.
- Return tailoredResume using only truthful candidate details found in the resume.
- Tailor only the professional summary and project/experience bullet points to the target job.
- Do not invent degrees, employers, contact details, metrics, certifications, or projects.
- Keep every section suitable for a clean single-column ATS resume.
`

    // expected json schema text for prompt
    const schemaText = `
{
  "matchScore": number (0-100),
  "title": string (target job title),
  "jdKeywords": [string],
  "tailoredResume": {
    "name": string,
    "contact": {"email": string, "phone": string, "location": string, "linkedin": string, "website": string},
    "summary": string,
    "education": [{"institution": string, "degree": string, "location": string, "dates": string, "details": [string]}],
    "experience": [{"title": string, "organization": string, "location": string, "dates": string, "bullets": [string]}],
    "projects": [{"name": string, "technologies": [string], "dates": string, "bullets": [string]}],
    "skills": [{"category": string, "items": [string]}]
  },
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

    // request structured json from gemini with retries and model fallback
    const response = await callWithRetryAndFallback({
        client,
        primaryModel: selectedModel,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: zodToJsonSchema(interviewReportSchema),
        }
    })

    // parse and return json with code-fence sanitization
    return parseAiJson(response.text)
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

    const response = await callWithRetryAndFallback({
        client,
        primaryModel: selectedModel,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: zodToJsonSchema(keywordsSchema),
        }
    })

    // extract and return keywords array with code-fence sanitization
    const parsed = parseAiJson(response.text)
    return parsed.recommendedJobKeywords
}

// generic structured ai execution helper across providers
async function executeStructuredAi({ prompt, schema, schemaDescription, customApiKey, aiProvider = 'default', aiModel }) {
    if (aiProvider === 'openai') {
        return await callOpenAiChatCompletion({ prompt, apiKey: customApiKey, model: aiModel, schemaDescription })
    }
    if (aiProvider === 'groq') {
        return await callGroqChatCompletion({ prompt, apiKey: customApiKey, model: aiModel, schemaDescription })
    }

    const client = customApiKey 
        ? new GoogleGenAI({ apiKey: customApiKey })
        : defaultAi

    const selectedModel = aiModel || "gemini-2.5-flash"

    const response = await callWithRetryAndFallback({
        client,
        primaryModel: selectedModel,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: zodToJsonSchema(schema),
        }
    })

    return parseAiJson(response.text)
}

// zod schema for outreach messages
const outreachSchema = z.object({
    subject: z.string().optional().describe("Subject line for emails, or headline/tagline if applicable"),
    content: z.string().describe("The generated message body, tailored specifically to the type and tone requested")
})

// generate personalized outreach copy
async function generateOutreachContent({ type, company, role, jobDescription = "", resumeText = "", tone = "Direct", customQuestion = "", customApiKey, aiProvider, aiModel }) {
    let typeInstructions = ""
    if (type === "referral_dm") {
        typeInstructions = "Create a short, non-cringe LinkedIn referral outreach message under 100 words. Connect genuinely, highlight 1 key matching qualification from the resume, state the target role, and ask politely if they would be open to referring or having a brief chat. Avoid generic groveling."
    } else if (type === "cold_email") {
        typeInstructions = "Generate a concise recruiter/hiring manager cold email. Include a high-converting, curiosity-inducing subject line in 'subject', and a 2-3 paragraph body in 'content' highlighting the single strongest matching project or quantifiable metric from the resume."
    } else if (type === "cover_letter") {
        typeInstructions = "Generate a punchy, modern 3-paragraph tailored cover letter: 1. The Hook & Enthusiasm for the company; 2. Hard Proof with specific achievements matching the JD; 3. Forward-looking value proposition and interview call-to-action. Do not use archaic boilerplate."
    } else if (type === "app_qa") {
        typeInstructions = `Write a first-person, high-impact answer to an application portal question. Target question: "${customQuestion || 'Why are you the right fit for this role and why this company?'}". Keep it authentic, structured, and under 250 words.`
    } else {
        typeInstructions = "Generate a professional career communication message tailored to the role and company."
    }

    const prompt = `You are an elite career strategist and executive coach.
Target Company: ${company || "Target Company"}
Target Role: ${role || "Target Role"}
Tone: ${tone} (${tone === "Direct" ? "clear, confident, no fluff" : tone === "Formal" ? "polished, respectful, executive" : "short, high-signal, punchy"})
Job Description Context: ${jobDescription || "N/A"}
Candidate Resume Profile: ${resumeText || "N/A"}

Goal:
${typeInstructions}

Rules:
- Strictly output a valid JSON object matching: { "subject": string (optional), "content": string }.
- Do not invent fake degrees or certifications not present in the candidate resume.`

    return await executeStructuredAi({
        prompt,
        schema: outreachSchema,
        schemaDescription: `{ "subject": "string", "content": "string" }`,
        customApiKey,
        aiProvider,
        aiModel
    })
}

// zod schema for resume lab audit
const resumeAuditSchema = z.object({
    overallScore: z.number().min(0).max(100).describe("Overall ATS and resume quality score between 0 and 100"),
    strengths: z.array(z.string()).describe("Key strengths found in candidate experience, skills, and structure"),
    weakVerbs: z.array(z.string()).describe("Passive or generic action verbs found (e.g. 'helped', 'worked on', 'responsible for') with recommended strong replacements"),
    missingMetrics: z.array(z.string()).describe("Specific bullets or sections lacking quantifiable metrics (%, $, scale, users)"),
    formattingTips: z.array(z.string()).describe("ATS formatting tips (e.g. single-column, standard headings, clear dates)"),
    quickWins: z.array(z.string()).describe("3-5 high-impact immediate edits to drastically increase interview callbacks")
})

// audit a standalone resume
async function auditResumeContent({ resumeText, customApiKey, aiProvider, aiModel }) {
    const prompt = `You are a principal technical recruiter and ATS parser architect.
Audit this resume thoroughly for ATS compliance, active language strength, metric density, and recruiter impact.

Resume Text:
${resumeText}

Rules:
- overallScore should reflect real-world hiring bar: 85+ is stellar with metrics; 70-84 is solid with small gaps; <70 is weak or lacking quantifiable impact.
- strengths: 3-5 specific positive aspects.
- weakVerbs: identify 3-6 passive or weak verbs actually found in the text and show what to replace them with (e.g. "Replace 'helped manage' with 'orchestrated' or 'spearheaded'").
- missingMetrics: pinpoint exact bullets where numbers/scale are missing.
- formattingTips: 2-4 concrete ATS layout & readability suggestions.
- quickWins: 3-5 immediate high-yield changes candidate can execute in 10 minutes.
- Strictly output valid JSON matching the schema.`

    return await executeStructuredAi({
        prompt,
        schema: resumeAuditSchema,
        schemaDescription: `{ "overallScore": number, "strengths": [string], "weakVerbs": [string], "missingMetrics": [string], "formattingTips": [string], "quickWins": [string] }`,
        customApiKey,
        aiProvider,
        aiModel
    })
}

// zod schema for bullet enhancement
const bulletEnhanceSchema = z.object({
    rewrites: z.array(z.string()).length(3).describe("Exactly 3 quantified, high-impact resume bullet rewrites using Google XYZ format")
})

// enhance a single bullet point
async function enhanceBulletContent({ bullet, targetRole = "", customApiKey, aiProvider, aiModel }) {
    const prompt = `You are an executive resume writer specializing in the Google XYZ formula: "Accomplished [X] as measured by [Y], by doing [Z]".
Transform this raw bullet point into 3 distinct, high-impact, recruiter-ready resume bullets.
Target Role context: ${targetRole || "Senior Professional / Engineer"}

Raw Bullet:
"${bullet}"

Requirements for the 3 rewrites:
1. Rewrite 1 (Metrics & Scale focus): Highlights performance, speed, latency, revenue, or user scale.
2. Rewrite 2 (Architecture & Strategy focus): Highlights technical decisions, methodologies, leadership, or ownership.
3. Rewrite 3 (Problem-Solving & Efficiency focus): Highlights root-cause resolution, cost reduction, or workflow automation.

Use strong power verbs (e.g. Architected, Engineered, Optimized, Spearheaded, Accelerated). Do not include placeholders like '[X]'—provide realistic, convincing numbers and phrasing that candidate can customize.
Strictly output a JSON object: { "rewrites": ["string", "string", "string"] }`

    return await executeStructuredAi({
        prompt,
        schema: bulletEnhanceSchema,
        schemaDescription: `{ "rewrites": ["string", "string", "string"] }`,
        customApiKey,
        aiProvider,
        aiModel
    })
}

// zod schema for practice answer evaluation
const evaluateAnswerSchema = z.object({
    score: z.number().min(1).max(10).describe("Score from 1 to 10 evaluating readiness, specificity, and delivery"),
    starCheck: z.object({
        situation: z.boolean().describe("Whether situation/context was established"),
        task: z.boolean().describe("Whether the challenge or task was clear"),
        action: z.boolean().describe("Whether the candidate's specific actions and technical/strategic decisions were highlighted"),
        result: z.boolean().describe("Whether outcomes, metrics, or lessons learned were mentioned")
    }).describe("STAR framework evaluation"),
    feedback: z.string().describe("Constructive, actionable feedback pointing out what worked and what was missing"),
    improvedAnswer: z.string().describe("A polished, recruiter-ready model answer to study and adapt")
})

// evaluate candidate's drafted interview answer
async function evaluateAnswerContent({ question, userAnswer, role = "", customApiKey, aiProvider, aiModel }) {
    const prompt = `You are a tough but supportive hiring manager evaluating a candidate's practice response to an interview question.
Role: ${role || "Candidate Target Role"}
Question Asked: "${question}"
Candidate's Drafted Answer: "${userAnswer}"

Evaluate:
1. score (1-10): Be realistic. 9-10 is exceptional with STAR and metrics. 6-8 is decent but missing depth. 1-5 is vague or incomplete.
2. starCheck: Set situation, task, action, result booleans based on whether the candidate actually covered each component.
3. feedback: Concise, 2-3 sentence constructive critique on structure, technical depth, and confidence.
4. improvedAnswer: A crisp, realistic model answer using the STAR method that the candidate can adapt.

Strictly output valid JSON matching the schema.`

    return await executeStructuredAi({
        prompt,
        schema: evaluateAnswerSchema,
        schemaDescription: `{ "score": number, "starCheck": { "situation": boolean, "task": boolean, "action": boolean, "result": boolean }, "feedback": string, "improvedAnswer": string }`,
        customApiKey,
        aiProvider,
        aiModel
    })
}

// export ai functions
module.exports = { 
    generateInterviewReport, 
    generateJobKeywords,
    generateOutreachContent,
    auditResumeContent,
    enhanceBulletContent,
    evaluateAnswerContent
}
