import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export const WaveLoader = ({ label = 'Loading', compact = false }) => (
    <div className={`wave-loader${compact ? ' wave-loader--compact' : ''}`} role="status" aria-live="polite">
        <div className="wave-loader__bars" aria-hidden="true">
            {[50, 75, 100, 75, 50].map((height, index) => (
                <span
                    key={index}
                    style={{ height: `${height}%`, animationDelay: `${index * 100}ms` }}
                />
            ))}
        </div>
        {label && <span className="wave-loader__label">{label}</span>}
    </div>
);

export const AnalyzingResumeLoader = ({ label = 'Scanning resume...' }) => {
    const reduceMotion = useReducedMotion();

    return (
        <div className="resume-analysis-card" role="status" aria-live="polite">
            <div className="resume-analysis-icon" aria-hidden="true">
                <svg viewBox="0 0 64 64" width="64" height="64" fill="none">
                    <rect x="15" y="6" width="34" height="52" rx="5" stroke="currentColor" strokeWidth="2" />
                    <path d="M23 18H41M23 27H41M23 36H35M23 45H39" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <motion.g
                        initial={reduceMotion ? false : { clipPath: 'inset(0 100% 0 0)' }}
                        animate={{ clipPath: ['inset(0 100% 0 0)', 'inset(0 0 0 0)', 'inset(0 0 0 100%)'] }}
                        transition={reduceMotion ? { duration: 0 } : { duration: 1.8, repeat: Infinity, ease: 'easeInOut', times: [0, 0.75, 1] }}
                        style={{ opacity: 0.9 }}
                    >
                        <path d="M23 18H41M23 27H41M23 36H35M23 45H39" stroke="var(--color-accent)" strokeWidth="3" strokeLinecap="round" />
                    </motion.g>
                    <motion.rect
                        x="17"
                        y="8"
                        width="2"
                        height="48"
                        rx="1"
                        fill="var(--color-accent)"
                        initial={reduceMotion ? false : { x: -2 }}
                        animate={{ x: [-2, 30, -2] }}
                        transition={reduceMotion ? { duration: 0 } : { duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                    />
                </svg>
            </div>
            <span className="resume-analysis-label">{label}</span>
        </div>
    );
};
