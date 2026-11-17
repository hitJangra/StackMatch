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
// helper for linkedin job urls
import { getLinkedInJobUrl } from '../../../utils/linkedin.js';

// home dashboard component for scanning resumes and getting recommendations
const Home = () => {
    // interview state and actions
    const { loading, generateReport, reports, getReports } = useInterview();
    // job description textarea input
    const [jobDescription, setJobDescription] = useState("");
    // optional candidate self-summary
    const [selfDescription, setSelfDescription] = useState("");
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
        // update filename display
        if (file) setSelectedFileName(file.name);
        else setSelectedFileName("");
    };

    // submit resume and job description for full interview report
    const handleGenerateReport = async () => {
        // grab uploaded file
        const resumeFile = resumeInputRef.current.files[0];

        // check required inputs
        if (!jobDescription.trim()) {
            addToast("Please enter a target job description.", "warning");
            return;
        }
        if (!resumeFile && !selfDescription.trim()) {
            addToast("Please upload a resume or provide a self-description.", "warning");
            return;
        }
        // file size check
        if (resumeFile && resumeFile.size > 3 * 1024 * 1024) {
            addToast("Resume file must be 3MB or smaller.", "warning");
            return;
        }

        try {
            // call report generation
            const data = await generateReport({ jobDescription, selfDescription, resumeFile });
            addToast("Interview plan generated!", "success");
            // redirect to report details view
            navigate(`/interview/${data._id}`);
        } catch (err) {
            addToast("Failed to generate report. Please try again.", "error");
        }
    };

    // automatically extract keywords from resume and scrape matching jobs
    const handleAutoAnalyze = async () => {
        const resumeFile = resumeInputRef.current.files[0];

        // require resume file
        if (!resumeFile) {
            addToast("Please upload your resume PDF first.", "warning");
            return;
        }
        if (resumeFile.size > 3 * 1024 * 1024) {
            addToast("Resume file must be 3MB or smaller.", "warning");
            return;
        }

        try {
            // set loading states
            setAnalyzingResume(true);
            addToast("Analysing resume for target roles…", "info");

            // build form data
            const formData = new FormData();
            formData.append("resume", resumeFile);
            formData.append("selfDescription", selfDescription || "");

            // dynamically import axios
            const { default: axios } = await import("axios");
            const api = axios.create({ baseURL: "http://localhost:3000", withCredentials: true });

            // request keywords extraction
            const { data: keywordData } = await api.post("/api/interview/", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            // validate keywords
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

            // save all recommended jobs to past recommendations (even if not matched)
            if (fetchedJobs.length > 0) {
                saveLocalPastJobs(fetchedJobs);
            }

            // feedback to user
            if (!fetchedJobs.length) {
                addToast("No live jobs found for this profile right now.", "info");
            } else {
                addToast(`Found ${fetchedJobs.length} recommendations!`, "success");
                // scroll down to recommendations
                setTimeout(() => {
                    document.getElementById("job-recommendations")?.scrollIntoView({ behavior: "smooth" });
                }, 300);
            }
        } catch (err) {
            console.error("Auto-analyze error:", err);
            addToast("Failed to fetch recommendations.", "error");
        } finally {
            // clear loading flags
            setAnalyzingResume(false);
            setJobsLoading(false);
        }
    };

    // one-click match a recommended job to the uploaded resume
    const handleMatchToJob = async (jobDesc, cardUrl) => {
        const resumeFile = resumeInputRef.current?.files[0];

        if (!resumeFile && !selfDescription.trim()) {
            addToast("Please upload a resume or add a self-description first.", "warning");
            return;
        }

        // populate textarea
        setJobDescription(jobDesc);

        try {
            // track which card is analyzing
            setMatchingJobId(cardUrl);
            const data = await generateReport({
                jobDescription: jobDesc,
                selfDescription,
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
        // main dashboard container
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
                    
                    {/* target job description column */}
                    <div className="p-6 sm:p-7 space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                                    Target Job Description
                                </h2>
                            </div>
                            <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400 px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50">
                                Optional
                            </span>
                        </div>

                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            Paste the full job listing here to evaluate tailored questions and skill gaps, or leave empty to discover roles based on your resume.
                        </p>

                        {/* job description text area */}
                        <div className="space-y-1.5">
                            <textarea
                                value={jobDescription}
                                onChange={(e) => setJobDescription(e.target.value)}
                                placeholder="Paste the full job description here...&#10;e.g. 'Senior Frontend Engineer at Google requires proficiency in React, TypeScript, and large-scale system design...'"
                                maxLength={5000}
                                rows={10}
                                className="w-full p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40 text-xs font-mono text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-all resize-none"
                            />
                            {/* character count */}
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
                                        Your Candidate Profile
                                    </h2>
                                </div>
                                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                                    Best Results
                                </span>
                            </div>

                            {/* file dropzone */}
                            <label 
                                htmlFor="resume-upload"
                                className={`flex flex-col items-center justify-center p-6 rounded-xl border-2 border-dashed transition-all cursor-pointer text-center ${
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
                                <div className="w-10 h-10 rounded-full bg-white dark:bg-zinc-800 shadow-xs flex items-center justify-center text-zinc-600 dark:text-zinc-300 mb-2.5">
                                    <Upload className="w-4 h-4" />
                                </div>
                                <p className="text-xs font-medium text-zinc-900 dark:text-zinc-100">
                                    {selectedFileName ? selectedFileName : "Click to select or drag & drop resume"}
                                </p>
                                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
                                    PDF only (Max 3MB limit)
                                </p>
                            </label>

                            {/* alternative summary text area */}
                            <div className="space-y-2 pt-1">
                                <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                                    <span>Or Quick Self-Description</span>
                                </div>
                                <textarea
                                    value={selfDescription}
                                    onChange={(e) => setSelfDescription(e.target.value)}
                                    placeholder="Briefly describe your years of experience, core tech stack, and primary career goals..."
                                    rows={3}
                                    className="w-full p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-all resize-none"
                                />
                            </div>
                        </div>

                        {/* tip badge */}
                        <div className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
                            <CheckCircle className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                            <span>Upload a resume or enter a brief summary to generate personalized recommendations.</span>
                        </div>
                    </div>
                </div>

                {/* card action buttons */}
                <div className="px-6 py-4 bg-zinc-50/70 dark:bg-zinc-950/50 border-t border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                        Powered by Gemini 2.5 Flash & Apify live scraping
                    </span>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        {/* auto-discover matching jobs */}
                        <button
                            onClick={handleAutoAnalyze}
                            disabled={analyzingResume || jobsLoading}
                            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-medium border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 transition-all cursor-pointer disabled:opacity-50"
                        >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>{analyzingResume ? "Analyzing Resume..." : jobsLoading ? "Searching Jobs..." : "Find Matching Jobs"}</span>
                        </button>

                        {/* generate full interview strategy */}
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

            {/* live recommended job cards */}
            {(recommendedJobs.length > 0 || jobsLoading) && (
                <section id="job-recommendations" className="space-y-4 pt-4">
                    <div>
                        <h2 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                            Live Recommended Jobs
                        </h2>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                            Scraped from live listings matching your resume keywords. Click <em>Match Profile</em> to generate a targeted prep plan.
                        </p>
                    </div>

                    {/* loading skeleton */}
                    {jobsLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs animate-pulse space-y-3">
                                    <div className="h-4 bg-zinc-100 dark:bg-zinc-800 rounded w-3/4" />
                                    <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded w-1/2" />
                                    <div className="h-16 bg-zinc-100 dark:bg-zinc-800 rounded-lg" />
                                </div>
                            ))}
                        </div>
                    ) : (
                        // job cards grid
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {recommendedJobs.map((job, idx) => (
                                <div
                                    key={job.url || idx}
                                    className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-all flex flex-col justify-between"
                                >
                                    <div className="space-y-3">
                                        {/* job title — clickable link to linkedin */}
                                        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-1">
                                            <a
                                                href={getLinkedInJobUrl(job)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors inline-flex items-center gap-1.5 group/title"
                                                title="View & apply for this job on LinkedIn"
                                            >
                                                <span className="line-clamp-1">{job.title}</span>
                                                <ArrowUpRight className="w-3.5 h-3.5 text-zinc-400 group-hover/title:text-indigo-500 group-hover/title:translate-x-0.5 group-hover/title:-translate-y-0.5 transition-all flex-shrink-0" />
                                            </a>
                                        </h3>
                                        {/* company and location metadata */}
                                        <div className="flex flex-wrap gap-2 text-[11px] text-zinc-500 dark:text-zinc-400">
                                            {job.company && (
                                                <span className="inline-flex items-center gap-1">
                                                    <Building2 className="w-3 h-3 text-zinc-400" />
                                                    {job.company}
                                                </span>
                                            )}
                                            {job.location && (
                                                <span className="inline-flex items-center gap-1">
                                                    <MapPin className="w-3 h-3 text-zinc-400" />
                                                    {job.location}
                                                </span>
                                            )}
                                        </div>
                                        {/* snippet */}
                                        {job.description && (
                                            <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-3 leading-relaxed">
                                                {job.description}
                                            </p>
                                        )}
                                    </div>

                                    {/* actions */}
                                    <div className="pt-4 mt-4 border-t border-zinc-100 dark:border-zinc-800/80 flex gap-2">
                                        {job.url && job.url !== '#' && (
                                            <a
                                                href={job.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center justify-center p-2 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                                                title="View original posting"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                            </a>
                                        )}

                                        {/* generate plan for this card */}
                                        <button
                                            onClick={() => handleMatchToJob(job.description || `${job.title} at ${job.company}`, job.url)}
                                            disabled={matchingJobId === job.url}
                                            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                                        >
                                            <Sparkles className="w-3.5 h-3.5" />
                                            <span>{matchingJobId === job.url ? "Analyzing..." : "Match Profile to this Job"}</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            )}

            {/* recent scan history snippet */}
            {reports.length > 0 && (
                <section className="space-y-4 pt-2">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                            Recent Scans
                        </h2>
                        {/* link to full history */}
                        <button
                            onClick={() => navigate('/history')}
                            className="text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                        >
                            View all history →
                        </button>
                    </div>

                    {/* recent 3 reports */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {reports.slice(0, 3).map((report) => (
                            <div 
                                key={report._id} 
                                onClick={() => navigate(`/interview/${report._id}`)}
                                className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-all cursor-pointer flex flex-col justify-between"
                            >
                                <div className="space-y-2">
                                    <div className="flex items-start justify-between gap-2">
                                        {/* job position title — clickable link to linkedin */}
                                        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-1">
                                            <a
                                                href={getLinkedInJobUrl(report.title || 'Target Position')}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                onClick={(e) => e.stopPropagation()}
                                                className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors inline-flex items-center gap-1.5 group/title"
                                                title="Search & apply on LinkedIn"
                                            >
                                                <span className="line-clamp-1">{report.title || 'Target Position'}</span>
                                                <ArrowUpRight className="w-3.5 h-3.5 text-zinc-400 group-hover/title:text-indigo-500 group-hover/title:translate-x-0.5 group-hover/title:-translate-y-0.5 transition-all flex-shrink-0" />
                                            </a>
                                        </h3>
                                        {/* match percentage badge */}
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                                            report.matchScore >= 80 
                                                ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20' 
                                                : report.matchScore >= 60 
                                                ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20' 
                                                : 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20'
                                        }`}>
                                            {report.matchScore}% Match
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                                        Generated on {new Date(report.createdAt).toLocaleDateString()}
                                    </p>
                                </div>

                                <div className="pt-4 mt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs font-medium text-zinc-700 dark:text-zinc-300">
                                    <span>Open Strategy</span>
                                    <ArrowUpRight className="w-3.5 h-3.5" />
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
};

// export home component
export default Home;
