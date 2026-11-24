import React, { useCallback, useEffect, useRef, useState } from 'react';
import { animate, motion, useMotionValue, useReducedMotion } from 'framer-motion';
import {
    AlertTriangle,
    ArrowLeft,
    ArrowRight,
    Bookmark,
    Check,
    CheckCircle2,
    Copy,
    FileText,
    FlaskConical,
    Layers,
    MapPin,
    Send
} from 'lucide-react';
import Reveal from './Reveal';

const DECK_GAP = 16;

const FEATURES = [
    {
        id: 'heatmap',
        number: '01',
        tag: 'Match',
        icon: Layers,
        title: 'ATS Keyword Heatmap',
        subtitle: "See what matches. Fix what doesn't."
    },
    {
        id: 'latex',
        number: '02',
        tag: 'Export',
        icon: FileText,
        title: 'Overleaf .tex & PDF',
        subtitle: 'Clean exports, ready to send.'
    },
    {
        id: 'outreach',
        number: '03',
        tag: 'Outreach',
        icon: Send,
        title: 'Outreach Hub',
        subtitle: 'Referral messages, emails, and cover letters.'
    },
    {
        id: 'lab',
        number: '04',
        tag: 'Rewrite',
        icon: FlaskConical,
        title: 'Resume Lab',
        subtitle: 'Turn weak bullets into clear results.'
    },
    {
        id: 'jobs',
        number: '05',
        tag: 'Discover',
        icon: MapPin,
        title: 'Location-Filtered Jobs',
        subtitle: 'Find roles near you or remote.'
    },
    {
        id: 'star',
        number: '06',
        tag: 'Practice',
        icon: CheckCircle2,
        title: 'STAR Interview Practice',
        subtitle: 'Practice answers with structure feedback.'
    }
];

const HeatmapPreview = () => (
    <div className="flex h-full min-h-[220px] flex-col gap-3 rounded-2xl border border-[var(--color-rule)] bg-[var(--color-paper-3)] p-4">
        <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-muted)]">
                Job keywords
            </span>
            <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
                7 matched · 2 missing
            </span>
        </div>

        <div className="flex flex-wrap gap-1.5">
            <span className="inline-flex items-center gap-1 rounded-full bg-[#9FE870] px-2.5 py-1 text-[11px] font-semibold text-[#163300]">
                <Check className="h-3 w-3" />
                React 19
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-[#9FE870] px-2.5 py-1 text-[11px] font-semibold text-[#163300]">
                <Check className="h-3 w-3" />
                TypeScript
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-[#9FE870]/50 bg-[#9FE870]/20 px-2.5 py-1 text-[11px] font-semibold text-[var(--color-ink)]">
                <Check className="h-3 w-3" />
                PostgreSQL
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-[#9FE870]/40 bg-[#9FE870]/10 px-2.5 py-1 text-[11px] font-semibold text-[var(--color-ink-2)]">
                <Check className="h-3 w-3" />
                Redis
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/25 bg-amber-500/10 px-2.5 py-1 text-[11px] font-semibold text-amber-700 dark:text-amber-300">
                <AlertTriangle className="h-3 w-3" />
                Kubernetes
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/25 bg-amber-500/10 px-2.5 py-1 text-[11px] font-semibold text-amber-700 dark:text-amber-300">
                <AlertTriangle className="h-3 w-3" />
                Terraform
            </span>
        </div>

        <div className="mt-auto flex items-center gap-2.5 rounded-xl border border-amber-500/25 bg-amber-500/5 px-3 py-2.5">
            <AlertTriangle className="h-4 w-4 flex-shrink-0 text-amber-600 dark:text-amber-400" />
            <div className="min-w-0">
                <p className="text-[10px] font-mono uppercase tracking-wider text-[var(--color-muted)]">
                    Top gap
                </p>
                <p className="truncate text-xs font-semibold text-[var(--color-ink)]">
                    Kubernetes
                </p>
            </div>
            <span className="ml-auto whitespace-nowrap rounded-full bg-[var(--color-card)] px-2.5 py-1 text-[10px] font-semibold text-[var(--color-ink-2)]">
                Add one project
            </span>
        </div>
    </div>
);

const LatexPreview = () => (
    <div className="flex h-full min-h-[220px] flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-[#0D120C]">
        <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-2.5">
            <div className="flex min-w-0 items-center gap-2">
                <span className="flex gap-1">
                    <span className="h-2 w-2 rounded-full bg-red-400/80" />
                    <span className="h-2 w-2 rounded-full bg-amber-400/80" />
                    <span className="h-2 w-2 rounded-full bg-emerald-400/80" />
                </span>
                <span className="truncate font-mono text-[10px] text-zinc-400">
                    resume.tex
                </span>
            </div>
            <span className="inline-flex flex-shrink-0 items-center gap-1 rounded-full bg-[#9FE870] px-2 py-0.5 text-[10px] font-bold text-[#163300]">
                <Check className="h-3 w-3" />
                ATS safe
            </span>
        </div>

        <pre className="min-h-0 flex-1 overflow-hidden whitespace-pre-wrap break-words p-4 font-mono text-[10px] leading-5 text-zinc-300 sm:text-[11px] sm:leading-6">{`\\documentclass[10pt]{article}
\\begin{document}
\\section*{Experience}
\\item Cut checkout latency 38% for 2M users
\\item Built ATS-safe layouts with React
\\end{document}`}</pre>

        <div className="flex items-center justify-between border-t border-white/10 px-4 py-2.5 font-mono text-[10px] text-zinc-400">
            <span>Overleaf ready</span>
            <span className="font-semibold text-[#9FE870]">PDF + .tex</span>
        </div>
    </div>
);

const OutreachPreview = () => (
    <div className="flex h-full min-h-[220px] flex-col overflow-hidden rounded-2xl border border-[var(--color-rule)] bg-[var(--color-card)]">
        <div className="flex items-center gap-1 border-b border-[var(--color-rule)] px-3 pt-3 text-[10px] font-mono">
            <span className="rounded-t-lg border-x border-t border-[var(--color-rule)] bg-[var(--color-paper-3)] px-2.5 py-1.5 font-semibold text-[var(--color-ink)]">
                Referral
            </span>
            <span className="px-2 text-[var(--color-muted)]">Email</span>
            <span className="px-2 text-[var(--color-muted)]">Cover letter</span>
        </div>

        <div className="flex flex-1 flex-col gap-3 p-4">
            <div className="flex items-center gap-2">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-[#163300] text-[10px] font-bold text-[#9FE870]">
                    SC
                </span>
                <div>
                    <p className="text-xs font-semibold text-[var(--color-ink)]">Sarah Chen</p>
                    <p className="text-[10px] text-[var(--color-muted)]">Stripe · Engineering</p>
                </div>
            </div>

            <p className="rounded-xl border border-[var(--color-rule)] bg-[var(--color-paper-3)] p-3 text-xs leading-relaxed text-[var(--color-ink-2)]">
                Hi Sarah — I saw the frontend role on your team. I cut checkout latency by 38% for 2M users and would love to share how I'd approach your payments UI.
            </p>

            <div className="mt-auto flex gap-1.5">
                {['Short', 'Warm', 'Specific'].map((tag) => (
                    <span
                        key={tag}
                        className="rounded-full bg-[var(--color-paper-2)] px-2 py-1 text-[10px] font-semibold text-[var(--color-muted)]"
                    >
                        {tag}
                    </span>
                ))}
            </div>
        </div>

        <div className="flex items-center justify-between border-t border-[var(--color-rule)] px-4 py-2.5">
            <span className="font-mono text-[10px] text-[var(--color-muted)]">Draft</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-[#9FE870] px-2.5 py-1 text-[10px] font-bold text-[#163300]">
                <Copy className="h-3 w-3" />
                Copy message
            </span>
        </div>
    </div>
);

const LabPreview = () => (
    <div className="flex h-full min-h-[220px] flex-col gap-3 rounded-2xl border border-[var(--color-rule)] bg-[var(--color-paper-3)] p-4">
        <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-muted)]">
                Bullet rewrite
            </span>
            <span className="text-[10px] font-semibold text-[var(--color-ink-2)]">2 of 3</span>
        </div>

        <div className="rounded-xl border border-[var(--color-rule)] bg-[var(--color-card)] p-3">
            <p className="text-[10px] font-mono uppercase tracking-wider text-[var(--color-muted)]">Before</p>
            <p className="mt-1 text-xs leading-relaxed text-[var(--color-muted)] line-through">
                Worked on checkout page performance
            </p>
        </div>

        <div className="flex justify-center text-[var(--color-muted)]" aria-hidden="true">
            ↓
        </div>

        <div className="rounded-xl border border-[#9FE870]/50 bg-[#9FE870]/10 p-3">
            <p className="text-[10px] font-mono uppercase tracking-wider text-[#163300] dark:text-[#9FE870]">After</p>
            <p className="mt-1 text-xs leading-relaxed text-[var(--color-ink)]">
                <strong className="font-semibold">Cut checkout latency 38%</strong> for 2M users with Redis caching.
            </p>
        </div>

        <div className="mt-auto flex flex-wrap gap-1.5">
            {['Action verb', 'Metric', 'Result'].map((label) => (
                <span
                    key={label}
                    className="inline-flex items-center gap-1 rounded-full bg-[#9FE870]/20 px-2 py-1 text-[10px] font-semibold text-[var(--color-ink)]"
                >
                    <Check className="h-3 w-3" />
                    {label}
                </span>
            ))}
        </div>
    </div>
);

const JobsPreview = () => {
    const jobs = [
        { mark: 'L', title: 'Frontend Engineer', meta: 'Linear · Bengaluru · Hybrid', saved: true },
        { mark: 'V', title: 'Product Engineer', meta: 'Vercel · Remote', saved: false },
        { mark: 'R', title: 'UI Engineer', meta: 'Razorpay · Bengaluru', saved: false }
    ];

    return (
        <div className="flex h-full min-h-[220px] flex-col gap-3 rounded-2xl border border-[var(--color-rule)] bg-[var(--color-paper-3)] p-4">
            <div className="flex flex-wrap gap-1.5">
                <span className="inline-flex items-center gap-1 rounded-full bg-[#9FE870] px-2.5 py-1 text-[10px] font-bold text-[#163300]">
                    <MapPin className="h-3 w-3" />
                    Bengaluru
                </span>
                <span className="rounded-full border border-[var(--color-rule)] bg-[var(--color-card)] px-2.5 py-1 text-[10px] font-semibold text-[var(--color-muted)]">
                    Remote
                </span>
                <span className="rounded-full border border-[var(--color-rule)] bg-[var(--color-card)] px-2.5 py-1 text-[10px] font-semibold text-[var(--color-muted)]">
                    Hyderabad
                </span>
            </div>

            <div className="space-y-2">
                {jobs.map((job) => (
                    <div
                        key={job.title}
                        className="flex items-center gap-2.5 rounded-xl border border-[var(--color-rule)] bg-[var(--color-card)] p-2.5"
                    >
                        <span className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-lg bg-[var(--color-paper-2)] text-[10px] font-bold text-[var(--color-ink)]">
                            {job.mark}
                        </span>
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-semibold text-[var(--color-ink)]">
                                {job.title}
                            </p>
                            <p className="truncate text-[10px] text-[var(--color-muted)]">
                                {job.meta}
                            </p>
                        </div>
                        <Bookmark
                            className={`h-3.5 w-3.5 flex-shrink-0 ${
                                job.saved ? 'fill-[#9FE870] text-[#163300] dark:text-[#9FE870]' : 'text-[var(--color-muted)]'
                            }`}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

const StarPreview = () => (
    <div className="flex h-full min-h-[220px] flex-col gap-3 rounded-2xl border border-[var(--color-rule)] bg-[var(--color-paper-3)] p-4">
        <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-muted)]">
                Behavioral
            </span>
            <span className="text-[10px] font-semibold text-[var(--color-ink-2)]">Question 3 of 8</span>
        </div>

        <p className="text-xs font-semibold leading-relaxed text-[var(--color-ink)]">
            "Tell me about a time you shipped under a tight deadline."
        </p>

        <div className="grid grid-cols-4 gap-1.5">
            {[
                { letter: 'S', done: true },
                { letter: 'T', done: true },
                { letter: 'A', done: true },
                { letter: 'R', done: false }
            ].map((item) => (
                <div
                    key={item.letter}
                    className={`flex items-center justify-center gap-1 rounded-lg py-2 text-[10px] font-bold ${
                        item.done
                            ? 'bg-[#9FE870]/20 text-[#163300] dark:text-[#9FE870]'
                            : 'border border-dashed border-amber-500/40 bg-amber-500/5 text-amber-700 dark:text-amber-300'
                    }`}
                >
                    {item.letter}
                    {item.done ? <Check className="h-3 w-3" /> : null}
                </div>
            ))}
        </div>

        <div className="mt-auto rounded-xl border border-amber-500/25 bg-amber-500/5 p-3">
            <p className="text-[10px] font-mono uppercase tracking-wider text-amber-700 dark:text-amber-300">
                Feedback
            </p>
            <p className="mt-1 text-xs leading-relaxed text-[var(--color-ink-2)]">
                Add one measurable result to complete the R.
            </p>
        </div>
    </div>
);

const FeaturePreview = ({ type }) => {
    switch (type) {
        case 'heatmap':
            return <HeatmapPreview />;
        case 'latex':
            return <LatexPreview />;
        case 'outreach':
            return <OutreachPreview />;
        case 'lab':
            return <LabPreview />;
        case 'jobs':
            return <JobsPreview />;
        case 'star':
            return <StarPreview />;
        default:
            return null;
    }
};

const FeatureCard = ({ feature, isActive, innerRef, reduceMotion }) => {
    const Icon = feature.icon;

    return (
        <motion.article
            ref={innerRef}
            role="group"
            aria-roledescription="slide"
            aria-label={`${feature.number} — ${feature.title}`}
            aria-hidden={!isActive}
            animate={{
                scale: reduceMotion ? 1 : isActive ? 1 : 0.94,
                opacity: isActive ? 1 : 0.6
            }}
            transition={{
                duration: reduceMotion ? 0 : 0.35,
                ease: [0.22, 1, 0.36, 1]
            }}
            className={`flex min-h-[30rem] w-[86vw] max-w-[40rem] shrink-0 select-none flex-col overflow-hidden rounded-3xl border bg-[var(--color-card)] shadow-xl transition-colors duration-300 sm:min-h-[28rem] ${
                isActive
                    ? 'border-[#9FE870]'
                    : 'border-[var(--color-rule)]'
            }`}
        >
            <div className="flex items-center justify-between gap-3 border-b border-[var(--color-rule)] px-5 py-3.5 sm:px-6">
                <div className="flex min-w-0 items-center gap-2.5">
                    <span
                        className={`grid h-8 w-8 flex-shrink-0 place-items-center rounded-lg transition-colors ${
                            isActive
                                ? 'bg-[#9FE870] text-[#163300]'
                                : 'bg-[var(--color-paper-2)] text-[var(--color-ink-2)]'
                        }`}
                    >
                        <Icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--color-muted)]">
                        {feature.tag}
                    </span>
                </div>
                <span className="font-mono text-[10px] font-semibold tabular-nums text-[var(--color-muted)]">
                    {feature.number}
                </span>
            </div>

            <div className="px-5 pt-4 sm:px-6">
                <h3 className="font-display text-2xl font-extrabold tracking-tight text-[var(--color-ink)]">
                    {feature.title}
                </h3>
                <p className="mt-1 text-sm text-[var(--color-ink-2)]">
                    {feature.subtitle}
                </p>
            </div>

            <div className="flex flex-1 p-4 sm:p-5">
                <div className="w-full">
                    <FeaturePreview type={feature.id} />
                </div>
            </div>
        </motion.article>
    );
};

export const ScrollShowcase = () => {
    const reduceMotion = useReducedMotion();
    const viewportRef = useRef(null);
    const cardRef = useRef(null);
    const activeIndexRef = useRef(0);
    const animationRef = useRef(null);
    const x = useMotionValue(0);

    const [index, setIndex] = useState(0);
    const [metrics, setMetrics] = useState({ viewportWidth: 0, cardWidth: 0 });

    const ready = metrics.viewportWidth > 0 && metrics.cardWidth > 0;

    const xFor = useCallback(
        (slideIndex) => {
            const step = metrics.cardWidth + DECK_GAP;
            return (metrics.viewportWidth - metrics.cardWidth) / 2 - slideIndex * step;
        },
        [metrics.cardWidth, metrics.viewportWidth]
    );

    const stopAnimation = useCallback(() => {
        if (animationRef.current) {
            animationRef.current.stop();
            animationRef.current = null;
        }
    }, []);

    const goTo = useCallback(
        (nextIndex) => {
            if (!ready) return;

            const clamped = Math.max(0, Math.min(FEATURES.length - 1, nextIndex));
            activeIndexRef.current = clamped;
            setIndex(clamped);
            stopAnimation();

            if (reduceMotion) {
                x.set(xFor(clamped));
                return;
            }

            animationRef.current = animate(x, xFor(clamped), {
                type: 'spring',
                stiffness: 280,
                damping: 32,
                mass: 0.9
            });
        },
        [ready, reduceMotion, stopAnimation, x, xFor]
    );

    // Measure the available width and card width, then re-center on resize.
    useEffect(() => {
        const viewport = viewportRef.current;
        if (!viewport) return undefined;

        const measure = () => {
            const card = cardRef.current;
            if (!card) return;

            const nextWidths = {
                viewportWidth: viewport.clientWidth,
                cardWidth: card.offsetWidth
            };

            setMetrics((current) => {
                if (
                    current.viewportWidth === nextWidths.viewportWidth &&
                    current.cardWidth === nextWidths.cardWidth
                ) {
                    return current;
                }
                return nextWidths;
            });
        };

        measure();

        const observer = new ResizeObserver(measure);
        observer.observe(viewport);
        if (cardRef.current) observer.observe(cardRef.current);
        window.addEventListener('resize', measure);

        return () => {
            observer.disconnect();
            window.removeEventListener('resize', measure);
        };
    }, []);

    useEffect(() => {
        if (!ready) return;
        stopAnimation();
        x.set(xFor(activeIndexRef.current));
    }, [ready, metrics.viewportWidth, metrics.cardWidth, stopAnimation, x, xFor]);

    useEffect(() => () => stopAnimation(), [stopAnimation]);

    const handleDragStart = () => {
        stopAnimation();
    };

    const handleDragEnd = (_, info) => {
        if (!ready) return;

        const swipeThreshold = metrics.cardWidth * 0.15;
        let nextIndex = index;

        if (info.offset.x < -swipeThreshold || info.velocity.x < -450) {
            nextIndex = index + 1;
        } else if (info.offset.x > swipeThreshold || info.velocity.x > 450) {
            nextIndex = index - 1;
        }

        goTo(nextIndex);
    };

    const dragConstraints = ready
        ? { left: xFor(FEATURES.length - 1), right: xFor(0) }
        : { left: 0, right: 0 };

    return (
        <section
            id="features"
            className="relative scroll-mt-20 overflow-hidden border-y border-[var(--color-rule)] bg-[var(--color-paper)] py-16 sm:py-24"
            aria-labelledby="features-title"
        >
            <div className="mx-auto max-w-[var(--container)] px-4 sm:px-8 lg:px-12">
                <Reveal className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
                    <div className="max-w-xl">
                        <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
                            Features
                        </p>
                        <h2
                            id="features-title"
                            className="mt-2 font-display text-3xl font-extrabold tracking-tight text-[var(--color-ink)] sm:text-4xl"
                        >
                            Six tools, one application.
                        </h2>
                    </div>
                    <p className="max-w-xs text-sm leading-relaxed text-[var(--color-ink-2)]">
                        Swipe through the deck or use the arrows.
                    </p>
                </Reveal>

                <Reveal delay={0.08} className="mt-8 sm:mt-10">
                    <div
                        ref={viewportRef}
                        className="relative overflow-hidden py-4"
                        role="region"
                        aria-roledescription="carousel"
                        aria-label="StackMatch features"
                    >
                        <motion.div
                            drag={ready ? 'x' : false}
                            dragConstraints={dragConstraints}
                            dragElastic={0.08}
                            dragMomentum={false}
                            onDragStart={handleDragStart}
                            onDragEnd={handleDragEnd}
                            style={{ x, gap: `${DECK_GAP}px`, touchAction: 'pan-y' }}
                            className={`flex w-full cursor-grab active:cursor-grabbing ${
                                ready ? 'opacity-100' : 'opacity-0'
                            } transition-opacity duration-300`}
                        >
                            {FEATURES.map((feature, featureIndex) => (
                                <FeatureCard
                                    key={feature.id}
                                    feature={feature}
                                    isActive={index === featureIndex}
                                    innerRef={featureIndex === 0 ? cardRef : undefined}
                                    reduceMotion={reduceMotion}
                                />
                            ))}
                        </motion.div>
                    </div>

                    <p className="sr-only" aria-live="polite">
                        Feature {index + 1} of {FEATURES.length}: {FEATURES[index].title}
                    </p>

                    <div className="mt-5 flex flex-col gap-4 border-t border-[var(--color-rule)] pt-5 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center justify-between gap-4 sm:justify-start">
                            <span className="font-mono text-[11px] font-semibold tabular-nums text-[var(--color-muted)]">
                                {String(index + 1).padStart(2, '0')} / {String(FEATURES.length).padStart(2, '0')}
                            </span>

                            <div className="flex items-center" aria-label="Choose a feature">
                                {FEATURES.map((feature, featureIndex) => {
                                    const isActive = index === featureIndex;
                                    return (
                                        <button
                                            key={feature.id}
                                            type="button"
                                            onClick={() => goTo(featureIndex)}
                                            aria-label={`Show ${feature.title}`}
                                            aria-current={isActive ? 'true' : undefined}
                                            className="group flex h-9 w-6 items-center justify-center"
                                        >
                                            <span
                                                className={`h-1.5 rounded-full transition-all duration-300 ${
                                                    isActive
                                                        ? 'w-5 bg-[#163300] dark:bg-[#9FE870]'
                                                        : 'w-1.5 bg-[var(--color-rule)] group-hover:bg-[#9FE870]'
                                                }`}
                                            />
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="flex items-center justify-between gap-3 sm:justify-end">
                            <div className="ml-auto flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => goTo(index - 1)}
                                    disabled={index === 0}
                                    aria-label="Previous feature"
                                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-rule)] bg-[var(--color-card)] text-[var(--color-ink)] transition-colors hover:border-[#9FE870] hover:bg-[#9FE870] hover:text-[#163300] disabled:pointer-events-none disabled:opacity-30"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => goTo(index + 1)}
                                    disabled={index === FEATURES.length - 1}
                                    aria-label="Next feature"
                                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-rule)] bg-[var(--color-card)] text-[var(--color-ink)] transition-colors hover:border-[#9FE870] hover:bg-[#9FE870] hover:text-[#163300] disabled:pointer-events-none disabled:opacity-30"
                                >
                                    <ArrowRight className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </Reveal>
            </div>
        </section>
    );
};

export default ScrollShowcase;
