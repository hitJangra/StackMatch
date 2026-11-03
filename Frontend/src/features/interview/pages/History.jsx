import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { 
    Clock, 
    ArrowUpRight, 
    Search, 
    FileText, 
    Plus, 
    Calendar,
    Target,
    Award,
    TrendingUp,
    Briefcase
} from 'lucide-react';
import { getHistory } from '../services/interview.api';

const History = () => {
    const [scans, setScans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                setLoading(true);
                const data = await getHistory();
                setScans(data?.history || []);
            } catch (err) {
                console.error("Failed to load history:", err);
                setScans([]);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    // Filter scans by search query
    const filteredScans = useMemo(() => {
        if (!searchQuery.trim()) return scans;
        const q = searchQuery.toLowerCase();
        return scans.filter(scan => 
            (scan.title && scan.title.toLowerCase().includes(q)) ||
            (scan.jobDescription && scan.jobDescription.toLowerCase().includes(q))
        );
    }, [scans, searchQuery]);

    // Aggregate statistics
    const stats = useMemo(() => {
        if (!scans.length) return { total: 0, avgScore: 0, highest: 0 };
        const total = scans.length;
        const sum = scans.reduce((acc, s) => acc + (s.matchScore || 0), 0);
        const avgScore = Math.round(sum / total);
        const highest = Math.max(...scans.map(s => s.matchScore || 0));
        return { total, avgScore, highest };
    }, [scans]);

    const formatDate = (dateString) => {
        if (!dateString) return 'Recent';
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        }).format(date);
    };

    const getScoreBadge = (score) => {
        const s = score || 0;
        if (s >= 80) {
            return {
                label: `${s}% Match`,
                badgeClass: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
                dotClass: 'bg-emerald-500'
            };
        }
        if (s >= 60) {
            return {
                label: `${s}% Match`,
                badgeClass: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
                dotClass: 'bg-amber-500'
            };
        }
        return {
            label: `${s}% Match`,
            badgeClass: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20',
            dotClass: 'bg-rose-500'
        };
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-300">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                        Scan History
                    </h1>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                        Review your past resume evaluations, ATS scores, and personalized interview preparation plans.
                    </p>
                </div>

                <button
                    onClick={() => navigate('/')}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900 shadow-sm transition-all self-start sm:self-auto cursor-pointer"
                >
                    <Plus className="w-4 h-4" />
                    <span>Run New Scan</span>
                </button>
            </div>

            {/* Quick Stats Overview */}
            {scans.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center flex-shrink-0">
                            <Clock className="w-5 h-5 text-indigo-500" />
                        </div>
                        <div>
                            <span className="text-xs text-zinc-500 dark:text-zinc-400 block font-medium">Total Evaluations</span>
                            <span className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">{stats.total}</span>
                        </div>
                    </div>

                    <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center flex-shrink-0">
                            <TrendingUp className="w-5 h-5 text-emerald-500" />
                        </div>
                        <div>
                            <span className="text-xs text-zinc-500 dark:text-zinc-400 block font-medium">Average Match</span>
                            <span className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">{stats.avgScore}%</span>
                        </div>
                    </div>

                    <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center flex-shrink-0">
                            <Award className="w-5 h-5 text-amber-500" />
                        </div>
                        <div>
                            <span className="text-xs text-zinc-500 dark:text-zinc-400 block font-medium">Top Match Score</span>
                            <span className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">{stats.highest}%</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Search Filter Bar */}
            {scans.length > 0 && (
                <div className="relative">
                    <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search past scans by target role or keywords..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 text-xs placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 focus:border-transparent transition-all shadow-xs"
                    />
                </div>
            )}

            {/* Content State: Loading Skeleton */}
            {loading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs animate-pulse space-y-4">
                            <div className="flex justify-between items-start">
                                <div className="h-5 bg-zinc-100 dark:bg-zinc-800 rounded w-2/3" />
                                <div className="h-5 bg-zinc-100 dark:bg-zinc-800 rounded-full w-16" />
                            </div>
                            <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded w-1/3" />
                            <div className="space-y-2 pt-2">
                                <div className="h-2.5 bg-zinc-100 dark:bg-zinc-800 rounded w-full" />
                                <div className="h-2.5 bg-zinc-100 dark:bg-zinc-800 rounded w-4/5" />
                            </div>
                            <div className="h-9 bg-zinc-100 dark:bg-zinc-800 rounded-lg w-full pt-4" />
                        </div>
                    ))}
                </div>
            )}

            {/* Content State: Empty Results */}
            {!loading && filteredScans.length === 0 && (
                <div className="text-center py-16 px-4 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900/50">
                    <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-400 mx-auto flex items-center justify-center mb-4">
                        <FileText className="w-6 h-6" />
                    </div>
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        {searchQuery ? "No matching scans found" : "No resume scans yet"}
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
                        {searchQuery 
                            ? "Try adjusting your search terms to locate specific evaluations."
                            : "Upload your resume and a target job description on the home page to start generating AI interview strategies."
                        }
                    </p>
                    {!searchQuery && (
                        <button
                            onClick={() => navigate('/')}
                            className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900 shadow-sm transition-all cursor-pointer"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Create Your First Scan</span>
                        </button>
                    )}
                </div>
            )}

            {/* Content State: Analysis Cards Grid */}
            {!loading && filteredScans.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredScans.map((scan) => {
                        const badge = getScoreBadge(scan.matchScore);
                        return (
                            <div
                                key={scan._id}
                                className="group relative rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-xs hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700 transition-all flex flex-col justify-between"
                            >
                                <div className="space-y-3">
                                    {/* Top Row: Title & ATS Score Badge */}
                                    <div className="flex items-start justify-between gap-3">
                                        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                            {scan.title || "Target Position"}
                                        </h3>
                                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold border flex-shrink-0 ${badge.badgeClass}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${badge.dotClass}`} />
                                            {badge.label}
                                        </span>
                                    </div>

                                    {/* Date Row */}
                                    <div className="flex items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400">
                                        <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                                        <span>{formatDate(scan.createdAt)}</span>
                                    </div>

                                    {/* Snippet */}
                                    {scan.jobDescription && (
                                        <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed pt-1">
                                            {scan.jobDescription}
                                        </p>
                                    )}
                                </div>

                                {/* Action Footer */}
                                <div className="pt-5 mt-4 border-t border-zinc-100 dark:border-zinc-800/80">
                                    <button
                                        onClick={() => navigate(`/interview/${scan._id}`)}
                                        className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800/80 hover:bg-zinc-900 hover:text-white dark:hover:bg-zinc-100 dark:hover:text-zinc-900 transition-all cursor-pointer group-hover:border-transparent"
                                    >
                                        <span>View Detailed Report</span>
                                        <ArrowUpRight className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default History;
