// react hooks
import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
// navigation hook
import { useNavigate, useLocation } from 'react-router';
// ui icons
import { 
    Upload, 
    FileText, 
    CheckCircle, 
    ArrowRight, 
    Briefcase, 
    Building2, 
    MapPin, 
    ExternalLink, 
    Calendar,
    ArrowUpRight,
    Search,
    AlertCircle
} from 'lucide-react';
// interview custom hook
import { useInterview } from '../hooks/useInterview.js';
// toast notifications
import { useToast } from '../../../components/Toast';
// api call to fetch recommended jobs and persist them
import { getRecommendedJobs, saveLocalPastJobs } from '../services/interview.api.js';
// shared axios client for direct api calls
import { api } from '../../../lib/axios';
// helper for linkedin job urls
import { getLinkedInJobUrl } from '../../../utils/linkedin.js';
import { AnalyzingResumeLoader } from '../../../components/Loaders';

// home dashboard component for scanning resumes and getting recommendations
const Home = () => {
    // interview state and actions
    const { loading, generateReport, reports, getReports } = useInterview();
    // job description textarea input
    const [jobDescription, setJobDescription] = useState("");
    // The actual uploaded PDF is retained across both Home modes.
    const [resumeFile, setResumeFile] = useState(null);
    const selectedFileName = resumeFile?.name || "";

    // recommended jobs state
    const [recommendedJobs, setRecommendedJobs] = useState([]);
    const [jobsLoading, setJobsLoading] = useState(false);
    const [analyzingResume, setAnalyzingResume] = useState(false);
    const [matchingJobId, setMatchingJobId] = useState(null);
    const [homeMode, setHomeMode] = useState("find");
    const [savedJobPrepBanner, setSavedJobPrepBanner] = useState(false);
    const reduceMotion = useReducedMotion();

    // router and toast
    const navigate = useNavigate();
    const location = useLocation();
    const { addToast } = useToast();

    // fetch past scan reports on page load and handle state from job board
    useEffect(() => {
        getReports();

        if (location.state?.homeMode === "match") {
            setHomeMode("match");
        }

        if (location.state?.savedJobPrepBanner) {
            setSavedJobPrepBanner(true);
        }

        if (location.state?.prepJob) {
            const prepJob = location.state.prepJob;
            setJobDescription(prepJob.description || [
                prepJob.title,
                prepJob.company ? `at ${prepJob.company}` : ""
            ].filter(Boolean).join(" "));
        }

        // check if user clicked "Match & Prep" from Jobs page
        if (location.state?.jobDescription) {
            setJobDescription(location.state.jobDescription);
            addToast("Target job description loaded!", "info");
        } else if (location.state?.targetJob) {
            const tj = location.state.targetJob;
            setJobDescription(tj.description || `${tj.title} at ${tj.company}`);
            addToast(`Loaded ${tj.title} for matching!`, "info");
        }
    }, [location.state]);

    const setResumeFromFile = (file) => {
        if (!file) {
            setResumeFile(null);
            return;
        }
        if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
            addToast("Please select a PDF resume.", "warning");
            return;
        }
        if (file.size > 3 * 1024 * 1024) {
            addToast("Resume file must be 3MB or smaller.", "warning");
            return;
        }
        setResumeFile(file);
    };

    const handleFileChange = (event) => {
        setResumeFromFile(event.target.files?.[0] || null);
    };

    const handleFileDrop = (event) => {
        event.preventDefault();
        setResumeFromFile(event.dataTransfer.files?.[0] || null);
    };

    // submit resume and job description for full interview report
    const handleGenerateReport = async () => {
        // check required inputs
        if (!resumeFile) {
            addToast("Please upload a resume PDF file.", "warning");
            return;
        }
        if (!jobDescription.trim()) {
            addToast("Please enter a target job description.", "warning");
            return;
        }
        // file size check
        if (resumeFile.size > 3 * 1024 * 1024) {
            addToast("Resume file must be 3MB or smaller.", "warning");
            return;
        }

        try {
            const data = await generateReport({ jobDescription, resumeFile });
            addToast("Interview plan generated!", "success");
            navigate(`/interview/${data._id}`);
        } catch (err) {
            addToast("Failed to generate report. Please try again.", "error");
        }
    };

    // automatically extract keywords from resume and scrape matching jobs
    const handleAutoAnalyze = async () => {
        if (!resumeFile) {
            addToast("Please upload your resume PDF first.", "warning");
            return;
        }
        if (resumeFile.size > 3 * 1024 * 1024) {
            addToast("Resume file must be 3MB or smaller.", "warning");
            return;
        }

        try {
            setAnalyzingResume(true);
            addToast("Analysing resume for target roles…", "info");

            const formData = new FormData();
            formData.append("resume", resumeFile);

            // request keywords extraction via shared api client (no dynamic import needed)
            const { data: keywordData } = await api.post("/api/interview/", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            if (keywordData.mode !== "keyword_recommendation" || !keywordData.recommendedJobKeywords?.length) {
                addToast("Could not extract keywords. Try adding a job description.", "warning");
                return;
            }

            addToast(`Matched roles: ${keywordData.recommendedJobKeywords.join(", ")}`, "success");

            // search live jobs with keywords
            setJobsLoading(true);
            const jobData = await getRecommendedJobs(keywordData.recommendedJobKeywords);
            const fetchedJobs = jobData.jobs || [];
            setRecommendedJobs(fetchedJobs);

            if (fetchedJobs.length > 0) {
                saveLocalPastJobs(fetchedJobs);
            }

            if (!fetchedJobs.length) {
                addToast("No live jobs found for this profile right now.", "info");
            } else {
                addToast(`Found ${fetchedJobs.length} recommendations!`, "success");
                setTimeout(() => {
                    document.getElementById("job-recommendations")?.scrollIntoView({ behavior: "smooth" });
                }, 300);
            }
        } catch (err) {
            console.error("Auto-analyze error:", err);
            addToast("Failed to fetch recommendations.", "error");
        } finally {
            setAnalyzingResume(false);
            setJobsLoading(false);
        }
    };

    // one-click match a recommended job to the uploaded resume
    const handleMatchToJob = async (jobDesc, cardUrl) => {
        if (!resumeFile) {
            addToast("Please upload a resume first.", "warning");
            return;
        }
        if (resumeFile.size > 3 * 1024 * 1024) {
            addToast("Resume file must be 3MB or smaller.", "warning");
            return;
        }

        setJobDescription(jobDesc);

        try {
            setMatchingJobId(cardUrl);
            const data = await generateReport({
                jobDescription: jobDesc,
                resumeFile
            });
            addToast("Interview plan generated!", "success");
            navigate(`/interview/${data._id}`);
        } catch (err) {
            addToast("Failed to generate report.", "error");
        } finally {
            setMatchingJobId(null);
        }
    };

    // show full-screen spinner if generating plan
    const analysisLabel = analyzingResume
        ? 'Scanning resume...'
        : jobsLoading
            ? 'Finding matching jobs...'
            : 'Generating match...';

    return (
        <div className="space-y-10 w-full animate-in fade-in duration-300">
            {/* page title header */}
            <div className="wise-page-header">
                <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">
                    Resume Match
                </h1>
            </div>

            <motion.div
                className="wise-beam-border"
                layout
                transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 300, damping: 30 }}
            >
            <div className="wise-beam-inner rounded-3xl bg-white dark:bg-zinc-900 overflow-hidden">
                <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
                    <div className="home-mode-toggle" role="tablist" aria-label="Resume matching mode">
                        <button
                            type="button"
                            role="tab"
                            aria-selected={homeMode === "find"}
                            onClick={() => setHomeMode("find")}
                            className={homeMode === "find" ? "home-mode-active" : ""}
                        >
                            {homeMode === "find" && (
                                <motion.span
                                    layoutId="activeModePill"
                                    className="home-mode-pill"
                                    transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 350, damping: 30 }}
                                />
                            )}
                            Find Jobs
                        </button>
                        <button
                            type="button"
                            role="tab"
                            aria-selected={homeMode === "match"}
                            onClick={() => setHomeMode("match")}
                            className={homeMode === "match" ? "home-mode-active" : ""}
                        >
                            {homeMode === "match" && (
                                <motion.span
                                    layoutId="activeModePill"
                                    className="home-mode-pill"
                                    transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 350, damping: 30 }}
                                />
                            )}
                            Match a JD
                        </button>
                    </div>
                </div>

                <motion.div
                    layout
                    transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 300, damping: 30 }}
                >
                <AnimatePresence mode="popLayout" initial={false}>
                {homeMode === "find" ? (
                    <motion.div layout key="find">
                        <div className="p-6 sm:p-8">
                            <motion.label
                                layout
                                htmlFor="resume-upload"
                                className={`home-upload-box ${selectedFileName ? "home-upload-box-selected" : ""}`}
                                onDragOver={(event) => event.preventDefault()}
                                onDrop={handleFileDrop}
                                transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 300, damping: 30 }}
                            >
                                <input
                                    id="resume-upload"
                                    type="file"
                                    accept=".pdf"
                                    className="hidden"
                                    onChange={handleFileChange}
                                />
                                <div className="home-upload-icon">
                                    {selectedFileName ? <FileText size={24} /> : <Upload size={24} />}
                                </div>
                                <p className="home-upload-title">
                                    {selectedFileName || "Upload your resume"}
                                </p>
                                <p className="home-upload-meta">PDF, up to 3MB</p>
                            </motion.label>
                        </div>
                        <div className="px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-end">
                            <button
                                type="button"
                                onClick={handleAutoAnalyze}
                                disabled={analyzingResume || jobsLoading}
                                className="wise-primary-pill"
                            >
                                <span>{analyzingResume ? "Finding Jobs" : jobsLoading ? "Finding Jobs" : "Find Matching Jobs"}</span>
                                <ArrowRight size={16} />
                            </button>
                        </div>
                    </motion.div>

                ) : (
                    <motion.div layout key="match">
                        {savedJobPrepBanner && (
                            <div className="saved-job-prep-banner" role="status">
                                Upload your resume to score this saved job and generate your prep report.
                            </div>
                        )}
                        <motion.div
                            layout
                            className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-zinc-200 dark:divide-zinc-800"
                            transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 300, damping: 30 }}
                        >
                            <motion.div layout className="p-6 sm:p-7" transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 300, damping: 30 }}>
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-sm font-semibold">Your Candidate Resume</h2>
                                    <span className="wise-label">PDF</span>
                                </div>
                                <label
                                    htmlFor="resume-upload"
                                    className={`home-upload-box home-upload-box-compact ${selectedFileName ? "home-upload-box-selected" : ""}`}
                                    onDragOver={(event) => event.preventDefault()}
                                    onDrop={handleFileDrop}
                                >
                                    <input
                                        id="resume-upload"
                                        type="file"
                                        accept=".pdf"
                                        className="hidden"
                                        onChange={handleFileChange}
                                    />
                                    <div className="home-upload-icon">
                                        {selectedFileName ? <FileText size={22} /> : <Upload size={22} />}
                                    </div>
                                    <p className="home-upload-title">{selectedFileName || "Upload resume"}</p>
                                    <p className="home-upload-meta">PDF, up to 3MB</p>
                                </label>
                            </motion.div>

                            <AnimatePresence mode="popLayout">
                            <motion.div
                                layout
                                key="target-job"
                                initial={reduceMotion ? false : { opacity: 0, scale: 0.96, x: 20, filter: "blur(6px)" }}
                                animate={{ opacity: 1, scale: 1, x: 0, filter: "blur(0px)" }}
                                exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, x: 20, filter: "blur(6px)" }}
                                transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 300, damping: 30 }}
                                className="p-6 sm:p-7 home-glass-panel"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-sm font-semibold">Target Job Description</h2>
                                    <span className="wise-label">Required</span>
                                </div>
                                <textarea
                                    value={jobDescription}
                                    onChange={(e) => setJobDescription(e.target.value)}
                                    placeholder="Paste the job description"
                                    maxLength={5000}
                                    rows={8}
                                    className="w-full min-h-56 p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#163300] dark:focus:ring-[#9FE870] resize-none"
                                />
                            </motion.div>
                            </AnimatePresence>
                        </motion.div>
                        <div className="px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-end">
                            <button
                                type="button"
                                onClick={handleGenerateReport}
                                className="wise-primary-pill"
                            >
                                <span>Score Match &amp; Prep</span>
                                <ArrowRight size={16} />
                            </button>
                        </div>
                    </motion.div>
                )}
                </AnimatePresence>
                {(loading || jobsLoading || analyzingResume) && (
                    <div className="home-analysis-loader">
                        <AnalyzingResumeLoader label={analysisLabel} />
                    </div>
                )}
                </motion.div>
            </div>
            </motion.div>


            {/* live recommended job cards */}
            {(recommendedJobs.length > 0) && (
                <section id="job-recommendations" className="space-y-4 pt-4">
                    <div>
                        <h2 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                            Live Recommended Jobs
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {recommendedJobs.map((job, idx) => {
                            const isMatchingThis = matchingJobId === (job.url || idx);
                            const externalApplyUrl = getLinkedInJobUrl(job);

                            return (
                                <div 
                                    key={idx}
                                    className="interactive-card rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-xs flex flex-col justify-between group"
                                >
                                    <div className="space-y-3">
                                        <div className="flex items-start justify-between gap-3">
                                            <span className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                                                <Briefcase className="w-4 h-4" />
                                            </span>
                                            {externalApplyUrl && (
                                                <a
                                                    href={externalApplyUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="wise-primary-pill"
                                                >
                                                    <span>Apply</span>
                                                    <ExternalLink className="w-3 h-3" />
                                                </a>
                                            )}
                                        </div>

                                        <div>
                                            <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                                                {job.title}
                                            </h3>
                                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                                                <span className="flex items-center gap-1">
                                                    <Building2 className="w-3.5 h-3.5" />
                                                    {job.company || 'Unknown Company'}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <MapPin className="w-3.5 h-3.5" />
                                                    {job.location || 'Location Not Specified'}
                                                </span>
                                            </div>
                                        </div>

                                        {job.description && (
                                            <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-3 leading-relaxed">
                                                {job.description}
                                            </p>
                                        )}
                                    </div>

                                    <div className="pt-4 mt-4 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
                                        <button
                                            onClick={() => handleMatchToJob(job.description || `${job.title} at ${job.company}`, job.url || idx)}
                                            disabled={isMatchingThis}
                                            className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100 transition-all cursor-pointer disabled:opacity-50"
                                        >
                                            <Search className="w-3.5 h-3.5 text-indigo-500" />
                                            <span>{isMatchingThis ? 'Analyzing...' : 'Match & Prep'}</span>
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>
            )}

            {/* recent scan history table preview */}
            {(reports?.length || 0) > 0 && (
                <section className="space-y-4 pt-2">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                                Previous Scans
                            </h2>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                            </p>
                        </div>
                        <button
                            onClick={() => navigate('/saved-jobs')}
                            className="inline-flex items-center gap-1 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                        >
                            <span>View all</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-xs divide-y divide-zinc-100 dark:divide-zinc-800">
                        {(reports || []).slice(0, 5).map((r) => (
                            <div 
                                key={r._id} 
                                onClick={() => navigate(`/interview/${r._id}`)}
                                className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer group"
                            >
                                <div className="space-y-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                            {r.title || 'Untitled Assessment'}
                                        </h3>
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-3.5 h-3.5" />
                                            {new Date(r.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 flex-shrink-0">
                                    {r.matchScore !== undefined && (
                                        <div className="text-right">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60">
                                                {r.matchScore}% Match
                                            </span>
                                        </div>
                                    )}
                                    <ArrowUpRight className="w-4 h-4 text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-200 transition-colors" />
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
};

export default Home;
