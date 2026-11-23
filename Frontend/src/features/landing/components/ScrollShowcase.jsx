import React, { useRef, useState } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { 
    Layers, 
    FileText, 
    Compass, 
    BookmarkCheck, 
    CheckCircle2, 
    AlertTriangle, 
    FileDown, 
    ExternalLink, 
    Sparkles, 
    ArrowRight,
    ChevronRight,
    Code2,
    Calendar,
    Target
} from 'lucide-react';
import { Link } from 'react-router';

export const ScrollShowcase = () => {
    const containerRef = useRef(null);
    const reduceMotion = useReducedMotion();
    const [activeFeature, setActiveFeature] = useState(0);

    // Track scroll progress of this container
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ['start end', 'end start']
    });

    // Replicate Dribbble 3D perspective scroll transform
    // Tilt starts at 16deg, straightens to 0deg as user scrolls into center, then stays steady
    const rotateX = useTransform(scrollYProgress, [0, 0.35, 0.7, 1], [16, 0, 0, -8]);
    const scale = useTransform(scrollYProgress, [0, 0.35, 0.7, 1], [0.92, 1, 1, 0.96]);
    const translateY = useTransform(scrollYProgress, [0, 0.35], [60, 0]);
    const opacity = useTransform(scrollYProgress, [0, 0.25], [0.5, 1]);

    const features = [
        {
            id: 'heatmap',
            icon: Layers,
            title: 'ATS Keyword Heatmap',
            tagline: 'Domain-Agnostic Skill Match & Gap Scan',
            desc: 'Scan your resume against any job description in seconds. Our engine extracts hard technical skills, domain tools, and methodologies, flagging missing keywords before an ATS or recruiter rejects you.',
            badge: '100% Parsing Accuracy',
            preview: 'heatmap'
        },
        {
            id: 'latex',
            icon: FileText,
            title: 'Tailored Resume Export',
            tagline: 'Single-Column ATS PDF & Overleaf .tex',
            desc: 'Never fight broken Word templates again. Export clean, recruiter-approved single-column resumes as publication-grade PDF or editable LaTeX (.tex) for instant Overleaf customization.',
            badge: 'LaTeX + ATS Standard',
            preview: 'latex'
        },
        {
            id: 'prep',
            icon: Compass,
            title: 'Role-Specific Interview Prep',
            tagline: 'Domain Questions, Behavioral STAR & Roadmaps',
            desc: 'Walk into interviews prepared. StackMatch analyzes the target role to generate exact domain questions, architectural trade-offs, STAR behavioral questions, and a day-by-day prep plan.',
            badge: 'Targeted Q&A',
            preview: 'prep'
        },
        {
            id: 'pipeline',
            icon: BookmarkCheck,
            title: 'Smart Job Discovery & Saved Jobs',
            tagline: 'Track Saved Jobs & 1-Click Prep Flow',
            desc: 'Organize your job search by status (Wishlist → Applied → Interviewing → Offered). Every saved job connects directly to your tailored resumes and interview prep.',
            badge: 'Job Tracker',
            preview: 'pipeline'
        }
    ];

    return (
        <section 
            id="features" 
            ref={containerRef} 
            className="relative py-20 sm:py-28 overflow-hidden bg-gradient-to-b from-transparent via-[var(--color-paper-2)]/30 to-transparent"
            aria-label="Interactive Product Showcase"
        >
            <div className="max-w-[var(--container)] mx-auto px-4 sm:px-8 lg:px-12">
                {/* Section Header */}
                <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-20 space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--color-rule)] bg-[var(--color-paper)] text-xs font-semibold text-[var(--color-ink-2)]">
                        <Sparkles className="w-3.5 h-3.5 text-[#163300] dark:text-[#9FE870]" />
                        <span>Interactive Feature System</span>
                    </div>
                    <h2 className="text-3xl sm:text-5xl font-extrabold font-display tracking-tight text-[var(--color-ink)] leading-[1.08]">
                        Every edge you need to go from <span className="text-[#163300] dark:text-[#9FE870]">applied</span> to <span className="text-[#163300] dark:text-[#9FE870]">offered</span>.
                    </h2>
                    <p className="text-base sm:text-lg text-[var(--color-ink-2)] leading-relaxed">
                        Replaced four fragmented tools with one unified workflow: keyword scanning, ATS LaTeX generation, interview prep, and job tracking.
                    </p>
                </div>

                {/* 3D Perspective Motion Container (Replicated from Dribbble shot with 60fps hardware acceleration) */}
                <div style={{ perspective: reduceMotion ? 'none' : '1200px' }} className="w-full">
                    <motion.div
                        style={
                            reduceMotion
                                ? {}
                                : {
                                      rotateX,
                                      scale,
                                      y: translateY,
                                      opacity,
                                      transformStyle: 'preserve-3d',
                                      willChange: 'transform, opacity'
                                  }
                        }
                        className="rounded-2xl sm:rounded-3xl border border-[var(--color-rule)] bg-[var(--color-card)] p-4 sm:p-8 lg:p-10 shadow-2xl transition-shadow"
                    >
                        {/* Interactive Feature Stage Header */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 p-1.5 rounded-2xl bg-[var(--color-paper-2)]/70 border border-[var(--color-rule)] mb-8">
                            {features.map((feat, idx) => {
                                const Icon = feat.icon;
                                const isCurrent = activeFeature === idx;
                                return (
                                    <button
                                        key={feat.id}
                                        type="button"
                                        onClick={() => setActiveFeature(idx)}
                                        className={`flex items-center gap-2.5 p-3 rounded-xl text-left transition-all cursor-pointer ${
                                            isCurrent
                                                ? 'bg-[var(--color-card)] text-[var(--color-ink)] shadow-sm font-semibold'
                                                : 'text-[var(--color-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-card)]/50'
                                        }`}
                                    >
                                        <div className={`p-2 rounded-lg flex-shrink-0 ${
                                            isCurrent 
                                                ? 'bg-[#9FE870] text-[#163300]' 
                                                : 'bg-[var(--color-paper-3)] text-[var(--color-muted)]'
                                        }`}>
                                            <Icon className="w-4 h-4" />
                                        </div>
                                        <div className="min-w-0">
                                            <div className="text-xs sm:text-sm font-bold truncate leading-tight">
                                                {feat.title}
                                            </div>
                                            <div className="text-[10px] text-[var(--color-muted)] truncate hidden sm:block">
                                                {feat.badge}
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Feature Detail Showcase Box */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center min-h-[440px]">
                            {/* Left: Editorial Content */}
                            <div className="lg:col-span-5 space-y-6">
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#9FE870]/20 text-[#163300] dark:text-[#9FE870] border border-[#9FE870]/30">
                                    {features[activeFeature].badge}
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-2xl sm:text-3xl font-extrabold font-display text-[var(--color-ink)] tracking-tight">
                                        {features[activeFeature].title}
                                    </h3>
                                    <p className="text-sm font-semibold text-[#163300] dark:text-[#9FE870]">
                                        {features[activeFeature].tagline}
                                    </p>
                                </div>
                                <p className="text-sm sm:text-base text-[var(--color-ink-2)] leading-relaxed">
                                    {features[activeFeature].desc}
                                </p>

                                <div className="pt-2">
                                    <Link
                                        to="/register"
                                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#163300] text-white hover:bg-[#204a00] dark:bg-[#9FE870] dark:text-[#163300] dark:hover:bg-[#8dd461] text-sm font-bold transition-transform hover:scale-[1.02] shadow-sm"
                                    >
                                        <span>Try with your resume</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </Link>
                                </div>
                            </div>

                            {/* Right: High-Fidelity Domain Mockup Preview */}
                            <div className="lg:col-span-7 rounded-2xl border border-[var(--color-rule)] bg-[var(--color-paper-3)] p-5 sm:p-6 shadow-inner">
                                {activeFeature === 0 && (
                                    <div className="space-y-4 animate-in fade-in duration-200">
                                        <div className="flex items-center justify-between pb-3 border-b border-[var(--color-rule)]">
                                            <span className="text-xs font-mono font-semibold text-[var(--color-muted)]">
                                                SCAN RESULT · SENIOR PRODUCT ENGINEER
                                            </span>
                                            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#9FE870] text-[#163300]">
                                                92% Coverage
                                            </span>
                                        </div>

                                        <div className="space-y-2">
                                            <span className="text-xs font-semibold text-[var(--color-ink)] block">
                                                Matched In Resume (Found in Experience & Projects)
                                            </span>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                                {['React 19', 'TypeScript', 'Node.js', 'PostgreSQL', 'Tailwind CSS', 'AWS Lambda'].map((s) => (
                                                    <div key={s} className="flex items-center gap-1.5 p-2 rounded-lg bg-[var(--color-card)] border border-emerald-500/20 text-xs text-[var(--color-ink)]">
                                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                                                        <span className="truncate">{s}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-2 pt-2">
                                            <span className="text-xs font-semibold text-[var(--color-ink)] block">
                                                Identified Missing Gaps (Injected into Prep Plan)
                                            </span>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                {[
                                                    { name: 'GraphQL Apollo Client', sev: 'Medium Gap' },
                                                    { name: 'End-to-End Testing (Playwright)', sev: 'High Gap' }
                                                ].map((g) => (
                                                    <div key={g.name} className="flex items-center justify-between p-2 rounded-lg bg-[var(--color-card)] border border-amber-500/20 text-xs">
                                                        <div className="flex items-center gap-1.5">
                                                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                                                            <span className="font-medium text-[var(--color-ink)]">{g.name}</span>
                                                        </div>
                                                        <span className="text-[10px] text-amber-700 dark:text-amber-300 font-mono font-semibold">
                                                            {g.sev}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeFeature === 1 && (
                                    <div className="space-y-4 animate-in fade-in duration-200">
                                        <div className="flex items-center justify-between pb-3 border-b border-[var(--color-rule)]">
                                            <div className="flex items-center gap-2">
                                                <FileText className="w-4 h-4 text-[#163300] dark:text-[#9FE870]" />
                                                <span className="text-xs font-mono font-semibold text-[var(--color-ink)]">
                                                    resume_tailored_ats.tex
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                                <span>ATS Parsing Score: 98/100</span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                            <div className="p-3.5 rounded-xl bg-[var(--color-card)] border border-[var(--color-rule)] space-y-2">
                                                <div className="flex items-center gap-1.5 font-bold text-red-600 dark:text-red-400">
                                                    <span>✕ Fragile Graphic Formats</span>
                                                </div>
                                                <p className="text-[var(--color-muted)] text-[11px] leading-relaxed">
                                                    Canva & Word two-column templates get jumbled by parser OCR, misreading dates, skills, and employer titles.
                                                </p>
                                            </div>

                                            <div className="p-3.5 rounded-xl bg-[var(--color-card)] border border-[#9FE870]/40 space-y-2 shadow-xs">
                                                <div className="flex items-center gap-1.5 font-bold text-emerald-700 dark:text-emerald-400">
                                                    <span>✓ StackMatch Clean LaTeX</span>
                                                </div>
                                                <p className="text-[var(--color-muted)] text-[11px] leading-relaxed">
                                                    Single-column, semantic hierarchy, standard margins, and clean ASCII headers. Easily compiled on Overleaf or local TeX.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="p-3 rounded-xl bg-zinc-950 font-mono text-[11px] text-zinc-300 border border-zinc-800 overflow-x-auto">
                                            <code>
                                                \section*{'{'}Technical Experience{'}'}<br />
                                                \textbf{'{'}Senior Systems Architect{'}'} \hfill 2022 -- 2026<br />
                                                \textit{'{'}CloudScale Global{'}'} \hfill San Francisco, CA<br />
                                                \begin{'{'}itemize{'}'}<br />
                                                &nbsp;&nbsp;\item Re-architected data ingestion pipeline handling 120M daily events...
                                            </code>
                                        </div>
                                    </div>
                                )}

                                {activeFeature === 2 && (
                                    <div className="space-y-4 animate-in fade-in duration-200">
                                        <div className="flex items-center justify-between pb-3 border-b border-[var(--color-rule)]">
                                            <span className="text-xs font-mono font-semibold text-[var(--color-muted)]">
                                                INTERVIEW PREP · SYSTEM ARCHITECTURE
                                            </span>
                                            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-[var(--color-paper-2)] text-[var(--color-ink)]">
                                                Day 1 of 5
                                            </span>
                                        </div>

                                        <div className="p-4 rounded-xl bg-[var(--color-card)] border border-[var(--color-rule)] space-y-2.5">
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="font-bold text-[#163300] dark:text-[#9FE870]">
                                                    Core System Design Challenge
                                                </span>
                                                <span className="text-[10px] font-mono text-[var(--color-muted)]">
                                                    Frequency: 90%
                                                </span>
                                            </div>
                                            <p className="text-xs sm:text-sm font-semibold text-[var(--color-ink)]">
                                                "Design a distributed rate limiter that handles 100k requests/second without single-point failure."
                                            </p>
                                            <div className="p-2.5 rounded-lg bg-[var(--color-paper-3)] text-xs text-[var(--color-ink-2)] space-y-1">
                                                <strong className="text-[var(--color-ink)] block">Recommended Response Framework:</strong>
                                                <p className="text-[11px]">
                                                    Sliding window counter algorithm backed by Redis clusters with local memory cache fallback to avoid cluster saturation.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="p-3 rounded-xl bg-[var(--color-card)] border border-[var(--color-rule)] flex items-center justify-between text-xs">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-[#163300] dark:text-[#9FE870]" />
                                                <span className="font-medium text-[var(--color-ink)]">
                                                    Preparation Roadmap: Day 1 (Distributed Caching) → Day 3 (STAR Behavioral) → Day 5 (Mock Pitch)
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeFeature === 3 && (
                                    <div className="space-y-4 animate-in fade-in duration-200">
                                        <div className="flex items-center justify-between pb-3 border-b border-[var(--color-rule)]">
                                            <span className="text-xs font-mono font-semibold text-[var(--color-muted)]">
                                                SAVED JOBS · APPLICATION STATUS
                                            </span>
                                            <span className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold">
                                                3 Active Interviews
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-3 gap-2.5 text-xs">
                                            {/* Column 1 */}
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between px-2 py-1 rounded-md bg-[var(--color-paper-2)] font-mono text-[11px] font-bold text-[var(--color-muted)]">
                                                    <span>WISHLIST</span>
                                                    <span>2</span>
                                                </div>
                                                <div className="p-2.5 rounded-lg bg-[var(--color-card)] border border-[var(--color-rule)] space-y-1">
                                                    <div className="font-semibold text-[var(--color-ink)] truncate">Linear</div>
                                                    <div className="text-[10px] text-[var(--color-muted)]">Frontend Architect</div>
                                                    <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">89% Match</div>
                                                </div>
                                            </div>

                                            {/* Column 2 */}
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between px-2 py-1 rounded-md bg-[var(--color-paper-2)] font-mono text-[11px] font-bold text-[var(--color-muted)]">
                                                    <span>APPLIED</span>
                                                    <span>3</span>
                                                </div>
                                                <div className="p-2.5 rounded-lg bg-[var(--color-card)] border border-[var(--color-rule)] space-y-1">
                                                    <div className="font-semibold text-[var(--color-ink)] truncate">Datadog</div>
                                                    <div className="text-[10px] text-[var(--color-muted)]">Staff SRE</div>
                                                    <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">94% Match</div>
                                                </div>
                                            </div>

                                            {/* Column 3 */}
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between px-2 py-1 rounded-md bg-[#9FE870]/20 font-mono text-[11px] font-bold text-[#163300] dark:text-[#9FE870]">
                                                    <span>INTERVIEW</span>
                                                    <span>1</span>
                                                </div>
                                                <div className="p-2.5 rounded-lg bg-[var(--color-card)] border border-[#9FE870]/50 space-y-1 shadow-xs">
                                                    <div className="font-semibold text-[var(--color-ink)] truncate">Stripe</div>
                                                    <div className="text-[10px] text-[var(--color-muted)]">Core Infra</div>
                                                    <div className="text-[10px] text-[#163300] dark:text-[#9FE870] font-bold">Prep Ready</div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-3 rounded-xl bg-[var(--color-card)] border border-[var(--color-rule)] text-xs text-[var(--color-ink-2)] flex items-center justify-between">
                                            <span>Sync with 1 click to refresh your tailored resume and interview prep.</span>
                                            <span className="font-mono text-[11px] text-[#163300] dark:text-[#9FE870] font-bold">
                                                Instant
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default ScrollShowcase;
