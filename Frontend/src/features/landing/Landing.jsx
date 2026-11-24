import React, { useState } from 'react';
import { Link } from 'react-router';
import { motion, useReducedMotion } from 'framer-motion';
import { 
    ArrowRight, 
    Check, 
    FileText, 
    Layers, 
    Code2, 
    ShieldCheck, 
    Compass, 
    BookmarkCheck,
    Sun, 
    Moon, 
    ChevronDown, 
    FileDown, 
    X, 
    CheckCircle2, 
    AlertCircle, 
    Mail, 
    ExternalLink,
    Zap,
    Cpu,
    ArrowUpRight,
    Lock
} from 'lucide-react';
import StackMatchLogo from '../../components/StackMatchLogo';
import { useTheme } from '../theme/theme.context';
import { useAuth } from '../auth/hooks/useAuth';
import HeroReportPreview from './components/HeroReportPreview';
import ScrollShowcase from './components/ScrollShowcase';
import LegalModals from './components/LegalModals';

const FAQ_ITEMS = [
    {
        q: "How does StackMatch guarantee 100% ATS compatibility?",
        a: "Applicant Tracking Systems (such as Greenhouse, Lever, Workday, and Taleo) fail frequently when parsing multi-column templates, tables, floating text boxes, and complex graphics. StackMatch generates single-column, linearly structured resumes adhering strictly to ATS typographic hierarchies. Headings, dates, roles, and skills are formatted in standard ASCII blocks so candidate parsers extract 100% of your experience without missing or misattributing skills."
    },
    {
        q: "Why do you provide LaTeX / Overleaf (.tex) export instead of just DOCX or Canva?",
        a: "Canva and Word templates introduce subtle formatting discrepancies, font-rendering glitches, and fragile margin shifts across different operating systems. LaTeX is the gold standard for precision document engineering. With our 1-click Overleaf-ready .tex export, you get pixel-perfect typography, clean mathematical and technical symbols, customizable styling, and effortless version control—all while preserving bulletproof ATS scannability."
    },
    {
        q: "Does StackMatch work for non-tech and non-engineering positions?",
        a: "Absolutely. StackMatch's semantic extraction engine is domain-agnostic. Whether you work in Product Management, Product Design, Finance, Operations, Healthcare, Marketing, or Sales, StackMatch benchmarks your experience directly against the exact terminology, KPIs, and toolchains specified in any target job description."
    },
    {
        q: "What happens to my uploaded resume data and privacy?",
        a: "Your data privacy is paramount. StackMatch never sells your resume data, contact information, or job history to third-party recruiters, advertising networks, or AI scrapers. Your documents are processed in secure, isolated runtime environments strictly for generating your match metrics, tailored resumes, and interview preparation questions. You can wipe your data or delete your account permanently at any time."
    },
    {
        q: "Is StackMatch really free to get started?",
        a: "Yes. You can upload your master resume, paste target job descriptions, calculate ATS keyword match scores, preview skill gaps, and export tailored ATS resumes completely free. We believe every candidate deserves clear, transparent insight into how hiring algorithms evaluate their qualifications."
    }
];

const Landing = () => {
    const { theme, toggleTheme } = useTheme();
    const { user } = useAuth();
    const reduceMotion = useReducedMotion();

    const [openFaqIndex, setOpenFaqIndex] = useState(0);
    const [activeModal, setActiveModal] = useState(null); // 'privacy' | 'terms' | null

    const entrance = reduceMotion
        ? { initial: false }
        : { initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 } };

    return (
        <div className="min-h-screen bg-[var(--color-paper)] text-[var(--color-ink)] selection:bg-[#9FE870] selection:text-[#163300]">
            {/* Sticky Navbar (compact h-16 for above-the-fold space) */}
            <header className="sticky top-0 z-40 w-full border-b border-[var(--color-rule)] bg-[var(--color-paper)]/85 backdrop-blur-md transition-colors">
                <div className="max-w-[var(--container)] mx-auto px-4 sm:px-8 lg:px-12 h-16 flex items-center justify-between gap-4">
                    {/* Brand */}
                    <Link to="/" className="flex items-center gap-3 text-decoration-none group" aria-label="StackMatch Home">
                        <StackMatchLogo />
                    </Link>

                    {/* Desktop Anchor Navigation Links */}
                    <nav className="hidden lg:flex items-center gap-7 text-sm font-semibold text-[var(--color-ink-2)]" aria-label="Quick links">
                        <a href="#features" className="hover:text-[var(--color-ink)] transition-colors">
                            Features
                        </a>
                        <a href="#how-it-works" className="hover:text-[var(--color-ink)] transition-colors">
                            How It Works
                        </a>
                        <a href="#problem-solution" className="hover:text-[var(--color-ink)] transition-colors">
                            The Difference
                        </a>
                        <a href="#faq" className="hover:text-[var(--color-ink)] transition-colors">
                            FAQ
                        </a>
                    </nav>

                    {/* Actions: Theme Toggle + Auth CTAs */}
                    <div className="flex items-center gap-2.5">
                        {/* Theme Toggle Button */}
                        <button
                            type="button"
                            onClick={toggleTheme}
                            className="theme-icon cursor-pointer shadow-xs shrink-0"
                            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                        >
                            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                        </button>

                        {user ? (
                            /* Logged in state */
                            <Link
                                to="/home"
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#163300] text-white hover:bg-[#204a00] dark:bg-[#9FE870] dark:text-[#163300] dark:hover:bg-[#8dd461] text-sm font-bold transition-all shadow-xs whitespace-nowrap shrink-0"
                            >
                                <span>Go to Workspace</span>
                                <ArrowRight size={15} />
                            </Link>
                        ) : (
                            /* Unauthenticated state */
                            <>
                                <Link
                                    to="/login"
                                    className="hidden sm:inline-flex items-center justify-center px-3.5 py-1.5 rounded-full text-sm font-semibold text-[var(--color-ink)] hover:text-[#163300] dark:hover:text-[#9FE870] hover:bg-[var(--color-paper-2)] transition-colors whitespace-nowrap shrink-0"
                                >
                                    Log in
                                </Link>
                                <Link
                                    to="/register"
                                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#9FE870] hover:bg-[#8dd461] text-[#163300] text-sm font-bold transition-all shadow-sm hover:scale-[1.02] whitespace-nowrap shrink-0"
                                >
                                    <span>Get Started Free</span>
                                    <ArrowRight size={15} />
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </header>

            <main>
                {/* 1. Hero Section (tightened for above-the-fold visibility) */}
                <section className="relative pt-6 sm:pt-8 pb-10 sm:pb-14 overflow-hidden" aria-labelledby="hero-title">
                    <div className="max-w-[var(--container)] mx-auto px-4 sm:px-8 lg:px-12">
                        {/* Hero Text */}
                        <motion.div 
                            className="text-center max-w-3xl mx-auto space-y-3.5"
                            {...entrance}
                            transition={{ duration: reduceMotion ? 0 : 0.4, ease: 'easeOut' }}
                        >
                            {/* Eyebrow Pill */}
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--color-rule)] bg-[var(--color-card)] text-xs font-semibold text-[var(--color-ink-2)] shadow-xs">
                                <span className="w-2 h-2 rounded-full bg-[#9FE870] animate-pulse" />
                                <span>ATS Match Algorithm & LaTeX Export</span>
                            </div>

                            {/* Main Headline (tightened to punchy 1-2 lines) */}
                            <h1 
                                id="hero-title"
                                className="text-3xl sm:text-5xl lg:text-6xl font-extrabold font-display tracking-tight text-[var(--color-ink)] leading-[1.08] text-balance"
                            >
                                Target the <span className="text-[#163300] dark:text-[#9FE870]">exact keywords</span> hiring teams screen for.
                            </h1>

                            {/* Subheadline (punchy 1-line) */}
                            <p className="text-sm sm:text-base text-[var(--color-ink-2)] max-w-2xl mx-auto font-normal leading-relaxed text-pretty">
                                Instant ATS keyword scoring, publication-grade LaTeX resumes, and role-specific interview prep.
                            </p>

                            {/* CTA Buttons */}
                            <div className="pt-1 flex flex-wrap items-center justify-center gap-3">
                                <Link
                                    to={user ? "/home" : "/register"}
                                    className="btn btn-primary px-7 py-3 text-sm sm:text-base font-bold shadow-md hover:scale-[1.02] active:scale-[0.98] transition-transform whitespace-nowrap shrink-0"
                                >
                                    <span>{user ? "Open Your Workspace" : "Start Matching Free"}</span>
                                    <ArrowRight size={17} />
                                </Link>
                                <a
                                    href="#hero-preview"
                                    className="btn btn-secondary px-5 py-3 text-sm sm:text-base font-semibold border border-[var(--color-rule)] hover:bg-[var(--color-paper-2)] transition-colors whitespace-nowrap shrink-0"
                                >
                                    Explore Sample Report
                                </a>
                            </div>

                            {/* Trust & Guarantee Indicators */}
                            <div className="pt-2 flex flex-wrap items-center justify-center gap-4 sm:gap-7 text-xs font-medium text-[var(--color-muted)]">
                                <div className="flex items-center gap-1.5">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-[#163300] dark:text-[#9FE870]" />
                                    <span>Single-Column ATS Standard</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-[#163300] dark:text-[#9FE870]" />
                                    <span>Overleaf .tex + PDF Export</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-[#163300] dark:text-[#9FE870]" />
                                    <span>100% Private & Never Sold</span>
                                </div>
                            </div>
                        </motion.div>

                        {/* Large, Crisp UI Preview of the StackMatch Interview Report */}
                        <motion.div 
                            id="hero-preview"
                            className="mt-6 sm:mt-10 max-w-5xl mx-auto"
                            initial={reduceMotion ? false : { opacity: 0, y: 28 }}
                            whileInView={reduceMotion ? {} : { opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.2 }}
                            transition={{ duration: reduceMotion ? 0 : 0.45, ease: 'easeOut' }}
                        >
                            <HeroReportPreview />
                        </motion.div>
                    </div>
                </section>

                {/* 2. Problem vs. Solution Strip (concise 1-line bullets) */}
                <section id="problem-solution" className="py-14 sm:py-18 border-y border-[var(--color-rule)] bg-[var(--color-paper-2)]/40" aria-label="The Difference">
                    <div className="max-w-[var(--container)] mx-auto px-4 sm:px-8 lg:px-12">
                        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
                            <h2 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight text-[var(--color-ink)]">
                                Why qualified resumes get lost in the recruiter void.
                            </h2>
                            <p className="text-sm sm:text-base text-[var(--color-ink-2)]">
                                Hiring algorithms filter by keywords and formatting. Target the job and stand out.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6 max-w-4xl mx-auto">
                            {/* Problem Card */}
                            <motion.div 
                                initial={reduceMotion ? false : { opacity: 0, y: 28 }}
                                whileInView={reduceMotion ? {} : { opacity: 1, y: 0 }}
                                viewport={{ once: true, amount: 0.2 }}
                                transition={{ duration: reduceMotion ? 0 : 0.45, ease: 'easeOut' }}
                                className="rounded-2xl border border-red-500/20 bg-[var(--color-card)] p-5 sm:p-6 space-y-4 shadow-xs"
                            >
                                <div className="flex items-center justify-between pb-3 border-b border-[var(--color-rule)]">
                                    <div className="flex items-center gap-2.5">
                                        <div className="p-1.5 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400">
                                            <AlertCircle className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-sm sm:text-base text-[var(--color-ink)]">
                                                The Spray-and-Pray Routine
                                            </h3>
                                            <span className="text-[11px] text-red-600 dark:text-red-400 font-mono">
                                                ~2% Response Rate
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <ul className="space-y-2.5 text-xs sm:text-sm text-[var(--color-ink-2)]">
                                    <li className="flex items-start gap-2.5">
                                        <X className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                                        <span>Multi-column templates crash ATS parsers into unreadable text</span>
                                    </li>
                                    <li className="flex items-start gap-2.5">
                                        <X className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                                        <span>Keyword guessing misses exact terms required for initial screen</span>
                                    </li>
                                    <li className="flex items-start gap-2.5">
                                        <X className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                                        <span>Entering interviews cold without role-specific technical Q&A</span>
                                    </li>
                                    <li className="flex items-start gap-2.5">
                                        <X className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                                        <span>Applications lost and disorganized across chaotic spreadsheets</span>
                                    </li>
                                </ul>
                            </motion.div>

                            {/* Solution Card */}
                            <motion.div 
                                initial={reduceMotion ? false : { opacity: 0, y: 28 }}
                                whileInView={reduceMotion ? {} : { opacity: 1, y: 0 }}
                                viewport={{ once: true, amount: 0.2 }}
                                transition={{ duration: reduceMotion ? 0 : 0.45, delay: reduceMotion ? 0 : 0.1, ease: 'easeOut' }}
                                className="rounded-2xl border border-[#9FE870]/40 bg-[var(--color-card)] p-5 sm:p-6 space-y-4 shadow-md relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 w-24 h-24 bg-[#9FE870]/10 rounded-full blur-2xl pointer-events-none" />

                                <div className="flex items-center justify-between pb-3 border-b border-[var(--color-rule)]">
                                    <div className="flex items-center gap-2.5">
                                        <div className="p-1.5 rounded-lg bg-[#9FE870] text-[#163300]">
                                            <ShieldCheck className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-sm sm:text-base text-[var(--color-ink)]">
                                                How StackMatch Fixes It
                                            </h3>
                                            <span className="text-[11px] text-[#163300] dark:text-[#9FE870] font-mono font-bold">
                                                Verified ATS Grade A+
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <ul className="space-y-2.5 text-xs sm:text-sm text-[var(--color-ink-2)]">
                                    <li className="flex items-start gap-2.5">
                                        <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                                        <span>Single-column LaTeX parsed with 100% accuracy by Greenhouse & Lever</span>
                                    </li>
                                    <li className="flex items-start gap-2.5">
                                        <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                                        <span>Exact semantic keyword match & gap detection before you apply</span>
                                    </li>
                                    <li className="flex items-start gap-2.5">
                                        <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                                        <span>Role-specific technical questions & structured STAR practice roadmap</span>
                                    </li>
                                    <li className="flex items-start gap-2.5">
                                        <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                                        <span>Saved jobs tracker with 1-click tailored prep workflows</span>
                                    </li>
                                </ul>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* 3. Scroll-Interactive Feature Showcase (Dribbble 3D Perspective Replicant + Bento Grid) */}
                <ScrollShowcase />

                {/* 4. 3-Step "How It Works" Walkthrough (trimmed to 1 scannable line per step) */}
                <section id="how-it-works" className="py-16 sm:py-24 border-t border-[var(--color-rule)] bg-[var(--color-paper)]" aria-labelledby="hiw-title">
                    <div className="max-w-[var(--container)] mx-auto px-4 sm:px-8 lg:px-12">
                        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-14 space-y-3">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--color-rule)] bg-[var(--color-card)] text-xs font-semibold text-[var(--color-ink-2)]">
                                <Layers className="w-3.5 h-3.5 text-[#163300] dark:text-[#9FE870]" />
                                <span>Fast 3-Step Workflow</span>
                            </div>
                            <h2 id="hiw-title" className="text-2xl sm:text-4xl font-extrabold font-display tracking-tight text-[var(--color-ink)]">
                                From job description to interview-ready in 60 seconds.
                            </h2>
                            <p className="text-sm sm:text-base text-[var(--color-ink-2)]">
                                Zero manual rewriting. Target keywords while you focus on interview delivery.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                            {/* Step 1 */}
                            <motion.div 
                                initial={reduceMotion ? false : { opacity: 0, y: 28 }}
                                whileInView={reduceMotion ? {} : { opacity: 1, y: 0 }}
                                viewport={{ once: true, amount: 0.2 }}
                                transition={{ duration: reduceMotion ? 0 : 0.45, ease: 'easeOut' }}
                                className="rounded-2xl border border-[var(--color-rule)] bg-[var(--color-card)] p-6 space-y-3 shadow-xs hover:border-[#9FE870] transition-colors"
                            >
                                <div className="w-10 h-10 rounded-xl bg-[#163300] text-[#9FE870] flex items-center justify-center font-display font-extrabold text-base shadow-xs">
                                    01
                                </div>
                                <h3 className="text-base sm:text-lg font-bold font-display text-[var(--color-ink)]">
                                    Upload Resume Once
                                </h3>
                                <p className="text-xs sm:text-sm text-[var(--color-ink-2)] leading-relaxed">
                                    Upload your resume once (PDF or text).
                                </p>
                                <div className="pt-1 text-[11px] font-mono text-[var(--color-muted)] flex items-center gap-1.5">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-[#163300] dark:text-[#9FE870]" />
                                    <span>Encrypted & Private</span>
                                </div>
                            </motion.div>

                            {/* Step 2 */}
                            <motion.div 
                                initial={reduceMotion ? false : { opacity: 0, y: 28 }}
                                whileInView={reduceMotion ? {} : { opacity: 1, y: 0 }}
                                viewport={{ once: true, amount: 0.2 }}
                                transition={{ duration: reduceMotion ? 0 : 0.45, delay: reduceMotion ? 0 : 0.1, ease: 'easeOut' }}
                                className="rounded-2xl border border-[var(--color-rule)] bg-[var(--color-card)] p-6 space-y-3 shadow-xs hover:border-[#9FE870] transition-colors"
                            >
                                <div className="w-10 h-10 rounded-xl bg-[#9FE870] text-[#163300] flex items-center justify-center font-display font-extrabold text-base shadow-xs">
                                    02
                                </div>
                                <h3 className="text-base sm:text-lg font-bold font-display text-[var(--color-ink)]">
                                    Paste JD or Pick a Job
                                </h3>
                                <p className="text-xs sm:text-sm text-[var(--color-ink-2)] leading-relaxed">
                                    Paste any job description to benchmark keywords.
                                </p>
                                <div className="pt-1 text-[11px] font-mono text-[var(--color-muted)] flex items-center gap-1.5">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-[#163300] dark:text-[#9FE870]" />
                                    <span>Domain-Agnostic Scan</span>
                                </div>
                            </motion.div>

                            {/* Step 3 */}
                            <motion.div 
                                initial={reduceMotion ? false : { opacity: 0, y: 28 }}
                                whileInView={reduceMotion ? {} : { opacity: 1, y: 0 }}
                                viewport={{ once: true, amount: 0.2 }}
                                transition={{ duration: reduceMotion ? 0 : 0.45, delay: reduceMotion ? 0 : 0.2, ease: 'easeOut' }}
                                className="rounded-2xl border border-[var(--color-rule)] bg-[var(--color-card)] p-6 space-y-3 shadow-xs hover:border-[#9FE870] transition-colors"
                            >
                                <div className="w-10 h-10 rounded-xl bg-[#163300] text-[#9FE870] flex items-center justify-center font-display font-extrabold text-base shadow-xs">
                                    03
                                </div>
                                <h3 className="text-base sm:text-lg font-bold font-display text-[var(--color-ink)]">
                                    Export LaTeX & Prep
                                </h3>
                                <p className="text-xs sm:text-sm text-[var(--color-ink-2)] leading-relaxed">
                                    Export single-column LaTeX & practice interview Q&A.
                                </p>
                                <div className="pt-1 text-[11px] font-mono text-[var(--color-muted)] flex items-center gap-1.5">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-[#163300] dark:text-[#9FE870]" />
                                    <span>ATS Grade A+ Output</span>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* 5. FAQ Accordion */}
                <section id="faq" className="py-16 sm:py-24 border-t border-[var(--color-rule)] bg-[var(--color-paper-2)]/30" aria-labelledby="faq-title">
                    <div className="max-w-[var(--container)] mx-auto px-4 sm:px-8 lg:px-12">
                        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--color-rule)] bg-[var(--color-card)] text-xs font-semibold text-[var(--color-ink-2)]">
                                <ShieldCheck className="w-3.5 h-3.5 text-[#163300] dark:text-[#9FE870]" />
                                <span>Straightforward Answers</span>
                            </div>
                            <h2 id="faq-title" className="text-2xl sm:text-4xl font-extrabold font-display tracking-tight text-[var(--color-ink)]">
                                Frequently Asked Questions
                            </h2>
                            <p className="text-sm text-[var(--color-ink-2)]">
                                Everything you need to know about ATS optimization, LaTeX exports, and privacy.
                            </p>
                        </div>

                        <div className="max-w-2xl mx-auto space-y-3">
                            {FAQ_ITEMS.map((item, idx) => {
                                const isOpen = openFaqIndex === idx;
                                return (
                                    <div
                                        key={idx}
                                        className="rounded-xl border border-[var(--color-rule)] bg-[var(--color-card)] overflow-hidden shadow-xs transition-colors"
                                    >
                                        <button
                                            type="button"
                                            onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                                            className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer select-none"
                                            aria-expanded={isOpen}
                                        >
                                            <span className="font-bold font-display text-sm sm:text-base text-[var(--color-ink)] leading-snug">
                                                {item.q}
                                            </span>
                                            <div className={`p-1.5 rounded-lg bg-[var(--color-paper-2)] text-[var(--color-ink)] transition-transform duration-200 flex-shrink-0 ${
                                                isOpen ? 'rotate-180 bg-[#9FE870] text-[#163300]' : ''
                                            }`}>
                                                <ChevronDown className="w-4 h-4" />
                                            </div>
                                        </button>
                                        {isOpen && (
                                            <div className="px-4 sm:px-5 pb-5 pt-1 text-xs sm:text-sm text-[var(--color-ink-2)] leading-relaxed border-t border-[var(--color-rule)]/50 animate-in fade-in duration-200">
                                                {item.a}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* 6. Closing CTA Banner */}
                <section className="py-16 sm:py-20 bg-[#163300] text-white relative overflow-hidden" aria-label="Get Started">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(159,232,112,0.15),transparent_60%)] pointer-events-none" />

                    <div className="max-w-[var(--container)] mx-auto px-4 sm:px-8 lg:px-12 relative z-10 text-center space-y-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#9FE870]/20 border border-[#9FE870]/30 text-xs font-semibold text-[#9FE870]">
                            <span>Precision Applications</span>
                        </div>

                        <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold font-display tracking-tight max-w-2xl mx-auto leading-[1.1] text-white">
                            Build a resume that lands the interview, <span className="text-[#9FE870]">not the trash can</span>.
                        </h2>

                        <p className="text-sm sm:text-base text-zinc-300 max-w-xl mx-auto font-normal leading-relaxed">
                            Benchmark your keywords, export publication-grade LaTeX resumes, and ace your interviews.
                        </p>

                        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                            <Link
                                to={user ? "/home" : "/register"}
                                className="inline-flex items-center justify-center gap-2 min-h-[48px] px-7 rounded-full bg-[#9FE870] hover:bg-[#8dd461] text-[#163300] font-bold text-sm sm:text-base transition-transform hover:scale-[1.02] active:scale-[0.98] shadow-lg cursor-pointer"
                            >
                                <span>{user ? "Go to Workspace" : "Get Started Free Today"}</span>
                                <ArrowRight className="w-4 h-4 text-[#163300]" />
                            </Link>
                            <Link
                                to={user ? "/home" : "/login"}
                                className="inline-flex items-center justify-center min-h-[48px] px-5 rounded-full border border-white/20 hover:bg-white/10 text-white font-semibold text-sm sm:text-base transition-colors"
                            >
                                {user ? "View Saved Jobs" : "Sign In to Account"}
                            </Link>
                        </div>

                        <div className="pt-2 text-xs font-mono text-zinc-400">
                            No credit card required · Free resume parsing & LaTeX export
                        </div>
                    </div>
                </section>
            </main>

            {/* 7. Real SaaS Footer */}
            <footer className="border-t border-[var(--color-rule)] bg-[var(--color-paper)] text-[var(--color-ink)] py-12 sm:py-16" aria-label="Site footer">
                <div className="max-w-[var(--container)] mx-auto px-4 sm:px-8 lg:px-12 space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-10">
                        {/* Brand & 1-Line Tagline */}
                        <div className="md:col-span-5 space-y-3">
                            <Link to="/" className="inline-block text-decoration-none">
                                <StackMatchLogo />
                            </Link>
                            <p className="text-xs sm:text-sm text-[var(--color-ink-2)] max-w-sm leading-relaxed">
                                Precision resume-job matching, LaTeX-grade ATS exports, and role-specific interview preparation. Built for candidates who care about craft.
                            </p>
                            <div className="pt-1 flex items-center gap-2.5">
                                {/* Email (Direct Gmail Compose in new tab) */}
                                <a
                                    href="https://mail.google.com/mail/?view=cm&fs=1&to=stackmatch.support@gmail.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2.5 rounded-full border border-[var(--color-rule)] bg-[var(--color-card)] text-[var(--color-ink-2)] hover:text-[#163300] dark:hover:text-[#9FE870] hover:border-[#9FE870] transition-colors"
                                    aria-label="Contact Email via Gmail"
                                    title="Email: stackmatch.support@gmail.com"
                                >
                                    <Mail className="w-4 h-4" />
                                </a>

                                {/* LinkedIn */}
                                <a
                                    href="https://www.linkedin.com/in/hitenderjangra/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2.5 rounded-full border border-[var(--color-rule)] bg-[var(--color-card)] text-[var(--color-ink-2)] hover:text-[#163300] dark:hover:text-[#9FE870] hover:border-[#9FE870] transition-colors"
                                    aria-label="LinkedIn Profile"
                                    title="LinkedIn: hitenderjangra"
                                >
                                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                                        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
                                    </svg>
                                </a>

                                {/* GitHub */}
                                <a
                                    href="https://github.com/hitJangra"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2.5 rounded-full border border-[var(--color-rule)] bg-[var(--color-card)] text-[var(--color-ink-2)] hover:text-[#163300] dark:hover:text-[#9FE870] hover:border-[#9FE870] transition-colors"
                                    aria-label="GitHub Profile"
                                    title="GitHub: hitJangra"
                                >
                                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                                        <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                                    </svg>
                                </a>
                            </div>
                        </div>

                        {/* Navigation Columns */}
                        <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-6">
                            {/* Product */}
                            <div className="space-y-2.5">
                                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--color-muted)]">
                                    Product
                                </h4>
                                <ul className="space-y-2 text-xs sm:text-sm text-[var(--color-ink-2)]">
                                    <li>
                                        <a href="#features" className="hover:text-[var(--color-ink)] transition-colors">
                                            ATS Keyword Heatmap
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#features" className="hover:text-[var(--color-ink)] transition-colors">
                                            LaTeX (.tex) Export
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#features" className="hover:text-[var(--color-ink)] transition-colors">
                                            Role Interview Prep
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#features" className="hover:text-[var(--color-ink)] transition-colors">
                                            Smart Job Discovery
                                        </a>
                                    </li>
                                </ul>
                            </div>

                            {/* Resources */}
                            <div className="space-y-2.5">
                                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--color-muted)]">
                                    Resources
                                </h4>
                                <ul className="space-y-2 text-xs sm:text-sm text-[var(--color-ink-2)]">
                                    <li>
                                        <a href="#how-it-works" className="hover:text-[var(--color-ink)] transition-colors">
                                            How It Works
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#problem-solution" className="hover:text-[var(--color-ink)] transition-colors">
                                            The Difference
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#faq" className="hover:text-[var(--color-ink)] transition-colors">
                                            FAQ
                                        </a>
                                    </li>
                                </ul>
                            </div>

                            {/* Legal & Account */}
                            <div className="space-y-2.5">
                                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--color-muted)]">
                                    Legal & Access
                                </h4>
                                <ul className="space-y-2 text-xs sm:text-sm text-[var(--color-ink-2)]">
                                    <li>
                                        <button
                                            type="button"
                                            onClick={() => setActiveModal('privacy')}
                                            className="text-left hover:text-[var(--color-ink)] transition-colors cursor-pointer"
                                        >
                                            Privacy Policy
                                        </button>
                                    </li>
                                    <li>
                                        <button
                                            type="button"
                                            onClick={() => setActiveModal('terms')}
                                            className="text-left hover:text-[var(--color-ink)] transition-colors cursor-pointer"
                                        >
                                            Terms of Service
                                        </button>
                                    </li>
                                    <li>
                                        <Link to="/login" className="hover:text-[var(--color-ink)] transition-colors">
                                            Sign In
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/register" className="hover:text-[var(--color-ink)] transition-colors">
                                            Create Account
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Bottom copyright line with exact requested credit */}
                    <div className="pt-6 border-t border-[var(--color-rule)] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[var(--color-muted)]">
                        <div>
                            &copy; 2026 StackMatch. All rights reserved.
                        </div>
                        <div className="flex items-center gap-1.5 font-medium">
                            <span>Built by Hitender Jangra</span>
                            <span role="img" aria-label="love">❤️</span>
                        </div>
                    </div>
                </div>
            </footer>

            {/* Legal Modals (Privacy Policy / Terms of Service) */}
            <LegalModals activeModal={activeModal} onClose={() => setActiveModal(null)} />
        </div>
    );
};

export default Landing;
