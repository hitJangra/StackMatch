import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { ExternalLink, Plus, Search, Trash2, X } from 'lucide-react';
import { useToast } from '../../../components/Toast';
import {
    getSavedJobs,
    createSavedJob,
    deleteSavedJob as deleteSavedJobApi
} from '../services/interview.api';
import { getAllInterviewReports } from '../services/interview.api';

export const saveJobToSavedJobs = async (job) => {
    try {
        await createSavedJob({
            title: job.title,
            company: job.company,
            location: job.location,
            url: job.url || "",
            applyLink: job.applyLink || "",
            jobUrl: job.jobUrl || "",
            link: job.link || "",
            description: job.description || ""
        });
        return true;
    } catch (error) {
        if (error?.response?.status === 401) return false;
        throw error;
    }
};

const getDirectUrl = (item) =>
    [item.applyLink, item.applicationUrl, item.jobUrl, item.url, item.link].find((value) =>
        typeof value === "string" && value.startsWith("http") && value !== "#"
    ) || "";

const SavedJobs = () => {
    const navigate = useNavigate();
    const { addToast } = useToast();
    const [searchQuery, setSearchQuery] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [newTitle, setNewTitle] = useState('');
    const [newCompany, setNewCompany] = useState('');
    const [newLocation, setNewLocation] = useState('');
    const [newUrl, setNewUrl] = useState('');
    const [newNotes, setNewNotes] = useState('');
    const [items, setItems] = useState([]);

    useEffect(() => {
        let active = true;
        getSavedJobs()
            .then((data) => {
                if (active) setItems(data?.jobs || []);
            })
            .catch((error) => {
                console.error("Failed to load saved jobs:", error);
                if (active) setItems([]);
            })
            .finally(() => {
                if (active) setLoading(false);
            });
        return () => { active = false; };
    }, []);

    const filteredItems = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        if (!query) return items;
        return items.filter((item) =>
            item.title?.toLowerCase().includes(query) ||
            item.company?.toLowerCase().includes(query)
        );
    }, [items, searchQuery]);

    const handleDelete = async (id) => {
        try {
            await deleteSavedJobApi(id);
            setItems((current) => current.filter((item) => item._id !== id));
            addToast('Saved job removed.', 'info');
        } catch (error) {
            console.error("Failed to delete saved job:", error);
            addToast("Could not remove saved job.", "error");
        }
    };

    const handlePrep = async (item) => {
        const linkedReportId =
            item.interviewReportId ||
            item.reportId ||
            item.interviewReport ||
            null;
        if (linkedReportId) {
            navigate(`/interview/${typeof linkedReportId === "object" ? linkedReportId._id : linkedReportId}`);
            return;
        }

        try {
            const response = await getAllInterviewReports();
            const match = (response?.interviewReports || []).find((report) => {
                const titleMatches = report.title?.toLowerCase() === item.title?.toLowerCase();
                const hasMatchData = Number(report.matchScore) > 0;
                return titleMatches && hasMatchData;
            });
            if (match?._id) {
                navigate(`/interview/${match._id}`);
                return;
            }
        } catch {
            // No report found; open the matching workflow instead.
        }

        const jobDescription = [
            item.description?.trim(),
            item.title && item.company ? `${item.title} at ${item.company}` : item.title || item.company || ""
        ].filter(Boolean).join("\n\n");

        navigate('/home', {
            state: {
                homeMode: 'match',
                savedJobPrepBanner: true,
                prepJob: {
                    title: item.title || 'Target Position',
                    company: item.company || '',
                    description: jobDescription
                }
            }
        });
    };

    const handleCreateItem = async (event) => {
        event.preventDefault();
        if (!newTitle.trim()) return;
        try {
            const data = await createSavedJob({
                title: newTitle.trim(),
                company: newCompany.trim() || 'Company',
                location: newLocation.trim(),
                url: newUrl.trim().startsWith('http') ? newUrl.trim() : '',
                notes: newNotes.trim()
            });
            setItems((current) => [data.job, ...current]);
            setNewTitle('');
            setNewCompany('');
            setNewLocation('');
            setNewUrl('');
            setNewNotes('');
            setIsAddModalOpen(false);
            addToast('Job saved.', 'success');
        } catch (error) {
            console.error("Failed to create saved job:", error);
            addToast("Could not save job.", "error");
        }
    };

    return (
        <div className="space-y-8 w-full animate-in fade-in duration-300">
            <div className="wise-page-header">
                <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">Saved Jobs</h1>
                <button type="button" className="wise-primary-pill" onClick={() => setIsAddModalOpen(true)}>
                    <Plus size={16} />
                    <span>Add Job</span>
                </button>
            </div>

            <div className="relative max-w-md">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                    type="search"
                    placeholder="Search jobs"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm"
                />
            </div>

            {loading ? (
                <div className="page-loading-area page-loading-area--compact">
                    <div className="loader-theme-card"><span>Loading jobs...</span></div>
                </div>
            ) : filteredItems.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredItems.map((item) => {
                        const directUrl = getDirectUrl(item);
                        return (
                            <article key={item._id} className="interactive-card saved-job-card group">
                                <div className="flex items-start justify-between gap-4">
                                    <h2 className="saved-job-title">{item.title}</h2>
                                    <button type="button" onClick={() => handleDelete(item._id)} className="saved-job-delete" title="Delete saved job" aria-label={`Delete ${item.title}`}>
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                                <p className="saved-job-meta">{[item.company, item.location].filter(Boolean).join(' · ')}</p>
                                {item.notes && <p className="saved-job-note">{item.notes}</p>}
                                <div className="saved-job-actions">
                                    <button type="button" className="wise-secondary-pill" onClick={() => handlePrep(item)}>Prep</button>
                                    {directUrl && (
                                        <a href={directUrl} target="_blank" rel="noopener noreferrer" className="wise-primary-pill">
                                            <span>Apply</span><ExternalLink size={15} />
                                        </a>
                                    )}
                                </div>
                            </article>
                        );
                    })}
                </div>
            ) : (
                <div className="saved-job-empty"><p>No saved jobs found.</p></div>
            )}

            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="w-full max-w-md rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold">Add Job</h2>
                            <button type="button" className="saved-job-delete" onClick={() => setIsAddModalOpen(false)} aria-label="Close"><X size={18} /></button>
                        </div>
                        <form onSubmit={handleCreateItem} className="space-y-3">
                            <input className="saved-job-input" required value={newTitle} onChange={(event) => setNewTitle(event.target.value)} placeholder="Job title" />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <input className="saved-job-input" value={newCompany} onChange={(event) => setNewCompany(event.target.value)} placeholder="Company" />
                                <input className="saved-job-input" value={newLocation} onChange={(event) => setNewLocation(event.target.value)} placeholder="Location" />
                            </div>
                            <input className="saved-job-input" type="url" value={newUrl} onChange={(event) => setNewUrl(event.target.value)} placeholder="Direct application URL" />
                            <textarea className="saved-job-input resize-none" rows={3} value={newNotes} onChange={(event) => setNewNotes(event.target.value)} placeholder="Note" />
                            <div className="flex justify-end gap-2">
                                <button type="button" className="wise-secondary-pill" onClick={() => setIsAddModalOpen(false)}>Cancel</button>
                                <button type="submit" className="wise-primary-pill">Save Job</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SavedJobs;
