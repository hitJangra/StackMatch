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
    ArrowRight,
    Code2,
    Calendar,
    Target,
    Send,
    FlaskConical,
    MapPin,
    Copy,
    Check,
    Wand2,
    ShieldCheck
} from 'lucide-react';
import { Link } from 'react-router';

// Mouse-tracking spotlight card with subtle #9FE870 radial hover glow
const SpotlightCard = ({ children, className = "", delay = 0, reduceMotion = false }) => {
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);

    const handleMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };

    return (
        <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 28 }}
            whileInView={reduceMotion ? {} : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: reduceMotion ? 0 : 0.45, delay: reduceMotion ? 0 : delay, ease: 'easeOut' }}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`relative overflow-hidden rounded-2xl border border-[var(--color-rule)] bg-[var(--color-card)] p-5 sm:p-6 transition-all duration-300 hover:border-[#9FE870]/60 shadow-xs group ${className}`}
        >
            {isHovered && (
                <div
                    className="pointer-events-none absolute -inset-px transition-opacity duration-300"
                    style={{
                        background: `radial-gradient(350px circle at ${mousePos.x}px ${mousePos.y}px, rgba(159, 232, 112, 0.12), transparent 75%)`
                    }}
                />
            )}
            <div className="relative z-10 flex flex-col justify-between h-full space-y-4">
                {children}
            </div>
        </motion.div>
    );
};

export const ScrollShowcase = () => {
    const containerRef = useRef(null);
    const reduceMotion = useReducedMotion();
    const [activeFeature, setActiveFeature] = useState(0);

    // Track scroll progress of this container
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ['start end', 'end start']
    });

    // 3D perspective scroll transform (straightens smoothly on scroll)
    const rotateX = useTransform(scrollYProgress, [0, 0.35, 0.7, 1], [14, 0, 0, -6]);
    const scale = useTransform(scrollYProgress, [0, 0.35, 0.7, 1], [0.94, 1, 1, 0.96]);
    const translateY = useTransform(scrollYProgress, [0, 0.35], [50, 0]);
    const opacity = useTransform(scrollYProgress, [0, 0.25], [0.6, 1]);

    const interactiveStages = [
        {
            id: 'heatmap',
            icon: Layers,
            title: 'ATS Keyword Heatmap',
            badge: '100% Parsing Accuracy',
            preview: 'heatmap'
        },
        {
            id: 'latex',
            icon: FileText,
            title: 'Overleaf LaTeX Export',
            badge: 'Publication Typography',
            preview: 'latex'
        },
        {
            id: 'prep',
            icon: Compass,
            title: 'Role-Specific Prep',
            badge: 'Targeted Q&A',
            preview: 'prep'
        },
        {
            id: 'pipeline',
            icon: BookmarkCheck,
            title: 'Saved Jobs Pipeline',
            badge: '1-Click Match Sync',
            preview: 'pipeline'
        }
    ];

    return (
        <section 
            id="features" 
            ref={containerRef} 
            className="relative py-16 sm:py-24 overflow-hidden bg-gradient-to-b from-transparent via-[var(--color-paper-2)]/30 to-transparent"
            aria-label="Features Showcase"
        >
            <div className="max-w-[var(--container)] mx-auto px-4 sm:px-8 lg:px-12 space-y-16 sm:space-y-20">
                {/* Section Header */}
                <div className="text-center max-w-2xl mx-auto space-y-3">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--color-rule)] bg-[var(--color-paper)] text-xs font-semibold text-[var(--color-ink-2)]">
                        <span className="w-2 h-2 rounded-full bg-[#9FE870]" />
                        <span>Core Product Suite</span>
                    </div>
                    <h2 className="text-2xl sm:text-4xl font-extrabold font-display tracking-tight text-[var(--color-ink)] leading-tight">
                        Every tool you need to turn applications into interviews.
                    </h2>
                    <p className="text-sm sm:text-base text-[var(--color-ink-2)]">
                        Six precision workflows engineered to beat keyword filters and prepare you for hiring loops.
                    </p>
                </div>

                {/* 3D Perspective Motion Container (Straightens on scroll) */}
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
                        className="rounded-2xl sm:rounded-3xl border border-[var(--color-rule)] bg-[var(--color-card)] p-4 sm:p-7 shadow-xl transition-shadow"
                    >
                        {/* Tab Switcher */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 p-1.5 rounded-2xl bg-[var(--color-paper-2)]/70 border border-[var(--color-rule)] mb-6">
                            {interactiveStages.map((feat, idx) => {
                                const Icon = feat.icon;
                                const isCurrent = activeFeature === idx;
                                return (
                                    <button
                                        key={feat.id}
                                        type="button"
                                        onClick={() => setActiveFeature(idx)}
                                        className={`flex items-center gap-2.5 p-2.5 sm:p-3 rounded-xl text-left transition-all cursor-pointer ${
                                            isCurrent
                                                ? 'bg-[var(--color-card)] text-[var(--color-ink)] shadow-xs font-semibold'
                                                : 'text-[var(--color-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-card)]/50'
                                        }`}
                                    >
                                        <div className={`p-1.5 rounded-lg flex-shrink-0 ${
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

                        {/* Interactive Stage Preview Box */}
                        <div className="rounded-2xl border border-[var(--color-rule)] bg-[var(--color-paper-3)] p-5 sm:p-6 shadow-inner min-h-[300px]">
                            {activeFeature === 0 && (
                                <div className="space-y-4 animate-in fade-in duration-200">
                                    <div className="flex items-center justify-between pb-3 border-b border-[var(--color-rule)]">
                                        <span className="text-xs font-mono font-semibold text-[var(--color-muted)]">
                                            SEMANTIC EXTRACTION · STAFF SYSTEMS ENGINEER
                                        </span>
                                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#9FE870] text-[#163300]">
                                            92% Match Score
                                        </span>
                                    </div>
                                    <div className="space-y-2">
                                        <span className="text-xs font-semibold text-[var(--color-ink)] block">
                                            Matched In Resume
                                        </span>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                            {['React 19', 'TypeScript', 'Node.js', 'PostgreSQL', 'Distributed Systems', 'Redis Caching'].map((s) => (
                                                <div key={s} className="flex items-center gap-1.5 p-2 rounded-lg bg-[var(--color-card)] border border-emerald-500/20 text-xs text-[var(--color-ink)]">
                                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                                                    <span className="truncate">{s}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-2 pt-1">
                                        <span className="text-xs font-semibold text-[var(--color-ink)] block">
                                            Identified Missing Gaps (Injected into Prep Plan)
                                        </span>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            {[
                                                { name: 'Kubernetes Cluster Architecture', sev: 'Priority Gap' },
                                                { name: 'Terraform IaC Pipelines', sev: 'Secondary Gap' }
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
                                <div className="space-y-3 animate-in fade-in duration-200">
                                    <div className="flex items-center justify-between pb-3 border-b border-[var(--color-rule)]">
                                        <div className="flex items-center gap-2">
                                            <FileText className="w-4 h-4 text-[#163300] dark:text-[#9FE870]" />
                                            <span className="text-xs font-mono font-semibold text-[var(--color-ink)]">
                                                resume_tailored_ats.tex
                                            </span>
                                        </div>
                                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                            <span>ATS Grade A+</span>
                                        </span>
                                    </div>
                                    <pre className="p-3.5 rounded-xl bg-zinc-950 font-mono text-xs text-zinc-300 border border-zinc-800 overflow-x-auto leading-relaxed">
{`\\documentclass[letterpaper,10pt]{article}
\\usepackage[empty]{fullpage}
\\begin{document}
\\section*{Technical Experience}
\\textbf{Senior Systems Engineer} \\hfill 2023 -- Present \\\\
\\begin{itemize}
  \\item Architected transaction ledger handling 45k ops/sec with PostgreSQL \\& Redis.
  \\item Deployed automated helm charts on AWS EKS to bridge Kubernetes skill gaps.
\\end{itemize}
\\end{document}`}
                                    </pre>
                                </div>
                            )}

                            {activeFeature === 2 && (
                                <div className="space-y-3 animate-in fade-in duration-200">
                                    <div className="flex items-center justify-between pb-3 border-b border-[var(--color-rule)]">
                                        <span className="text-xs font-mono font-semibold text-[var(--color-muted)]">
                                            TARGETED INTERVIEW PREPARATION
                                        </span>
                                        <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-[#9FE870] text-[#163300]">
                                            STAR Framework
                                        </span>
                                    </div>
                                    <div className="p-3.5 rounded-xl bg-[var(--color-card)] border border-[var(--color-rule)] space-y-2">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="font-bold text-[#163300] dark:text-[#9FE870]">
                                                Core System Design Question
                                            </span>
                                            <span className="text-[10px] font-mono text-[var(--color-muted)]">Frequency: 92%</span>
                                        </div>
                                        <p className="text-xs sm:text-sm font-semibold text-[var(--color-ink)]">
                                            "How would you ensure webhook idempotency across concurrent payment transactions?"
                                        </p>
                                        <p className="text-xs text-[var(--color-ink-2)] bg-[var(--color-paper-3)] p-2 rounded-lg">
                                            <strong>Key Approach:</strong> Distributed lock via Redis + unique constraint idempotency keys in PostgreSQL.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {activeFeature === 3 && (
                                <div className="space-y-3 animate-in fade-in duration-200">
                                    <div className="flex items-center justify-between pb-3 border-b border-[var(--color-rule)]">
                                        <span className="text-xs font-mono font-semibold text-[var(--color-muted)]">
                                            SAVED JOBS PIPELINE
                                        </span>
                                        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                                            1-Click Prep Sync
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2.5 text-xs">
                                        <div className="p-3 rounded-xl bg-[var(--color-card)] border border-[var(--color-rule)] space-y-1">
                                            <div className="text-[10px] font-mono font-bold text-[var(--color-muted)]">WISHLIST (2)</div>
                                            <div className="font-semibold text-[var(--color-ink)] truncate">Linear</div>
                                            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">89% Match</div>
                                        </div>
                                        <div className="p-3 rounded-xl bg-[var(--color-card)] border border-[var(--color-rule)] space-y-1">
                                            <div className="text-[10px] font-mono font-bold text-[var(--color-muted)]">APPLIED (3)</div>
                                            <div className="font-semibold text-[var(--color-ink)] truncate">Datadog</div>
                                            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">94% Match</div>
                                        </div>
                                        <div className="p-3 rounded-xl bg-[var(--color-card)] border border-[#9FE870]/50 space-y-1 shadow-xs">
                                            <div className="text-[10px] font-mono font-bold text-[#163300] dark:text-[#9FE870]">INTERVIEW (1)</div>
                                            <div className="font-semibold text-[var(--color-ink)] truncate">Stripe</div>
                                            <div className="text-[10px] text-[#163300] dark:text-[#9FE870] font-bold">Prep Ready</div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>

                {/* ── 6-Feature Visual Bento Grid with Spotlight Hover Glow ── */}
                <div className="space-y-6">
                    <div className="text-center max-w-xl mx-auto space-y-1.5">
                        <h3 className="text-xl sm:text-2xl font-bold font-display text-[var(--color-ink)]">
                            All 6 StackMatch Capabilities
                        </h3>
                        <p className="text-xs sm:text-sm text-[var(--color-ink-2)]">
                            Compact visual previews of everything in your workspace.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {/* 1. ATS Keyword Heatmap */}
                        <SpotlightCard delay={0} reduceMotion={reduceMotion}>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="p-2 rounded-xl bg-[#9FE870]/20 text-[#163300] dark:text-[#9FE870]">
                                        <Layers className="w-4 h-4" />
                                    </div>
                                    <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                        88% Semantic Match
                                    </span>
                                </div>
                                <h4 className="font-bold text-sm text-[var(--color-ink)]">
                                    ATS Keyword Heatmap
                                </h4>
                                <p className="text-xs text-[var(--color-ink-2)]">
                                    Live matched skills vs. prioritized gap tags extracted from any JD.
                                </p>
                            </div>

                            {/* Mini UI Preview */}
                            <div className="p-3 rounded-xl bg-[var(--color-paper-2)]/60 border border-[var(--color-rule)] space-y-2">
                                <div className="flex flex-wrap gap-1.5">
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                                        ✓ React 19
                                    </span>
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                                        ✓ TypeScript
                                    </span>
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                                        ✓ PostgreSQL
                                    </span>
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-500/15 text-amber-700 dark:text-amber-300">
                                        ! Kubernetes (High Gap)
                                    </span>
                                </div>
                            </div>
                        </SpotlightCard>

                        {/* 2. Overleaf .tex & ATS PDF Export */}
                        <SpotlightCard delay={0.08} reduceMotion={reduceMotion}>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="p-2 rounded-xl bg-[#9FE870]/20 text-[#163300] dark:text-[#9FE870]">
                                        <Code2 className="w-4 h-4" />
                                    </div>
                                    <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-[#9FE870] text-[#163300]">
                                        Overleaf 1-Click
                                    </span>
                                </div>
                                <h4 className="font-bold text-sm text-[var(--color-ink)]">
                                    Overleaf .tex & ATS PDF
                                </h4>
                                <p className="text-xs text-[var(--color-ink-2)]">
                                    Single-column publication-grade LaTeX that never breaks ATS parsers.
                                </p>
                            </div>

                            {/* Mini UI Preview */}
                            <div className="p-2.5 rounded-xl bg-zinc-950 font-mono text-[10px] text-zinc-300 border border-zinc-800 space-y-1">
                                <div className="text-zinc-500">// resume.tex</div>
                                <div className="text-[#9FE870]">\documentclass[10pt]{'{'}article{'}'}</div>
                                <div className="truncate">\item Optimized ledger to 45k ops/sec</div>
                            </div>
                        </SpotlightCard>

                        {/* 3. Outreach Hub */}
                        <SpotlightCard delay={0.16} reduceMotion={reduceMotion}>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="p-2 rounded-xl bg-[#9FE870]/20 text-[#163300] dark:text-[#9FE870]">
                                        <Send className="w-4 h-4" />
                                    </div>
                                    <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-[var(--color-paper-2)] text-[var(--color-ink)]">
                                        Direct Tone
                                    </span>
                                </div>
                                <h4 className="font-bold text-sm text-[var(--color-ink)]">
                                    Outreach Hub
                                </h4>
                                <p className="text-xs text-[var(--color-ink-2)]">
                                    High-converting LinkedIn referral DMs, cold emails, and cover letters.
                                </p>
                            </div>

                            {/* Mini UI Preview */}
                            <div className="p-3 rounded-xl bg-[var(--color-paper-2)]/60 border border-[var(--color-rule)] space-y-1.5 text-xs">
                                <div className="flex items-center justify-between text-[10px] text-[var(--color-muted)] font-mono">
                                    <span>Referral DM</span>
                                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">84 words</span>
                                </div>
                                <p className="text-[11px] text-[var(--color-ink-2)] line-clamp-2 leading-relaxed italic">
                                    "Hi Sarah — saw the Staff role at Stripe. Scaled our distributed transaction ledger to 45k ops/sec..."
                                </p>
                            </div>
                        </SpotlightCard>

                        {/* 4. Resume Lab */}
                        <SpotlightCard delay={0.24} reduceMotion={reduceMotion}>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="p-2 rounded-xl bg-[#9FE870]/20 text-[#163300] dark:text-[#9FE870]">
                                        <FlaskConical className="w-4 h-4" />
                                    </div>
                                    <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#9FE870] text-[#163300]">
                                        91 / 100 Score
                                    </span>
                                </div>
                                <h4 className="font-bold text-sm text-[var(--color-ink)]">
                                    Resume Lab
                                </h4>
                                <p className="text-xs text-[var(--color-ink-2)]">
                                    Standalone ATS health audit and Google XYZ bullet enhancer.
                                </p>
                            </div>

                            {/* Mini UI Preview */}
                            <div className="p-3 rounded-xl bg-[var(--color-paper-2)]/60 border border-[var(--color-rule)] space-y-1.5 text-xs">
                                <div className="text-[10px] text-zinc-400 line-through">
                                    Helped with checkout page performance
                                </div>
                                <div className="text-[11px] font-semibold text-[#163300] dark:text-[#9FE870] leading-snug">
                                    → Accelerated checkout flow by 38% for 2M users via Redis caching
                                </div>
                            </div>
                        </SpotlightCard>

                        {/* 5. Location-Filtered Jobs */}
                        <SpotlightCard delay={0.32} reduceMotion={reduceMotion}>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="p-2 rounded-xl bg-[#9FE870]/20 text-[#163300] dark:text-[#9FE870]">
                                        <MapPin className="w-4 h-4" />
                                    </div>
                                    <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-[var(--color-paper-2)] text-[var(--color-ink)]">
                                        Active Scraper
                                    </span>
                                </div>
                                <h4 className="font-bold text-sm text-[var(--color-ink)]">
                                    Location-Filtered Jobs
                                </h4>
                                <p className="text-xs text-[var(--color-ink-2)]">
                                    Real-time job matching across India tech hubs and remote roles.
                                </p>
                            </div>

                            {/* Mini UI Preview */}
                            <div className="p-2.5 rounded-xl bg-[var(--color-paper-2)]/60 border border-[var(--color-rule)] space-y-2">
                                <div className="flex flex-wrap gap-1">
                                    {['All India', 'Remote', 'Bengaluru', 'Hyderabad'].map((loc, i) => (
                                        <span
                                            key={loc}
                                            className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                                                i === 0
                                                    ? 'bg-[#9FE870] text-[#163300] font-bold'
                                                    : 'bg-[var(--color-card)] text-[var(--color-muted)]'
                                            }`}
                                        >
                                            {loc}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </SpotlightCard>

                        {/* 6. STAR Interview Practice */}
                        <SpotlightCard delay={0.4} reduceMotion={reduceMotion}>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="p-2 rounded-xl bg-[#9FE870]/20 text-[#163300] dark:text-[#9FE870]">
                                        <CheckCircle2 className="w-4 h-4" />
                                    </div>
                                    <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                        Score: 9.4 / 10
                                    </span>
                                </div>
                                <h4 className="font-bold text-sm text-[var(--color-ink)]">
                                    STAR Interview Practice
                                </h4>
                                <p className="text-xs text-[var(--color-ink-2)]">
                                    Practice draft answers with instant readiness scoring and feedback.
                                </p>
                            </div>

                            {/* Mini UI Preview */}
                            <div className="p-3 rounded-xl bg-[var(--color-paper-2)]/60 border border-[var(--color-rule)] space-y-2 text-xs">
                                <div className="flex items-center justify-between text-[10px] font-mono text-[var(--color-muted)]">
                                    <span>STAR Checklist</span>
                                    <span className="text-[#163300] dark:text-[#9FE870] font-bold">4/4 Passed</span>
                                </div>
                                <div className="grid grid-cols-4 gap-1 text-center font-mono text-[10px] font-bold">
                                    <span className="p-1 rounded bg-[#9FE870]/20 text-[#163300] dark:text-[#9FE870]">S ✓</span>
                                    <span className="p-1 rounded bg-[#9FE870]/20 text-[#163300] dark:text-[#9FE870]">T ✓</span>
                                    <span className="p-1 rounded bg-[#9FE870]/20 text-[#163300] dark:text-[#9FE870]">A ✓</span>
                                    <span className="p-1 rounded bg-[#9FE870]/20 text-[#163300] dark:text-[#9FE870]">R ✓</span>
                                </div>
                            </div>
                        </SpotlightCard>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ScrollShowcase;
