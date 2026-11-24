import React from 'react';
import { Link } from 'react-router';
import { Mail } from 'lucide-react';
import Reveal from './Reveal';

const PRODUCT_LINKS = [
    { label: 'Find Jobs', href: '#features' },
    { label: 'Match a JD', href: '#features' },
    { label: 'Prep Mode', href: '#features' },
    { label: 'Resume Lab', href: '#features' },
    { label: 'Outreach Hub', href: '#features' },
    { label: 'Saved Jobs', href: '#features' },
];

export const Footer = ({ activeModal, setActiveModal }) => {
    return (
        <footer
            id="contact"
            className="scroll-mt-20 border-t border-[var(--color-rule)] bg-[var(--color-paper)] py-16 sm:py-24"
            aria-label="Site footer"
        >
            <Reveal>
                <div className="mx-auto max-w-[var(--container)] space-y-10 px-4 sm:px-8 lg:px-12">
                    <div className="grid grid-cols-1 gap-10 md:grid-cols-12 lg:gap-12">
                        <div className="space-y-4 md:col-span-5">
                            <Link
                                to="/"
                                className="inline-flex items-center gap-2.5 no-underline"
                                aria-label="StackMatch home"
                            >
                                <img
                                    src="/favicon.svg"
                                    alt=""
                                    className="h-7 w-7 shrink-0 rounded-lg"
                                />
                                <span className="font-[family-name:var(--font-display)] text-[18px] font-extrabold tracking-[-0.03em] text-[var(--color-ink)]">
                                    StackMatch
                                </span>
                            </Link>
                            <p className="max-w-sm text-xs leading-relaxed text-[var(--color-ink-2)] sm:text-sm">
                                Find roles, match your resume to the JD, refine your bullets, draft outreach, and practice for interviews in one place.
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
                            <div className="space-y-3">
                                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--color-muted)]">
                                    Workspace
                                </h4>
                                <ul className="space-y-2 text-xs text-[var(--color-ink-2)] sm:text-sm">
                                    {PRODUCT_LINKS.map((item) => (
                                        <li key={item.label}>
                                            <a href={item.href} className="transition-colors hover:text-[var(--color-ink)]">
                                                {item.label}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="space-y-3">
                                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--color-muted)]">
                                    Resources
                                </h4>
                                <ul className="space-y-2 text-xs text-[var(--color-ink-2)] sm:text-sm">
                                    <li><a href="#how-it-works" className="transition-colors hover:text-[var(--color-ink)]">How it works</a></li>
                                    <li><a href="#features" className="transition-colors hover:text-[var(--color-ink)]">Features</a></li>
                                    <li><a href="#faq" className="transition-colors hover:text-[var(--color-ink)]">FAQ</a></li>
                                </ul>
                            </div>

                            <div className="space-y-3">
                                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--color-muted)]">
                                    Legal &amp; access
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
                                    <li><Link to="/login" className="transition-colors hover:text-[var(--color-ink)]">Sign in</Link></li>
                                    <li><Link to="/register" className="transition-colors hover:text-[var(--color-ink)]">Create account</Link></li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col items-center justify-between gap-3 border-t border-[var(--color-rule)] pt-8 text-xs text-[var(--color-muted)] sm:flex-row">
                        <p>&copy; 2026 StackMatch. All rights reserved.</p>
                        <p className="flex items-center gap-1.5 font-medium">
                            <span>Built by Hitender Jangra</span>
                            <span className="text-[#9FE870]" aria-hidden="true">♥</span>
                        </p>
                    </div>
                </div>
            </Reveal>
        </footer>
    );
};