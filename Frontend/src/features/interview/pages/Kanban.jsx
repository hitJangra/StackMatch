import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { 
    Plus, 
    MoreVertical, 
    Building2, 
    MapPin, 
    ExternalLink, 
    Calendar, 
    CheckCircle2, 
    Clock, 
    Trash2, 
    Sparkles, 
    Search,
    ArrowRight,
    ArrowLeft,
    TrendingUp,
    Briefcase,
    FileText
} from 'lucide-react';
import { useToast } from '../../../components/Toast';
import { getLinkedInJobUrl } from '../../../utils/linkedin';

export const KANBAN_STORAGE_KEY = 'stackmatch_kanban_apps_v1';

// Pre-defined pipeline stages
const COLUMNS = [
    { id: 'saved', label: 'Saved', color: 'border-zinc-300 dark:border-zinc-700', badge: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300' },
    { id: 'applied', label: 'Applied', color: 'border-blue-400 dark:border-blue-600', badge: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300' },
    { id: 'interviewing', label: 'Interviewing', color: 'border-amber-400 dark:border-amber-600', badge: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300' },
    { id: 'offered', label: 'Offered', color: 'border-emerald-400 dark:border-emerald-600', badge: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300' },
    { id: 'rejected', label: 'Archived', color: 'border-rose-300 dark:border-rose-800', badge: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300' }
];

// Helper to save a job directly into the user's Kanban board
export const saveJobToKanban = (job, stage = 'saved') => {
    try {
        const raw = localStorage.getItem(KANBAN_STORAGE_KEY);
        const list = raw ? JSON.parse(raw) : [];
        const exists = list.some(item => (item.url && item.url === job.url) || (item.title === job.title && item.company === job.company));
        if (exists) return false;

        const newItem = {
            id: 'kanban_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
            title: job.title || 'Software Engineer',
            company: job.company || 'Company',
            location: job.location || 'Remote',
            salary: job.salary || '',
            url: job.url || '',
            description: job.description || '',
            stage,
            appliedDate: stage === 'applied' ? new Date().toISOString() : null,
            createdAt: new Date().toISOString(),
            notes: ''
        };

        localStorage.setItem(KANBAN_STORAGE_KEY, JSON.stringify([newItem, ...list]));
        return true;
    } catch (e) {
        console.error("Failed to save job to Kanban:", e);
        return false;
    }
};

const Kanban = () => {
    const [items, setItems] = useState(() => {
        try {
            const raw = localStorage.getItem(KANBAN_STORAGE_KEY);
            return raw ? JSON.parse(raw) : [
                {
                    id: 'sample-1',
                    title: 'Frontend Engineer',
                    company: 'Stripe',
                    location: 'Remote, US',
                    salary: '$140k - $170k',
                    url: 'https://www.linkedin.com/jobs',
                    description: 'React, TypeScript, state management systems, and high-performance web experiences.',
                    stage: 'interviewing',
                    appliedDate: new Date(Date.now() - 6 * 86400000).toISOString(),
                    createdAt: new Date().toISOString(),
                    notes: 'Round 1 completed with Hiring Manager. Technical screen scheduled for Friday.'
                },
                {
                    id: 'sample-2',
                    title: 'Full Stack Developer',
                    company: 'Vercel',
                    location: 'San Francisco, CA',
                    salary: '$150k - $185k',
                    url: 'https://www.linkedin.com/jobs',
                    description: 'Next.js, Node.js, distributed databases, edge compute infrastructure.',
                    stage: 'applied',
                    appliedDate: new Date(Date.now() - 2 * 86400000).toISOString(),
                    createdAt: new Date().toISOString(),
                    notes: 'Applied via company portal.'
                }
            ];
        } catch {
            return [];
        }
    });

    const [searchQuery, setSearchQuery] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newCompany, setNewCompany] = useState('');
    const [newLocation, setNewLocation] = useState('');
    const [newSalary, setNewSalary] = useState('');
    const [newUrl, setNewUrl] = useState('');
    const [newStage, setNewStage] = useState('saved');
    const [newNotes, setNewNotes] = useState('');

    const navigate = useNavigate();
    const { addToast } = useToast();

    // Persist items on change
    useEffect(() => {
        try {
            localStorage.setItem(KANBAN_STORAGE_KEY, JSON.stringify(items));
        } catch (e) {
            console.error("Failed to write kanban storage:", e);
        }
    }, [items]);

    // Move stage
    const handleMoveStage = (id, targetStage) => {
        setItems(prev => prev.map(item => {
            if (item.id === id) {
                return {
                    ...item,
                    stage: targetStage,
                    appliedDate: targetStage === 'applied' && !item.appliedDate ? new Date().toISOString() : item.appliedDate
                };
            }
            return item;
        }));
        addToast(`Moved to ${COLUMNS.find(c => c.id === targetStage)?.label || targetStage}`, 'info');
    };

    // Delete item
    const handleDelete = (id) => {
        setItems(prev => prev.filter(item => item.id !== id));
        addToast("Application removed from board.", "info");
    };

    // Add manual item
    const handleCreateItem = (e) => {
        e.preventDefault();
        if (!newTitle.trim()) {
            addToast("Job Title is required.", "warning");
            return;
        }

        const newItem = {
            id: 'kanban_' + Date.now(),
            title: newTitle.trim(),
            company: newCompany.trim() || 'Undisclosed',
            location: newLocation.trim() || 'Remote',
            salary: newSalary.trim(),
            url: newUrl.trim(),
            description: '',
            stage: newStage,
            appliedDate: newStage === 'applied' ? new Date().toISOString() : null,
            createdAt: new Date().toISOString(),
            notes: newNotes.trim()
        };

        setItems(prev => [newItem, ...prev]);
        setIsAddModalOpen(false);
        setNewTitle('');
        setNewCompany('');
        setNewLocation('');
        setNewSalary('');
        setNewUrl('');
        setNewNotes('');
        addToast("Job added to pipeline!", "success");
    };

    // Filtered items
    const filteredItems = useMemo(() => {
        if (!searchQuery.trim()) return items;
        const q = searchQuery.toLowerCase();
        return items.filter(item => 
            item.title?.toLowerCase().includes(q) ||
            item.company?.toLowerCase().includes(q) ||
            item.notes?.toLowerCase().includes(q)
        );
    }, [items, searchQuery]);

    // Statistics metrics
    const stats = useMemo(() => {
        const total = items.length;
        const applied = items.filter(i => i.stage === 'applied').length;
        const interviewing = items.filter(i => i.stage === 'interviewing').length;
        const offered = items.filter(i => i.stage === 'offered').length;
        const active = applied + interviewing + offered;
        const interviewRate = total > 0 ? Math.round(((interviewing + offered) / total) * 100) : 0;
        return { total, active, interviewing, offered, interviewRate };
    }, [items]);

    return (
        <div className="space-y-8 w-full animate-in fade-in duration-300">
            {/* Header and KPI stats */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800">
                <div className="space-y-1">
                    <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                        Application Tracker
                    </h1>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        Manage your active recruiting pipelines, interview stages, and track application conversion rates.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative min-w-[200px]">
                        <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search applications..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-8 pr-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 shadow-xs"
                        />
                    </div>

                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900 shadow-xs transition-all cursor-pointer whitespace-nowrap"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Application</span>
                    </button>
                </div>
            </div>

            {/* Metrics Ribbon */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
                    <span className="text-[11px] font-mono uppercase text-zinc-400 dark:text-zinc-500 font-semibold block">Total Applications</span>
                    <span className="text-2xl font-light font-mono text-zinc-900 dark:text-zinc-100 mt-1 block">{stats.total}</span>
                </div>
                <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
                    <span className="text-[11px] font-mono uppercase text-zinc-400 dark:text-zinc-500 font-semibold block">Active Pipelines</span>
                    <span className="text-2xl font-light font-mono text-indigo-600 dark:text-indigo-400 mt-1 block">{stats.active}</span>
                </div>
                <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
                    <span className="text-[11px] font-mono uppercase text-zinc-400 dark:text-zinc-500 font-semibold block">In Interviews</span>
                    <span className="text-2xl font-light font-mono text-amber-600 dark:text-amber-400 mt-1 block">{stats.interviewing}</span>
                </div>
                <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
                    <span className="text-[11px] font-mono uppercase text-zinc-400 dark:text-zinc-500 font-semibold block">Interview Conversion</span>
                    <span className="text-2xl font-light font-mono text-emerald-600 dark:text-emerald-400 mt-1 block">{stats.interviewRate}%</span>
                </div>
            </div>

            {/* Kanban Columns Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-start">
                {COLUMNS.map((col) => {
                    const columnItems = filteredItems.filter(i => i.stage === col.id);

                    return (
                        <div 
                            key={col.id}
                            className="rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-950/40 p-3.5 flex flex-col gap-3 min-h-[500px]"
                        >
                            {/* Column Header */}
                            <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-mono font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                                        {col.label}
                                    </span>
                                    <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-semibold ${col.badge}`}>
                                        {columnItems.length}
                                    </span>
                                </div>
                            </div>

                            {/* Cards Stack */}
                            <div className="space-y-3 flex-1">
                                {columnItems.length === 0 ? (
                                    <div className="h-32 rounded-lg border border-dashed border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-[11px] text-zinc-400 font-mono">
                                        Empty
                                    </div>
                                ) : (
                                    columnItems.map((item) => (
                                        <div
                                            key={item.id}
                                            className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-all space-y-3 group"
                                        >
                                            {/* Role & Company */}
                                            <div className="space-y-1">
                                                <div className="flex items-start justify-between gap-2">
                                                    <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-2">
                                                        {item.title}
                                                    </h3>
                                                    <button
                                                        onClick={() => handleDelete(item.id)}
                                                        className="text-zinc-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 cursor-pointer"
                                                        title="Delete card"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>

                                                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                                                    <span className="flex items-center gap-1 font-medium text-zinc-700 dark:text-zinc-300">
                                                        <Building2 className="w-3 h-3 text-zinc-400" />
                                                        {item.company}
                                                    </span>
                                                    {item.location && (
                                                        <span className="flex items-center gap-1">
                                                            <MapPin className="w-3 h-3 text-zinc-400" />
                                                            {item.location}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Notes / Snippet */}
                                            {item.notes && (
                                                <p className="text-[11px] text-zinc-600 dark:text-zinc-400 line-clamp-2 italic bg-zinc-50 dark:bg-zinc-800/40 p-2 rounded-lg border border-zinc-100 dark:border-zinc-800/60">
                                                    "{item.notes}"
                                                </p>
                                            )}

                                            {/* Action Bar */}
                                            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-1">
                                                {/* Match & Prep link */}
                                                <button
                                                    onClick={() => navigate('/', { state: { targetJob: { title: item.title, company: item.company, description: item.description } } })}
                                                    className="inline-flex items-center gap-1 text-[10px] font-medium text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                                                    title="Evaluate match score and prepare interview questions"
                                                >
                                                    <Sparkles className="w-3 h-3" />
                                                    <span>Prep</span>
                                                </button>

                                                {/* External job link if available */}
                                                {item.url && (
                                                    <a
                                                        href={getLinkedInJobUrl(item)}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1 text-[10px] text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                                                    >
                                                        <span>Link</span>
                                                        <ExternalLink className="w-2.5 h-2.5" />
                                                    </a>
                                                )}

                                                {/* Stage Selector Dropdown */}
                                                <select
                                                    value={item.stage}
                                                    onChange={(e) => handleMoveStage(item.id, e.target.value)}
                                                    className="text-[10px] font-mono py-1 px-1.5 rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 cursor-pointer focus:outline-none"
                                                >
                                                    {COLUMNS.map(c => (
                                                        <option key={c.id} value={c.id}>{c.label}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Add Application Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
                    <div className="w-full max-w-md rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-xl space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
                            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                                Add Tracked Application
                            </h3>
                            <button 
                                onClick={() => setIsAddModalOpen(false)}
                                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-xs font-mono"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleCreateItem} className="space-y-3">
                            <div>
                                <label className="text-[11px] font-mono uppercase text-zinc-500 dark:text-zinc-400 block mb-1">
                                    Role / Job Title *
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Senior Frontend Engineer"
                                    value={newTitle}
                                    onChange={(e) => setNewTitle(e.target.value)}
                                    className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[11px] font-mono uppercase text-zinc-500 dark:text-zinc-400 block mb-1">
                                        Company Name
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Netflix"
                                        value={newCompany}
                                        onChange={(e) => setNewCompany(e.target.value)}
                                        className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100"
                                    />
                                </div>
                                <div>
                                    <label className="text-[11px] font-mono uppercase text-zinc-500 dark:text-zinc-400 block mb-1">
                                        Location
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Remote / New York"
                                        value={newLocation}
                                        onChange={(e) => setNewLocation(e.target.value)}
                                        className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[11px] font-mono uppercase text-zinc-500 dark:text-zinc-400 block mb-1">
                                        Salary Range
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. $130k - $160k"
                                        value={newSalary}
                                        onChange={(e) => setNewSalary(e.target.value)}
                                        className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100"
                                    />
                                </div>
                                <div>
                                    <label className="text-[11px] font-mono uppercase text-zinc-500 dark:text-zinc-400 block mb-1">
                                        Initial Stage
                                    </label>
                                    <select
                                        value={newStage}
                                        onChange={(e) => setNewStage(e.target.value)}
                                        className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100 cursor-pointer"
                                    >
                                        {COLUMNS.map(c => (
                                            <option key={c.id} value={c.id}>{c.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="text-[11px] font-mono uppercase text-zinc-500 dark:text-zinc-400 block mb-1">
                                    Listing URL
                                </label>
                                <input
                                    type="url"
                                    placeholder="https://..."
                                    value={newUrl}
                                    onChange={(e) => setNewUrl(e.target.value)}
                                    className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100"
                                />
                            </div>

                            <div>
                                <label className="text-[11px] font-mono uppercase text-zinc-500 dark:text-zinc-400 block mb-1">
                                    Notes & Next Steps
                                </label>
                                <textarea
                                    rows={2}
                                    placeholder="e.g. Referral submitted by John; recruiter call next Tuesday"
                                    value={newNotes}
                                    onChange={(e) => setNewNotes(e.target.value)}
                                    className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100 resize-none"
                                />
                            </div>

                            <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 rounded-xl text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900 cursor-pointer shadow-xs"
                                >
                                    Save to Board
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Kanban;
