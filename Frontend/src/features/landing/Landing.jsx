import React, { useState } from 'react';
import { Link } from 'react-router';
import { motion, useReducedMotion } from 'framer-motion';
import {
    ArrowRight,
    Check,
    ChevronDown,
    Mail,
    Moon,
    Sun,
    X
} from 'lucide-react';
import StackMatchLogo from '../../components/StackMatchLogo';
import { useTheme } from '../theme/theme.context';
import { useAuth } from '../auth/hooks/useAuth';
import HeroReportPreview from './components/HeroReportPreview';
import ScrollShowcase from './components/ScrollShowcase';
import LegalModals from './components/LegalModals';
import Reveal from './components/Reveal';

const FAQ_ITEMS = [
    {
        q: 'How does the keyword match work?',
        a: 'Paste a job description. StackMatch compares it with your resume and shows which terms match and which are missing.'
    },
    {
        q: 'Is it free to start?',
        a: 'Yes. Start with a resume and one job description at no cost.'
    },
    {
        q: 'What can I export?',
        a: 'A clean PDF resume and an Overleaf-ready .tex file.'
    },
    {
        q: 'Is my resume private?',
        a: 'Your files are used only for the features you run. You can delete them from Settings at any time.'
    },
    {
        q: 'Does StackMatch guarantee an interview?',
        a: 'No. It shows the gaps between your resume and a job so you can decide what to fix.'
    }
];

const STEPS = [
    {
        title: 'Add your resume',
        body: 'Upload a PDF or paste the text.'
    },
    {
        title: 'Choose a job',
        body: 'Paste a job description or open a saved role.'
    },
    {
        title: 'Close the gaps',
        body: 'Update weak keywords, then export PDF or .tex.'
    }
];

const Landing = () => {
    const { theme, toggleTheme } = useTheme();
    const { user } = useAuth();
    const reduceMotion = useReducedMotion();

    const [openFaqIndex, setOpenFaqIndex] = useState(0);
    const [activeModal, setActiveModal] = useState(null); // 'privacy' | 'terms' | null

    return (
        <div className="min-h-screen bg-[var(--color-paper)] text-[var(--color-ink)] selection:bg-[#9FE870] selection:text-[#163300]">
            <header className="sticky top-0 z-40 w-full border-b border-[var(--color-rule)] bg-[var(--color-paper)]/85 backdrop-blur-md transition-colors">
                <div className="mx-auto flex h-16 max-w-[var(--container)] items-center justify-between gap-3 px-4 sm:px-8 lg:px-12">
                    <Link to="/" className="flex shrink-0 items-center text-decoration-none" aria-label="StackMatch home">
                        <span className="sm:hidden">
                            <StackMatchLogo compact />
                        </span>
                        <span className="hidden sm:inline-flex">
                            <StackMatchLogo />
                        </span>
                    </Link>

                    <nav className="hidden items-center gap-7 text-sm font-semibold text-[var(--color-ink-2)] lg:flex" aria-label="Page sections">
                        <a href="#features" className="whitespace-nowrap transition-colors hover:text-[var(--color-ink)]">
                            Features
                        </a>
                        <a href="#how-it-works" className="whitespace-nowrap transition-colors hover:text-[var(--color-ink)]">
                            How it works
                        </a>
                        <a href="#faq" className="whitespace-nowrap transition-colors hover:text-[var(--color-ink)]">
                            FAQ
                        </a>
                    </nav>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={toggleTheme}
                            className="theme-icon shrink-0 cursor-pointer shadow-xs"
                            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                        >
                            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                        </button>

                        {user ? (
                            <Link
                                to="/home"
                                className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-[#163300] px-4 py-2 text-sm font-bold text-white shadow-xs transition-colors hover:bg-[#204a00] dark:bg-[#9FE870] dark:text-[#163300] dark:hover:bg-[#8dd461]"
                            >
                                <span>Workspace</span>
                                <ArrowRight size={15} />
                            </Link>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="hidden shrink-0 items-center justify-center whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-semibold text-[var(--color-ink)] transition-colors hover:bg-[var(--color-paper-2)] hover:text-[#163300] dark:hover:text-[#9FE870] sm:inline-flex"
                                >
                                    Log in
                                </Link>
                                <Link
                                    to="/register"
                                    className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-[#9FE870] px-4 py-2 text-sm font-bold text-[#163300] shadow-sm transition-all hover:scale-[1.02] hover:bg-[#8dd461]"
                                >
                                    <span>Start free</span>
                                    <ArrowRight size={15} />
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </header>

            <main>
                <section className="relative overflow-hidden" aria-labelledby="hero-title">
                    <div className="mx-auto grid max-w-[var(--container)] grid-cols-1 gap-10 px-4 pb-14 pt-10 sm:px-8 sm:pb-20 sm:pt-14 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-center lg:gap-12 lg:px-12 lg:pt-16">
                        <motion.div
                            className="min-w-0"
                            initial={reduceMotion ? false : { opacity: 0, y: 18 }}
                            animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                            transition={{
                                duration: reduceMotion ? 0 : 0.55,
                                ease: [0.22, 1, 0.36, 1]
                            }}
                        >
                            <p className="flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
                                <span className="h-1.5 w-1.5 rounded-full bg-[#9FE870]" />
                                Resume matching
                            </p>

                            <h1
                                id="hero-title"
                                className="mt-4 font-display text-[clamp(3.25rem,7vw,5.5rem)] font-extrabold leading-[0.92] tracking-[-0.055em] text-[var(--color-ink)]"
                            >
                                <span className="block">Make it</span>
                                <span className="block">
                                    <span className="relative inline-block">
                                        <span
                                            aria-hidden="true"
                                            className="absolute inset-x-0 bottom-[0.08em] h-[0.17em] rounded-full bg-[#9FE870]"
                                        />
                                        <span className="relative">match</span>
                                    </span>
                                    .
                                </span>
                            </h1>

                            <p className="mt-6 max-w-[31rem] text-base leading-relaxed text-[var(--color-ink-2)] sm:text-lg">
                                Score your resume against any job, close keyword gaps, and export an ATS-ready PDF.
                            </p>

                            <div className="mt-7 flex flex-wrap items-center gap-3">
                                <Link
                                    to={user ? '/home' : '/register'}
                                    className="btn btn-primary px-6 text-sm font-bold sm:text-base"
                                >
                                    <span>{user ? 'Open workspace' : 'Start free'}</span>
                                    <ArrowRight size={17} />
                                </Link>
                                <a
                                    href="#how-it-works"
                                    className="inline-flex min-h-12 items-center justify-center rounded-full border border-[var(--color-rule)] bg-transparent px-5 text-sm font-semibold text-[var(--color-ink)] transition-colors hover:bg-[var(--color-paper-2)] sm:text-base"
                                >
                                    See how it works
                                </a>
                            </div>

                            <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-[var(--color-rule)] pt-5 text-xs font-medium text-[var(--color-muted)]">
                                <span className="inline-flex items-center gap-1.5">
                                    <Check className="h-3.5 w-3.5 text-[#163300] dark:text-[#9FE870]" aria-hidden="true" />
                                    Free to start
                                </span>
                                <span className="inline-flex items-center gap-1.5">
                                    <Check className="h-3.5 w-3.5 text-[#163300] dark:text-[#9FE870]" aria-hidden="true" />
                                    PDF + .tex export
                                </span>
                                <span className="inline-flex items-center gap-1.5">
                                    <Check className="h-3.5 w-3.5 text-[#163300] dark:text-[#9FE870]" aria-hidden="true" />
                                    No credit card
                                </span>
                            </div>
                        </motion.div>

                        <motion.div
                            id="hero-preview"
                            className="relative mx-auto w-full min-w-0 max-w-[630px] lg:justify-self-end"
                            initial={reduceMotion ? false : { opacity: 0, y: 24 }}
                            animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                            transition={{
                                duration: reduceMotion ? 0 : 0.55,
                                delay: reduceMotion ? 0 : 0.12,
                                ease: [0.22, 1, 0.36, 1]
                            }}
                        >
                            <div
                                aria-hidden="true"
                                className="absolute -inset-x-2 bottom-[-8px] top-6 rounded-3xl bg-[#9FE870]"
                            />
                            <div className="relative">
                                <HeroReportPreview />
                            </div>
                        </motion.div>
                    </div>
                </section>

                <section
                    id="problem-solution"
                    className="scroll-mt-20 border-y border-[var(--color-rule)] bg-[var(--color-paper-2)]/45 py-14 sm:py-20"
                    aria-labelledby="difference-title"
                >
                    <div className="mx-auto grid max-w-[var(--container)] gap-8 px-4 sm:px-8 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] lg:items-center lg:gap-16 lg:px-12">
                        <Reveal>
                            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
                                The difference
                            </p>
                            <h2
                                id="difference-title"
                                className="mt-2 max-w-md font-display text-3xl font-extrabold tracking-tight text-[var(--color-ink)] sm:text-4xl"
                            >
                                One resume does not fit every job.
                            </h2>
                            <p className="mt-4 max-w-sm text-sm leading-relaxed text-[var(--color-ink-2)] sm:text-base">
                                The job post is the brief.
                            </p>
                        </Reveal>

                        <Reveal
                            delay={0.1}
                            className="overflow-hidden rounded-3xl border border-[var(--color-rule)] bg-[var(--color-card)] shadow-sm"
                        >
                            <div className="grid md:grid-cols-2">
                                <div className="border-b border-[var(--color-rule)] p-5 sm:p-6 md:border-b-0 md:border-r">
                                    <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--color-muted)]">
                                        Without StackMatch
                                    </p>
                                    <ul className="mt-4 space-y-3">
                                        {[
                                            'One resume for every job',
                                            'Keywords by guesswork',
                                            'Exports that may not parse'
                                        ].map((item) => (
                                            <li key={item} className="flex items-start gap-2.5 text-sm text-[var(--color-ink-2)]">
                                                <X
                                                    className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-500/75"
                                                    aria-hidden="true"
                                                />
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="bg-[#163300] p-5 text-white sm:p-6">
                                    <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[#9FE870]">
                                        With StackMatch
                                    </p>
                                    <ul className="mt-4 space-y-3">
                                        {[
                                            'Keywords matched to the job',
                                            'Gaps shown before you apply',
                                            'Clean PDF and .tex export'
                                        ].map((item) => (
                                            <li key={item} className="flex items-start gap-2.5 text-sm text-zinc-100">
                                                <Check
                                                    className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#9FE870]"
                                                    aria-hidden="true"
                                                />
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </Reveal>
                    </div>
                </section>

                <ScrollShowcase />

                <section
                    id="how-it-works"
                    className="scroll-mt-20 border-b border-[var(--color-rule)] bg-[var(--color-paper)] py-16 sm:py-24"
                    aria-labelledby="how-title"
                >
                    <div className="mx-auto max-w-[var(--container)] px-4 sm:px-8 lg:px-12">
                        <Reveal className="max-w-2xl">
                            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
                                How it works
                            </p>
                            <h2
                                id="how-title"
                                className="mt-2 font-display text-3xl font-extrabold tracking-tight text-[var(--color-ink)] sm:text-4xl"
                            >
                                Three steps to a closer match.
                            </h2>
                        </Reveal>

                        <div className="mt-9 overflow-hidden rounded-3xl border border-[var(--color-rule)] bg-[var(--color-card)] md:grid md:grid-cols-3">
                            {STEPS.map((step, index) => (
                                <Reveal
                                    key={step.title}
                                    delay={index * 0.08}
                                    className={`p-6 sm:p-8 ${
                                        index < STEPS.length - 1
                                            ? 'border-b border-[var(--color-rule)] md:border-b-0 md:border-r'
                                            : ''
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="font-mono text-xs font-bold tabular-nums text-[var(--color-muted)]">
                                            0{index + 1}
                                        </span>
                                        <span className="h-px flex-1 bg-[var(--color-rule)]" />
                                    </div>
                                    <h3 className="mt-8 font-display text-xl font-extrabold tracking-tight text-[var(--color-ink)]">
                                        {step.title}
                                    </h3>
                                    <p className="mt-2 text-sm leading-relaxed text-[var(--color-ink-2)]">
                                        {step.body}
                                    </p>
                                </Reveal>
                            ))}
                        </div>
                    </div>
                </section>

                <section
                    id="faq"
                    className="scroll-mt-20 border-b border-[var(--color-rule)] bg-[var(--color-paper-2)]/30 py-16 sm:py-24"
                    aria-labelledby="faq-title"
                >
                    <div className="mx-auto grid max-w-[var(--container)] gap-8 px-4 sm:px-8 lg:grid-cols-[minmax(0,0.65fr)_minmax(0,1.35fr)] lg:gap-16 lg:px-12">
                        <Reveal>
                            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
                                FAQ
                            </p>
                            <h2
                                id="faq-title"
                                className="mt-2 font-display text-3xl font-extrabold tracking-tight text-[var(--color-ink)] sm:text-4xl"
                            >
                                Common questions
                            </h2>
                        </Reveal>

                        <div className="space-y-2.5">
                            {FAQ_ITEMS.map((item, index) => {
                                const isOpen = openFaqIndex === index;
                                const answerId = `faq-answer-${index}`;
                                const questionId = `faq-question-${index}`;

                                return (
                                    <Reveal
                                        key={item.q}
                                        delay={index * 0.05}
                                        className={`overflow-hidden rounded-2xl border bg-[var(--color-card)] transition-colors ${
                                            isOpen
                                                ? 'border-[#9FE870]'
                                                : 'border-[var(--color-rule)]'
                                        }`}
                                    >
                                        <button
                                            type="button"
                                            id={questionId}
                                            onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                                            aria-expanded={isOpen}
                                            aria-controls={answerId}
                                            className="flex w-full cursor-pointer items-center justify-between gap-4 p-4 text-left select-none sm:p-5"
                                        >
                                            <span className="font-display text-sm font-bold leading-snug text-[var(--color-ink)] sm:text-base">
                                                {item.q}
                                            </span>
                                            <span
                                                className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg transition-all duration-200 ${
                                                    isOpen
                                                        ? 'rotate-180 bg-[#9FE870] text-[#163300]'
                                                        : 'bg-[var(--color-paper-2)] text-[var(--color-ink)]'
                                                }`}
                                            >
                                                <ChevronDown className="h-4 w-4" aria-hidden="true" />
                                            </span>
                                        </button>

                                        <div
                                            id={answerId}
                                            role="region"
                                            aria-labelledby={questionId}
                                            aria-hidden={!isOpen}
                                            className={`grid transition-[grid-template-rows] duration-300 ${
                                                isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                                            }`}
                                        >
                                            <div className="overflow-hidden">
                                                <p className="border-t border-[var(--color-rule)] px-4 py-4 text-sm leading-relaxed text-[var(--color-ink-2)] sm:px-5">
                                                    {item.a}
                                                </p>
                                            </div>
                                        </div>
                                    </Reveal>
                                );
                            })}
                        </div>
                    </div>
                </section>

                <section
                    className="relative overflow-hidden bg-[#163300] py-16 text-white sm:py-20"
                    aria-label="Get started"
                >
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_82%_18%,rgba(159,232,112,0.2),transparent_55%)]"
                    />

                    <div className="relative z-10 mx-auto grid max-w-[var(--container)] gap-8 px-4 sm:px-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:items-end lg:gap-16 lg:px-12">
                        <Reveal>
                            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9FE870]">
                                Start here
                            </p>
                            <h2 className="mt-3 max-w-2xl font-display text-3xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-5xl">
                                Your next application starts with a match.
                            </h2>
                            <p className="mt-4 max-w-md text-sm leading-relaxed text-zinc-300 sm:text-base">
                                Check the job before you hit send.
                            </p>
                        </Reveal>

                        <Reveal delay={0.1} className="flex flex-col gap-3 sm:flex-row lg:justify-end">
                            <Link
                                to={user ? '/home' : '/register'}
                                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#9FE870] px-6 text-sm font-bold text-[#163300] shadow-lg transition-transform hover:scale-[1.02] hover:bg-[#8dd461] active:scale-[0.98] sm:text-base"
                            >
                                <span>{user ? 'Open workspace' : 'Start free'}</span>
                                <ArrowRight className="h-4 w-4" aria-hidden="true" />
                            </Link>
                            <Link
                                to={user ? '/saved-jobs' : '/login'}
                                className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/20 px-5 text-sm font-semibold text-white transition-colors hover:bg-white/10 sm:text-base"
                            >
                                {user ? 'View saved jobs' : 'Sign in'}
                            </Link>
                        </Reveal>
                    </div>

                    <div className="relative z-10 mx-auto mt-10 max-w-[var(--container)] border-t border-white/10 px-4 pt-4 text-xs text-zinc-400 sm:px-8 lg:px-12">
                        Free to start. No credit card.
                    </div>
                </section>
            </main>

            <footer className="border-t border-[var(--color-rule)] bg-[var(--color-paper)] py-12 text-[var(--color-ink)] sm:py-16" aria-label="Site footer">
                <Reveal className="mx-auto max-w-[var(--container)] space-y-10 px-4 sm:px-8 lg:px-12">
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-12 lg:gap-10">
                        <div className="space-y-3 md:col-span-5">
                            <Link to="/" className="inline-block text-decoration-none" aria-label="StackMatch home">
                                <StackMatchLogo />
                            </Link>
                            <p className="max-w-sm text-xs leading-relaxed text-[var(--color-ink-2)] sm:text-sm">
                                Match your resume to the job, then prep for the interview.
                            </p>
                            <div className="flex items-center gap-2.5 pt-1">
                                <a
                                    href="https://mail.google.com/mail/?view=cm&fs=1&to=stackmatch.support@gmail.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="rounded-full border border-[var(--color-rule)] bg-[var(--color-card)] p-2.5 text-[var(--color-ink-2)] transition-colors hover:border-[#9FE870] hover:text-[#163300] dark:hover:text-[#9FE870]"
                                    aria-label="Contact email via Gmail"
                                    title="Email: stackmatch.support@gmail.com"
                                >
                                    <Mail className="h-4 w-4" />
                                </a>

                                <a
                                    href="https://www.linkedin.com/in/hitenderjangra/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="rounded-full border border-[var(--color-rule)] bg-[var(--color-card)] p-2.5 text-[var(--color-ink-2)] transition-colors hover:border-[#9FE870] hover:text-[#163300] dark:hover:text-[#9FE870]"
                                    aria-label="LinkedIn profile"
                                    title="LinkedIn: hitenderjangra"
                                >
                                    <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                                        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                                    </svg>
                                </a>

                                <a
                                    href="https://github.com/hitJangra"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="rounded-full border border-[var(--color-rule)] bg-[var(--color-card)] p-2.5 text-[var(--color-ink-2)] transition-colors hover:border-[#9FE870] hover:text-[#163300] dark:hover:text-[#9FE870]"
                                    aria-label="GitHub profile"
                                    title="GitHub: hitJangra"
                                >
                                    <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                                        <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                                    </svg>
                                </a>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:col-span-7">
                            <div className="space-y-2.5">
                                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--color-muted)]">
                                    Product
                                </h4>
                                <ul className="space-y-2 text-xs text-[var(--color-ink-2)] sm:text-sm">
                                    <li>
                                        <a href="#features" className="transition-colors hover:text-[var(--color-ink)]">
                                            Keyword heatmap
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#features" className="transition-colors hover:text-[var(--color-ink)]">
                                            LaTeX export
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#features" className="transition-colors hover:text-[var(--color-ink)]">
                                            Outreach hub
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#features" className="transition-colors hover:text-[var(--color-ink)]">
                                            Interview practice
                                        </a>
                                    </li>
                                </ul>
                            </div>

                            <div className="space-y-2.5">
                                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--color-muted)]">
                                    Resources
                                </h4>
                                <ul className="space-y-2 text-xs text-[var(--color-ink-2)] sm:text-sm">
                                    <li>
                                        <a href="#how-it-works" className="transition-colors hover:text-[var(--color-ink)]">
                                            How it works
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#features" className="transition-colors hover:text-[var(--color-ink)]">
                                            Features
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#problem-solution" className="transition-colors hover:text-[var(--color-ink)]">
                                            The difference
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#faq" className="transition-colors hover:text-[var(--color-ink)]">
                                            FAQ
                                        </a>
                                    </li>
                                </ul>
                            </div>

                            <div className="space-y-2.5">
                                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--color-muted)]">
                                    Legal & access
                                </h4>
                                <ul className="space-y-2 text-xs text-[var(--color-ink-2)] sm:text-sm">
                                    <li>
                                        <button
                                            type="button"
                                            onClick={() => setActiveModal('privacy')}
                                            className="cursor-pointer text-left transition-colors hover:text-[var(--color-ink)]"
                                        >
                                            Privacy policy
                                        </button>
                                    </li>
                                    <li>
                                        <button
                                            type="button"
                                            onClick={() => setActiveModal('terms')}
                                            className="cursor-pointer text-left transition-colors hover:text-[var(--color-ink)]"
                                        >
                                            Terms of service
                                        </button>
                                    </li>
                                    <li>
                                        <Link to="/login" className="transition-colors hover:text-[var(--color-ink)]">
                                            Sign in
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/register" className="transition-colors hover:text-[var(--color-ink)]">
                                            Create account
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col items-center justify-between gap-3 border-t border-[var(--color-rule)] pt-6 text-xs text-[var(--color-muted)] sm:flex-row">
                        <p>&copy; 2026 StackMatch. All rights reserved.</p>
                        <p className="flex items-center gap-1.5 font-medium">
                            <span>Built by Hitender Jangra</span>
                            <span className="text-[#9FE870]" aria-hidden="true">♥</span>
                        </p>
                    </div>
                </Reveal>
            </footer>

            <LegalModals activeModal={activeModal} onClose={() => setActiveModal(null)} />
        </div>
    );
};

export default Landing;
