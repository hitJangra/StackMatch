import React, { useState, useMemo } from 'react';
import { CheckCircle2, AlertTriangle, Search, Filter, Hash, Layers } from 'lucide-react';

/**
 * Resume Keyword Heatmap Component
 * Benchmarks extracted keywords from the Job Description against the Candidate Resume.
 * Visually categorizes keywords into Matched (Green) and Missing (Amber/Rose).
 */
export const ResumeKeywordHeatmap = ({ resumeText = "", jobDescription = "", skillGaps = [], jdKeywords = [] }) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState("all"); // 'all' | 'matched' | 'missing'
    const [selectedKeyword, setSelectedKeyword] = useState(null);

    // Heuristic extraction of key technical & domain terms from JD & Resume
    const heatmapData = useMemo(() => {
        const jd = (jobDescription || "").toLowerCase();
        const res = (resumeText || "").toLowerCase();

        // Expanded catalog of real technical, framework, cloud & domain skills
        const standardTechCatalog = [
            "react", "react.js", "next.js", "vue", "angular", "svelte", "typescript", "javascript",
            "node.js", "express", "nestjs", "python", "django", "fastapi", "flask", "java",
            "spring boot", "c++", "c#", ".net", "asp.net core", "entity framework", "web api",
            "golang", "rust", "php", "laravel", "ruby", "rails", "swift", "kotlin", "flutter",
            "aws", "gcp", "azure", "vercel", "fly.io", "docker", "kubernetes", "ci/cd", "terraform",
            "sql", "postgres", "postgresql", "sql server", "mysql", "supabase", "mongodb", "redis",
            "elasticsearch", "graphql", "rest api", "system design", "microservices", "kafka",
            "rabbitmq", "git", "linux", "html5", "css3", "tailwind", "shadcn", "sass", "redux",
            "zustand", "jest", "cypress", "playwright", "unit testing", "agile", "scrum",
            "dbt", "airbyte", "langgraph", "langchain", "openai", "anthropic", "gemini",
            "machine learning", "nlp", "rag", "devops", "mlops"
        ];

        // Boundary-safe regex so terms with special chars (C++, C#, .NET, Node.js) match cleanly
        const makeSafeRegex = (term) => {
            const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            return new RegExp(`(?<![a-zA-Z0-9])${escaped}(?![a-zA-Z0-9])`, 'gi');
        };

        // 1. Gather concise skill-gap terms from AI (skip long full-sentence gaps)
        const gapSkills = new Map();
        if (Array.isArray(skillGaps)) {
            skillGaps.forEach(g => {
                if (g && g.skill) {
                    const clean = g.skill.toLowerCase().trim();
                    if (clean.split(/\s+/).length <= 3) {
                        gapSkills.set(clean, g.severity || "medium");
                    }
                }
            });
        }

        // 2. Prefer AI-extracted JD keywords; fall back to the standard catalog only when absent
        const candidates = new Set();
        const primaryKeywords = Array.isArray(jdKeywords)
            ? jdKeywords.map(keyword => String(keyword).trim().toLowerCase()).filter(Boolean).slice(0, 20)
            : [];
        if (primaryKeywords.length > 0) {
            primaryKeywords.forEach(keyword => candidates.add(keyword));
        } else {
            standardTechCatalog.forEach(tech => {
                if (makeSafeRegex(tech).test(jd)) candidates.add(tech);
            });
        }

        // 3. Add concise explicit skill gap items
        gapSkills.forEach((_, skill) => {
            candidates.add(skill);
        });

        // 4. Evaluate match against candidate resume
        const list = Array.from(candidates).map(term => {
            const isExplicitGap = gapSkills.has(term);
            const safePattern = makeSafeRegex(term);
            const jdMatches = (jd.match(safePattern) || []).length;
            const resMatches = res.length > 0 ? (res.match(safePattern) || []).length : 0;
            const inResume = !isExplicitGap && (res.length > 0 ? resMatches > 0 : true);

            const severity = gapSkills.get(term) || (isExplicitGap ? "high" : "low");

            return {
                term,
                isMatched: inResume,
                jdFrequency: Math.max(1, jdMatches),
                resFrequency: resMatches,
                severity: isExplicitGap ? severity : "matched",
                importance: jdMatches >= 3 || isExplicitGap ? "critical" : "standard"
            };
        });

        // Sort: missing critical first, then matched high frequency
        return list.sort((a, b) => {
            if (a.isMatched !== b.isMatched) return a.isMatched ? 1 : -1;
            return b.jdFrequency - a.jdFrequency;
        });
    }, [resumeText, jobDescription, skillGaps, jdKeywords]);

    // Metrics
    const stats = useMemo(() => {
        const total = heatmapData.length;
        if (!total) return { total: 0, matched: 0, missing: 0, rate: 0 };
        const matched = heatmapData.filter(i => i.isMatched).length;
        const missing = total - matched;
        const rate = Math.round((matched / total) * 100);
        return { total, matched, missing, rate };
    }, [heatmapData]);

    // Filtered list
    const filteredKeywords = useMemo(() => {
        return heatmapData.filter(item => {
            if (activeFilter === "matched" && !item.isMatched) return false;
            if (activeFilter === "missing" && item.isMatched) return false;
            if (searchQuery.trim()) {
                return item.term.toLowerCase().includes(searchQuery.toLowerCase().trim());
            }
            return true;
        });
    }, [heatmapData, activeFilter, searchQuery]);

    return (
        <div className="interactive-card rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-xs">
            {/* Header */}
            <div className="p-5 sm:p-6 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <Layers className="w-4 h-4 text-indigo-500" />
                            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                                Keyword heatmap
                            </h3>
                        </div>
                    </div>

                    {/* ATS Keyword Match Health Badge */}
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 font-mono text-xs">
                            <span className="text-zinc-500 dark:text-zinc-400">ATS match:</span>
                            <span className={`font-semibold ${stats.rate >= 75 ? 'text-emerald-600 dark:text-emerald-400' : stats.rate >= 50 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                {stats.rate}%
                            </span>
                        </div>
                    </div>
                </div>

                {/* Filter and Search Bar */}
                <div className="mt-5 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                    <div className="flex items-center gap-1.5 p-1 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/40">
                        <button
                            onClick={() => setActiveFilter("all")}
                            className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${activeFilter === "all" ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs" : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"}`}
                        >
                            All ({stats.total})
                        </button>
                        <button
                            onClick={() => setActiveFilter("matched")}
                            className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${activeFilter === "matched" ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 shadow-xs" : "text-zinc-500 hover:text-emerald-600 dark:hover:text-emerald-400"}`}
                        >
                            Matched ({stats.matched})
                        </button>
                        <button
                            onClick={() => setActiveFilter("missing")}
                            className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${activeFilter === "missing" ? "bg-rose-500/15 text-rose-700 dark:text-rose-400 shadow-xs" : "text-zinc-500 hover:text-rose-600 dark:hover:text-rose-400"}`}
                        >
                            Missing ({stats.missing})
                        </button>
                    </div>

                    <div className="relative min-w-[200px]">
                        <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Filter keyword..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100"
                        />
                    </div>
                </div>
            </div>

            {/* Keyword Chips Heatmap Area */}
            <div className="p-5 sm:p-6">
                {filteredKeywords.length === 0 ? (
                    <div className="text-center py-8 text-xs text-zinc-400">
                        No keywords found.
                    </div>
                ) : (
                    <div className="flex flex-wrap gap-2.5">
                        {filteredKeywords.map((item, idx) => {
                            const isSelected = selectedKeyword?.term === item.term;

                            return (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedKeyword(isSelected ? null : item)}
                                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer border ${
                                        item.isMatched
                                            ? isSelected
                                                ? "bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-500 ring-2 ring-emerald-500/30"
                                                : "bg-emerald-500/10 hover:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 hover:border-emerald-500/40"
                                            : isSelected
                                                ? "bg-rose-500/20 text-rose-800 dark:text-rose-300 border-rose-500 ring-2 ring-rose-500/30"
                                                : "bg-rose-500/10 hover:bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/20 hover:border-rose-500/40"
                                    }`}
                                >
                                    {item.isMatched ? (
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                                    ) : (
                                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 flex-shrink-0" />
                                    )}
                                    <span className="font-medium capitalize">{item.term}</span>
                                    <span className="text-[10px] opacity-60 ml-0.5">
                                        ×{item.jdFrequency}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* Selected Keyword Context Drawer */}
                {selectedKeyword && (
                    <div className="mt-5 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950/60 space-y-2 animate-in fade-in duration-200">
                        <div className="flex items-center justify-between">
                            <span className="font-mono text-xs font-semibold uppercase text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                                <Hash className="w-3.5 h-3.5 text-indigo-500" />
                                Context for "{selectedKeyword.term}"
                            </span>
                            <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-medium uppercase ${selectedKeyword.isMatched ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300' : 'bg-rose-500/20 text-rose-700 dark:text-rose-300'}`}>
                                {selectedKeyword.isMatched ? 'Matched' : 'Missing'}
                            </span>
                        </div>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                            {selectedKeyword.isMatched
                                ? `Found in your resume. Mentioned ${selectedKeyword.jdFrequency} time(s) in the job description.`
                                : `Not found in your resume. Mentioned ${selectedKeyword.jdFrequency} time(s) in the job description.`}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResumeKeywordHeatmap;