import React, { useRef } from 'react';
import { Link } from 'react-router';
import { motion, useScroll, useSpring, useTransform } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '../../auth/hooks/useAuth';
import { KINETIC_EASE, RollingText } from './KineticPrimitives';

/* -------------------------------------------------------------------------- */
/* Hoisted miniature StackMatch logo mark (matches /favicon.svg geometry)     */
/* -------------------------------------------------------------------------- */

function LogoShapeMark({ size = 24, variant = 'solid' }) {
    const isOutline = variant === 'outline';
    const isSoft = variant === 'soft';

    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 64 64"
            fill="none"
            aria-hidden="true"
            className="block shrink-0"
        >
            <rect
                x="2"
                y="2"
                width="60"
                height="60"
                rx="16"
                fill={isOutline ? 'rgba(22, 51, 0, 0.7)' : isSoft ? '#76C947' : '#9FE870'}
                stroke={isOutline ? '#9FE870' : 'none'}
                strokeWidth={isOutline ? '3' : '0'}
            />
            <rect
                x="14"
                y="18"
                width="36"
                height="6.5"
                rx="3.25"
                fill={isOutline ? '#9FE870' : '#163300'}
            />
            <rect
                x="14"
                y="30"
                width="26"
                height="6.5"
                rx="3.25"
                fill={isOutline ? '#9FE870' : '#163300'}
            />
            <rect
                x="14"
                y="42"
                width="17"
                height="6.5"
                rx="3.25"
                fill={isOutline ? '#9FE870' : '#163300'}
            />
            <circle
                cx="45.5"
                cy="45.25"
                r="4.25"
                fill={isOutline ? '#9FE870' : '#163300'}
            />
        </svg>
    );
}

/* -------------------------------------------------------------------------- */
/* Deterministic logo particle specs (spread above & around, converge to 0,0) */
/* -------------------------------------------------------------------------- */

const LOGO_PARTICLES = [
    { id: 1, x: -290, y: -185, rotate: -44, size: 28, variant: 'solid', arriveAt: 0.78 },
    { id: 2, x: -210, y: -220, rotate: 28, size: 20, variant: 'outline', arriveAt: 0.82 },
    { id: 3, x: -135, y: -170, rotate: -22, size: 26, variant: 'soft', arriveAt: 0.76 },
    { id: 4, x: -55, y: -235, rotate: 38, size: 22, variant: 'solid', arriveAt: 0.85 },
    { id: 5, x: 35, y: -215, rotate: -30, size: 28, variant: 'outline', arriveAt: 0.80 },
    { id: 6, x: 120, y: -180, rotate: 24, size: 24, variant: 'solid', arriveAt: 0.75 },
    { id: 7, x: 215, y: -225, rotate: -36, size: 20, variant: 'soft', arriveAt: 0.84 },
    { id: 8, x: 295, y: -175, rotate: 42, size: 28, variant: 'solid', arriveAt: 0.79 },
    { id: 9, x: -330, y: -85, rotate: 32, size: 22, variant: 'outline', arriveAt: 0.83 },
    { id: 10, x: -235, y: -75, rotate: -18, size: 26, variant: 'solid', arriveAt: 0.74 },
    { id: 11, x: -145, y: -95, rotate: 16, size: 18, variant: 'soft', arriveAt: 0.77 },
    { id: 12, x: 150, y: -95, rotate: -20, size: 20, variant: 'outline', arriveAt: 0.77 },
    { id: 13, x: 240, y: -70, rotate: 26, size: 26, variant: 'solid', arriveAt: 0.75 },
    { id: 14, x: 330, y: -90, rotate: -34, size: 22, variant: 'soft', arriveAt: 0.82 },
    { id: 15, x: -240, y: 55, rotate: -24, size: 20, variant: 'soft', arriveAt: 0.80 },
    { id: 16, x: -115, y: 80, rotate: 18, size: 22, variant: 'outline', arriveAt: 0.78 },
    { id: 17, x: 115, y: 80, rotate: -18, size: 22, variant: 'outline', arriveAt: 0.79 },
    { id: 18, x: 240, y: 55, rotate: 24, size: 20, variant: 'solid', arriveAt: 0.81 },
];

function ConvergingLogoParticle({ spec, progress }) {
    const end = spec.arriveAt;
    const x = useTransform(progress, [0, end], [spec.x, 0]);
    const y = useTransform(progress, [0, end], [spec.y, 0]);
    const rotate = useTransform(progress, [0, end], [spec.rotate, 0]);
    const scale = useTransform(progress, [0, end * 0.72, end], [1.08, 0.82, 0.25]);
    const opacity = useTransform(
        progress,
        [0, 0.14, end - 0.12, end],
        [0, 0.95, 0.9, 0]
    );

    return (
        <motion.span
            aria-hidden="true"
            style={{ x, y, rotate, scale, opacity }}
            className="pointer-events-none absolute will-change-transform"
        >
            <LogoShapeMark size={spec.size} variant={spec.variant} />
        </motion.span>
    );
}

export const ClosingCTA = () => {
    const { user } = useAuth();
    const sectionRef = useRef(null);

    // Finishes assembling right as the CTA section settles into the viewport
    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ['start 96%', 'end 90%'],
    });

    const smoothProgress = useSpring(scrollYProgress, {
        stiffness: 115,
        damping: 22,
        mass: 0.65,
    });

    // The "Match now" button coalesces out of the converging particles
    const buttonScale = useTransform(smoothProgress, [0.55, 0.88], [0.76, 1]);
    const buttonOpacity = useTransform(smoothProgress, [0.52, 0.84], [0.12, 1]);
    const buttonY = useTransform(smoothProgress, [0.55, 0.88], [10, 0]);

    // Soft electric lime ring pulse when the logo particles snap into the pill
    const pulseScale = useTransform(smoothProgress, [0.68, 0.96], [0.72, 1.48]);
    const pulseOpacity = useTransform(smoothProgress, [0.66, 0.8, 0.98], [0, 0.55, 0]);

    // Secondary action fades in right after the button forms
    const secondaryOpacity = useTransform(smoothProgress, [0.76, 0.96], [0, 1]);
    const secondaryY = useTransform(smoothProgress, [0.76, 0.96], [8, 0]);

    return (
        <section
            ref={sectionRef}
            className="relative overflow-hidden bg-[#163300] pt-28 pb-20 text-white sm:pt-36 sm:pb-24"
            aria-label="Get started"
        >
            {/* Subtle background grid + top lime glow */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-20"
                style={{
                    backgroundImage:
                        'radial-gradient(rgba(159, 232, 112, 0.35) 1px, transparent 1px)',
                    backgroundSize: '28px 28px',
                }}
            />
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(159,232,112,0.18),transparent_58%)]"
            />

            <div className="relative z-10 mx-auto max-w-[var(--container)] px-4 sm:px-8 lg:px-12">
                <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
                    <motion.p
                        initial={{ opacity: 0, y: 14 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ duration: 0.5, ease: KINETIC_EASE }}
                        className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-[#9FE870]"
                    >
                        
                    </motion.p>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ duration: 0.6, delay: 0.06, ease: KINETIC_EASE }}
                        className="mt-4 font-[family-name:var(--font-display)] text-4xl font-extrabold leading-[1.04] tracking-[-0.04em] text-white sm:text-5xl lg:text-6xl"
                    >
                        Check the match before you hit send.
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ duration: 0.55, delay: 0.12, ease: KINETIC_EASE }}
                        className="mt-5 max-w-lg text-sm leading-relaxed text-zinc-300 sm:text-base"
                    >
                        Score your resume against the JD, export a tailored Overleaf{' '}
                        <code className="font-mono text-[#9FE870]">.tex</code> file, draft your
                        outreach, and download your Prep Roadmap PDF in one workspace.
                    </motion.p>

                    {/* Particle convergence stage anchored directly on the Match now button */}
                    <div className="mt-12 flex flex-col items-center gap-4 sm:mt-14">
                        <div className="relative inline-flex items-center justify-center">
                            {/* Logo-shaped particles raining down & snapping into (0, 0) */}
                            <div
                                aria-hidden="true"
                                className="pointer-events-none absolute inset-0 flex items-center justify-center"
                            >
                                {LOGO_PARTICLES.map((spec) => (
                                    <ConvergingLogoParticle
                                        key={spec.id}
                                        spec={spec}
                                        progress={smoothProgress}
                                    />
                                ))}

                                {/* Electric lime lock-in pulse ring */}
                                <motion.span
                                    style={{ scale: pulseScale, opacity: pulseOpacity }}
                                    className="pointer-events-none absolute h-14 w-48 rounded-full border-2 border-[#9FE870]"
                                />
                            </div>

                            {/* Coalesced primary CTA button (proportional 48px pill) */}
                            <motion.div
                                style={{
                                    scale: buttonScale,
                                    opacity: buttonOpacity,
                                    y: buttonY,
                                }}
                                className="relative z-10"
                            >
                                <Link
                                    to={user ? '/home' : '/register'}
                                    className="group inline-flex h-12 shrink-0 items-center justify-center gap-2.5 whitespace-nowrap rounded-full bg-[#9FE870] px-7 text-sm font-extrabold text-[#163300] shadow-[0_14px_40px_rgba(159,232,112,0.3)] transition-transform duration-150 hover:scale-[1.03] hover:bg-[#93df63] active:scale-[0.98]"
                                >
                                    <img
                                        src="/favicon.svg"
                                        alt=""
                                        className="h-5 w-5 shrink-0 rounded-md ring-1 ring-[#163300]/15"
                                    />
                                    <RollingText text={user ? 'Open workspace' : 'Match now'} />
                                    <ArrowRight
                                        size={16}
                                        className="transition-transform duration-200 group-hover:translate-x-0.5"
                                    />
                                </Link>
                            </motion.div>
                        </div>

                        <motion.div
                            style={{ opacity: secondaryOpacity, y: secondaryY }}
                            className="flex flex-wrap items-center justify-center gap-4 text-xs text-zinc-300"
                        >
                            <span>Free to start · No credit card</span>
                            <span className="text-white/25" aria-hidden="true">
                                •
                            </span>
                            <Link
                                to={user ? '/saved-jobs' : '/login'}
                                className="group inline-flex items-center gap-1 font-semibold text-[#9FE870] hover:underline"
                            >
                                <RollingText
                                    text={user ? 'View saved jobs' : 'Already have an account? Sign in'}
                                />
                            </Link>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ClosingCTA;