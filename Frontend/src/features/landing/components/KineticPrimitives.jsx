import React, { useRef } from 'react';
import {
    motion,
    useAnimationFrame,
    useMotionValue,
    useScroll,
    useSpring,
    useTransform,
    useVelocity,
} from 'framer-motion';

export const KINETIC_EASE = [0.22, 1, 0.36, 1];

function wrapRange(min, max, value) {
    const range = max - min;
    return ((((value - min) % range) + range) % range) + min;
}

/**
 * Staggered character-roll hover text (works standalone or inside any `.group` link/button).
 */
export function RollingText({ text = '', className = '', staggerMs = 15 }) {
    const chars = Array.from(String(text));

    return (
        <span className={`group/roll relative inline-flex items-baseline whitespace-pre ${className}`}>
            <span className="sr-only">{text}</span>
            <span aria-hidden="true" className="inline-flex leading-[1.18]">
                {chars.map((char, index) => {
                    const displayChar = char === ' ' ? '\u00A0' : char;
                    const delay = `${index * staggerMs}ms`;

                    return (
                        <span
                            key={`${char}-${index}`}
                            className="relative inline-block overflow-hidden"
                        >
                            <span
                                style={{ transitionDelay: delay }}
                                className="block translate-y-0 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-full group-hover/roll:-translate-y-full"
                            >
                                {displayChar}
                            </span>
                            <span
                                style={{ transitionDelay: delay }}
                                className="absolute inset-0 block translate-y-full transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0 group-hover/roll:translate-y-0"
                            >
                                {displayChar}
                            </span>
                        </span>
                    );
                })}
            </span>
        </span>
    );
}

/**
 * Editorial dashed container with subtle corner registration ticks and electric lime hover cue.
 */
export function DashedFrame({ children, className = '', interactive = true }) {
    return (
        <div
            className={`group/frame relative rounded-2xl border border-dashed border-[var(--color-rule)] bg-[var(--color-card)] transition-colors duration-200 ${
                interactive ? 'hover:border-[#9FE870]' : ''
            } ${className}`}
        >
            <span
                aria-hidden="true"
                className="pointer-events-none absolute -top-1 -left-1 h-2 w-2 border-t-2 border-l-2 border-[#4F9D24] opacity-60 transition-opacity duration-200 group-hover/frame:border-[#9FE870] group-hover/frame:opacity-100"
            />
            <span
                aria-hidden="true"
                className="pointer-events-none absolute -top-1 -right-1 h-2 w-2 border-t-2 border-r-2 border-[#4F9D24] opacity-60 transition-opacity duration-200 group-hover/frame:border-[#9FE870] group-hover/frame:opacity-100"
            />
            <span
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-1 -left-1 h-2 w-2 border-b-2 border-l-2 border-[#4F9D24] opacity-60 transition-opacity duration-200 group-hover/frame:border-[#9FE870] group-hover/frame:opacity-100"
            />
            <span
                aria-hidden="true"
                className="pointer-events-none absolute -right-1 -bottom-1 h-2 w-2 border-r-2 border-b-2 border-[#4F9D24] opacity-60 transition-opacity duration-200 group-hover/frame:border-[#9FE870] group-hover/frame:opacity-100"
            />
            {children}
        </div>
    );
}

/**
 * Scroll-velocity-reactive horizontal marquee strip.
 * Pass negative `baseVelocity` to run right-to-left, positive for left-to-right.
 */
export function KineticMarquee({
    items = [],
    baseVelocity = -3.2,
    className = '',
    itemClassName = '',
    separator = '•',
}) {
    const baseX = useMotionValue(0);
    const { scrollY } = useScroll();
    const scrollVelocity = useVelocity(scrollY);
    const smoothVelocity = useSpring(scrollVelocity, {
        damping: 50,
        stiffness: 380,
    });
    const velocityFactor = useTransform(smoothVelocity, [0, 1400], [0, 4.5], {
        clamp: false,
    });

    const directionFactor = useRef(baseVelocity < 0 ? -1 : 1);
    const speedMagnitude = Math.abs(baseVelocity);

    useAnimationFrame((_, delta) => {
        const clampedDelta = Math.min(delta, 50);
        const vel = velocityFactor.get();

        if (vel < -0.15) {
            directionFactor.current = baseVelocity < 0 ? 1 : -1;
        } else if (vel > 0.15) {
            directionFactor.current = baseVelocity < 0 ? -1 : 1;
        }

        const baseStep = directionFactor.current * speedMagnitude * (clampedDelta / 1000);
        const scrollBoost = directionFactor.current * Math.abs(vel) * (clampedDelta / 1000) * 1.4;
        baseX.set(wrapRange(-50, 0, baseX.get() + baseStep + scrollBoost));
    });

    const x = useTransform(baseX, (v) => `${v}%`);

    return (
        <div className={`w-full overflow-hidden select-none ${className}`} aria-hidden="true">
            <motion.div style={{ x }} className="flex w-max will-change-transform">
                {[0, 1].map((trackIndex) => (
                    <div key={trackIndex} className="flex shrink-0 items-center">
                        {items.map((item, idx) => (
                            <div
                                key={`${trackIndex}-${idx}`}
                                className="flex shrink-0 items-center"
                            >
                                <span className={`whitespace-nowrap ${itemClassName}`}>
                                    {item}
                                </span>
                                <span className="mx-5 text-[#9FE870] opacity-85 sm:mx-7">
                                    {separator}
                                </span>
                            </div>
                        ))}
                    </div>
                ))}
            </motion.div>
        </div>
    );
}

/**
 * Editorial section header with numbered index (`01 / ...`) and display title.
 */
export function SectionIndex({
    number = '01',
    label = '',
    title = '',
    description = '',
    className = '',
}) {
    return (
        <div className={`space-y-4 ${className}`}>
            <div className="flex items-center gap-3 text-xs font-mono font-bold uppercase tracking-[0.14em] text-[var(--color-muted)]">
                <span className="inline-flex items-center justify-center rounded-full bg-[#9FE870] px-2.5 py-0.5 text-[11px] font-extrabold text-[#163300]">
                    {number}
                </span>
                <span>{label}</span>
                <span className="h-px flex-1 bg-[var(--color-rule)]" aria-hidden="true" />
            </div>

            {title ? (
                <div className="grid grid-cols-1 items-end gap-4 lg:grid-cols-12">
                    <h2 className="font-[family-name:var(--font-display)] text-3xl font-extrabold leading-[1.06] tracking-[-0.035em] text-[var(--color-ink)] sm:text-4xl lg:col-span-7 lg:text-5xl">
                        {title}
                    </h2>
                    {description ? (
                        <p className="max-w-[46ch] text-sm leading-relaxed text-[var(--color-ink-2)] sm:text-base lg:col-span-5 lg:justify-self-end">
                            {description}
                        </p>
                    ) : null}
                </div>
            ) : null}
        </div>
    );
}