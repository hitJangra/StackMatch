import React, { useEffect, useRef, useState } from 'react';
import {
    AnimatePresence,
    motion,
    useMotionTemplate,
    useMotionValue,
} from 'framer-motion';
import {
    AlertTriangle,
    Bookmark,
    Briefcase,
    Check,
    FileCode2,
    FileDown,
    FileSearch,
    FileText,
    MapPin,
    MessageSquare,
    Send,
    Target,
} from 'lucide-react';
import Reveal from './Reveal';
import { KINETIC_EASE, SectionIndex } from './KineticPrimitives';

/* -------------------------------------------------------------------------- */
/* Hoisted visual preview frames (replace any inner block with <img> later)   */
/* -------------------------------------------------------------------------- */

function FindJobsPreview() {
    const filters = ['Bengaluru', 'Remote', '0–2 yrs', 'Full-time', 'Internship'];
    const roles = [
        { mark: 'R', title: 'Frontend Engineer', meta: 'Razorpay · Bengaluru · Full-time', saved: true },
        { mark: 'L', title: 'Full-Stack Developer', meta: 'Linear · Remote · Mid-level', saved: false },
        { mark: 'S', title: 'SWE Intern (React/Node)', meta: 'Swiggy · Hyderabad · Internship', saved: false },
    ];

    return (
        <div className="flex h-full flex-col justify-between gap-3">
            <div className="flex flex-wrap gap-1.5">
                {filters.map((chip, idx) => (
                    <span
                        key={chip}
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${
                            idx === 0
                                ? 'bg-[#9FE870] text-[#163300]'
                                : 'border border-[var(--color-rule)] bg-[var(--color-card)] text-[var(--color-ink-2)]'
                        }`}
                    >
                        {idx === 0 ? <MapPin size={11} /> : null}
                        {chip}
                    </span>
                ))}
            </div>

            <div className="space-y-2">
                {roles.map((role) => (
                    <div
                        key={role.title}
                        className="flex items-center gap-2.5 rounded-xl border border-[var(--color-rule)] bg-[var(--color-card)] px-3 py-2.5"
                    >
                        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-[var(--color-paper-2)] font-mono text-[11px] font-bold text-[var(--color-ink)]">
                            {role.mark}
                        </span>
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-bold text-[var(--color-ink)]">
                                {role.title}
                            </p>
                            <p className="truncate text-[11px] text-[var(--color-muted)]">
                                {role.meta}
                            </p>
                        </div>
                        <Bookmark
                            size={14}
                            className={`shrink-0 ${
                                role.saved
                                    ? 'fill-[#9FE870] text-[#163300] dark:text-[#9FE870]'
                                    : 'text-[var(--color-muted)]'
                            }`}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}

function MatchJDPreview() {
    const keywords = [
        { name: 'React 19', match: true },
        { name: 'TypeScript', match: true },
        { name: 'Node.js', match: true },
        { name: 'Redis', match: false },
        { name: 'GraphQL', match: false },
    ];

    return (
        <div className="flex h-full flex-col justify-between gap-2.5">
            <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-[var(--color-rule)] bg-[var(--color-card)] p-3">
                {keywords.map((item) => (
                    <span
                        key={item.name}
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                            item.match
                                ? 'border border-emerald-500/25 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300'
                                : 'border border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-300'
                        }`}
                    >
                        {item.match ? <Check size={10} /> : <AlertTriangle size={10} />}
                        {item.name}
                    </span>
                ))}
            </div>

            <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-white/10 bg-[#0D120C]">
                <div className="flex items-center justify-between gap-2 border-b border-white/10 px-3 py-2">
                    <div className="flex items-center gap-2">
                        <span className="flex gap-1">
                            <span className="h-2 w-2 rounded-full bg-red-400/80" />
                            <span className="h-2 w-2 rounded-full bg-amber-400/80" />
                            <span className="h-2 w-2 rounded-full bg-emerald-400/80" />
                        </span>
                        <span className="font-mono text-[10px] text-zinc-400">tailored_resume.tex</span>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#9FE870] px-2.5 py-0.5 text-[10px] font-bold text-[#163300]">
                        <FileCode2 size={10} />
                        Overleaf ready
                    </span>
                </div>
                <pre className="flex-1 overflow-hidden p-3 font-mono text-[10px] leading-relaxed text-zinc-300">
{`\\section*{Experience}
\\item Cut checkout latency 38\\% with Redis caching
\\item Built GraphQL gateway serving 1.4M req/day`}
                </pre>
            </div>
        </div>
    );
}

function PrepModePreview() {
    const starSteps = [
        { letter: 'S', done: true },
        { letter: 'T', done: true },
        { letter: 'A', done: true },
        { letter: 'R', done: false },
    ];

    return (
        <div className="flex h-full flex-col justify-between gap-2.5">
            <div className="rounded-xl border border-[var(--color-rule)] bg-[var(--color-card)] p-3.5">
                <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--color-muted)]">
                        Behavioral &amp; Tech · Q3 / 12
                    </span>
                    <span className="rounded-full bg-[#9FE870] px-2.5 py-0.5 text-[10px] font-extrabold text-[#163300]">
                        AI Check: 8.6/10
                    </span>
                </div>
                <p className="mt-2 text-xs font-bold leading-snug text-[var(--color-ink)]">
                    &ldquo;Tell me about a production bottleneck you diagnosed under a tight deadline.&rdquo;
                </p>
                <div className="mt-3 grid grid-cols-4 gap-1.5">
                    {starSteps.map((step) => (
                        <div
                            key={step.letter}
                            className={`flex items-center justify-center gap-1 rounded-lg py-1.5 text-[10px] font-bold ${
                                step.done
                                    ? 'bg-[#9FE870]/25 text-[#163300] dark:text-[#9FE870]'
                                    : 'border border-dashed border-amber-500/45 bg-amber-500/10 text-amber-800 dark:text-amber-300'
                            }`}
                        >
                            <span>{step.letter}</span>
                            {step.done ? <Check size={10} /> : null}
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-dashed border-[var(--color-rule)] bg-[var(--color-card)] px-3.5 py-2.5">
                <span className="inline-flex items-center gap-2 text-xs font-bold text-[var(--color-ink)]">
                    <FileDown size={14} className="text-[#163300] dark:text-[#9FE870]" />
                    <span>Prep Roadmap PDF</span>
                </span>
                <span className="font-mono text-[10px] font-semibold text-[var(--color-muted)]">
                    Q&amp;As + study plan
                </span>
            </div>
        </div>
    );
}

function ResumeLabPreview() {
    return (
        <div className="flex h-full flex-col justify-between gap-2.5">
            <div className="flex items-center justify-between rounded-xl border border-[var(--color-rule)] bg-[var(--color-card)] px-3.5 py-2.5">
                <span className="text-xs font-semibold text-[var(--color-ink-2)]">
                    Standalone ATS Audit (No JD)
                </span>
                <span className="rounded-full bg-[#9FE870] px-2.5 py-0.5 font-mono text-xs font-extrabold text-[#163300]">
                    91 / 100
                </span>
            </div>

            <div className="rounded-xl border border-[var(--color-rule)] bg-[var(--color-card)] p-3">
                <p className="font-mono text-[10px] uppercase tracking-wider text-[var(--color-muted)]">
                    Before
                </p>
                <p className="mt-1 text-xs text-[var(--color-muted)] line-through">
                    Worked on checkout page performance and fixed slow backend queries.
                </p>
            </div>

            <div className="rounded-xl border border-[#9FE870]/60 bg-[#9FE870]/12 p-3">
                <span className="inline-block rounded bg-[#9FE870] px-1.5 py-0.5 font-mono text-[9px] font-extrabold text-[#163300]">
                    XYZ BULLET ENHANCER
                </span>
                <p className="mt-1.5 text-xs leading-relaxed font-semibold text-[var(--color-ink)]">
                    Cut checkout latency 38% (520ms to 320ms) for 2M users by indexing MongoDB
                    queries and adding Redis caching.
                </p>
            </div>
        </div>
    );
}

function OutreachHubPreview() {
    const tabs = ['Cold Email', 'Referral DM', 'Cover Letter', 'App Q&A'];

    return (
        <div className="flex h-full flex-col justify-between gap-2.5">
            <div className="flex flex-wrap gap-1.5">
                {tabs.map((tab, idx) => (
                    <span
                        key={tab}
                        className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                            idx === 0
                                ? 'bg-[#9FE870] text-[#163300]'
                                : 'border border-[var(--color-rule)] bg-[var(--color-card)] text-[var(--color-ink-2)]'
                        }`}
                    >
                        {tab}
                    </span>
                ))}
            </div>

            <div className="flex flex-1 flex-col justify-between rounded-xl border border-[var(--color-rule)] bg-[var(--color-card)] p-3.5">
                <div className="flex items-center gap-2">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#163300] text-[10px] font-bold text-[#9FE870]">
                        SC
                    </span>
                    <div className="min-w-0">
                        <p className="truncate text-xs font-bold text-[var(--color-ink)]">
                            Sarah Chen · Engineering Manager
                        </p>
                        <p className="truncate font-mono text-[10px] text-[var(--color-muted)]">
                            Stripe · Frontend Systems
                        </p>
                    </div>
                </div>

                <p className="mt-2.5 rounded-lg border border-[var(--color-rule)] bg-[var(--color-paper-3)] p-2.5 text-xs leading-relaxed text-[var(--color-ink-2)]">
                    Hi Sarah, saw your team is hiring for Frontend Systems. I recently cut checkout
                    latency 38% and built an accessible design system. Would love to share a quick
                    note on how I&apos;d approach your payments UI.
                </p>

                <div className="mt-2.5 flex items-center justify-between text-[10px] text-[var(--color-muted)]">
                    <span className="inline-flex items-center gap-1 font-mono">
                        <MessageSquare size={11} />
                        JD-matched draft
                    </span>
                    <span className="font-semibold text-[#163300] dark:text-[#9FE870]">
                        Ready to copy
                    </span>
                </div>
            </div>
        </div>
    );
}

function SavedJobsPreview() {
    const saved = [
        { mark: 'L', role: 'Product Engineer · Linear', status: 'Match 88%', next: 'Prep Mode' },
        { mark: 'S', role: 'Frontend SDE-2 · Swiggy', status: 'Bookmarked', next: 'Match a JD' },
        { mark: 'A', role: 'Full-Stack Dev · Atlassian', status: 'Roadmap PDF', next: 'Apply' },
    ];

    return (
        <div className="flex h-full flex-col justify-center gap-2">
            {saved.map((item) => (
                <div
                    key={item.role}
                    className="flex items-center gap-2.5 rounded-xl border border-[var(--color-rule)] bg-[var(--color-card)] px-3 py-2.5"
                >
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-[var(--color-paper-2)] font-mono text-[11px] font-bold text-[var(--color-ink)]">
                        {item.mark}
                    </span>
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-bold text-[var(--color-ink)]">
                            {item.role}
                        </p>
                        <p className="font-mono text-[10px] text-[var(--color-muted)]">
                            {item.status}
                        </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-[#9FE870] px-2.5 py-1 text-[10px] font-extrabold text-[#163300]">
                        {item.next}
                    </span>
                </div>
            ))}
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* Feature metadata array (declared after hoisted preview components)         */
/* -------------------------------------------------------------------------- */

const FEATURES = [
    {
        id: 'find-jobs',
        code: '01',
        name: 'Find Jobs',
        tagline: 'Search India cities, remote, and global roles in one feed.',
        description:
            'Filter openings by Indian cities, Remote, or international hubs alongside experience level and job type (Full-time, Internship, Part-time).',
        highlights: ['India city filters + Remote', 'Experience & job-type filters', 'Save directly to shortlist'],
        icon: Briefcase,
        Preview: FindJobsPreview,
    },
    {
        id: 'match-jd',
        code: '02',
        name: 'Match a JD',
        tagline: 'Score your resume against any JD and export an Overleaf .tex file.',
        description:
            'Inspect matched vs. missing keywords against the exact job description, then download a clean Overleaf-style .tex resume tailored to that role.',
        highlights: ['JD match score & gap heatmap', 'Tailored Overleaf .tex download', 'ATS-safe single-column layout'],
        icon: FileText,
        Preview: MatchJDPreview,
    },
    {
        id: 'prep-mode',
        code: '03',
        name: 'Prep Mode',
        tagline: 'Practice JD-specific Q&As, get AI answer checks, and export a PDF.',
        description:
            'Review behavioral and technical questions with reference answers, submit your own response for AI grading, and download your Prep Roadmap PDF.',
        highlights: ['Behavioral & technical Q&As', 'AI feedback on your answers', 'Downloadable Prep Roadmap PDF'],
        icon: Target,
        Preview: PrepModePreview,
    },
    {
        id: 'resume-lab',
        code: '04',
        name: 'Resume Lab',
        tagline: 'Run a standalone ATS audit and upgrade bullets into XYZ format.',
        description:
            'Score your resume anytime without a job description, catch clarity issues, and rewrite weak lines into measurable XYZ impact bullets.',
        highlights: ['Standalone ATS audit (no JD)', 'XYZ Bullet Enhancer', 'Clear action & metric prompts'],
        icon: FileSearch,
        Preview: ResumeLabPreview,
    },
    {
        id: 'outreach-hub',
        code: '05',
        name: 'Outreach Hub',
        tagline: 'Draft JD-specific emails, referral DMs, cover letters & app Q&As.',
        description:
            'Generate tailored cold emails, LinkedIn referral notes, custom cover letters, and application answers like "Why do you want to join this company?"',
        highlights: ['Cold emails & LinkedIn DMs', 'JD-specific cover letters', 'In-app Q&A answers'],
        icon: Send,
        Preview: OutreachHubPreview,
    },
    {
        id: 'saved-jobs',
        code: '06',
        name: 'Saved Jobs',
        tagline: 'Keep shortlisted roles ready for matching, prep, and applying.',
        description:
            'Bookmark roles from Find Jobs so you can come back later to apply, run a Match a JD scan, or launch straight into Prep Mode.',
        highlights: ['Apply-later job shortlist', 'One-click Match a JD', 'Jump straight into Prep Mode'],
        icon: Bookmark,
        Preview: SavedJobsPreview,
    },
];

const VISIBLE_STACK_DEPTH = 4;

const LAYER_STYLES = [
    { y: 0, x: 0, scale: 1, rotate: 0, opacity: 1 },
    { y: 18, x: 10, scale: 0.965, rotate: 1.4, opacity: 0.92 },
    { y: 34, x: 18, scale: 0.93, rotate: 2.6, opacity: 0.78 },
    { y: 48, x: 24, scale: 0.895, rotate: 3.6, opacity: 0.56 },
];

const CARD_SPRING = {
    type: 'spring',
    stiffness: 300,
    damping: 28,
    mass: 0.85,
};

const cardVariants = {
    enter: () => ({
        y: 62,
        x: 28,
        scale: 0.87,
        rotate: 4,
        opacity: 0,
    }),
    stacked: (custom) => {
        const layer = LAYER_STYLES[custom.depth] || LAYER_STYLES[LAYER_STYLES.length - 1];
        return {
            y: layer.y,
            x: layer.x,
            scale: layer.scale,
            rotate: layer.rotate,
            opacity: layer.opacity,
            transition: CARD_SPRING,
        };
    },
    exit: (custom) => {
        if (custom.isPeeling) {
            const dir = custom.direction || -1;
            return {
                x: dir * 380,
                y: 26,
                rotate: dir * 13,
                scale: 0.92,
                opacity: 0,
                transition: { duration: 0.34, ease: KINETIC_EASE },
            };
        }
        return {
            opacity: 0,
            scale: 0.9,
            y: 44,
            transition: { duration: 0.22, ease: KINETIC_EASE },
        };
    },
};

function DeckCard({ feature, depth, direction, isPeeling, onRollNext }) {
    const isFront = depth === 0;
    const Icon = feature.icon;
    const Preview = feature.Preview;

    const didDragRef = useRef(false);
    const pointerX = useMotionValue(0);
    const pointerY = useMotionValue(0);
    const spotlightBg = useMotionTemplate`radial-gradient(420px circle at ${pointerX}px ${pointerY}px, rgba(159, 232, 112, 0.16), transparent 68%)`;

    function handleMouseMove(event) {
        if (!isFront) return;
        const rect = event.currentTarget.getBoundingClientRect();
        pointerX.set(event.clientX - rect.left);
        pointerY.set(event.clientY - rect.top);
    }

    function handleCardClick() {
        if (didDragRef.current) return;
        onRollNext(-1);
    }

    function handleKeyDown(event) {
        if (!isFront) return;
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onRollNext(-1);
        }
    }

    return (
        <motion.article
            custom={{ depth, direction, isPeeling }}
            variants={cardVariants}
            initial="enter"
            animate="stacked"
            exit="exit"
            style={{
                zIndex: isPeeling ? 50 : 30 - depth,
                transformOrigin: 'center bottom',
            }}
            drag={isFront ? 'x' : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.45}
            onDragStart={() => {
                didDragRef.current = true;
            }}
            onDragEnd={(_, info) => {
                const swipedEnough =
                    Math.abs(info.offset.x) > 85 || Math.abs(info.velocity.x) > 420;
                if (swipedEnough) {
                    onRollNext(info.offset.x < 0 ? -1 : 1);
                }
                window.setTimeout(() => {
                    didDragRef.current = false;
                }, 60);
            }}
            onMouseMove={handleMouseMove}
            onClick={handleCardClick}
            onKeyDown={handleKeyDown}
            tabIndex={isFront ? 0 : -1}
            role={isFront ? 'button' : undefined}
            aria-label={
                isFront
                    ? `${feature.name}: click or drag to roll to next feature`
                    : undefined
            }
            className={`group absolute inset-0 flex select-none flex-col justify-between overflow-hidden rounded-3xl border bg-[var(--color-card)] p-5 shadow-[0_24px_60px_rgba(14,15,12,0.1)] transition-colors sm:p-7 dark:shadow-[0_24px_60px_rgba(0,0,0,0.45)] ${
                isFront
                    ? 'cursor-pointer border-[var(--color-rule)] hover:border-[#9FE870] active:cursor-grabbing'
                    : 'cursor-pointer border-[var(--color-rule)]'
            }`}
        >
            {isFront ? (
                <motion.div
                    aria-hidden="true"
                    style={{ background: spotlightBg }}
                    className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                />
            ) : null}

            {/* Header row */}
            <div className="relative z-10 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#9FE870] text-[#163300]">
                        <Icon size={18} strokeWidth={2.25} />
                    </span>
                    <div>
                        <span className="block font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--color-muted)]">
                            Module {feature.code} / 06
                        </span>
                        <h3 className="font-[family-name:var(--font-display)] text-xl font-extrabold leading-tight tracking-tight text-[var(--color-ink)] sm:text-2xl">
                            {feature.name}
                        </h3>
                    </div>
                </div>

                <span className="shrink-0 rounded-full border border-dashed border-[var(--color-rule)] bg-[var(--color-paper-3)] px-3 py-1 font-mono text-[11px] font-semibold text-[var(--color-ink-2)] transition-colors group-hover:border-[#9FE870] group-hover:text-[var(--color-ink)]">
                    Click card &rarr;
                </span>
            </div>

            {/* Split copy + screenshot-ready preview frame */}
            <div className="relative z-10 mt-5 grid flex-1 grid-cols-1 gap-5 lg:grid-cols-12 lg:items-stretch">
                <div className="flex flex-col justify-center space-y-3.5 lg:col-span-5">
                    <p className="font-[family-name:var(--font-display)] text-base font-bold leading-snug text-[var(--color-ink)] sm:text-lg">
                        {feature.tagline}
                    </p>
                    <p className="text-xs leading-relaxed text-[var(--color-ink-2)] sm:text-sm">
                        {feature.description}
                    </p>
                    <ul className="space-y-1.5 pt-1">
                        {feature.highlights.map((point) => (
                            <li
                                key={point}
                                className="flex items-center gap-2 text-xs font-medium text-[var(--color-ink)]"
                            >
                                <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#9FE870] text-[#163300]">
                                    <Check size={10} strokeWidth={3} />
                                </span>
                                <span>{point}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Screenshot-ready frame: swap <Preview /> with an <img> capture anytime */}
                <div className="min-h-[215px] rounded-2xl border border-dashed border-[var(--color-rule)] bg-[var(--color-paper-3)] p-3.5 lg:col-span-7">
                    <Preview />
                </div>
            </div>

            {/* Subtle footer cue */}
            <div className="relative z-10 mt-4 flex items-center justify-between border-t border-[var(--color-rule)] pt-3 text-[11px] text-[var(--color-muted)]">
                <span className="font-mono">Click or swipe card to roll stack</span>
                <span className="font-mono font-bold text-[var(--color-ink-2)] tabular-nums">
                    {feature.code} / 06
                </span>
            </div>
        </motion.article>
    );
}

export function FeatureDeck() {
    const [activeIndex, setActiveIndex] = useState(0);
    const [exitState, setExitState] = useState({ direction: -1, peelingId: null });

    const total = FEATURES.length;

    useEffect(() => {
        function handleSelectFeature(event) {
            const targetId = event?.detail?.id;
            if (!targetId) return;
            const foundIndex = FEATURES.findIndex((item) => item.id === targetId);
            if (foundIndex !== -1 && foundIndex !== activeIndex) {
                setExitState({ direction: -1, peelingId: FEATURES[activeIndex].id });
                setActiveIndex(foundIndex);
            }
        }

        window.addEventListener('stackmatch:select-feature', handleSelectFeature);
        return () => window.removeEventListener('stackmatch:select-feature', handleSelectFeature);
    }, [activeIndex]);

    function rollNext(direction = -1) {
        const currentCard = FEATURES[activeIndex];
        setExitState({ direction, peelingId: currentCard.id });
        setActiveIndex((prev) => (prev + 1) % total);
    }

    function jumpToIndex(targetIndex) {
        if (targetIndex === activeIndex) {
            rollNext(-1);
            return;
        }
        const currentCard = FEATURES[activeIndex];
        setExitState({
            direction: targetIndex > activeIndex ? -1 : 1,
            peelingId: currentCard.id,
        });
        setActiveIndex(targetIndex);
    }

    const visibleCards = [];
    for (let depth = 0; depth < VISIBLE_STACK_DEPTH; depth += 1) {
        const index = (activeIndex + depth) % total;
        visibleCards.push({ feature: FEATURES[index], depth });
    }

    return (
        <section
            id="features"
            className="scroll-mt-20 border-b border-[var(--color-rule)] bg-[var(--color-paper)] py-20 sm:py-28"
            aria-labelledby="features-title"
        >
            <div className="mx-auto max-w-[var(--container)] px-4 sm:px-8 lg:px-12">
                <Reveal>
                    <SectionIndex
                        number="01"
                        label="Workspace Modules"
                        title="Six focused tools. One rolling stack."
                    />
                </Reveal>

                <div className="mt-12 grid grid-cols-1 items-start gap-10 lg:mt-16 lg:grid-cols-12 lg:gap-10">
                    {/* Left editorial index */}
                    <div className="lg:col-span-4">
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-1">
                            {FEATURES.map((item, idx) => {
                                const isActive = idx === activeIndex;
                                const Icon = item.icon;

                                return (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => jumpToIndex(idx)}
                                        className={`group flex w-full cursor-pointer items-center justify-between gap-3 rounded-2xl border px-3.5 py-3 text-left transition-all ${
                                            isActive
                                                ? 'border-[#9FE870] bg-[var(--color-card)] shadow-[0_8px_24px_rgba(22,51,0,0.06)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.28)]'
                                                : 'border-transparent bg-transparent hover:border-[var(--color-rule)] hover:bg-[var(--color-card)]'
                                        }`}
                                    >
                                        <span className="flex min-w-0 items-center gap-3">
                                            <span
                                                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
                                                    isActive
                                                        ? 'bg-[#9FE870] text-[#163300]'
                                                        : 'border border-[var(--color-rule)] bg-[var(--color-paper-3)] text-[var(--color-ink-2)] group-hover:text-[var(--color-ink)]'
                                                }`}
                                            >
                                                <Icon size={15} />
                                            </span>
                                            <span className="min-w-0">
                                                <span className="block truncate font-[family-name:var(--font-display)] text-sm font-extrabold text-[var(--color-ink)]">
                                                    {item.name}
                                                </span>
                                                <span className="hidden truncate text-xs text-[var(--color-muted)] lg:block">
                                                    {item.tagline}
                                                </span>
                                            </span>
                                        </span>

                                        <span
                                            className={`shrink-0 font-mono text-[11px] font-bold ${
                                                isActive
                                                    ? 'text-[#163300] dark:text-[#9FE870]'
                                                    : 'text-[var(--color-muted)]'
                                            }`}
                                        >
                                            {item.code}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Right click-to-roll card deck */}
                    <div className="min-w-0 pb-14 lg:col-span-8">
                        <div className="relative h-[620px] w-full sm:h-[520px] lg:h-[450px]">
                            <AnimatePresence
                                initial={false}
                                custom={{
                                    direction: exitState.direction,
                                    isPeeling: true,
                                }}
                            >
                                {visibleCards.map(({ feature, depth }) => (
                                    <DeckCard
                                        key={feature.id}
                                        feature={feature}
                                        depth={depth}
                                        direction={exitState.direction}
                                        isPeeling={exitState.peelingId === feature.id}
                                        onRollNext={rollNext}
                                    />
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default FeatureDeck;