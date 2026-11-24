import React, { useEffect } from 'react';
import { X, ShieldCheck, FileCheck, Lock, Trash2, Database, AlertCircle } from 'lucide-react';

export const LegalModals = ({ activeModal, onClose }) => {
    // Close on Escape key press
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        if (activeModal) {
            window.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [activeModal, onClose]);

    if (!activeModal) return null;

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-headline"
        >
            <div 
                className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl border border-[var(--color-rule)] bg-[var(--color-card)] p-6 sm:p-8 text-[var(--color-ink)] shadow-2xl focus:outline-none"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-[var(--color-rule)]">
                    <div className="flex items-center gap-3">
                        {activeModal === 'privacy' ? (
                            <div className="p-2 rounded-xl bg-[#9FE870]/20 text-[#163300] dark:text-[#9FE870]">
                                <ShieldCheck className="w-6 h-6" />
                            </div>
                        ) : (
                            <div className="p-2 rounded-xl bg-[#9FE870]/20 text-[#163300] dark:text-[#9FE870]">
                                <FileCheck className="w-6 h-6" />
                            </div>
                        )}
                        <div>
                            <h3 id="modal-headline" className="text-xl font-bold font-display tracking-tight">
                                {activeModal === 'privacy' ? 'Privacy Policy' : 'Terms of Service'}
                            </h3>
                            <p className="text-xs text-[var(--color-muted)] mt-0.5">
                                Last updated: February 2026
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        type="button"
                        className="p-2 rounded-lg text-[var(--color-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-paper-2)] transition-colors cursor-pointer"
                        aria-label="Close modal"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="py-6 space-y-5 text-sm leading-relaxed text-[var(--color-ink-2)]">
                    {activeModal === 'privacy' ? (
                        <>
                            <div className="p-4 rounded-xl border border-[var(--color-rule)] bg-[var(--color-paper-3)] flex items-start gap-3">
                                <Lock className="w-5 h-5 text-[#163300] dark:text-[#9FE870] flex-shrink-0 mt-0.5" />
                                <div className="text-xs">
                                    <strong className="text-[var(--color-ink)] block font-semibold mb-1">Privacy</strong>
                                    StackMatch never sells your resume data, work history, or personal information to recruiters, data brokers, or advertisers.
                                </div>
                            </div>

                            <section className="space-y-2">
                                <h4 className="font-semibold text-[var(--color-ink)] text-base">1. Information we collect</h4>
                                <p>
                                    When you use StackMatch, we only collect the text and documents you explicitly submit:
                                </p>
                                <ul className="list-disc pl-5 space-y-1">
                                    <li>Resume files (PDF or raw text) for ATS keyword parsing and skill extraction.</li>
                                    <li>Job descriptions or URLs for keyword matching.</li>
                                    <li>Account credentials (email, hashed password, and session tokens) for authentication.</li>
                                </ul>
                            </section>

                            <section className="space-y-2">
                                <h4 className="font-semibold text-[var(--color-ink)] text-base">2. How we process data</h4>
                                <p>
                                    Your resume data is processed strictly in isolated computing environments to compute keyword density, identify skill gaps, generate LaTeX templates, and produce interview prep questions. Model inference is executed without training public models on your private documents.
                                </p>
                            </section>

                            <section className="space-y-2">
                                <h4 className="font-semibold text-[var(--color-ink)] text-base">3. Data retention</h4>
                                <p>
                                    You have full control over your data. In your account settings, you can clear all stored resumes, saved jobs, and interview reports, or permanently delete your account with one click. Upon deletion, all associated records are permanently erased from our active databases.
                                </p>
                            </section>

                            <section className="space-y-2">
                                <h4 className="font-semibold text-[var(--color-ink)] text-base">4. Contact</h4>
                                <p>
                                    For any privacy concerns or data requests, contact our team directly at <a href="mailto:stackmatch.support@gmail.com" className="text-[#163300] dark:text-[#9FE870] font-semibold underline underline-offset-2">stackmatch.support@gmail.com</a>.
                                </p>
                            </section>
                        </>
                    ) : (
                        <>
                            <div className="p-4 rounded-xl border border-[var(--color-rule)] bg-[var(--color-paper-3)] flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-[#163300] dark:text-[#9FE870] flex-shrink-0 mt-0.5" />
                                <div className="text-xs">
                                    <strong className="text-[var(--color-ink)] block font-semibold mb-1">Terms</strong>
                                    By creating an account, you agree to these terms.
                                </div>
                            </div>

                            <section className="space-y-2">
                                <h4 className="font-semibold text-[var(--color-ink)] text-base">1. Service</h4>
                                <p>
                                    StackMatch scores resumes against job descriptions, finds keyword gaps, generates LaTeX templates, and prepares interview questions. We do not guarantee job offers or hiring decisions.
                                </p>
                            </section>

                            <section className="space-y-2">
                                <h4 className="font-semibold text-[var(--color-ink)] text-base">2. User conduct</h4>
                                <p>
                                    You represent that any resume and experience information you upload is truthful and that you possess the necessary rights to use and submit such material. You agree not to upload malicious payloads, automated scraping scripts, or abuse API rate limits.
                                </p>
                            </section>

                            <section className="space-y-2">
                                <h4 className="font-semibold text-[var(--color-ink)] text-base">3. Ownership</h4>
                                <p>
                                    You own your resume content and exported files. StackMatch owns its matching algorithms, interface, and branding.
                                </p>
                            </section>

                            <section className="space-y-2">
                                <h4 className="font-semibold text-[var(--color-ink)] text-base">4. Changes</h4>
                                <p>
                                    We reserve the right to modify or discontinue features to improve system reliability. You may terminate your account at any time through the in-app settings dashboard.
                                </p>
                            </section>
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="pt-4 border-t border-[var(--color-rule)] flex justify-end">
                    <button
                        onClick={onClose}
                        type="button"
                        className="px-5 py-2.5 rounded-full bg-[var(--color-paper-2)] hover:bg-[var(--color-paper-3)] text-[var(--color-ink)] text-sm font-semibold transition-colors cursor-pointer"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LegalModals;
