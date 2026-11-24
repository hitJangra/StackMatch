import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Mail, Plus } from 'lucide-react';
import Reveal from './Reveal';
import { KINETIC_EASE, RollingText, SectionIndex } from './KineticPrimitives';

const FAQ_CATEGORIES = ['All', 'Resume & JD', 'Exports', 'Prep & Outreach', 'Privacy'];

const FAQ_ITEMS = [
    {
        id: 'match-vs-lab',
        category: 'Resume & JD',
        q: 'What is the difference between Match a JD and Resume Lab?',
        a: 'Match a JD evaluates your resume directly against a specific job description—scoring your fit, listing missing role keywords, and generating a tailored Overleaf .tex resume for that opening. Resume Lab works without any job description: it runs a standalone ATS audit on formatting and clarity, and includes the XYZ Bullet Enhancer to turn vague experience lines into measurable outcomes.',
    },
    {
        id: 'exports',
        category: 'Exports',
        q: 'What files can I download from StackMatch?',
        a: 'You can export two practical files. From Match a JD, download a single-column, Overleaf-style .tex resume already tailored to the target role so you can compile or edit it cleanly in Overleaf. From Prep Mode, download a structured Prep Roadmap PDF containing your role-specific technical and behavioral questions, reference answers, and key areas to review.',
    },
    {
        id: 'prep-mode',
        category: 'Prep & Outreach',
        q: 'How does Prep Mode check my interview answers?',
        a: 'Attach your resume and a job description—or launch Prep Mode directly from a Saved Job—to generate behavioral and technical questions tailored to that role, complete with sample answers. You can type your own response to any question and run an AI check to see what landed well, what is missing, and how to tighten your structure before the real interview.',
    },
    {
        id: 'outreach-hub',
        category: 'Prep & Outreach',
        q: 'What can Outreach Hub draft for an application?',
        a: 'Using both your resume and the job description, Outreach Hub drafts four application pieces you normally write from scratch: cold emails to hiring managers, concise LinkedIn referral DMs, job-specific cover letters, and in-app Q&A responses like "Why do you want to join this company?" Every draft stays editable so you can keep your own voice.',
    },
    {
        id: 'find-saved-jobs',
        category: 'Resume & JD',
        q: 'Which locations and filters does Find Jobs support?',
        a: 'Find Jobs lets you search across major Indian cities, Remote roles, and international locations, alongside filters for experience level and job type (Full-time, Internship, Part-time, and more). Any opening you want to revisit can be bookmarked into Saved Jobs so you can apply later, run a Match a JD scan, or open it straight in Prep Mode.',
    },
    {
        id: 'privacy-and-honesty',
        category: 'Privacy',
        q: 'Is my resume private, and does StackMatch guarantee interviews?',
        a: 'Your uploaded resumes, saved roles, and practice answers stay tied to your account only to power the tools you run, and you can delete your account and stored data anytime from Settings. As for results: no tool can guarantee a callback. StackMatch shows you the exact gaps against a JD, cleans up your resume and outreach, and helps you walk into interviews prepared.',
    },
];

function FAQRow({ item, index, isOpen, onToggle }) {
    const num = String(index + 1).padStart(2, '0');

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.4, delay: index * 0.04, ease: KINETIC_EASE }}
            className={`overflow-hidden rounded-2xl border bg-[var(--color-card)] transition-colors duration-200 ${
                isOpen
                    ? 'border-[#9FE870] shadow-[0_14px_36px_rgba(22,51,0,0.06)] dark:shadow-[0_14px_36px_rgba(0,0,0,0.34)]'
                    : 'border-[var(--color-rule)] hover:border-[#9FE870]/60'
            }`}
        >
            <button
                type="button"
                onClick={onToggle}
                aria-expanded={isOpen}
                className="flex w-full cursor-pointer items-center justify-between gap-4 px-5 py-5 text-left select-none sm:px-6"
            >
                <div className="flex min-w-0 items-start gap-3.5 sm:items-center">
                    <span
                        className={`mt-0.5 inline-flex shrink-0 rounded-full px-2 py-0.5 font-mono text-[11px] font-bold tabular-nums transition-colors sm:mt-0 ${
                            isOpen
                                ? 'bg-[#9FE870] text-[#163300]'
                                : 'bg-[var(--color-paper-3)] text-[var(--color-muted)]'
                        }`}
                    >
                        {num}
                    </span>
                    <span className="font-[family-name:var(--font-display)] text-sm font-extrabold leading-snug tracking-tight text-[var(--color-ink)] sm:text-base">
                        {item.q}
                    </span>
                </div>

                <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-colors duration-200 ${
                        isOpen
                            ? 'border-[#9FE870] bg-[#9FE870] text-[#163300]'
                            : 'border-[var(--color-rule)] bg-[var(--color-paper-3)] text-[var(--color-ink-2)]'
                    }`}
                    aria-hidden="true"
                >
                    <motion.span
                        animate={{ rotate: isOpen ? 45 : 0 }}
                        transition={{ duration: 0.22, ease: KINETIC_EASE }}
                        className="inline-flex"
                    >
                        <Plus size={15} strokeWidth={2.5} />
                    </motion.span>
                </span>
            </button>

            <AnimatePresence initial={false}>
                {isOpen ? (
                    <motion.div
                        key="answer"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.28, ease: KINETIC_EASE }}
                        className="overflow-hidden"
                    >
                        <div className="border-t border-dashed border-[var(--color-rule)] px-5 pt-4 pb-5 sm:px-6 sm:pl-[62px]">
                            <p className="text-sm leading-relaxed text-[var(--color-ink-2)] sm:text-[15px]">
                                {item.a}
                            </p>
                        </div>
                    </motion.div>
                ) : null}
            </AnimatePresence>
        </motion.div>
    );
}

export const FAQ = () => {
    const [activeCategory, setActiveCategory] = useState('All');
    const [openId, setOpenId] = useState(FAQ_ITEMS[0].id);

    const filteredItems =
        activeCategory === 'All'
            ? FAQ_ITEMS
            : FAQ_ITEMS.filter((item) => item.category === activeCategory);

    function handleCategoryChange(category) {
        setActiveCategory(category);
        const nextList =
            category === 'All'
                ? FAQ_ITEMS
                : FAQ_ITEMS.filter((item) => item.category === category);
        setOpenId(nextList[0] ? nextList[0].id : null);
    }

    return (
        <section
            id="faq"
            className="scroll-mt-20 border-b border-[var(--color-rule)] bg-[var(--color-paper)] py-20 sm:py-28"
            aria-labelledby="faq-title"
        >
            <div className="mx-auto max-w-[var(--container)] px-4 sm:px-8 lg:px-12">
                <Reveal>
                    <SectionIndex
                        number="03"
                        label="FAQ"
                        title="Straight answers before you sign up."
                    />
                </Reveal>

                <div className="mt-12 grid grid-cols-1 gap-10 lg:mt-16 lg:grid-cols-12 lg:gap-12">
                    {/* Left sticky column: category filters + direct support */}
                    <div className="space-y-6 lg:sticky lg:top-24 lg:col-span-4 lg:self-start">
                        <div className="flex flex-wrap gap-2" role="tablist" aria-label="FAQ topics">
                            {FAQ_CATEGORIES.map((category) => {
                                const active = activeCategory === category;
                                return (
                                    <button
                                        key={category}
                                        type="button"
                                        role="tab"
                                        aria-selected={active}
                                        onClick={() => handleCategoryChange(category)}
                                        className={`relative cursor-pointer rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors ${
                                            active
                                                ? 'text-[#163300]'
                                                : 'border border-[var(--color-rule)] bg-[var(--color-card)] text-[var(--color-ink-2)] hover:border-[#9FE870] hover:text-[var(--color-ink)]'
                                        }`}
                                    >
                                        {active ? (
                                            <motion.span
                                                layoutId="faq-category-pill"
                                                transition={{
                                                    type: 'spring',
                                                    stiffness: 420,
                                                    damping: 32,
                                                }}
                                                className="absolute inset-0 rounded-full bg-[#9FE870]"
                                            />
                                        ) : null}
                                        <span className="relative z-10">{category}</span>
                                    </button>
                                );
                            })}
                        </div>

                        <div className="rounded-2xl border border-dashed border-[var(--color-rule)] bg-[var(--color-card)] p-5">
                            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--color-muted)]">
                                Still wondering?
                            </p>
                            <p className="mt-2 text-sm leading-relaxed text-[var(--color-ink-2)]">
                                Have a question about a resume format, Overleaf template, or bug?
                                Send a quick note directly.
                            </p>
                            <a
                                href="https://mail.google.com/mail/?view=cm&fs=1&to=stackmatch.support@gmail.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group mt-4 inline-flex items-center gap-2 rounded-full border border-[var(--color-rule)] bg-[var(--color-paper-3)] px-4 py-2 text-xs font-bold text-[var(--color-ink)] transition-colors hover:border-[#9FE870] hover:bg-[#9FE870] hover:text-[#163300]"
                            >
                                <Mail size={14} />
                                <RollingText text="Email support" />
                            </a>
                        </div>
                    </div>

                    {/* Right accordion column */}
                    <div className="space-y-3 lg:col-span-8">
                        {filteredItems.map((item, idx) => (
                            <FAQRow
                                key={item.id}
                                item={item}
                                index={idx}
                                isOpen={openId === item.id}
                                onToggle={() =>
                                    setOpenId((prev) => (prev === item.id ? null : item.id))
                                }
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default FAQ;