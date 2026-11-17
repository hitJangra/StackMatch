// react and state
import React, { useState, useEffect } from 'react';
// navigation hook
import { useNavigate } from 'react-router';
// ui icons
import { Briefcase, Search, Sparkles, ArrowUpRight, MapPin, Building2, ChevronDown, SlidersHorizontal, Clock, ExternalLink, BookmarkPlus } from 'lucide-react';
// api call to scrape job recommendations and manage past recommendations
import { getRecommendedJobs, getPastRecommendations, saveLocalPastJobs, getLocalPastJobs } from '../services/interview.api';
// helper for linkedin job urls
import { getLinkedInJobUrl } from '../../../utils/linkedin';
// toast alerts
import { useToast } from '../../../components/Toast';
import ScraperLoadingProgress from '../../../components/ScraperLoadingProgress';
import { saveJobToKanban } from './Kanban';

// shared select field component for minimalist glassmorphic dropdowns
const FilterSelect = ({ label, value, onChange, options, icon: Icon }) => (
    <div className="flex flex-col gap-1.5 flex-1 min-w-[140px]">
        <label className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1">
            {Icon && <Icon className="w-3 h-3" />}
            {label}
        </label>
        <div className="relative">
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full appearance-none pl-3 pr-8 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 text-xs focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-all shadow-xs cursor-pointer"
            >
                {options.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
    </div>
);

// jobs discovery page
const Jobs = () => {
    // search input value
    const [keywordInput, setKeywordInput] = useState('');
    // filter states — pre-fetch query parameters
    const [location, setLocation] = useState('India');
    const [experience, setExperience] = useState('any');
    const [jobType, setJobType] = useState('any');
    // scraped jobs list for current live search
    const [jobs, setJobs] = useState([]);
    // loading state during scraping
    const [loading, setLoading] = useState(false);
    // past recommended jobs list
    const [pastJobs, setPastJobs] = useState(() => getLocalPastJobs());
    const [pastLoading, setPastLoading] = useState(false);
    // toast triggers
    const { addToast } = useToast();
    // navigation router
    const navigate = useNavigate();

    // fetch all past recommended jobs on mount
    useEffect(() => {
        const fetchPast = async () => {
            setPastLoading(true);
            try {
                const res = await getPastRecommendations();
                if (res?.jobs?.length) {
                    saveLocalPastJobs(res.jobs);
                }
                setPastJobs(getLocalPastJobs());
            } catch (e) {
                setPastJobs(getLocalPastJobs());
            } finally {
                setPastLoading(false);
            }
        };
        fetchPast();
    }, []);

    // filter option definitions
    const locationOptions = [
        { value: 'India', label: '🇮🇳 India' },
        { value: 'Remote', label: '🌐 Remote' },
        { value: 'United States', label: '🇺🇸 United States' },
        { value: 'United Kingdom', label: '🇬🇧 United Kingdom' },
        { value: 'Canada', label: '🇨🇦 Canada' },
        { value: 'Australia', label: '🇦🇺 Australia' },
        { value: 'Germany', label: '🇩🇪 Germany' },
        { value: 'Singapore', label: '🇸🇬 Singapore' },
    ];

    const experienceOptions = [
        { value: 'any',    label: 'Any Experience' },
        { value: 'fresher', label: 'Entry Level / Fresher' },
        { value: 'mid',    label: 'Mid-Level' },
        { value: 'senior', label: 'Senior' },
    ];

    const jobTypeOptions = [
        { value: 'any',       label: 'Any Type' },
        { value: 'full-time', label: 'Full-Time' },
        { value: 'internship',label: 'Internship' },
        { value: 'contract',  label: 'Contract' },
        { value: 'part-time', label: 'Part-Time' },
    ];

    // trigger job scraper on search
    const handleSearch = async (e) => {
        // prevent page reload
        e?.preventDefault();
        // check non-empty
        if (!keywordInput.trim()) {
            addToast("Please enter at least one job role or keyword.", "warning");
            return;
        }

        // split comma-separated keywords
        const keywords = keywordInput.split(',').map(s => s.trim()).filter(Boolean);

        // build filter params to send alongside keywords
        const filters = { location, experience, type: jobType };

        try {
            // start scraping animation
            setLoading(true);
            // query backend scraper with keywords + filters
            const data = await getRecommendedJobs(keywords, filters);
            const fetched = data?.jobs || [];
            setJobs(fetched);

            // also save to past recommendations so they are preserved
            if (fetched.length > 0) {
                saveLocalPastJobs(fetched);
                setPastJobs(getLocalPastJobs());
            }

            // notify count
            if (fetched.length) {
                addToast(`Found ${fetched.length} jobs!`, "success");
            } else {
                addToast("No jobs found for these keywords. Try broader roles.", "info");
            }
        } catch (err) {
            console.error(err);
            addToast("Failed to fetch jobs. Check API configuration.", "error");
        } finally {
            // stop spinner
            setLoading(false);
        }
    };

    return (
        // jobs page container
        <div className="space-y-8 animate-in fade-in duration-300">
            {/* page header */}
            <div className="pb-6 border-b border-zinc-200 dark:border-zinc-800">
                <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                    Live Job Recommendations
                </h1>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                    Search active market opportunities matching your target roles scraped via Apify.
                </p>
            </div>

            {/* ── filter panel ── */}
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-sm p-4 shadow-xs space-y-3">
                {/* filter header */}
                <div className="flex items-center gap-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Search Filters</span>
                    <span className="ml-auto text-[11px] font-normal text-zinc-400">Applied before fetching</span>
                </div>

                {/* three filter dropdowns */}
                <div className="flex flex-wrap gap-3">
                    <FilterSelect
                        label="Location"
                        value={location}
                        onChange={setLocation}
                        options={locationOptions}
                        icon={MapPin}
                    />
                    <FilterSelect
                        label="Experience Level"
                        value={experience}
                        onChange={setExperience}
                        options={experienceOptions}
                    />
                    <FilterSelect
                        label="Job Type"
                        value={jobType}
                        onChange={setJobType}
                        options={jobTypeOptions}
                    />
                </div>

                {/* active filter badges */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                    {location !== 'any' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                            📍 {location}
                        </span>
                    )}
                    {experience !== 'any' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                            🎯 {experienceOptions.find(o => o.value === experience)?.label}
                        </span>
                    )}
                    {jobType !== 'any' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                            💼 {jobTypeOptions.find(o => o.value === jobType)?.label}
                        </span>
                    )}
                </div>
            </div>

            {/* search input bar */}
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
                {/* submit search button */}
                <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900 shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{loading ? "Searching..." : "Find Matches"}</span>
                </button>
            </form>

            {/* Premium minimalist loading indicator */}
            {loading && (
                <ScraperLoadingProgress 
                    active={loading} 
                    title={`Querying live LinkedIn indices for ${location !== 'any' ? location : 'Global market'}`}
                    estimatedSeconds={40}
                />
            )}

            {/* job listing cards — live search results */}
            {!loading && jobs.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-indigo-500" />
                            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                                Live Search Results
                            </h2>
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            Showing <span className="font-semibold text-zinc-900 dark:text-zinc-100">{jobs.length}</span> results
                            {location !== 'any' && <> in <span className="font-semibold text-zinc-900 dark:text-zinc-100">{location}</span></>}
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {jobs.map((job, idx) => (
                            <div
                                key={job.url || idx}
                                className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-all flex flex-col justify-between group"
                            >
                                <div className="space-y-3">
                                    {/* job title — clickable link to linkedin with arrow icon */}
                                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-1">
                                        <a
                                            href={getLinkedInJobUrl(job)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors inline-flex items-center gap-1.5 group/title"
                                            title="View & apply for this job on LinkedIn"
                                        >
                                            <span className="line-clamp-1">{job.title}</span>
                                            <ArrowUpRight className="w-3.5 h-3.5 text-zinc-400 group-hover/title:text-indigo-500 group-hover/title:translate-x-0.5 group-hover/title:-translate-y-0.5 transition-all flex-shrink-0" />
                                        </a>
                                    </h3>
                                    {/* company and location */}
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
                                    {/* description snippet */}
                                    {job.description && (
                                        <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-3 leading-relaxed">
                                            {job.description}
                                        </p>
                                    )}
                                </div>

                                {/* card footer actions */}
                                <div className="pt-4 mt-4 border-t border-zinc-100 dark:border-zinc-800/80 flex gap-2">
                                    <a
                                        href={getLinkedInJobUrl(job)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all"
                                        title="Open application page on LinkedIn"
                                    >
                                        <span>Apply on LinkedIn</span>
                                        <ExternalLink className="w-3.5 h-3.5" />
                                    </a>

                                    <button
                                        onClick={() => {
                                            const added = saveJobToKanban(job);
                                            if (added) addToast(`Added "${job.title}" to Tracker!`, "success");
                                            else addToast(`"${job.title}" is already in your Tracker.`, "info");
                                        }}
                                        className="p-2 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 bg-zinc-100 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all cursor-pointer"
                                        title="Track this application in Tracker"
                                    >
                                        <BookmarkPlus className="w-3.5 h-3.5" />
                                    </button>

                                    <button
                                        onClick={() => navigate('/', { state: { targetJob: job } })}
                                        className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900 shadow-sm transition-all cursor-pointer"
                                        title="Match this job with your resume on Home"
                                    >
                                        <Sparkles className="w-3.5 h-3.5" />
                                        <span>Match</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* empty state if no live search active and no past recommendations */}
            {!loading && jobs.length === 0 && pastJobs.length === 0 && (
                <div className="text-center py-12 px-4 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900/50">
                    <Briefcase className="w-8 h-8 text-zinc-400 mx-auto mb-3" />
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        Search live opportunities
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
                        Set your filters above, type one or more job titles, then click <strong>Find Matches</strong>.
                    </p>
                </div>
            )}

            {/* ── past recommendations section ── */}
            <div className="space-y-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center">
                            <Clock className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                                    Past Recommendations
                                </h2>
                                <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                                    {pastJobs.length} {pastJobs.length === 1 ? 'role' : 'roles'}
                                </span>
                            </div>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                                All roles recommended for your profile across scans and searches, including those not yet matched.
                            </p>
                        </div>
                    </div>
                </div>

                {pastLoading && pastJobs.length === 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs animate-pulse space-y-3">
                                <div className="h-4 bg-zinc-100 dark:bg-zinc-800 rounded w-3/4" />
                                <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded w-1/2" />
                                <div className="h-16 bg-zinc-100 dark:bg-zinc-800 rounded-lg" />
                            </div>
                        ))}
                    </div>
                ) : pastJobs.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {pastJobs.map((job, idx) => (
                            <div
                                key={job.url || `${job.title}-${idx}`}
                                className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-all flex flex-col justify-between group"
                            >
                                <div className="space-y-3">
                                    {/* job title — clickable link to linkedin with arrow icon */}
                                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-1">
                                        <a
                                            href={getLinkedInJobUrl(job)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors inline-flex items-center gap-1.5 group/title"
                                            title="View & apply for this job on LinkedIn"
                                        >
                                            <span className="line-clamp-1">{job.title}</span>
                                            <ArrowUpRight className="w-3.5 h-3.5 text-zinc-400 group-hover/title:text-indigo-500 group-hover/title:translate-x-0.5 group-hover/title:-translate-y-0.5 transition-all flex-shrink-0" />
                                        </a>
                                    </h3>

                                    {/* company and location metadata */}
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

                                    {/* snippet / description */}
                                    {job.description && (
                                        <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-3 leading-relaxed">
                                            {job.description}
                                        </p>
                                    )}
                                </div>

                                {/* card actions */}
                                <div className="pt-4 mt-4 border-t border-zinc-100 dark:border-zinc-800/80 flex gap-2">
                                    <a
                                        href={getLinkedInJobUrl(job)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all"
                                        title="Open application page on LinkedIn"
                                    >
                                        <span>Apply on LinkedIn</span>
                                        <ExternalLink className="w-3.5 h-3.5" />
                                    </a>

                                    <button
                                        onClick={() => {
                                            const added = saveJobToKanban(job);
                                            if (added) addToast(`Added "${job.title}" to Tracker!`, "success");
                                            else addToast(`"${job.title}" is already in your Tracker.`, "info");
                                        }}
                                        className="p-2 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 bg-zinc-100 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all cursor-pointer"
                                        title="Track this application in Tracker"
                                    >
                                        <BookmarkPlus className="w-3.5 h-3.5" />
                                    </button>

                                    <button
                                        onClick={() => navigate('/', { state: { targetJob: job } })}
                                        className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900 shadow-sm transition-all cursor-pointer"
                                        title="Match this job with your resume on Home"
                                    >
                                        <Sparkles className="w-3.5 h-3.5" />
                                        <span>Match</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10 px-4 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30">
                        <Briefcase className="w-7 h-7 text-zinc-400 mx-auto mb-2 opacity-60" />
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
                            No past recommendations recorded yet. When you search for opportunities or click <strong>Find Matching Jobs</strong> on the Home page, all recommended listings will appear here automatically.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

// export jobs component
export default Jobs;
