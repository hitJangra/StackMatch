import React, { useEffect, useId, useRef, useState } from 'react';
import { animate, motion } from 'framer-motion';

const RING_EASE = [0.22, 1, 0.36, 1];

export function ScoreCircle({
    score = 84,
    size = 148,
    strokeWidth = 11,
    label = 'ATS Match',
    sublabel = '',
    className = '',
}) {
    const clampedScore = Math.max(0, Math.min(100, Math.round(Number(score) || 0)));
    const gradientId = useId();
    const [displayScore, setDisplayScore] = useState(0);
    const currentValRef = useRef(0);

    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const targetOffset = circumference * (1 - clampedScore / 100);

    useEffect(() => {
        const startFrom = currentValRef.current;
        const controls = animate(startFrom, clampedScore, {
            duration: 0.85,
            ease: RING_EASE,
            onUpdate: (latest) => {
                const rounded = Math.round(latest);
                currentValRef.current = rounded;
                setDisplayScore(rounded);
            },
        });

        return () => {
            controls.stop();
        };
    }, [clampedScore]);

    return (
        <div
            className={`relative inline-flex shrink-0 items-center justify-center ${className}`}
            style={{ width: size, height: size }}
            role="img"
            aria-label={`${label}: ${clampedScore} percent`}
        >
            <svg
                width={size}
                height={size}
                viewBox={`0 0 ${size} ${size}`}
                className="-rotate-90 overflow-visible"
            >
                <defs>
                    <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#4F9D24" />
                        <stop offset="100%" stopColor="#9FE870" />
                    </linearGradient>
                </defs>

                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="var(--color-paper-2)"
                    strokeWidth={strokeWidth}
                />

                <motion.circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={`url(#${gradientId})`}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: targetOffset }}
                    transition={{ duration: 0.9, ease: RING_EASE }}
                />
            </svg>

            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="font-[family-name:var(--font-display)] text-3xl font-extrabold leading-none tracking-tight text-[var(--color-ink)] tabular-nums">
                    {displayScore}
                    <span className="text-lg font-bold text-[var(--color-muted)]">%</span>
                </span>
                {label ? (
                    <span className="mt-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-muted)]">
                        {label}
                    </span>
                ) : null}
                {sublabel ? (
                    <span className="mt-0.5 text-[11px] font-medium text-[var(--color-ink-2)]">
                        {sublabel}
                    </span>
                ) : null}
            </div>
        </div>
    );
}

export default ScoreCircle;