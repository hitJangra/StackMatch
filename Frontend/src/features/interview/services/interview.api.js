import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:3000",
    withCredentials: true,
});

/**
 * Storage key for user-configured BYOK and Local AI settings.
 */
export const BYOK_STORAGE_KEY = "byok_ai_config";

/**
 * Helper to retrieve stored BYOK settings from browser localStorage.
 */
export const getStoredByokConfig = () => {
    try {
        const raw = localStorage.getItem(BYOK_STORAGE_KEY);
        if (raw) return JSON.parse(raw);
    } catch (e) {
        console.error("Failed to parse BYOK config from localStorage:", e);
    }
    return {
        provider: "default",
        apiKey: "",
        model: "",
        endpoint: "http://localhost:11434"
    };
};

/**
 * Helper to persist BYOK configuration to localStorage.
 */
export const saveByokConfig = (config) => {
    localStorage.setItem(BYOK_STORAGE_KEY, JSON.stringify(config));
};

/**
 * Axios Request Interceptor:
 * Automatically reads the user's BYOK credentials from localStorage and attaches
 * them as custom request headers on every outgoing API call to our backend.
 */
api.interceptors.request.use((config) => {
    try {
        const byok = getStoredByokConfig();
        if (byok && byok.provider && byok.provider !== "default") {
            config.headers["x-ai-provider"] = byok.provider;
            if (byok.apiKey) {
                config.headers["x-ai-api-key"] = byok.apiKey;
            }
            if (byok.model) {
                config.headers["x-ai-model"] = byok.model;
            }
        }
    } catch (err) {
        console.error("Interceptor failed to attach BYOK headers:", err);
    }
    return config;
});

/**
 * Directly communicates with OpenAI Chat Completions API (https://api.openai.com/v1/chat/completions).
 * Formats structured JSON response using OpenAI's response_format { type: "json_object" }.
 */
async function generateViaOpenAI({ jobDescription, selfDescription, resumeFile, byokConfig }) {
    const apiKey = byokConfig.apiKey;
    if (!apiKey) {
        throw new Error("OpenAI API Key is missing. Please configure your key in Settings.");
    }

    const model = byokConfig.model || "gpt-4o-mini";

    const prompt = `You are an elite technical interviewer, hiring manager, and talent strategist.
Analyze the candidate's profile and target job description:

Candidate Profile / Summary:
${selfDescription || "Senior Full Stack Software Engineer with production experience"}

Target Job Description:
${jobDescription || "Full Stack Software Engineer"}

You MUST output strictly a single valid JSON object with NO markdown formatting, NO backticks, and NO conversational text.
Use this exact JSON schema:
{
  "title": "Target Role Title",
  "matchScore": 85,
  "technicalQuestions": [
    { "question": "Detailed technical scenario question 1", "intention": "Why the interviewer asks this question", "answer": "Structured model answer strategy with key concepts" },
    { "question": "Detailed technical scenario question 2", "intention": "Why the interviewer asks this question", "answer": "Structured model answer strategy with key concepts" },
    { "question": "Detailed technical scenario question 3", "intention": "Why the interviewer asks this question", "answer": "Structured model answer strategy with key concepts" }
  ],
  "behavioralQuestions": [
    { "question": "Behavioral leadership question 1", "intention": "Assesses team conflict and ownership", "answer": "STAR method response strategy" },
    { "question": "Behavioral leadership question 2", "intention": "Assesses prioritization under pressure", "answer": "STAR method response strategy" }
  ],
  "skillGaps": [
    { "skill": "Identified primary gap", "severity": "medium" },
    { "skill": "Identified secondary gap", "severity": "low" }
  ],
  "preparationPlan": [
    { "day": 1, "focus": "Core Domain Systems", "tasks": ["Deep dive into critical architecture", "Review common performance bottlenecks"] },
    { "day": 2, "focus": "System Design & Live Coding", "tasks": ["Practice whiteboard system trade-offs", "Implement mock interface"] },
    { "day": 3, "focus": "Executive Presence & Behavioral", "tasks": ["Rehearse past career milestones with STAR", "Prepare reverse interview questions"] }
  ]
}`;

    const response = await axios.post("https://api.openai.com/v1/chat/completions", {
        model,
        messages: [
            {
                role: "system",
                content: "You are an AI interview screener and talent coach. You must strictly output valid JSON matching the requested schema."
            },
            {
                role: "user",
                content: prompt
            }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3
    }, {
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
        }
    });

    const content = response.data?.choices?.[0]?.message?.content;
    if (!content) {
        throw new Error("Empty response received from OpenAI API.");
    }

    let parsed;
    try {
        parsed = JSON.parse(content);
    } catch {
        const cleaned = content.replace(/```json/g, "").replace(/```/g, "").trim();
        parsed = JSON.parse(cleaned);
    }

    const localReport = {
        _id: "local-openai-" + Date.now(),
        title: parsed.title || "Target Position (OpenAI)",
        createdAt: new Date().toISOString(),
        matchScore: typeof parsed.matchScore === "number" ? parsed.matchScore : 85,
        jobDescription: jobDescription || "",
        selfDescription: selfDescription || "",
        technicalQuestions: Array.isArray(parsed.technicalQuestions) ? parsed.technicalQuestions : [],
        behavioralQuestions: Array.isArray(parsed.behavioralQuestions) ? parsed.behavioralQuestions : [],
        skillGaps: Array.isArray(parsed.skillGaps) ? parsed.skillGaps : [],
        preparationPlan: Array.isArray(parsed.preparationPlan) ? parsed.preparationPlan : []
    };

    localStorage.setItem("local_report_" + localReport._id, JSON.stringify(localReport));

    return {
        message: "Interview report generated via OpenAI.",
        interviewReport: localReport
    };
}

/**
 * Directly communicates with a locally running Ollama instance (http://localhost:11434).
 * Bypasses the cloud backend completely for 100% private, on-device AI generation.
 */
async function generateViaOllama({ jobDescription, selfDescription, resumeFile, byokConfig }) {
    const endpoint = (byokConfig.endpoint || "http://localhost:11434").replace(/\/$/, "");
    const model = byokConfig.model || "llama3";

    const prompt = `You are an expert technical recruiter and interview strategist.
Analyze the candidate's profile and target job description:

Candidate Profile/Summary:
${selfDescription || "Experienced Software Engineer with full-stack background"}

Target Job Description:
${jobDescription || "Full Stack Software Developer"}

You MUST output ONLY a valid JSON object with NO markdown formatting, NO backticks, and NO conversational text.
Use this exact JSON structure:
{
  "title": "Target Role Title",
  "matchScore": 85,
  "technicalQuestions": [
    { "question": "Detailed technical question 1", "intention": "Why interviewer asks this", "answer": "Structured answer approach" },
    { "question": "Detailed technical question 2", "intention": "Why interviewer asks this", "answer": "Structured answer approach" },
    { "question": "Detailed technical question 3", "intention": "Why interviewer asks this", "answer": "Structured answer approach" }
  ],
  "behavioralQuestions": [
    { "question": "Behavioral question 1", "intention": "Culture and collaboration check", "answer": "STAR method response strategy" },
    { "question": "Behavioral question 2", "intention": "Conflict or leadership check", "answer": "STAR method response strategy" }
  ],
  "skillGaps": [
    { "skill": "Core relevant skill gap", "severity": "medium" },
    { "skill": "Secondary skill gap", "severity": "low" }
  ],
  "preparationPlan": [
    { "day": 1, "focus": "Core Domain Fundamentals", "tasks": ["Review primary algorithms and patterns", "Implement key reference modules"] },
    { "day": 2, "focus": "System Design & Architecture", "tasks": ["Study scalable distributed patterns", "Practice whiteboard architecture"] },
    { "day": 3, "focus": "Mock Behavioral & Case Prep", "tasks": ["Rehearse past project stories using STAR", "Review company values"] }
  ]
}`;

    const ollamaResponse = await axios.post(`${endpoint}/api/generate`, {
        model,
        prompt,
        format: "json",
        stream: false
    });

    if (!ollamaResponse.data || !ollamaResponse.data.response) {
        throw new Error("Ollama returned an empty response. Verify model is installed via 'ollama pull " + model + "'");
    }

    let parsed;
    try {
        parsed = JSON.parse(ollamaResponse.data.response);
    } catch {
        const cleaned = ollamaResponse.data.response.replace(/```json/g, "").replace(/```/g, "").trim();
        parsed = JSON.parse(cleaned);
    }

    const localReport = {
        _id: "local-ollama-" + Date.now(),
        title: parsed.title || "Target Position (Local AI)",
        createdAt: new Date().toISOString(),
        matchScore: typeof parsed.matchScore === "number" ? parsed.matchScore : 80,
        jobDescription: jobDescription || "",
        selfDescription: selfDescription || "",
        technicalQuestions: Array.isArray(parsed.technicalQuestions) ? parsed.technicalQuestions : [],
        behavioralQuestions: Array.isArray(parsed.behavioralQuestions) ? parsed.behavioralQuestions : [],
        skillGaps: Array.isArray(parsed.skillGaps) ? parsed.skillGaps : [],
        preparationPlan: Array.isArray(parsed.preparationPlan) ? parsed.preparationPlan : []
    };

    localStorage.setItem("local_report_" + localReport._id, JSON.stringify(localReport));

    return {
        message: "Interview report generated locally via Ollama.",
        interviewReport: localReport
    };
}

/**
 * Service to generate an interview report.
 * - If "OpenAI" is selected in BYOK settings, routes directly to https://api.openai.com/v1/chat/completions.
 * - If "Ollama Local" is selected, bypasses backend and directly queries http://localhost:11434.
 * - If "Groq", "Google Gemini", or "Default" is selected, forwards to the backend with appropriate BYOK headers.
 */
export const generateInterviewReport = async ({ jobDescription, selfDescription, resumeFile }) => {
    const byok = getStoredByokConfig();

    // ── 1. OpenAI Direct Client-Side Routing ─────────────────────────────────
    if (byok && byok.provider === "openai") {
        return await generateViaOpenAI({
            jobDescription,
            selfDescription,
            resumeFile,
            byokConfig: byok
        });
    }

    // ── 2. Ollama Local Direct Client-Side Routing ───────────────────────────
    if (byok && byok.provider === "ollama") {
        return await generateViaOllama({
            jobDescription,
            selfDescription,
            resumeFile,
            byokConfig: byok
        });
    }

    // ── 3. Groq, Gemini & System Default Cloud Backend Routing ───────────────
    const formData = new FormData();
    formData.append("jobDescription", jobDescription);
    formData.append("selfDescription", selfDescription);
    formData.append("resume", resumeFile);

    const response = await api.post("/api/interview/", formData, {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    });

    return response.data;
};

/**
 * Service to get interview report by interviewId.
 * Supports loading locally generated OpenAI and Ollama reports without hitting the backend.
 */
export const getInterviewReportById = async (interviewId) => {
    if (interviewId && interviewId.startsWith("local-")) {
        const stored = localStorage.getItem("local_report_" + interviewId);
        if (stored) {
            return { interviewReport: JSON.parse(stored) };
        }
    }

    const response = await api.get(`/api/interview/report/${interviewId}`);
    return response.data;
};

/**
 * Service to get all interview reports of logged in user.
 */
export const getAllInterviewReports = async () => {
    const response = await api.get("/api/interview/");
    return response.data;
};

/**
 * Service to generate resume pdf based on user self description, resume content and job description.
 */
export const generateResumePdf = async ({ interviewReportId }) => {
    const response = await api.post(`/api/interview/resume/pdf/${interviewReportId}`, null, {
        responseType: "blob"
    });

    return response.data;
};

/**
 * Service to fetch recommended job listings from Apify based on
 * an array of keywords derived from the user's resume.
 */
export const getRecommendedJobs = async (keywords) => {
    const response = await api.post("/api/jobs/recommend", { keywords });
    return response.data;
};

/**
 * Service to fetch all historical resume analyses and interview plans.
 */
export const getHistory = async () => {
    const response = await api.get("/api/history");
    return response.data;
};
