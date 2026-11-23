import React, { useState } from 'react';
import { 
    CheckCircle2, 
    AlertTriangle, 
    FileDown, 
    Layers, 
    Code2, 
    Sparkles, 
    Check, 
    ExternalLink, 
    ShieldCheck,
    Compass,
    Copy,
    ArrowUpRight
} from 'lucide-react';

export const HeroReportPreview = () => {
    const [activeTab, setActiveTab] = useState('heatmap'); // 'heatmap' | 'questions' | 'latex'
    const [copiedTex, setCopiedTex] = useState(false);

    const handleCopyTex = () => {
        navigator.clipboard?.writeText(`\\documentclass[letterpaper,10pt]{article}
\\usepackage[empty]{fullpage}
\\usepackage{titlesec}
\\usepackage{hyperref}
% ATS Optimized Single Column Layout
\\begin{document}
\\begin{center}
  {\\Huge \\textbf{Alex Mercer}} \\\\
  \\small \\href{mailto:alex@example.com}{alex@example.com} | (555) 019-2834 | San Francisco, CA
\\end{center}
% Tailored Skills Section
\\section*{Technical Skills}
\\textbf{Languages & Frameworks:} React 19, TypeScript, Node.js, Next.js, Python \\\\
\\textbf{Architecture & Cloud:} RESTful APIs, Microservices, PostgreSQL, Redis, AWS
\\end{document}`);
        setCopiedTex(true);
        setTimeout(() => setCopiedTex(false), 2000);
    };

    return (
        <div className="w-full rounded-2xl border border-[var(--color-rule)] bg-[var(--color-card)] shadow-xl overflow-hidden text-left transition-all">
            {/* Top Bar resembling browser/app view */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 border-b border-[var(--color-rule)] bg-[var(--color-paper-2)]/60 text-xs">
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-red-400/80 inline-block" />
                        <span className="w-3 h-3 rounded-full bg-amber-400/80 inline-block" />
                        <span className="w-3 h-3 rounded-full bg-emerald-400/80 inline-block" />
                    </div>
                    <span className="h-4 w-px bg-[var(--color-rule)] mx-1" />
                    <span className="font-mono text-[var(--color-muted)] text-[11px] font-medium hidden sm:inline">
                        interview/report-7f89b4.stackmatch
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#9FE870] text-[#163300] font-semibold text-[11px]">
                        <ShieldCheck className="w-3 h-3" />
                        ATS Grade A+
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[var(--color-card)] border border-[var(--color-rule)] text-[var(--color-ink-2)] text-[11px] font-mono">
                        Overleaf Ready
                    </span>
                </div>
            </div>

            {/* Header info */}
            <div className="p-5 sm:p-6 border-b border-[var(--color-rule)] bg-gradient-to-b from-[var(--color-paper-3)]/50 to-transparent">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono uppercase font-semibold bg-[var(--color-paper-2)] text-[var(--color-ink-2)]">
                                Target Role
                            </span>
                            <span className="text-xs text-[var(--color-muted)]">Stripe · Core Infrastructure</span>
                        </div>
                        <h3 className="text-lg sm:text-xl font-bold font-display text-[var(--color-ink)] tracking-tight">
                            Staff Full-Stack & Systems Engineer
                        </h3>
                        <p className="text-xs sm:text-sm text-[var(--color-muted)]">
                            Benchmarked against JD: 28 requirements scanned · 23 matched · 3 gap items prioritized
                        </p>
                    </div>

                    {/* Match Score Display */}
                    <div className="flex items-center gap-3.5 bg-[var(--color-card)] border border-[var(--color-rule)] rounded-xl p-3 sm:px-4 shadow-xs self-start md:self-auto">
                        <div className="relative w-12 h-12 flex items-center justify-center flex-shrink-0">
                            <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
                                <path
                                    className="text-[var(--color-paper-2)]"
                                    strokeWidth="3.2"
                                    stroke="currentColor"
                                    fill="none"
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                />
                                <path
                                    className="text-[#163300] dark:text-[#9FE870] transition-all duration-1000 ease-out"
                                    strokeDasharray="88, 100"
                                    strokeWidth="3.2"
                                    strokeLinecap="round"
                                    stroke="currentColor"
                                    fill="none"
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                />
                            </svg>
                            <span className="absolute text-xs font-bold font-mono text-[var(--color-ink)]">
                                88%
                            </span>
                        </div>
                        <div>
                            <span className="text-[10px] uppercase font-mono tracking-wider text-[var(--color-muted)] block">
                                ATS Fit Score
                            </span>
                            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                High Probability Match
                            </span>
                        </div>
                    </div>
                </div>

                {/* Sub-actions toolbar */}
                <div className="mt-4 pt-3 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--color-rule)]/60">
                    {/* Tabs */}
                    <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[var(--color-paper-2)] border border-[var(--color-rule)]">
                        <button
                            type="button"
                            onClick={() => setActiveTab('heatmap')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                                activeTab === 'heatmap'
                                    ? 'bg-[var(--color-card)] text-[var(--color-ink)] shadow-xs font-semibold'
                                    : 'text-[var(--color-muted)] hover:text-[var(--color-ink)]'
                            }`}
                        >
                            <Layers className="w-3.5 h-3.5" />
                            <span>Keyword Heatmap</span>
                            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-mono">
                                88%
                            </span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('questions')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                                activeTab === 'questions'
                                    ? 'bg-[var(--color-card)] text-[var(--color-ink)] shadow-xs font-semibold'
                                    : 'text-[var(--color-muted)] hover:text-[var(--color-ink)]'
                            }`}
                        >
                            <Code2 className="w-3.5 h-3.5" />
                            <span>Domain Questions</span>
                            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[var(--color-paper-3)] text-[var(--color-muted)] font-mono">
                                5
                            </span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('latex')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                                activeTab === 'latex'
                                    ? 'bg-[var(--color-card)] text-[var(--color-ink)] shadow-xs font-semibold'
                                    : 'text-[var(--color-muted)] hover:text-[var(--color-ink)]'
                            }`}
                        >
                            <FileDown className="w-3.5 h-3.5" />
                            <span>Tailored LaTeX (.tex)</span>
                        </button>
                    </div>

                    {/* Export Action Simulation */}
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[var(--color-rule)] bg-[var(--color-card)] text-xs font-medium text-[var(--color-ink)] hover:bg-[var(--color-paper-2)] transition-colors cursor-pointer"
                            title="Export PDF"
                        >
                            <FileDown className="w-3.5 h-3.5 text-[#163300] dark:text-[#9FE870]" />
                            <span>ATS Single-Column PDF</span>
                        </button>
                        <button
                            type="button"
                            onClick={handleCopyTex}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#9FE870] hover:bg-[#8dd461] text-[#163300] text-xs font-bold transition-colors cursor-pointer"
                            title="Open in Overleaf / Copy LaTeX"
                        >
                            {copiedTex ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copiedTex ? 'Copied .tex!' : 'Copy LaTeX'}</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Tab Body */}
            <div className="p-5 sm:p-6 min-h-[300px]">
                {activeTab === 'heatmap' && (
                    <div className="space-y-4 animate-in fade-in duration-200">
                        <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-[var(--color-ink)]">
                                Core JD Keywords Extracted (Semantic Match)
                            </span>
                            <span className="text-[var(--color-muted)]">
                                7 Matched · 2 Identified Gaps to Address
                            </span>
                        </div>

                        {/* Matched Chips */}
                        <div>
                            <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-700 dark:text-emerald-400 font-semibold mb-2 block">
                                Verified in Your Resume (High Density)
                            </span>
                            <div className="flex flex-wrap gap-2">
                                {[
                                    { name: 'React 19 & Next.js', count: '4 mentions' },
                                    { name: 'TypeScript Architecture', count: '5 mentions' },
                                    { name: 'Distributed Systems', count: '3 mentions' },
                                    { name: 'PostgreSQL & Indexing', count: '3 mentions' },
                                    { name: 'REST & GraphQL APIs', count: '4 mentions' },
                                    { name: 'Tailwind CSS', count: '2 mentions' },
                                    { name: 'Redis Caching', count: '2 mentions' },
                                ].map((item) => (
                                    <span
                                        key={item.name}
                                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20"
                                    >
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                        <span>{item.name}</span>
                                        <span className="text-[10px] text-emerald-600/70 dark:text-emerald-400/70 font-mono">
                                            {item.count}
                                        </span>
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Gaps to address */}
                        <div className="pt-2">
                            <span className="text-[11px] font-mono uppercase tracking-wider text-amber-700 dark:text-amber-400 font-semibold mb-2 block">
                                Gaps Highlighted in Job Description
                            </span>
                            <div className="flex flex-wrap gap-2">
                                {[
                                    { name: 'Kubernetes Cluster Management', note: 'Priority Gap · Prep answer provided' },
                                    { name: 'Terraform / IaC', note: 'Mentioned in JD infra section' },
                                ].map((item) => (
                                    <span
                                        key={item.name}
                                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20"
                                    >
                                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                                        <span>{item.name}</span>
                                        <span className="text-[10px] text-amber-600/70 dark:text-amber-400/70">
                                            ({item.note})
                                        </span>
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Recommendation bar */}
                        <div className="mt-3 p-3.5 rounded-xl border border-[var(--color-rule)] bg-[var(--color-paper-3)] text-xs text-[var(--color-ink-2)] flex items-start gap-2.5">
                            <Sparkles className="w-4 h-4 text-[#163300] dark:text-[#9FE870] flex-shrink-0 mt-0.5" />
                            <div>
                                <strong className="text-[var(--color-ink)] font-semibold">StackMatch Recommendation:</strong> Your frontend and systems foundation aligns 100% with the hiring manager's requirements. We injected targeted talking points for Kubernetes container orchestration in your tailored resume and Q&A roadmap.
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'questions' && (
                    <div className="space-y-3 animate-in fade-in duration-200">
                        <div className="text-xs font-semibold text-[var(--color-ink)] mb-1">
                            Tailored Interview Questions for this Role
                        </div>
                        {[
                            {
                                q: "How would you design idempotency for concurrent webhook events in Stripe's ledger?",
                                topic: "Domain Architecture",
                                tip: "Frame using database unique constraints, redis locking, and replay log verification."
                            },
                            {
                                q: "Tell me about a time you had to trade off strict data consistency for high availability.",
                                topic: "Behavioral & System Trade-off",
                                tip: "Use STAR format: Situation, Task, Action (eventual consistency with read replicas), Result (99.99% uptime)."
                            }
                        ].map((item, idx) => (
                            <div key={idx} className="p-3.5 rounded-xl border border-[var(--color-rule)] bg-[var(--color-paper-3)] space-y-2">
                                <div className="flex items-center justify-between text-[11px]">
                                    <span className="font-mono text-[var(--color-muted)] font-semibold">Q{idx + 1} · {item.topic}</span>
                                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-medium">Likely Question</span>
                                </div>
                                <h4 className="text-sm font-semibold text-[var(--color-ink)]">{item.q}</h4>
                                <div className="text-xs text-[var(--color-ink-2)] bg-[var(--color-card)] p-2.5 rounded-lg border border-[var(--color-rule)] flex items-start gap-2">
                                    <Compass className="w-3.5 h-3.5 text-[#163300] dark:text-[#9FE870] flex-shrink-0 mt-0.5" />
                                    <span><strong>Target Angle:</strong> {item.tip}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'latex' && (
                    <div className="space-y-3 animate-in fade-in duration-200">
                        <div className="flex items-center justify-between text-xs">
                            <span className="font-mono text-[var(--color-muted)]">resume_stripe_staff_v1.tex</span>
                            <span className="text-xs text-[#163300] dark:text-[#9FE870] font-semibold">Overleaf 1-Click Compatible</span>
                        </div>
                        <pre className="p-4 rounded-xl border border-[var(--color-rule)] bg-zinc-950 text-zinc-100 font-mono text-xs overflow-x-auto leading-relaxed selection:bg-[#9FE870] selection:text-[#163300]">
{`\\documentclass[letterpaper,10pt]{article}
\\usepackage[empty]{fullpage}
\\usepackage{titlesec}
\\usepackage{hyperref}

% ATS Standard Clean Single-Column Layout
\\addtolength{\\oddsidemargin}{-0.5in}
\\addtolength{\\evensidemargin}{-0.5in}
\\addtolength{\\textwidth}{1in}

\\begin{document}
\\section*{Selected Experience Tailored for Stripe Core}
\\textbf{Senior Full-Stack Engineer} \\hfill Jan 2023 -- Present \\\\
\\textit{FinTech Infrastructure Corp} \\hfill San Francisco, CA
\\begin{itemize}
  \\item Architected high-throughput transaction ledger handling 45k ops/sec with PostgreSQL \\& Redis.
  \\item Implemented idempotency keys and distributed tracing, reducing duplicate events to 0.00\\%.
  \\item Bridged gap in Kubernetes orchestration by deploying automated helm charts on AWS EKS.
\\end{itemize}
\\end{document}`}
                        </pre>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HeroReportPreview;
