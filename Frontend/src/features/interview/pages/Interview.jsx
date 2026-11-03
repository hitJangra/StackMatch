import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { 
    ArrowLeft, 
    Download, 
    CheckCircle2, 
    AlertCircle, 
    ChevronDown, 
    Code2, 
    Users, 
    Compass, 
    Sparkles, 
    Calendar,
    Target,
    Layers,
    FileDown
} from 'lucide-react';
import { useInterview } from '../hooks/useInterview.js';
import Spinner from '../../../components/Spinner';
import { useToast } from '../../../components/Toast';

const NAV_ITEMS = [
    { 
        id: 'technical', 
        label: 'Technical Questions', 
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
        label: 'Preparation Road Map', 
        icon: Compass,
        countKey: 'preparationPlan'
    },
];

// ── Question Card Sub-component ────────────────────────────────────────────────
const QuestionCard = ({ item, index }) => {
    const [open, setOpen] = useState(index === 0);

    return (
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-all">
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
                    {/* Intention */}
                    <div className="space-y-1.5 pt-3">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60">
                            Interviewer Intention
                        </span>
                        <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed pl-0.5">
                            {item.intention}
                        </p>
                    </div>

                    {/* Answer Strategy */}
                    <div className="space-y-1.5 pt-1">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60">
                            Model Answer Strategy
                        </span>
                        <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed pl-0.5 whitespace-pre-line">
                            {item.answer}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

// ── Main Interview Detail Component ───────────────────────────────────────────
const Interview = () => {
    const [activeNav, setActiveNav] = useState('technical');
    const { report, getReportById, loading, getResumePdf } = useInterview();
    const { interviewId } = useParams();
    const navigate = useNavigate();
    const { addToast } = useToast();
    const [downloading, setDownloading] = useState(false);

    useEffect(() => {
        if (interviewId) {
            getReportById(interviewId).catch(() => {
                addToast("Failed to load interview report.", "error");
            });
        }
    }, [interviewId]);

    const handleDownloadResume = async () => {
        try {
            setDownloading(true);
            addToast("Generating your tailored resume PDF...", "info");
            await getResumePdf(interviewId);
            addToast("Resume downloaded successfully!", "success");
        } catch {
            addToast("Failed to generate resume PDF. Please try again.", "error");
        } finally {
            setDownloading(false);
        }
    };

    if (loading || !report) {
        return <Spinner message="Loading your interview report..." />;
    }

    const score = report.matchScore || 0;
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
            {/* Top Navigation & Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/history')}
                        className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shadow-xs cursor-pointer"
                        title="Back to History"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                                {report.title || "Detailed Interview Strategy"}
                            </h1>
                            <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${scoreBadgeBg}`}>
                                {score}% Match
                            </span>
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                            AI-evaluated interview plan, target technical questions, and personalized roadmap.
                        </p>
                    </div>
                </div>

                {/* Right Action: Download Resume */}
                <button
                    onClick={handleDownloadResume}
                    disabled={downloading}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900 shadow-sm transition-all disabled:opacity-50 cursor-pointer self-start sm:self-auto"
                >
                    <Download className="w-3.5 h-3.5" />
                    <span>{downloading ? "Generating PDF..." : "Download Tailored Resume"}</span>
                </button>
            </div>

            {/* Main Content Layout: Left Tabs + Center Questions + Right Score Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* ── Left Section Navigation Tabs (3 cols) ── */}
                <div className="lg:col-span-3 space-y-2">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-semibold px-2 block">
                        Evaluation Sections
                    </span>
                    <div className="space-y-1">
                        {NAV_ITEMS.map((item) => {
                            const Icon = item.icon;
                            const isActive = activeNav === item.id;
                            const count = report[item.countKey]?.length || 0;

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

                {/* ── Center Content Area (6 cols) ── */}
                <div className="lg:col-span-6 space-y-4">
                    {/* Technical Questions */}
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
                                    <QuestionCard key={i} item={q} index={i} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Behavioral Questions */}
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
                                    <QuestionCard key={i} item={q} index={i} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Preparation Road Map */}
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
                                        {/* Dot */}
                                        <div className="absolute -left-6 top-1.5 w-3 h-3 rounded-full border-2 border-indigo-600 bg-white dark:bg-zinc-900" />
                                        
                                        <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60">
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

                {/* ── Right Column: Score & Skill Gaps Sidebar (3 cols) ── */}
                <div className="lg:col-span-3 space-y-5">
                    {/* Match Score Card */}
                    <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs space-y-4 text-center">
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

                    {/* Skill Gaps Card */}
                    <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs space-y-3">
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

export default Interview;
