// axios http client
import axios from "axios";

// create api client with cookie support
const api = axios.create({
    baseURL: "http://localhost:3000",
    withCredentials: true,
});

// localstorage key for byok settings
export const BYOK_STORAGE_KEY = "byok_ai_config";

// retrieve stored byok api keys from localstorage
export const getStoredByokConfig = () => {
    try {
        const raw = localStorage.getItem(BYOK_STORAGE_KEY);
        if (raw) return JSON.parse(raw);
    } catch (e) {
        console.error("Failed to parse BYOK config from localStorage:", e);
    }
    // fallback default settings
    return {
        provider: "default",
        apiKey: "",
        model: "",
        endpoint: "http://localhost:11434"
    };
};

// save byok settings to localstorage
export const saveByokConfig = (config) => {
    localStorage.setItem(BYOK_STORAGE_KEY, JSON.stringify(config));
};

// request interceptor to attach custom byok headers to requests
api.interceptors.request.use((config) => {
    try {
        // read active byok configuration
        const byok = getStoredByokConfig();
        // attach headers if non-default provider is configured
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

// direct browser-to-openai api call
async function generateViaOpenAI({ jobDescription, selfDescription, resumeFile, byokConfig }) {
    // validate key
    const apiKey = byokConfig.apiKey;
    if (!apiKey) {
        throw new Error("OpenAI API Key is missing. Please configure your key in Settings.");
    }

    // pick model
    const model = byokConfig.model || "gpt-4o-mini";

    // build scoring prompt
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

    // post to openai completions endpoint
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

    // extract response text
    const content = response.data?.choices?.[0]?.message?.content;
    if (!content) {
        throw new Error("Empty response received from OpenAI API.");
    }

    // parse json safely
    let parsed;
    try {
        parsed = JSON.parse(content);
    } catch {
        const cleaned = content.replace(/```json/g, "").replace(/```/g, "").trim();
        parsed = JSON.parse(cleaned);
    }

    // build report object
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

    // save locally in browser storage
    localStorage.setItem("local_report_" + localReport._id, JSON.stringify(localReport));

    return {
        message: "Interview report generated via OpenAI.",
        interviewReport: localReport
    };
}

// direct local ollama api call
async function generateViaOllama({ jobDescription, selfDescription, resumeFile, byokConfig }) {
    // get ollama host and model
    const endpoint = (byokConfig.endpoint || "http://localhost:11434").replace(/\/$/, "");
    const model = byokConfig.model || "llama3";

    // build prompt
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

    // post to local ollama endpoint
    const ollamaResponse = await axios.post(`${endpoint}/api/generate`, {
        model,
        prompt,
        format: "json",
        stream: false
    });

    // validate returned body
    if (!ollamaResponse.data || !ollamaResponse.data.response) {
        throw new Error("Ollama returned an empty response. Verify model is installed via 'ollama pull " + model + "'");
    }

    // parse json
    let parsed;
    try {
        parsed = JSON.parse(ollamaResponse.data.response);
    } catch {
        const cleaned = ollamaResponse.data.response.replace(/```json/g, "").replace(/```/g, "").trim();
        parsed = JSON.parse(cleaned);
    }

    // format local report
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

    // store in browser
    localStorage.setItem("local_report_" + localReport._id, JSON.stringify(localReport));

    return {
        message: "Interview report generated locally via Ollama.",
        interviewReport: localReport
    };
}

// generate interview report based on active byok provider
export const generateInterviewReport = async ({ jobDescription, selfDescription, resumeFile }) => {
    // read byok configuration
    const byok = getStoredByokConfig();

    // route to openai client-side if selected
    if (byok && byok.provider === "openai") {
        return await generateViaOpenAI({
            jobDescription,
            selfDescription,
            resumeFile,
            byokConfig: byok
        });
    }

    // route to ollama local client-side if selected
    if (byok && byok.provider === "ollama") {
        return await generateViaOllama({
            jobDescription,
            selfDescription,
            resumeFile,
            byokConfig: byok
        });
    }

    // forward to backend for groq, gemini or default
    const formData = new FormData();
    formData.append("jobDescription", jobDescription);
    formData.append("selfDescription", selfDescription);
    formData.append("resume", resumeFile);

    // send multipart form data
    const response = await api.post("/api/interview/", formData, {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    });

    return response.data;
};

// get single interview report by id
export const getInterviewReportById = async (interviewId) => {
    // check if this was a local client-side report
    if (interviewId && interviewId.startsWith("local-")) {
        const stored = localStorage.getItem("local_report_" + interviewId);
        if (stored) {
            return { interviewReport: JSON.parse(stored) };
        }
    }

    // fetch from backend
    const response = await api.get(`/api/interview/report/${interviewId}`);
    return response.data;
};

// fetch all reports for current user
export const getAllInterviewReports = async () => {
    const response = await api.get("/api/interview/");
    return response.data;
};

// download resume pdf
export const generateResumePdf = async ({ interviewReportId }) => {
    // request pdf blob
    const response = await api.post(`/api/interview/resume/pdf/${interviewReportId}`, null, {
        responseType: "blob"
    });

    return response.data;
};

// request job recommendations by keywords and optional filters
export const getRecommendedJobs = async (keywords, filters = {}) => {
    // build query string from non-empty filter values
    const params = new URLSearchParams();
    if (filters.location && filters.location !== 'any') params.append('location', filters.location);
    if (filters.experience && filters.experience !== 'any') params.append('exp', filters.experience);
    if (filters.type && filters.type !== 'any') params.append('type', filters.type);

    // post keywords array; send filters as query params
    const queryString = params.toString();
    const url = queryString ? `/api/jobs/recommend?${queryString}` : '/api/jobs/recommend';
    const response = await api.post(url, { keywords });
    return response.data;
};

// fetch scan history list
export const getHistory = async () => {
    // query history endpoint
    const response = await api.get("/api/history");
    return response.data;
};

// localstorage key for persisting past recommended jobs
export const PAST_JOBS_STORAGE_KEY = "past_recommended_jobs";

// retrieve locally cached past recommended jobs
export const getLocalPastJobs = () => {
    try {
        const raw = localStorage.getItem(PAST_JOBS_STORAGE_KEY);
        if (raw) return JSON.parse(raw);
    } catch (e) {
        console.error("Failed to read past recommended jobs from localStorage:", e);
    }
    return [];
};

// save newly recommended jobs into local cache, merging & deduplicating
export const saveLocalPastJobs = (newJobs) => {
    if (!Array.isArray(newJobs) || newJobs.length === 0) return;
    try {
        const existing = getLocalPastJobs();
        const seen = new Set();
        const merged = [];

        for (const job of [...newJobs, ...existing]) {
            if (!job || !job.title || job.title === "N/A") continue;
            const key = (job.url && job.url !== "#") ? job.url : `${job.title}::${job.company || ""}`;
            if (!seen.has(key)) {
                seen.add(key);
                merged.push(job);
            }
        }

        // keep up to 100 most recent recommended jobs
        localStorage.setItem(PAST_JOBS_STORAGE_KEY, JSON.stringify(merged.slice(0, 100)));
    } catch (e) {
        console.error("Failed to persist past recommended jobs to localStorage:", e);
    }
};

// fetch all past recommended jobs from backend API
export const getPastRecommendations = async () => {
    try {
        const response = await api.get("/api/jobs/past-recommendations");
        return response.data;
    } catch (err) {
        console.warn("Failed to fetch past recommendations from backend API:", err);
        return { success: false, jobs: [] };
    }
};
