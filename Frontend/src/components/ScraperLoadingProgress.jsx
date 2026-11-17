import React, { useState, useEffect } from "react";

/**
 * Premium Minimalist Scraper Loading UI
 * Features:
 * - Sleek ultra-thin animated progress line across the top
 * - Smooth simulated percentage counter easing from 0% to 99%
 * - Monochromatic glassmorphic StackMatch theme
 */
export const ScraperLoadingProgress = ({ 
    active, 
    title = "Querying live LinkedIn indices",
    estimatedSeconds = 45 
}) => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (!active) {
            setProgress(0);
            return;
        }

        // Reset to 1% immediately
        setProgress(1);

        const startTime = Date.now();
        const duration = estimatedSeconds * 1000;

        const interval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            // Logarithmic/exponential deceleration easing: approaches 99% smoothly
            const ratio = Math.min(elapsed / duration, 1.2);
            // Ease out formula: 1 - (1 - x)^2.5 capped at 99
            const eased = 1 - Math.pow(Math.max(0, 1 - ratio * 0.8), 2.2);
            const current = Math.min(Math.floor(eased * 99), 99);
            
            setProgress(Math.max(1, current));
        }, 120);

        return () => clearInterval(interval);
    }, [active, estimatedSeconds]);

    if (!active) return null;

    return (
        <div className="relative overflow-hidden rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md p-5 shadow-xs transition-all animate-in fade-in duration-300">
            {/* Ultra-thin top animated progress line */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                <div 
                    className="h-full bg-zinc-900 dark:bg-zinc-100 transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                />
                {/* Subtle moving shimmer highlight */}
                <div 
                    className="absolute top-0 bottom-0 w-24 bg-gradient-to-r from-transparent via-white/40 dark:via-zinc-400/30 to-transparent animate-shimmer"
                    style={{
                        animation: "shimmer 1.8s infinite linear"
                    }}
                />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-zinc-400 dark:bg-zinc-500 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-zinc-900 dark:bg-zinc-100"></span>
                        </span>
                        <h4 className="text-xs font-mono font-medium tracking-wide text-zinc-900 dark:text-zinc-100 uppercase">
                            {title}
                        </h4>
                    </div>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-sans">
                        Deep indexing LinkedIn roles & normalizing requirements. This typically takes 20–45s.
                    </p>
                </div>

                {/* Simulated percentage display */}
                <div className="flex items-baseline gap-1.5 self-end sm:self-center font-mono">
                    <span className="text-2xl font-light tracking-tighter text-zinc-900 dark:text-zinc-100">
                        {progress}
                    </span>
                    <span className="text-xs text-zinc-400 dark:text-zinc-500 font-normal">%</span>
                </div>
            </div>

            {/* Micro subtle track bar */}
            <div className="w-full bg-zinc-100 dark:bg-zinc-800/80 h-1 rounded-full overflow-hidden mt-4">
                <div 
                    className="h-full bg-zinc-800 dark:bg-zinc-200 rounded-full transition-all duration-200 ease-out"
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    );
};

export default ScraperLoadingProgress;
