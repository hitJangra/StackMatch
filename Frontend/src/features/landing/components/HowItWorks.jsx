import React, { useRef, useState } from 'react';
import {
    AnimatePresence,
    motion,
    useMotionTemplate,
    useMotionValue,
    useScroll,
    useSpring,
} from 'framer-motion';
import {
    Bookmark,
    Check,
    FileCode2,
    FileDown,
    FileText,
    MapPin,
    Plus,
    RefreshCw,
    Send,
    Target,
    Upload,
} from 'lucide-react';
import Reveal from './Reveal';
import {
    DashedFrame,
    KINETIC_EASE,
    RollingText,
    SectionIndex,
} from './KineticPrimitives';

/* -------------------------------------------------------------------------- */
/* Hoisted interactive step playgrounds                                       */
/* -------------------------------------------------------------------------- */

const STEP_ONE_MODES = [
    {
        id: 'bengaluru',
        label: 'Bengaluru',
        source: 'Find Jobs · India Cities',
        role: 'Frontend Engineer · Razorpay',
        meta: 'Bengaluru · Full-time · 1–3 yrs',
        file: 'resume_v3.pdf attached',
    },
    {
        id: 'remote',
        label: 'Remote',
        source: 'Find Jobs · Global Remote',
        role: 'Full-Stack Dev · Linear',
        meta: 'Remote · Full-time · Mid-level',
        file: 'resume_v3.pdf attached',
    },
    {
        id: 'saved',
        label: 'Saved Jobs',
        source: 'Saved Jobs Shortlist',
        role: 'SWE Intern · Swiggy',
        meta: 'Hyderabad · Internship · Saved',
        file: 'Ready for Match or Prep',
    },
];

function StepOnePlayground() {
    const [selectedId, setSelectedId] = useState('bengaluru');
    const current =
        STEP_ONE_MODES.find((item) => item.id === selectedId) || STEP_ONE_MODES[0];

    return (
        <div className="flex h-full flex-col justify-between gap-3 rounded-xl border border-[var(--color-rule)] bg-[var(--color-paper-3)] p-3.5">
            <div className="flex flex-wrap gap-1.5">
                {STEP_ONE_MODES.map((mode) => {
                    const active = mode.id === selectedId;
                    return (
                        <button
                            key={mode.id}
                            type="button"
                            onClick={() => setSelectedId(mode.id)}
                            className={`relative cursor-pointer rounded-full px-2.5 py-1 text-[11px] font-bold transition-colors ${
                                active
                                    ? 'text-[#163300]'
                                    : 'border border-[var(--color-rule)] bg-[var(--color-card)] text-[var(--color-ink-2)] hover:border-[#9FE870] hover:text-[var(--color-ink)]'
                            }`}
                        >
                            {active ? (
                                <motion.span
                                    layoutId="how-step1-pill"
                                    transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                                    className="absolute inset-0 rounded-full bg-[#9FE870]"
                                />
                            ) : null}
                            <span className="relative z-10 inline-flex items-center gap-1">
                                {mode.id === 'saved' ? (
                                    <Bookmark size={10} />
                                ) : (
                                    <MapPin size={10} />
                                )}
                                {mode.label}
                            </span>
                        </button>
                    );
                })}
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={current.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.22, ease: KINETIC_EASE }}
                    className="space-y-2 rounded-xl border border-[var(--color-rule)] bg-[var(--color-card)] p-3"
                >
                    <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--color-muted)]">
                            {current.source}
                        </span>
                        <span className="inline-flex h-2 w-2 rounded-full bg-[#9FE870]" />
                    </div>
                    <p className="text-xs font-bold text-[var(--color-ink)]">
                        {current.role}
                    </p>
                    <p className="text-[11px] text-[var(--color-muted)]">{current.meta}</p>
                    <div className="flex items-center gap-1.5 border-t border-dashed border-[var(--color-rule)] pt-2 text-[11px] font-semibold text-[#163300] dark:text-[#9FE870]">
                        <Check size={12} strokeWidth={3} />
                        <span>{current.file}</span>
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}

const STEP_TWO_SKILLS = [
    { name: 'Redis', boost: 6 },
    { name: 'GraphQL', boost: 6 },
];

function StepTwoPlayground() {
    const [enhanced, setEnhanced] = useState(false);
    const [addedSkills, setAddedSkills] = useState([]);

    const skillBoost = STEP_TWO_SKILLS.reduce(
        (sum, item) => (addedSkills.includes(item.name) ? sum + item.boost : sum),
        0
    );
    const score = 79 + (enhanced ? 5 : 0) + skillBoost;

    function toggleSkill(name) {
        setAddedSkills((prev) =>
            prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name]
        );
    }

    return (
        <div className="flex h-full flex-col justify-between gap-3 rounded-xl border border-[var(--color-rule)] bg-[var(--color-paper-3)] p-3.5">
            <div className="flex items-center justify-between gap-2">
                <div className="flex flex-wrap gap-1.5">
                    {STEP_TWO_SKILLS.map((skill) => {
                        const added = addedSkills.includes(skill.name);
                        return (
                            <motion.button
                                key={skill.name}
                                type="button"
                                whileTap={{ scale: 0.94 }}
                                onClick={() => toggleSkill(skill.name)}
                                className={`inline-flex cursor-pointer items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-bold transition-colors ${
                                    added
                                        ? 'border-[#9FE870] bg-[#9FE870] text-[#163300]'
                                        : 'border-dashed border-[var(--color-rule)] bg-[var(--color-card)] text-[var(--color-ink-2)] hover:border-[#9FE870]'
                                }`}
                            >
                                {added ? <Check size={10} strokeWidth={3} /> : <Plus size={10} />}
                                <span>{skill.name}</span>
                            </motion.button>
                        );
                    })}
                </div>

                <span className="shrink-0 rounded-full bg-[#9FE870] px-2.5 py-0.5 font-mono text-xs font-extrabold text-[#163300] tabular-nums">
                    {score}%
                </span>
            </div>

            <div className="rounded-xl border border-[var(--color-rule)] bg-[var(--color-card)] p-3">
                <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--color-muted)]">
                        {enhanced ? 'XYZ Enhanced' : 'Original Bullet'}
                    </span>
                    <button
                        type="button"
                        onClick={() => setEnhanced((prev) => !prev)}
                        className="group inline-flex cursor-pointer items-center gap-1 rounded-full border border-[var(--color-rule)] bg-[var(--color-paper-3)] px-2 py-0.5 text-[10px] font-bold text-[var(--color-ink)] transition-colors hover:border-[#9FE870] hover:bg-[#9FE870] hover:text-[#163300]"
                    >
                        <RefreshCw
                            size={10}
                            className={`transition-transform duration-300 ${
                                enhanced ? 'rotate-180' : ''
                            }`}
                        />
                        <RollingText text={enhanced ? 'Show raw' : 'XYZ rewrite'} />
                    </button>
                </div>

                <AnimatePresence mode="wait">
                    <motion.p
                        key={enhanced ? 'after' : 'before'}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.2, ease: KINETIC_EASE }}
                        className={`mt-2 text-xs leading-relaxed ${
                            enhanced
                                ? 'font-semibold text-[var(--color-ink)]'
                                : 'text-[var(--color-muted)]'
                        }`}
                    >
                        {enhanced
                            ? 'Cut checkout API latency 38% (520ms to 320ms) for 2M users by adding Redis caching and indexing queries.'
                            : 'Worked on backend APIs and helped make the checkout page load faster for users.'}
                    </motion.p>
                </AnimatePresence>

                <div className="mt-2.5 flex items-center justify-between border-t border-dashed border-[var(--color-rule)] pt-2 text-[10px] font-mono text-[var(--color-muted)]">
                    <span className="inline-flex items-center gap-1 font-semibold text-[#163300] dark:text-[#9FE870]">
                        <FileCode2 size={11} />
                        tailored_resume.tex
                    </span>
                    <span>Overleaf ready</span>
                </div>
            </div>
        </div>
    );
}

const STEP_THREE_TABS = [
    {
        id: 'dm',
        label: 'Referral DM',
        header: 'Outreach Hub · LinkedIn DM',
        text: 'Hi Priya, saw your team is hiring for Frontend Systems. I matched 91% on the JD after shipping a shared React library. Open to a quick chat?',
        footerIcon: Send,
        footerText: 'Cold email, cover letter & Q&As included',
    },
    {
        id: 'qa',
        label: 'App Q&A',
        header: 'Outreach Hub · Why this company?',
        text: 'Razorpay’s checkout latency goals directly overlap with my Redis caching work that cut p95 times by 38% across high-volume payments.',
        footerIcon: FileText,
        footerText: 'Tailored to resume + JD context',
    },
    {
        id: 'prep',
        label: 'Prep PDF',
        header: 'Prep Mode · AI Answer Check',
        text: 'Behavioral & technical Q&As generated for this role. Submit your practice answer for AI scoring and download the full Prep Roadmap PDF.',
        footerIcon: FileDown,
        footerText: 'Prep Roadmap PDF ready',
    },
];

function StepThreePlayground() {
    const [activeTab, setActiveTab] = useState('dm');
    const [checkedAnswer, setCheckedAnswer] = useState(false);

    const current =
        STEP_THREE_TABS.find((tab) => tab.id === activeTab) || STEP_THREE_TABS[0];
    const FooterIcon = current.footerIcon;

    return (
        <div className="flex h-full flex-col justify-between gap-3 rounded-xl border border-[var(--color-rule)] bg-[var(--color-paper-3)] p-3.5">
            <div className="flex flex-wrap gap-1.5">
                {STEP_THREE_TABS.map((tab) => {
                    const active = tab.id === activeTab;
                    return (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveTab(tab.id)}
                            className={`relative cursor-pointer rounded-full px-2.5 py-1 text-[11px] font-bold transition-colors ${
                                active
                                    ? 'text-[#163300]'
                                    : 'border border-[var(--color-rule)] bg-[var(--color-card)] text-[var(--color-ink-2)] hover:border-[#9FE870] hover:text-[var(--color-ink)]'
                            }`}
                        >
                            {active ? (
                                <motion.span
                                    layoutId="how-step3-pill"
                                    transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                                    className="absolute inset-0 rounded-full bg-[#9FE870]"
                                />
                            ) : null}
                            <span className="relative z-10">{tab.label}</span>
                        </button>
                    );
                })}
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={current.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.22, ease: KINETIC_EASE }}
                    className="space-y-2 rounded-xl border border-[var(--color-rule)] bg-[var(--color-card)] p-3"
                >
                    <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--color-muted)]">
                            {current.header}
                        </span>
                        {current.id === 'prep' ? (
                            <button
                                type="button"
                                onClick={() => setCheckedAnswer((prev) => !prev)}
                                className="cursor-pointer rounded-full bg-[#9FE870] px-2 py-0.5 text-[10px] font-extrabold text-[#163300]"
                            >
                                {checkedAnswer ? 'AI Score: 8.9/10' : 'Check answer'}
                            </button>
                        ) : null}
                    </div>
                    <p className="text-xs leading-relaxed text-[var(--color-ink-2)]">
                        {current.text}
                    </p>
                    <div className="flex items-center gap-1.5 border-t border-dashed border-[var(--color-rule)] pt-2 text-[11px] font-semibold text-[#163300] dark:text-[#9FE870]">
                        <FooterIcon size={12} />
                        <span>{current.footerText}</span>
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}

function StepCard({ step, index, isActive, onActivate }) {
    const Icon = step.icon;
    const Playground = step.Playground;

    const pointerX = useMotionValue(0);
    const pointerY = useMotionValue(0);
    const spotlightBg = useMotionTemplate`radial-gradient(340px circle at ${pointerX}px ${pointerY}px, rgba(159, 232, 112, 0.14), transparent 70%)`;

    function handleMouseMove(event) {
        const rect = event.currentTarget.getBoundingClientRect();
        pointerX.set(event.clientX - rect.left);
        pointerY.set(event.clientY - rect.top);
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 26 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.58, delay: index * 0.09, ease: KINETIC_EASE }}
            whileHover={{ y: -4 }}
            onMouseEnter={onActivate}
            onFocus={onActivate}
            onMouseMove={handleMouseMove}
            className="h-full"
        >
            <DashedFrame
                className={`relative flex h-full flex-col justify-between overflow-hidden p-6 transition-shadow duration-300 sm:p-7 ${
                    isActive
                        ? 'border-[#9FE870] shadow-[0_18px_48px_rgba(22,51,0,0.08)] dark:shadow-[0_18px_48px_rgba(0,0,0,0.36)]'
                        : ''
                }`}
            >
                <motion.div
                    aria-hidden="true"
                    style={{ background: spotlightBg }}
                    className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover/frame:opacity-100"
                />

                <div className="relative z-10">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <span
                                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors duration-200 ${
                                    isActive
                                        ? 'bg-[#9FE870] text-[#163300]'
                                        : 'border border-[var(--color-rule)] bg-[var(--color-paper-3)] text-[var(--color-ink)]'
                                }`}
                            >
                                <Icon className="h-5 w-5" aria-hidden="true" />
                            </span>
                            <span className="font-mono text-xs font-bold uppercase tracking-[0.12em] text-[var(--color-muted)]">
                                Step 0{index + 1}
                            </span>
                        </div>

                        <span className="rounded-full border border-[var(--color-rule)] bg-[var(--color-paper-3)] px-2.5 py-0.5 font-mono text-[10px] font-semibold text-[var(--color-ink-2)]">
                            {step.tag}
                        </span>
                    </div>

                    <h3 className="mt-5 font-[family-name:var(--font-display)] text-xl font-extrabold tracking-tight text-[var(--color-ink)] sm:text-2xl">
                        {step.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-[var(--color-ink-2)]">
                        {step.body}
                    </p>
                </div>

                <div className="relative z-10 mt-6 flex-1">
                    <Playground />
                </div>
            </DashedFrame>
        </motion.div>
    );
}

/* -------------------------------------------------------------------------- */
/* Step definitions (declared AFTER hoisted playgrounds)                      */
/* -------------------------------------------------------------------------- */

const STEPS = [
    {
        id: 'pick-role',
        tag: 'Find · Save',
        icon: Upload,
        title: 'Add your resume & pick a role',
        body: 'Upload your resume, paste any JD, or pick a role from Find Jobs (India cities, Remote, global) and Saved Jobs.',
        Playground: StepOnePlayground,
    },
    {
        id: 'match-enhance',
        tag: 'Audit · .tex',
        icon: FileText,
        title: 'Audit, enhance & export .tex',
        body: 'Run Match a JD or a standalone Resume Lab audit, upgrade bullets into XYZ format, and download an Overleaf .tex resume.',
        Playground: StepTwoPlayground,
    },
    {
        id: 'outreach-prep',
        tag: 'Outreach · PDF',
        icon: Target,
        title: 'Draft outreach & prep answers',
        body: 'Generate tailored cold emails, LinkedIn DMs, cover letters, and app Q&As—then check answers in Prep Mode and save your Roadmap PDF.',
        Playground: StepThreePlayground,
    },
];

export const HowItWorks = () => {
    const sectionRef = useRef(null);
    const [activeStep, setActiveStep] = useState(0);

    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ['start 78%', 'end 62%'],
    });

    const smoothProgress = useSpring(scrollYProgress, {
        stiffness: 160,
        damping: 26,
        restDelta: 0.001,
    });

    return (
        <section
            ref={sectionRef}
            id="how-it-works"
            className="scroll-mt-20 border-b border-[var(--color-rule)] bg-[var(--color-paper)] py-20 sm:py-28"
            aria-labelledby="how-title"
        >
            <div className="mx-auto max-w-[var(--container)] px-4 sm:px-8 lg:px-12">
                <Reveal>
                    <SectionIndex
                        number="02"
                        label="How It Works"
                        title="Three hands-on steps from resume to interview."
                    />
                </Reveal>

                {/* Scroll-driven 01 -> 02 -> 03 progress rail (desktop) */}
                <div className="relative mt-12 hidden items-center justify-between px-12 lg:flex">
                    <div
                        aria-hidden="true"
                        className="absolute right-12 left-12 top-1/2 h-[2px] -translate-y-1/2 bg-[var(--color-rule)]"
                    />
                    <motion.div
                        aria-hidden="true"
                        style={{ scaleX: smoothProgress }}
                        className="absolute right-12 left-12 top-1/2 h-[2px] -translate-y-1/2 origin-left bg-[#9FE870]"
                    />

                    {STEPS.map((step, idx) => {
                        const isActive = idx === activeStep;
                        return (
                            <button
                                key={step.id}
                                type="button"
                                onClick={() => setActiveStep(idx)}
                                className={`relative z-10 inline-flex cursor-pointer items-center gap-2 rounded-full border px-3.5 py-1.5 font-mono text-xs font-bold transition-colors ${
                                    isActive
                                        ? 'border-[#9FE870] bg-[#9FE870] text-[#163300]'
                                        : 'border-[var(--color-rule)] bg-[var(--color-card)] text-[var(--color-ink-2)] hover:border-[#9FE870] hover:text-[var(--color-ink)]'
                                }`}
                            >
                                <span>0{idx + 1}</span>
                                <span className="font-sans font-semibold">{step.tag}</span>
                            </button>
                        );
                    })}
                </div>

                {/* 3 kinetic dashed-frame cards with live micro-playgrounds */}
                <div className="mt-8 grid grid-cols-1 gap-6 lg:mt-8 lg:grid-cols-3">
                    {STEPS.map((step, idx) => (
                        <StepCard
                            key={step.id}
                            step={step}
                            index={idx}
                            isActive={activeStep === idx}
                            onActivate={() => setActiveStep(idx)}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default HowItWorks;