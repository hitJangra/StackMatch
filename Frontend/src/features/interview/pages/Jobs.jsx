import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Briefcase, Search, Sparkles, ArrowUpRight, MapPin, Building2, CheckCircle2 } from 'lucide-react';
import { getRecommendedJobs } from '../services/interview.api';
import { useToast } from '../../../components/Toast';

const Jobs = () => {
    const [keywordInput, setKeywordInput] = useState('');
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(false);
    const { addToast } = useToast();
    const navigate = useNavigate();

    const handleSearch = async (e) => {
        e?.preventDefault();
        if (!keywordInput.trim()) {
            addToast("Please enter at least one job role or keyword.", "warning");
            return;
        }

        const keywords = keywordInput.split(',').map(s => s.trim()).filter(Boolean);
        try {
            setLoading(true);
            const data = await getRecommendedJobs(keywords);
            setJobs(data?.jobs || []);
            if (data?.jobs?.length) {
                addToast(`Found ${data.jobs.length} jobs!`, "success");
            } else {
                addToast("No jobs found for these keywords. Try broader roles.", "info");
            }
        } catch (err) {
            console.error(err);
            addToast("Failed to fetch jobs. Check API configuration.", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-300">
            {/* Header */}
            <div className="pb-6 border-b border-zinc-200 dark:border-zinc-800">
                <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                    Live Job Recommendations
                </h1>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                    Search active market opportunities matching your target roles scraped via Apify.
                </p>
            </div>

            {/* Search Box */}
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        value={keywordInput}
                        onChange={(e) => setKeywordInput(e.target.value)}
                        placeholder="Enter roles, e.g. 'React Developer, Full Stack Engineer'..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 text-xs placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-all shadow-xs"
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900 shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{loading ? "Scraping..." : "Search Jobs"}</span>
                </button>
            </form>

            {/* Loading */}
            {loading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs animate-pulse space-y-3">
                            <div className="h-4 bg-zinc-100 dark:bg-zinc-800 rounded w-3/4" />
                            <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded w-1/2" />
                            <div className="h-16 bg-zinc-100 dark:bg-zinc-800 rounded-lg" />
                        </div>
                    ))}
                </div>
            )}

            {/* Results */}
            {!loading && jobs.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {jobs.map((job, idx) => (
                        <div
                            key={job.url || idx}
                            className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-all flex flex-col justify-between"
                        >
                            <div className="space-y-3">
                                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-1">
                                    {job.title}
                                </h3>
                                <div className="flex flex-wrap gap-2 text-[11px] text-zinc-500 dark:text-zinc-400">
                                    {job.company && (
                                        <span className="inline-flex items-center gap-1">
                                            <Building2 className="w-3 h-3 text-zinc-400" />
                                            {job.company}
                                        </span>
                                    )}
                                    {job.location && (
                                        <span className="inline-flex items-center gap-1">
                                            <MapPin className="w-3 h-3 text-zinc-400" />
                                            {job.location}
                                        </span>
                                    )}
                                </div>
                                {job.description && (
                                    <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-3 leading-relaxed">
                                        {job.description}
                                    </p>
                                )}
                            </div>

                            <div className="pt-4 mt-4 border-t border-zinc-100 dark:border-zinc-800/80 flex gap-2">
                                {job.url && job.url !== '#' && (
                                    <a
                                        href={job.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800/80 hover:bg-zinc-200 transition-all"
                                    >
                                        <span>View Posting</span>
                                        <ArrowUpRight className="w-3.5 h-3.5" />
                                    </a>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!loading && jobs.length === 0 && (
                <div className="text-center py-16 px-4 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900/50">
                    <Briefcase className="w-8 h-8 text-zinc-400 mx-auto mb-3" />
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        Search live opportunities
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
                        Type one or more job titles above, or head to Home to let AI analyze your resume automatically.
                    </p>
                </div>
            )}
        </div>
    );
};

export default Jobs;
