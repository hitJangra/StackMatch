import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import Lenis from 'lenis';
import { AnimatePresence, motion, useScroll, useSpring } from 'framer-motion';
import {
    ArrowRight,
    ArrowUpRight,
    Bookmark,
    Briefcase,
    ChevronDown,
    FileCheck2,
    FileSearch,
    Moon,
    Send,
    Sun,
    Target,
    X,
} from 'lucide-react';
import { useTheme } from '../theme/theme.context';
import { useAuth } from '../auth/hooks/useAuth';
import Hero from './components/Hero';
import FeatureDeck from './components/FeatureDeck';
import { HowItWorks } from './components/HowItWorks';
import { FAQ } from './components/FAQ';
import { ClosingCTA } from './components/ClosingCTA';
import { Footer } from './components/Footer';
import LegalModals from './components/LegalModals';
import { KINETIC_EASE, RollingText } from './components/KineticPrimitives';

const PLATFORM_TOOLS = [
    {
        id: 'find-jobs',
        code: '01',
        name: 'Find Jobs',
        description: 'Filter by India cities, Remote, global roles, experience, and job type.',
        icon: Briefcase,
        href: '#features',
    },
    {
        id: 'match-jd',
        code: '02',
        name: 'Match a JD',
        description: 'Score your resume against a JD, spot gaps, and export a tailored Overleaf .tex resume.',
        icon: FileCheck2,
        href: '#features',
    },
    {
        id: 'prep-mode',
        code: '03',
        name: 'Prep Mode',
        description: 'Behavioral & technical Q&As, AI answer checks, and a downloadable Prep Roadmap PDF.',
        icon: Target,
        href: '#features',
    },
    {
        id: 'resume-lab',
        code: '04',
        name: 'Resume Lab',
        description: 'Run a standalone ATS audit without a JD and rewrite bullets in XYZ format.',
        icon: FileSearch,
        href: '#features',
    },
    {
        id: 'outreach-hub',
        code: '05',
        name: 'Outreach Hub',
        description: 'JD-tailored cold emails, LinkedIn referral DMs, cover letters & app Q&As.',
        icon: Send,
        href: '#features',
    },
    {
        id: 'saved-jobs',
        code: '06',
        name: 'Saved Jobs',
        description: 'Bookmark roles to apply later, run resume matches, or jump into Prep Mode.',
        icon: Bookmark,
        href: '#features',
    },
];

const NAV_LINKS = [
    { href: '#how-it-works', label: 'How it works' },
    { href: '#faq', label: 'FAQ' },
    { href: '#contact', label: 'Contact' },
];

const Landing = () => {
    const { theme, toggleTheme } = useTheme();
    const { user } = useAuth();
    const [activeModal, setActiveModal] = useState(null);
    const [toolsOpen, setToolsOpen] = useState(false);
    const [menuOverlayOpen, setMenuOverlayOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    const dropdownRef = useRef(null);
    const lenisRef = useRef(null);

    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 220,
        damping: 30,
        restDelta: 0.001,
    });

    // Initialize Lenis momentum smooth scroll for the landing page
    useEffect(() => {
        const lenis = new Lenis({
            duration: 1.15,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: 'vertical',
            gestureOrientation: 'vertical',
            smoothWheel: true,
            wheelMultiplier: 0.95,
            touchMultiplier: 1.5,
        });

        lenisRef.current = lenis;
        let rafId = 0;

        function raf(time) {
            lenis.raf(time);
            rafId = window.requestAnimationFrame(raf);
        }

        rafId = window.requestAnimationFrame(raf);

        return () => {
            window.cancelAnimationFrame(rafId);
            lenis.destroy();
            lenisRef.current = null;
        };
    }, []);

    // Pause Lenis scroll while a full-screen overlay or legal modal is open
    useEffect(() => {
        const lenis = lenisRef.current;
        if (!lenis) return;

        if (menuOverlayOpen || activeModal) {
            lenis.stop();
        } else {
            lenis.start();
        }
    }, [menuOverlayOpen, activeModal]);

    useEffect(() => {
        function handleScroll() {
            setIsScrolled(window.scrollY > 18);
        }
        handleScroll();
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        function handlePointerDown(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setToolsOpen(false);
            }
        }
        function handleKeyDown(event) {
            if (event.key === 'Escape') {
                setToolsOpen(false);
                setMenuOverlayOpen(false);
            }
        }
        document.addEventListener('mousedown', handlePointerDown);
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('mousedown', handlePointerDown);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    function smoothScrollTo(event, target) {
        if (event) event.preventDefault();
        setToolsOpen(false);
        setMenuOverlayOpen(false);

        const lenis = lenisRef.current;
        if (lenis) {
            lenis.start();
            lenis.scrollTo(target, { offset: target === 0 ? 0 : -72 });
            return;
        }

        if (target === 0) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        const el = document.querySelector(target);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
        }
    }

    function handleToolSelect(event, toolId, href) {
        window.dispatchEvent(
            new CustomEvent('stackmatch:select-feature', { detail: { id: toolId } })
        );
        smoothScrollTo(event, href);
    }

    return (
        <div className="min-h-screen bg-[var(--color-paper)] text-[var(--color-ink)] selection:bg-[#9FE870] selection:text-[#163300]">
            <header
                className={`sticky top-0 z-40 w-full border-b border-[var(--color-rule)] bg-[color-mix(in_srgb,var(--color-paper)_84%,transparent)] backdrop-blur-md transition-all duration-300 ${
                    isScrolled
                        ? 'shadow-[0_10px_32px_rgba(14,15,12,0.06)] dark:shadow-[0_10px_32px_rgba(0,0,0,0.34)]'
                        : ''
                }`}
            >
                <div className="mx-auto flex h-16 max-w-[var(--container)] items-center justify-between gap-4 px-4 sm:px-8 lg:px-12">
                    <Link
                        to="/"
                        onClick={(event) => smoothScrollTo(event, 0)}
                        className="group flex shrink-0 items-center gap-2.5 no-underline"
                        aria-label="StackMatch home"
                    >
                        <img
                            src="/favicon.svg"
                            alt=""
                            className="h-7 w-7 shrink-0 rounded-lg transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:rotate-[-6deg] group-hover:scale-105"
                        />
                        <span className="font-[family-name:var(--font-display)] text-[17px] font-extrabold tracking-[-0.03em] text-[var(--color-ink)]">
                            StackMatch
                        </span>
                    </Link>

                    <nav
                        className="hidden items-center gap-6 text-sm font-semibold text-[var(--color-ink-2)] lg:flex"
                        aria-label="Page sections"
                    >
                        <div
                            ref={dropdownRef}
                            className="relative"
                            onMouseEnter={() => setToolsOpen(true)}
                            onMouseLeave={() => setToolsOpen(false)}
                        >
                            <button
                                type="button"
                                onClick={() => setToolsOpen((prev) => !prev)}
                                aria-expanded={toolsOpen}
                                aria-haspopup="menu"
                                className={`group inline-flex cursor-pointer items-center gap-1 whitespace-nowrap rounded-full px-3.5 py-1.5 transition-colors hover:bg-[var(--color-paper-2)] hover:text-[var(--color-ink)] ${
                                    toolsOpen ? 'bg-[var(--color-paper-2)] text-[var(--color-ink)]' : ''
                                }`}
                            >
                                <RollingText text="Tools" />
                                <ChevronDown
                                    size={15}
                                    className={`transition-transform duration-200 ${
                                        toolsOpen ? 'rotate-180' : ''
                                    }`}
                                />
                            </button>

                            <AnimatePresence>
                                {toolsOpen ? (
                                    <motion.div
                                        initial={{ opacity: 0, y: 12, scale: 0.98 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 8, scale: 0.98 }}
                                        transition={{ duration: 0.2, ease: KINETIC_EASE }}
                                        role="menu"
                                        className="absolute left-1/2 top-full z-50 w-[590px] -translate-x-1/2 pt-3"
                                    >
                                        <div className="overflow-hidden rounded-2xl border border-[var(--color-rule)] bg-[var(--color-card)] p-2.5 shadow-[0_24px_60px_rgba(14,15,12,0.14)] dark:shadow-[0_24px_60px_rgba(0,0,0,0.5)]">
                                            <div className="grid grid-cols-2 gap-1.5">
                                                {PLATFORM_TOOLS.map((tool) => {
                                                    const Icon = tool.icon;
                                                    return (
                                                        <a
                                                            key={tool.id}
                                                            href={tool.href}
                                                            role="menuitem"
                                                            onClick={(event) =>
                                                                handleToolSelect(event, tool.id, tool.href)
                                                            }
                                                            className="group/item flex items-start gap-3 rounded-xl border border-transparent p-3 transition-colors hover:border-[var(--color-rule)] hover:bg-[var(--color-paper-2)]"
                                                        >
                                                            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[var(--color-rule)] bg-[var(--color-paper-3)] text-[#163300] transition-colors group-hover/item:border-[#9FE870] group-hover/item:bg-[#9FE870] group-hover/item:text-[#163300] dark:text-[#9FE870] dark:group-hover/item:text-[#163300]">
                                                                <Icon size={16} />
                                                            </span>
                                                            <span className="min-w-0">
                                                                <span className="flex items-center gap-2 text-[13px] font-bold text-[var(--color-ink)]">
                                                                    <span>{tool.name}</span>
                                                                    <span className="font-mono text-[10px] font-semibold text-[var(--color-muted)]">
                                                                        {tool.code}
                                                                    </span>
                                                                </span>
                                                                <span className="mt-0.5 block text-xs leading-snug font-normal text-[var(--color-muted)]">
                                                                    {tool.description}
                                                                </span>
                                                            </span>
                                                        </a>
                                                    );
                                                })}
                                            </div>

                                            <div className="mt-2 flex items-center justify-between border-t border-dashed border-[var(--color-rule)] px-3 pt-2.5 pb-1 text-xs">
                                                <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--color-muted)]">
                                                    06 Modules · One Workspace
                                                </span>
                                                <a
                                                    href="#features"
                                                    onClick={(event) => smoothScrollTo(event, '#features')}
                                                    className="group inline-flex items-center gap-1 font-bold text-[#163300] dark:text-[#9FE870]"
                                                >
                                                    <RollingText text="Explore all" />
                                                    <ArrowRight size={13} />
                                                </a>
                                            </div>
                                        </div>
                                    </motion.div>
                                ) : null}
                            </AnimatePresence>
                        </div>

                        {NAV_LINKS.map((link) => (
                            <a
                                key={link.href}
                                href={link.href}
                                onClick={(event) => smoothScrollTo(event, link.href)}
                                className="group whitespace-nowrap rounded-full px-3.5 py-1.5 transition-colors hover:bg-[var(--color-paper-2)] hover:text-[var(--color-ink)]"
                            >
                                <RollingText text={link.label} />
                            </a>
                        ))}
                    </nav>

                    <div className="flex shrink-0 items-center gap-2">
                        <button
                            type="button"
                            onClick={toggleTheme}
                            className="theme-icon shrink-0 cursor-pointer"
                            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                        >
                            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                        </button>

                        {user ? (
                            <Link
                                to="/home"
                                className="group inline-flex min-h-10 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-[#9FE870] px-4 text-sm font-bold text-[#163300] transition-transform duration-150 hover:scale-[1.02] hover:bg-[#93df63]"
                            >
                                <RollingText text="Workspace" />
                                <ArrowRight
                                    size={15}
                                    className="transition-transform duration-200 group-hover:translate-x-0.5"
                                />
                            </Link>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="group hidden min-h-10 shrink-0 items-center justify-center whitespace-nowrap rounded-full px-3.5 text-sm font-semibold text-[var(--color-ink)] transition-colors hover:bg-[var(--color-paper-2)] sm:inline-flex"
                                >
                                    <RollingText text="Log in" />
                                </Link>
                                <Link
                                    to="/register"
                                    className="group inline-flex min-h-10 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-[#9FE870] px-4 text-sm font-bold text-[#163300] shadow-xs transition-transform duration-150 hover:scale-[1.02] hover:bg-[#93df63]"
                                >
                                    <RollingText text="Start matching" />
                                    <ArrowRight
                                        size={15}
                                        className="transition-transform duration-200 group-hover:translate-x-0.5"
                                    />
                                </Link>
                            </>
                        )}

                        <button
                            type="button"
                            onClick={() => setMenuOverlayOpen(true)}
                            className="group inline-flex min-h-10 shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-full border border-[var(--color-rule)] bg-[var(--color-card)] px-3.5 text-xs font-bold uppercase tracking-[0.08em] text-[var(--color-ink)] transition-colors hover:border-[#9FE870] hover:bg-[var(--color-paper-2)] lg:hidden"
                            aria-label="Open full navigation menu"
                            aria-expanded={menuOverlayOpen}
                        >
                            <RollingText text="Menu" />
                        </button>
                    </div>
                </div>

                <motion.div
                    aria-hidden="true"
                    style={{ scaleX }}
                    className="h-[2px] w-full origin-left bg-[#9FE870]"
                />
            </header>

            {/* Full-screen editorial menu overlay for mobile & tablet */}
            <AnimatePresence>
                {menuOverlayOpen ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.24, ease: KINETIC_EASE }}
                        className="fixed inset-0 z-50 flex flex-col justify-between overflow-y-auto bg-[var(--color-paper)] px-5 py-5 sm:px-8 lg:hidden"
                        role="dialog"
                        aria-modal="true"
                        aria-label="Site navigation"
                    >
                        <div className="flex items-center justify-between border-b border-[var(--color-rule)] pb-4">
                            <div className="flex items-center gap-2.5">
                                <img src="/favicon.svg" alt="" className="h-7 w-7 rounded-lg" />
                                <span className="font-[family-name:var(--font-display)] text-[17px] font-extrabold tracking-[-0.03em] text-[var(--color-ink)]">
                                    StackMatch
                                </span>
                            </div>

                            <button
                                type="button"
                                onClick={() => setMenuOverlayOpen(false)}
                                className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-[var(--color-rule)] bg-[var(--color-card)] text-[var(--color-ink)]"
                                aria-label="Close menu"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="my-8 space-y-8">
                            <div className="space-y-2">
                                <p className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--color-muted)]">
                                    01 / Workspace Modules
                                </p>
                                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                    {PLATFORM_TOOLS.map((tool, index) => {
                                        const Icon = tool.icon;
                                        return (
                                            <motion.a
                                                key={tool.id}
                                                href={tool.href}
                                                initial={{ opacity: 0, y: 14 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{
                                                    duration: 0.32,
                                                    delay: 0.04 * index,
                                                    ease: KINETIC_EASE,
                                                }}
                                                onClick={(event) =>
                                                    handleToolSelect(event, tool.id, tool.href)
                                                }
                                                className="flex items-center justify-between rounded-2xl border border-dashed border-[var(--color-rule)] bg-[var(--color-card)] px-4 py-3.5 text-[var(--color-ink)] transition-colors hover:border-[#9FE870]"
                                            >
                                                <span className="flex items-center gap-3">
                                                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--color-paper-3)] text-[#163300] dark:text-[#9FE870]">
                                                        <Icon size={16} />
                                                    </span>
                                                    <span className="font-[family-name:var(--font-display)] text-base font-extrabold tracking-tight">
                                                        {tool.name}
                                                    </span>
                                                </span>
                                                <ArrowUpRight size={16} className="text-[var(--color-muted)]" />
                                            </motion.a>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="space-y-2 border-t border-[var(--color-rule)] pt-6">
                                <p className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--color-muted)]">
                                    02 / Navigate
                                </p>
                                <div className="flex flex-col gap-1">
                                    {NAV_LINKS.map((link) => (
                                        <a
                                            key={link.href}
                                            href={link.href}
                                            onClick={(event) => smoothScrollTo(event, link.href)}
                                            className="flex items-center justify-between rounded-xl px-2 py-2.5 font-[family-name:var(--font-display)] text-2xl font-extrabold tracking-tight text-[var(--color-ink)] transition-colors hover:text-[#4F9D24] dark:hover:text-[#9FE870]"
                                        >
                                            <span>{link.label}</span>
                                            <ArrowUpRight size={20} />
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--color-rule)] pt-4">
                            {user ? (
                                <Link
                                    to="/home"
                                    onClick={() => setMenuOverlayOpen(false)}
                                    className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full bg-[#9FE870] px-5 text-sm font-bold text-[#163300]"
                                >
                                    <span>Open Workspace</span>
                                    <ArrowRight size={16} />
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        to="/login"
                                        onClick={() => setMenuOverlayOpen(false)}
                                        className="inline-flex min-h-11 flex-1 items-center justify-center rounded-full border border-[var(--color-rule)] bg-[var(--color-card)] px-5 text-sm font-bold text-[var(--color-ink)]"
                                    >
                                        Log in
                                    </Link>
                                    <Link
                                        to="/register"
                                        onClick={() => setMenuOverlayOpen(false)}
                                        className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full bg-[#9FE870] px-5 text-sm font-bold text-[#163300]"
                                    >
                                        <span>Start matching</span>
                                        <ArrowRight size={16} />
                                    </Link>
                                </>
                            )}
                        </div>
                    </motion.div>
                ) : null}
            </AnimatePresence>

            <main>
                <Hero isAuthenticated={Boolean(user)} />
                <FeatureDeck />
                <HowItWorks />
                <FAQ />
                <ClosingCTA />
            </main>

            <Footer activeModal={activeModal} setActiveModal={setActiveModal} />
            <LegalModals activeModal={activeModal} onClose={() => setActiveModal(null)} />
        </div>
    );
};

export default Landing;