import React from 'react';
import { useRouteError, Link } from 'react-router';

export const RouteErrorFallback = () => {
    const error = useRouteError();

    return (
        <div
            className="min-h-screen flex items-center justify-center bg-[var(--color-paper)] text-[var(--color-ink)] px-6"
        >
            <div className="max-w-xl text-center">
                <div
                    className="inline-flex items-center gap-2 rounded-full bg-[#163300] px-4 py-1.5 text-[#9FE870] text-xs font-semibold tracking-tight uppercase mb-6"
                >
                    Error
                </div>
                <h1 className="font-display text-4xl font-extrabold tracking-tight text-[var(--color-ink)] mb-4">
                    Something went wrong
                </h1>
                <p className="text-lg leading-relaxed text-[var(--color-ink-2)] mb-8">
                    {error instanceof Error ? error.message : 'An unexpected error occurred.'}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                        onClick={() => window.location.reload()}
                        className="inline-flex items-center justify-center gap-2 rounded-full bg-[#9FE870] px-6 py-3 text-sm font-bold text-[#163300] shadow-lg hover:bg-[#8dd461] active:scale-[0.98] transition-all"
                    >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M23 12h-4" />
                            <path d="M17 5v14" />
                            <path d="M23 12h-4" />
                            <path d="M17 5v14" />
                            <path d="M17 18l5-5-5-5" />
                        </svg>
                        Reload page
                    </button>
                    <Link
                        to="/"
                        className="inline-flex items-center justify-center gap-2 rounded-full border border-[var(--color-rule)] bg-[var(--color-card)] px-6 py-3 text-sm font-semibold text-[var(--color-ink)] hover:border-[#9FE870] transition-colors active:scale-[0.98]"
                    >
                        Back to Home
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M5 12h14" />
                            <path d="m12 5 7 7-7 7" />
                        </svg>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default RouteErrorFallback;
