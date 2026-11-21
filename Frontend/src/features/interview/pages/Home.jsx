// react hooks
import React, { useState, useRef, useEffect } from 'react';
// navigation hook
import { useNavigate, useLocation } from 'react-router';
// ui icons
import { 
    Sparkles, 
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
// spinner component
import Spinner from '../../../components/Spinner';
// toast notifications
import { useToast } from '../../../components/Toast';
// api call to fetch recommended jobs and persist them
import { getRecommendedJobs, saveLocalPastJobs } from '../services/interview.api.js';
// shared axios client for direct api calls
import { api } from '../../../lib/axios';
// helper for linkedin job urls
import { getLinkedInJobUrl } from '../../../utils/linkedin.js';
// minimalist scraper progress loading UI
import ScraperLoadingProgress from '../../../components/ScraperLoadingProgress';

// home dashboard component for scanning resumes and getting recommendations
const Home = () => {
    // interview state and actions
    const { loading, generateReport, reports, getReports } = useInterview();
    // job description textarea input
    const [jobDescription, setJobDescription] = useState("");
    // selected resume filename display
    const [selectedFileName, setSelectedFileName] = useState("");
    // hidden file input ref
    const resumeInputRef = useRef();

    // recommended jobs state
    const [recommendedJobs, setRecommendedJobs] = useState([]);
    const [jobsLoading, setJobsLoading] = useState(false);
    const [analyzingResume, setAnalyzingResume] = useState(false);
    const [matchingJobId, setMatchingJobId] = useState(null);

    // router and toast
    const navigate = useNavigate();
    const location = useLocation();
    const { addToast } = useToast();

    // fetch past scan reports on page load and handle state from job board
    useEffect(() => {
        getReports();

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

    // handle resume file selection
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) setSelectedFileName(file.name);
        else setSelectedFileName("");
    };

    // submit resume and job description for full interview report
    const handleGenerateReport = async () => {
        const resumeFile = resumeInputRef.current?.files[0];

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
        const resumeFile = resumeInputRef.current?.files[0];

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
        const resumeFile = resumeInputRef.current?.files[0];

        if (!resumeFile) {
            addToast("Please upload a resume first.", "warning");
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
    if (loading && !jobsLoading && !analyzingResume) {
        return <Spinner message="Generating your interview plan..." />;
    }

    return (
        <div className="space-y-10 w-full animate-in fade-in duration-300">
            {/* page title header */}
            <div className="pb-6 border-b border-zinc-200 dark:border-zinc-800">
                <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                    StackMatch — Resume Screener & Interview Prep
                </h1>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-2xl">
                    Upload your resume to receive instantaneous role alignment, ATS scoring, custom interview roadmaps, and matching market opportunities.
                </p>
            </div>

            {/* scan inputs card */}
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-zinc-200 dark:divide-zinc-800">
                    {/* job description column */}
                    <div className="p-6 sm:p-7 space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                                <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                                    Target Job Description
                                </h2>
                            </div>
                            <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400 px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50">
                                Required for Match
                            </span>
                        </div>

                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            Paste the full job listing here to evaluate tailored questions and skill gaps, or leave empty to discover roles based on your resume.
                        </p>

                        <div className="space-y-1.5">
                            <textarea
                                value={jobDescription}
                                onChange={(e) => setJobDescription(e.target.value)}
                                placeholder="Paste the full job description here...&#10;e.g. 'Senior Frontend Engineer requires proficiency in React, TypeScript, and large-scale system design...'"
                                maxLength={5000}
                                rows={10}
                                className="w-full p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40 text-xs font-mono text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-all resize-none"
                            />
                            <div className="text-[11px] text-zinc-400 font-mono text-right">
                                {jobDescription.length} / 5000 chars
                            </div>
                        </div>
                    </div>

                    {/* resume upload column */}
                    <div className="p-6 sm:p-7 space-y-5 flex flex-col justify-between">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                    <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                                        Your Candidate Resume
                                    </h2>
                                </div>
                                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                                    PDF Upload
                                </span>
                            </div>

                            {/* file dropzone */}
                            <label 
                                htmlFor="resume-upload"
                                className={`flex flex-col items-center justify-center p-8 rounded-xl border-2 border-dashed transition-all cursor-pointer text-center ${
                                    selectedFileName
                                        ? 'border-indigo-500/80 bg-indigo-50/40 dark:bg-indigo-950/20'
                                        : 'border-zinc-300 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-950/40'
                                }`}
                            >
                                <input
                                    ref={resumeInputRef}
                                    id="resume-upload"
                                    type="file"
                                    accept=".pdf"
                                    className="hidden"
                                    onChange={handleFileChange}
                                />
                                <div className="w-12 h-12 rounded-full bg-white dark:bg-zinc-800 shadow-xs flex items-center justify-center text-zinc-600 dark:text-zinc-300 mb-3">
                                    {selectedFileName ? (
                                        <FileText className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                                    ) : (
                                        <Upload className="w-6 h-6" />
                                    )}
                                </div>
                                <p className="text-xs font-medium text-zinc-900 dark:text-zinc-100">
                                    {selectedFileName || 'Click to select or drag and drop your resume'}
                                </p>
                                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
                                    PDF only (Max 3MB limit)
                                </p>
                            </label>
                        </div>

                        {/* tip badge */}
                        <div className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
                            <CheckCircle className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                            <span>Your resume is parsed securely in-memory to extract core competencies and benchmark against ATS.</span>
                        </div>
                    </div>
                </div>

                {/* card action buttons */}
                <div className="px-6 py-4 bg-zinc-50/70 dark:bg-zinc-950/50 border-t border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                        Powered by Unified AI Architecture & Apify Scraper
                    </span>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <button
                            onClick={handleAutoAnalyze}
                            disabled={analyzingResume || jobsLoading}
                            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-medium border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 transition-all cursor-pointer disabled:opacity-50"
                        >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>{analyzingResume ? "Analyzing Resume..." : jobsLoading ? "Searching Jobs..." : "Find Matching Jobs"}</span>
                        </button>

                        <button
                            onClick={handleGenerateReport}
                            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900 shadow-sm transition-all cursor-pointer"
                        >
                            <span>Generate Interview Strategy</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Premium Minimalist Scraper Loading Indicator */}
            {(jobsLoading || analyzingResume) && (
                <ScraperLoadingProgress 
                    active={jobsLoading || analyzingResume} 
                    title={analyzingResume ? "Analyzing resume competencies..." : "Live LinkedIn intelligence query"}
                    estimatedSeconds={35}
                />
            )}

            {/* live recommended job cards */}
            {(recommendedJobs.length > 0) && (
                <section id="job-recommendations" className="space-y-4 pt-4">
                    <div>
                        <h2 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                            Live Recommended Jobs
                        </h2>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                            Scraped from live listings matching your resume keywords. Click <em>Match Profile</em> to generate a targeted prep plan.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {recommendedJobs.map((job, idx) => {
                            const isMatchingThis = matchingJobId === (job.url || idx);
                            const externalApplyUrl = getLinkedInJobUrl(job);

                            return (
                                <div 
                                    key={idx}
                                    className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-xs flex flex-col justify-between hover:border-zinc-300 dark:hover:border-zinc-700 transition-all group"
                                >
                                    <div className="space-y-3">
                                        <div className="flex items-start justify-between gap-3">
                                            <span className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                                                <Briefcase className="w-4 h-4" />
                                            </span>
                                            <a
                                                href={externalApplyUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-500 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                            >
                                                <span>Apply</span>
                                                <ExternalLink className="w-3 h-3" />
                                            </a>
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
                                            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
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
            {reports.length > 0 && (
                <section className="space-y-4 pt-2">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                                Previous Scans
                            </h2>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                                Select any past analysis to review roadmaps, questions, and skill breakdowns.
                            </p>
                        </div>
                        <button
                            onClick={() => navigate('/history')}
                            className="inline-flex items-center gap-1 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                        >
                            <span>View all</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-xs divide-y divide-zinc-100 dark:divide-zinc-800">
                        {reports.slice(0, 5).map((r) => (
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
