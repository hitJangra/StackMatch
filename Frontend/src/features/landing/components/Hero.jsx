import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { AnimatePresence, motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';
import HeroLogoParticles from './HeroLogoParticles';
import { KINETIC_EASE, KineticMarquee, RollingText } from './KineticPrimitives';

const ACTION_WORDS = ['apply.', 'reach out.', 'interview.'];

const PROOF_ITEMS = [
    'Tailored Overleaf .tex export',
    'Prep Roadmap PDF & AI checks',
    'XYZ bullet enhancer & Outreach Hub',
];

const MARQUEE_ROW_ONE = [
    'Find Jobs',
    'Match a JD',
    'Overleaf .tex Export',
    'Prep Mode',
    'Prep Roadmap PDF',
    'Resume Lab',
    'Outreach Hub',
    'Saved Jobs',
];

const MARQUEE_ROW_TWO = [
    'India Cities & Remote',
    'XYZ Bullet Enhancer',
    'Standalone ATS Audit',
    'AI Answer Checks',
    'LinkedIn Referral DMs',
    'Cold Emails & App Q&As',
];

function MaskedLine({ children, delay = 0, className = '' }) {
    return (
        <span className={`block overflow-hidden pb-[0.08em] ${className}`}>
            <motion.span
                initial={{ y: '108%', opacity: 0 }}
                animate={{ y: '0%', opacity: 1 }}
                transition={{ duration: 0.72, delay, ease: KINETIC_EASE }}
                className="block"
            >
                {children}
            </motion.span>
        </span>
    );
}

export function Hero({ isAuthenticated = false }) {
    const sectionRef = useRef(null);
    const [actionIndex, setActionIndex] = useState(0);

    useEffect(() => {
        const timer = window.setInterval(() => {
            setActionIndex((prev) => (prev + 1) % ACTION_WORDS.length);
        }, 2200);

        return () => window.clearInterval(timer);
    }, []);

    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ['start start', 'end start'],
    });

    const stageParallaxY = useTransform(scrollYProgress, [0, 1], [0, -24]);

    return (
        <section
            ref={sectionRef}
            className="relative overflow-hidden border-b border-[var(--color-rule)]"
        >
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-28 right-0 h-[440px] w-[440px] rounded-full opacity-25 blur-3xl"
                style={{
                    background:
                        'radial-gradient(circle, rgba(159,232,112,0.45) 0%, rgba(159,232,112,0) 70%)',
                }}
            />

            <div className="mx-auto grid max-w-[var(--container)] grid-cols-1 items-center gap-12 px-4 pt-14 pb-16 sm:px-8 sm:pt-20 sm:pb-20 lg:grid-cols-12 lg:gap-12 lg:px-12 lg:pt-24 lg:pb-24">
                {/* Left editorial column */}
                <div className="min-w-0 lg:col-span-6">
                    <h1 className="font-[family-name:var(--font-display)] text-[36px] font-extrabold leading-[1.1] tracking-[-0.04em] text-[var(--color-ink)] sm:text-[46px] lg:text-[52px]">
                        <MaskedLine delay={0.05}>
                            Find the role. Fix the resume.
                        </MaskedLine>

                        <MaskedLine delay={0.18} className="mt-2">
                            <span className="inline-flex flex-wrap items-baseline gap-x-2.5 gap-y-2 text-[var(--color-ink-2)]">
                                <span>Ready to</span>
                                <span className="relative inline-grid overflow-hidden rounded-xl bg-[#9FE870] px-3 py-0.5 text-[#163300] align-baseline">
                                    <AnimatePresence mode="wait" initial={false}>
                                        <motion.span
                                            key={ACTION_WORDS[actionIndex]}
                                            initial={{ y: '100%', opacity: 0 }}
                                            animate={{ y: '0%', opacity: 1 }}
                                            exit={{ y: '-100%', opacity: 0 }}
                                            transition={{ duration: 0.42, ease: KINETIC_EASE }}
                                            className="col-start-1 row-start-1 block whitespace-nowrap"
                                        >
                                            {ACTION_WORDS[actionIndex]}
                                        </motion.span>
                                    </AnimatePresence>
                                </span>
                            </span>
                        </MaskedLine>
                    </h1>

                    <motion.div
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3, ease: KINETIC_EASE }}
                        className="mt-8 flex flex-wrap items-center gap-3"
                    >
                        <Link
                            to={isAuthenticated ? '/home' : '/register'}
                            className="group inline-flex min-h-12 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-[#9FE870] px-6 text-sm font-bold text-[#163300] shadow-xs transition-transform duration-150 hover:scale-[1.02] hover:bg-[#93df63] active:scale-[0.98]"
                        >
                            <RollingText
                                text={isAuthenticated ? 'Open workspace' : 'Start matching free'}
                            />
                            <ArrowRight
                                size={16}
                                className="transition-transform duration-200 group-hover:translate-x-0.5"
                            />
                        </Link>

                        <a
                            href="#features"
                            className="group inline-flex min-h-12 shrink-0 items-center justify-center whitespace-nowrap rounded-full border border-[var(--color-rule)] bg-[var(--color-card)] px-6 text-sm font-semibold text-[var(--color-ink)] transition-colors hover:border-[#9FE870] hover:bg-[var(--color-paper-2)]"
                        >
                            <RollingText text="Explore tools" />
                        </a>
                    </motion.div>

                    <motion.ul
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4, ease: KINETIC_EASE }}
                        className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-2.5 border-t border-dashed border-[var(--color-rule)] pt-6 text-sm text-[var(--color-ink-2)]"
                    >
                        {PROOF_ITEMS.map((item) => (
                            <li key={item} className="flex items-center gap-2">
                                <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#9FE870] text-[#163300]">
                                    <Check size={12} strokeWidth={3} />
                                </span>
                                <span>{item}</span>
                            </li>
                        ))}
                    </motion.ul>
                </div>

                {/* Right contained 3D particle StackMatch logo stage */}
                <motion.div
                    style={{ y: stageParallaxY }}
                    initial={{ opacity: 0, y: 28, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.72, delay: 0.16, ease: KINETIC_EASE }}
                    className="min-w-0 lg:col-span-6"
                >
                    <HeroLogoParticles />
                </motion.div>
            </div>

            {/* Opposing velocity-reactive kinetic marquee */}
            <div className="space-y-2.5 border-t border-[var(--color-rule)] bg-[var(--color-paper-3)] py-4">
                <KineticMarquee
                    items={MARQUEE_ROW_ONE}
                    baseVelocity={-2.2}
                    itemClassName="font-[family-name:var(--font-display)] text-sm font-extrabold uppercase tracking-[0.06em] text-[var(--color-ink)] sm:text-base"
                />
                <KineticMarquee
                    items={MARQUEE_ROW_TWO}
                    baseVelocity={1.9}
                    separator="/"
                    itemClassName="font-mono text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-muted)]"
                />
            </div>
        </section>
    );
}

export default Hero;