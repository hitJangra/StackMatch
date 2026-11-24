// react hooks
import React, { useState, useEffect, useRef } from 'react';
// navigation and url parameters
import { useNavigate, useParams } from 'react-router';
// ui icons
import { 
    ArrowLeft, 
    Download, 
    CheckCircle2, 
    AlertCircle, 
    ChevronDown, 
    Code2, 
    Users, 
    Compass, 
    Calendar,
    Target,
    Layers,
    FileDown,
    ExternalLink,
    ArrowUpRight,
    FileText,
    Loader2,
    Sparkles,
    Check,
    X
} from 'lucide-react';
// interview custom hook
import { useInterview } from '../hooks/useInterview.js';
// loading spinner
import LoadingSpinner from '../../../components/LoadingSpinner';
// toast notifications
import { useToast } from '../../../components/Toast';
// Resume Keyword Heatmap component
import ResumeKeywordHeatmap from '../components/ResumeKeywordHeatmap';
// tailored resume export helpers
import { downloadTailoredResumePdf, downloadTailoredTexResume } from '../components/ResumePdfDocument';
import { evaluateAnswer } from '../services/interview.api';

// tab navigation menu items
const NAV_ITEMS = [
    { 
        id: 'heatmap', 
        label: 'Keyword Heatmap', 
        icon: Layers,
        countKey: 'skillGaps'
    },
    { 
        id: 'technical', 
        label: 'Domain & Role Questions', 
        icon: Code2,
        countKey: 'technicalQuestions'
    },
    { 
        id: 'behavioral', 
        label: 'Behavioral Questions', 
        icon: Users,
        countKey: 'behavioralQuestions'
    },
    { 
        id: 'roadmap', 
        label: 'Preparation', 
        icon: Compass,
        countKey: 'preparationPlan'
    },
];

// collapsible question card component with interactive practice & evaluation
const QuestionCard = ({ item, index, role }) => {
    // open state (first question open by default)
    const [open, setOpen] = useState(index === 0);
    const [showPractice, setShowPractice] = useState(false);
    const [userAnswer, setUserAnswer] = useState('');
    const [evaluating, setEvaluating] = useState(false);
    const [evaluation, setEvaluation] = useState(null);
    const { addToast } = useToast();

    const handleEvaluate = async () => {
        if (!userAnswer.trim()) {
            addToast("Please enter your answer before checking.", "warning");
            return;
        }
        setEvaluating(true);
        try {
            const result = await evaluateAnswer({
                question: item.question,
                userAnswer: userAnswer.trim(),
                role: role || 'Candidate'
            });
            setEvaluation(result?.data || result?.evaluation || result);
            addToast("Answer evaluated successfully!", "success");
        } catch (err) {
            console.error(err);
            addToast(err?.response?.data?.message || "Failed to evaluate answer. Try again.", "error");
        } finally {
            setEvaluating(false);
        }
    };

    return (
        <div className="interactive-card rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-xs">
            <button
                onClick={() => setOpen(prev => !prev)}
                className="w-full text-left p-4 sm:p-5 flex items-start justify-between gap-4 cursor-pointer select-none"
            >
                <div className="flex items-start gap-3.5 min-w-0">
                    <span className="flex-shrink-0 px-2 py-0.5 rounded-md text-[11px] font-mono font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 mt-0.5">
                        Q{index + 1}
                    </span>
                    <h4 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 leading-snug">
                        {item.question}
                    </h4>
                </div>
                <div className={`p-1 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-transform duration-200 flex-shrink-0 ${open ? 'rotate-180' : ''}`}>
                    <ChevronDown className="w-4 h-4" />
                </div>
            </button>

            {open && (
                <div className="px-5 pb-5 pt-1 space-y-4 border-t border-zinc-100 dark:border-zinc-800/80 animate-in fade-in duration-200">
                    <div className="space-y-1.5 pt-3">
                        <span className="wise-label">
                            Intention
                        </span>
                        <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed pl-0.5">
                            {item.intention}
                        </p>
                    </div>

                    <div className="space-y-1.5 pt-1">
                        <span className="wise-label">
                            Answer
                        </span>
                        <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed pl-0.5 whitespace-pre-line">
                            {item.answer}
                        </p>
                    </div>

                    {/* Practice Answer Toggle & Area */}
                    <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
                        <button
                            type="button"
                            onClick={() => setShowPractice(p => !p)}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#163300] dark:text-[#9FE870] hover:underline cursor-pointer"
                        >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>{showPractice ? 'Hide Practice Box' : 'Practice Your Answer'}</span>
                        </button>

                        {showPractice && (
                            <div className="mt-3 p-3.5 sm:p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950/40 space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                                        <Sparkles className="w-3.5 h-3.5 text-[#163300] dark:text-[#9FE870]" />
                                        <span>Practice Answer &amp; STAR Evaluation</span>
                                    </label>
                                    <span className="text-[11px] text-zinc-400 font-mono">
                                        {userAnswer.trim() ? userAnswer.trim().split(/\s+/).length : 0} words
                                    </span>
                                </div>

                                <textarea
                                    value={userAnswer}
                                    onChange={(e) => setUserAnswer(e.target.value)}
                                    placeholder="Draft your answer here (incorporating Situation, Task, Action, and Result)..."
                                    rows={4}
                                    className="w-full p-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#163300] dark:focus:ring-[#9FE870] resize-y"
                                />

                                <div className="flex items-center justify-between pt-1">
                                    <p className="text-[11px] text-zinc-400">
                                        AI analyzes STAR structure, clarity &amp; impact.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={handleEvaluate}
                                        disabled={evaluating || !userAnswer.trim()}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#9FE870] text-[#163300] dark:text-[#163300] hover:bg-[#8ddb5e] disabled:opacity-50 cursor-pointer shadow-xs transition-all"
                                    >
                                        {evaluating ? (
                                            <>
                                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                <span>Checking...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles className="w-3.5 h-3.5" />
                                                <span>Check Answer</span>
                                            </>
                                        )}
                                    </button>
                                </div>

                                {evaluation && (
                                    <div className="mt-3 p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-3 animate-in fade-in duration-200">
                                        {/* Header: Score & STAR tags */}
                                        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-zinc-100 dark:border-zinc-800">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                                                    Score:
                                                </span>
                                                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#9FE870] text-[#163300] dark:text-[#163300] border border-[#9FE870]/40 shadow-xs">
                                                    {evaluation.score} / 10
                                                </span>
                                            </div>

                                            {/* STAR pills */}
                                            <div className="flex items-center gap-1.5">
                                                {['situation', 'task', 'action', 'result'].map((k) => {
                                                    const passed = Boolean(evaluation.starCheck?.[k]);
                                                    return (
                                                        <span
                                                            key={k}
                                                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold uppercase ${
                                                                passed
                                                                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                                                                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 border border-zinc-200 dark:border-zinc-700 line-through'
                                                            }`}
                                                            title={`${k.toUpperCase()}: ${passed ? 'Present' : 'Missing'}`}
                                                        >
                                                            {passed ? <Check className="w-2.5 h-2.5" /> : <X className="w-2.5 h-2.5" />}
                                                            {k[0].toUpperCase()}
                                                        </span>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Feedback */}
                                        <div className="space-y-1">
                                            <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                                                Feedback
                                            </span>
                                            <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
                                                {evaluation.feedback}
                                            </p>
                                        </div>

                                        {/* Improved Model Answer */}
                                        {evaluation.improvedAnswer && (
                                            <div className="space-y-1 pt-1">
                                                <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                                                    Improved Model Answer
                                                </span>
                                                <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-800 dark:text-zinc-200 leading-relaxed whitespace-pre-line font-mono text-[11px]">
                                                    {evaluation.improvedAnswer}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

// full interview report detail page
const InterviewReport = () => {
    const [activeNav, setActiveNav] = useState('heatmap');
    const { report, getReportById, loading, getResumePdf } = useInterview();
    const { interviewId } = useParams();
    const navigate = useNavigate();
    const { addToast } = useToast();
    const [downloading, setDownloading] = useState(false);
    const [downloadingTailored, setDownloadingTailored] = useState(false);
    const [tailoredDropdownOpen, setTailoredDropdownOpen] = useState(false);
    const tailoredDropdownRef = useRef(null);

    useEffect(() => {
        if (interviewId) {
            getReportById(interviewId).catch(() => {
                addToast("Failed to load interview report.", "error");
            });
        }
    }, [interviewId]);

    // close tailored dropdown on outside click
    useEffect(() => {
        if (!tailoredDropdownOpen) return;
        const handleOutside = (e) => {
            if (tailoredDropdownRef.current && !tailoredDropdownRef.current.contains(e.target)) {
                setTailoredDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleOutside);
        return () => document.removeEventListener('mousedown', handleOutside);
    }, [tailoredDropdownOpen]);

    // download prep roadmap pdf via pure client-side @react-pdf/renderer
    const handleDownloadPrepRoadmap = async () => {
        try {
            setDownloading(true);
            addToast("Generating your prep roadmap PDF...", "info");
            await getResumePdf(interviewId, report);
            addToast("Prep roadmap downloaded successfully!", "success");
        } catch {
            addToast("Failed to generate prep roadmap PDF. Please try again.", "error");
        } finally {
            setDownloading(false);
        }
    };

    // download tailored resume as PDF
    const handleDownloadTailoredPdf = async () => {
        setTailoredDropdownOpen(false);
        try {
            setDownloadingTailored(true);
            addToast("Generating tailored resume PDF...", "info");
            await downloadTailoredResumePdf(report);
            addToast("Tailored resume downloaded!", "success");
        } catch {
            addToast("Failed to generate tailored resume PDF. Please try again.", "error");
        } finally {
            setDownloadingTailored(false);
        }
    };

    // download tailored resume as .tex for Overleaf
    const handleDownloadTex = () => {
        setTailoredDropdownOpen(false);
        try {
            downloadTailoredTexResume(report);
            addToast("LaTeX file downloaded — open in Overleaf!", "success");
        } catch {
            addToast("Failed to generate .tex file. Please try again.", "error");
        }
    };

    if (loading || !report) {
        return <LoadingSpinner message="Loading report..." />;
    }

    const score = report.matchScore || 0;
    const reportApplyUrl =
        typeof report.jobUrl === "string" && report.jobUrl.startsWith("http") && report.jobUrl !== "#"
            ? report.jobUrl
            : typeof report.url === "string" && report.url.startsWith("http") && report.url !== "#"
                ? report.url
                : typeof report.applyLink === "string" && report.applyLink.startsWith("http")
                    ? report.applyLink
                    : "";
    const scoreColor = 
        score >= 80 ? 'text-emerald-600 dark:text-emerald-400 border-emerald-500' :
        score >= 60 ? 'text-amber-600 dark:text-amber-400 border-amber-500' :
        'text-rose-600 dark:text-rose-400 border-rose-500';

    const scoreBadgeBg = 
        score >= 80 ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20' :
        score >= 60 ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20' :
        'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20';

    const scoreLabel =
        score >= 80 ? 'Strong match for this role' :
        score >= 60 ? 'Moderate match — targeted prep needed' :
        'Noticeable skill gaps — follow prep plan';

    return (
        <div className="space-y-6 w-full animate-in fade-in duration-300">
            {/* page header and actions */}
            <div className="wise-page-header">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/saved-jobs')}
                        className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shadow-xs cursor-pointer"
                        title="Back to Saved Jobs"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                                {reportApplyUrl ? (
                                    <a
                                        href={reportApplyUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="hover:text-[#163300] dark:hover:text-[#9FE870] transition-colors inline-flex items-center gap-1.5 group/title"
                                        title="Open application"
                                    >
                                        <span>{report.title || "Detailed Interview Strategy"}</span>
                                        <ArrowUpRight className="w-5 h-5 text-zinc-400 transition-all flex-shrink-0" />
                                    </a>
                                ) : (
                                    <span>{report.title || "Detailed Interview Strategy"}</span>
                                )}
                            </h1>
                            <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${scoreBadgeBg}`}>
                                {score}% Match
                            </span>
                        </div>
                    </div>
                </div>

                {/* action buttons */}
                <div className="flex items-center gap-2 self-start sm:self-auto">
                    {reportApplyUrl && (
                        <a
                            href={reportApplyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="wise-primary-pill"
                            title="Open application"
                        >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Apply</span>
                        </a>
                    )}

                    {/* Prep Roadmap PDF download — renamed from "Download Tailored Resume" */}
                    <button
                        onClick={handleDownloadPrepRoadmap}
                        disabled={downloading}
                        className="wise-secondary-pill"
                    >
                        {downloading
                            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            : <Download className="w-3.5 h-3.5" />
                        }
                        <span>{downloading ? "Generating…" : "Download Prep Roadmap"}</span>
                    </button>

                    {/* Tailored Resume split-dropdown */}
                    <div className="relative" ref={tailoredDropdownRef}>
                        {/* main trigger */}
                        <button
                            onClick={() => report?.tailoredResume && setTailoredDropdownOpen(prev => !prev)}
                            disabled={downloadingTailored || !report?.tailoredResume}
                            title={!report?.tailoredResume ? "Tailored resume not available in this report" : "Export tailored resume"}
                            className={[
                                "wise-secondary-pill gap-1.5",
                                (!report?.tailoredResume || downloadingTailored)
                                    ? "opacity-50 cursor-not-allowed"
                                    : "cursor-pointer"
                            ].join(" ")}
                        >
                            {downloadingTailored
                                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                : <FileText className="w-3.5 h-3.5" />
                            }
                            <span>{downloadingTailored ? "Generating…" : "Tailored Resume"}</span>
                            <ChevronDown className={[
                                "w-3 h-3 ml-0.5 transition-transform duration-150",
                                tailoredDropdownOpen ? "rotate-180" : ""
                            ].join(" ")} />
                        </button>

                        {/* dropdown panel — matches wise card token set */}
                        {tailoredDropdownOpen && report?.tailoredResume && (
                            <div className="absolute right-0 top-full mt-1.5 w-52 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-lg z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
                                <button
                                    onClick={handleDownloadTailoredPdf}
                                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-[#163300]/8 dark:hover:bg-[#9FE870]/8 hover:text-[#163300] dark:hover:text-[#9FE870] transition-colors text-left cursor-pointer"
                                >
                                    <Download className="w-3.5 h-3.5 flex-shrink-0" />
                                    <span>Download Tailored PDF</span>
                                </button>
                                <div className="border-t border-zinc-100 dark:border-zinc-800" />
                                <button
                                    onClick={handleDownloadTex}
                                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-[#163300]/8 dark:hover:bg-[#9FE870]/8 hover:text-[#163300] dark:hover:text-[#9FE870] transition-colors text-left cursor-pointer"
                                >
                                    <FileDown className="w-3.5 h-3.5 flex-shrink-0" />
                                    <span>Download .tex (Overleaf)</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* 3-column content layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* section tabs sidebar */}
                <div className="lg:col-span-3 space-y-2">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-semibold px-2 block">
                        Evaluation Sections
                    </span>
                    <div className="space-y-1">
                        {NAV_ITEMS.map((item) => {
                            const Icon = item.icon;
                            const isActive = activeNav === item.id;
                            const count = report[item.countKey]?.length || (item.id === 'heatmap' ? 'Live' : 0);

                            return (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveNav(item.id)}
                                    className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-medium transition-all text-left cursor-pointer border ${
                                        isActive
                                            ? 'bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-xs'
                                            : 'bg-transparent border-transparent text-zinc-600 dark:text-zinc-400 hover:bg-white/60 dark:hover:bg-zinc-900/60 hover:text-zinc-900 dark:hover:text-zinc-200'
                                    }`}
                                >
                                    <div className="flex items-center gap-2.5">
                                        <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-zinc-400'}`} />
                                        <span>{item.label}</span>
                                    </div>
                                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                                        isActive 
                                            ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200' 
                                            : 'text-zinc-400 dark:text-zinc-500'
                                    }`}>
                                        {count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* center questions / heatmap / roadmap column */}
                <div className="lg:col-span-6 space-y-4">
                    {/* Resume Keyword Heatmap Tab */}
                    {activeNav === 'heatmap' && (
                        <ResumeKeywordHeatmap 
                            resumeText={report.resume}
                            jobDescription={report.jobDescription}
                            skillGaps={report.skillGaps}
                            jdKeywords={report.jdKeywords}
                        />
                    )}

                    {/* technical questions tab */}
                    {activeNav === 'technical' && (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between pb-1">
                                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                                    Technical Inquiries
                                </h3>
                                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                                    {report.technicalQuestions?.length || 0} questions
                                </span>
                            </div>
                            <div className="space-y-3">
                                {report.technicalQuestions?.map((q, i) => (
                                    <QuestionCard key={i} item={q} index={i} role={report?.title} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* behavioral questions tab */}
                    {activeNav === 'behavioral' && (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between pb-1">
                                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                                    Behavioral & Culture Fit
                                </h3>
                                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                                    {report.behavioralQuestions?.length || 0} questions
                                </span>
                            </div>
                            <div className="space-y-3">
                                {report.behavioralQuestions?.map((q, i) => (
                                    <QuestionCard key={i} item={q} index={i} role={report?.title} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* preparation roadmap tab */}
                    {activeNav === 'roadmap' && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between pb-1">
                                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                                    Day-by-Day Preparation Plan
                                </h3>
                                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                                    {report.preparationPlan?.length || 0} milestones
                                </span>
                            </div>

                            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-zinc-200 dark:before:bg-zinc-800">
                                {report.preparationPlan?.map((day) => (
                                    <div key={day.day} className="relative space-y-2">
                                        <div className="absolute -left-6 top-1.5 w-3 h-3 rounded-full border-2 border-[#163300] dark:border-[#9FE870] bg-[#9FE870]" />
                                        
                                        <div className="interactive-card p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-[#9FE870] text-[#163300] dark:text-[#163300] border border-[#9FE870]/40 shadow-xs">
                                                    Day {day.day}
                                                </span>
                                                <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                                                    {day.focus}
                                                </h4>
                                            </div>

                                            <ul className="space-y-1.5 pt-1">
                                                {day.tasks?.map((task, idx) => (
                                                    <li key={idx} className="flex items-start gap-2 text-xs text-zinc-600 dark:text-zinc-300">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 dark:bg-zinc-600 mt-1.5 flex-shrink-0" />
                                                        <span>{task}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* right column: match score & skill gaps */}
                <div className="lg:col-span-3 space-y-5">
                    {/* circular score card */}
                    <div className="interactive-card p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs space-y-4 text-center">
                        <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-semibold block text-left">
                            Match Score
                        </span>

                        <div className="flex flex-col items-center justify-center py-2">
                            <div className={`w-24 h-24 rounded-full border-4 flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-800/40 ${scoreColor}`}>
                                <span className="text-3xl font-extrabold tracking-tight font-mono leading-none">
                                    {score}
                                </span>
                                <span className="text-[10px] font-medium opacity-80 mt-0.5">%</span>
                            </div>
                            <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300 mt-3 max-w-[200px]">
                                {scoreLabel}
                            </p>
                        </div>
                    </div>

                    {/* missing skills badges */}
                    <div className="interactive-card p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs space-y-3">
                        <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-semibold block">
                            Identified Skill Gaps
                        </span>

                        {report.skillGaps && report.skillGaps.length > 0 ? (
                            <div className="flex flex-wrap gap-2 pt-1">
                                {report.skillGaps.map((gap, i) => {
                                    const severityBadge = 
                                        gap.severity === 'high' 
                                            ? 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20' 
                                            : gap.severity === 'medium' 
                                            ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20' 
                                            : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20';

                                    return (
                                        <div 
                                            key={i} 
                                            className={`px-2.5 py-1 rounded-lg text-xs font-medium border flex items-center gap-1.5 ${severityBadge}`}
                                        >
                                            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
                                            <span>{gap.skill}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 py-1">
                                No critical skill gaps detected.
                            </p>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default InterviewReport;
