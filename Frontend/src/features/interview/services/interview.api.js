// shared axios client (reads VITE_API_BASE_URL, withCredentials, 100s timeout)
import { api } from "../../../lib/axios";
import axios from "axios"; // kept only for the direct Ollama localhost call below
import { downloadClientResumePdf } from "../components/ResumePdfDocument";

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

// direct browser-to-local-ollama api call (strictly client-side since AWS backend cannot reach localhost)
async function generateViaOllama({ jobDescription, resumeFile, byokConfig }) {
    const endpoint = byokConfig.endpoint || "http://localhost:11434";
    const model = byokConfig.model || "llama3";

    // build structured prompt
    const prompt = `You are an elite technical interviewer, hiring manager, and talent strategist.
Analyze the target job description and profile:

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

    // post to local ollama endpoint
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

// generate interview report based on active byok provider
export const generateInterviewReport = async ({ jobDescription, resumeFile }) => {
    // read byok configuration
    const byok = getStoredByokConfig();

    // route to ollama local client-side ONLY if selected
    if (byok && byok.provider === "ollama") {
        return await generateViaOllama({
            jobDescription,
            resumeFile,
            byokConfig: byok
        });
    }

    // Unified AI Architecture: OpenAI, Gemini, Groq, and default all route through Node.js backend
    const formData = new FormData();
    formData.append("jobDescription", jobDescription);
    if (resumeFile) {
        formData.append("resume", resumeFile);
    }

    // send multipart form data to unified backend
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

// download resume pdf via pure client-side @react-pdf/renderer
export const generateResumePdf = async ({ interviewReportId, reportData }) => {
    let report = reportData;
    if (!report && interviewReportId) {
        const res = await getInterviewReportById(interviewReportId);
        report = res?.interviewReport;
    }
    return await downloadClientResumePdf(report);
};

// request job recommendations by keywords and optional filters
export const getRecommendedJobs = async (keywords, filters = {}) => {
    const params = new URLSearchParams();
    if (filters.location && filters.location !== 'any') params.append('location', filters.location);
    if (filters.experience && filters.experience !== 'any') params.append('exp', filters.experience);
    if (filters.type && filters.type !== 'any') params.append('type', filters.type);

    const queryString = params.toString();
    const url = queryString ? `/api/jobs/recommend?${queryString}` : '/api/jobs/recommend';
    const response = await api.post(url, { keywords });
    return response.data;
};

// fetch scan history list
export const getHistory = async () => {
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
