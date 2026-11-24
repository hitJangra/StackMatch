import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { 
    Send, 
    Mail, 
    FileText, 
    MessageSquare, 
    Copy, 
    Check, 
    Sparkles, 
    Building2, 
    Briefcase, 
    SlidersHorizontal,
    ArrowRight,
    Loader2,
    Bookmark,
    HelpCircle,
    RotateCcw
} from 'lucide-react';
import { useToast } from '../../../components/Toast';
import { generateOutreach, getSavedJobs } from '../../interview/services/interview.api';

const OUTREACH_TABS = [
    {
        id: 'referral_dm',
        label: 'Referral DM',
        icon: MessageSquare,
        description: 'Short, non-cringe LinkedIn referral outreach under 100 words.'
    },
    {
        id: 'cold_email',
        label: 'Cold Email',
        icon: Mail,
        description: 'Concise cold email with high-converting subject line.'
    },
    {
        id: 'cover_letter',
        label: 'Cover Letter',
        icon: FileText,
        description: '3-paragraph tailored cover letter with hard proof points.'
    },
    {
        id: 'app_qa',
        label: 'App Q&A',
        icon: HelpCircle,
        description: 'First-person answers to portal questions & elevator pitches.'
    }
];

const TONES = [
    { id: 'Direct', label: 'Direct', desc: 'Punchy & high-signal' },
    { id: 'Formal', label: 'Formal', desc: 'Polished & executive' },
    { id: 'Concise', label: 'Concise', desc: 'Brief & under 70 words' }
];

export const Outreach = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { addToast } = useToast();

    // Active generation mode
    const [activeTab, setActiveTab] = useState(location.state?.type || 'referral_dm');
    const [tone, setTone] = useState('Direct');

    // Form inputs
    const [role, setRole] = useState(location.state?.role || location.state?.title || '');
    const [company, setCompany] = useState(location.state?.company || '');
    const [jobDescription, setJobDescription] = useState(location.state?.jobDescription || location.state?.description || '');
    const [customQuestion, setCustomQuestion] = useState(
        location.state?.customQuestion || 'Why do you want to work at this company and in this role?'
    );
    const [resumeText, setResumeText] = useState(() => {
        // Retrieve persisted resume text from local state if available
        try {
            return localStorage.getItem('stackmatch_persisted_resume_text') || '';
        } catch {
            return '';
        }
    });

    // Saved jobs list for quick autofill
    const [savedJobsList, setSavedJobsList] = useState([]);
    const [selectedSavedJobId, setSelectedSavedJobId] = useState('');

    // Output state
    const [loading, setLoading] = useState(false);
    const [generatedSubject, setGeneratedSubject] = useState('');
    const [generatedContent, setGeneratedContent] = useState('');
    const [copied, setCopied] = useState(false);

    // Load user's saved jobs for autofill
    useEffect(() => {
        let mounted = true;
        const fetchSaved = async () => {
            try {
                const res = await getSavedJobs();
                if (mounted && Array.isArray(res?.jobs)) {
                    setSavedJobsList(res.jobs);
                }
            } catch {
                // Ignore silent fail
            }
        };
        fetchSaved();
        return () => { mounted = false; };
    }, []);

    // Autofill from Saved Jobs select
    const handleSelectSavedJob = (jobId) => {
        setSelectedSavedJobId(jobId);
        if (!jobId) return;
        const found = savedJobsList.find((j) => (j._id || j.id) === jobId);
        if (found) {
            setRole(found.title || found.role || '');
            setCompany(found.company || '');
            setJobDescription(found.description || found.jobDescription || '');
            addToast(`Autofilled from ${found.company}!`, 'info');
        }
    };

    // Handle Generation
    const handleGenerate = async (e) => {
        e?.preventDefault();
        if (!role.trim() && !company.trim()) {
            addToast('Please enter at least a Role or Company name.', 'warning');
            return;
        }

        setLoading(true);
        try {
            const data = await generateOutreach({
                type: activeTab,
                role: role.trim(),
                company: company.trim(),
                jobDescription: jobDescription.trim(),
                resumeText: resumeText.trim(),
                tone,
                customQuestion: activeTab === 'app_qa' ? customQuestion.trim() : undefined
            });

            setGeneratedSubject(data.subject || '');
            setGeneratedContent(data.content || '');
            addToast('Outreach copy generated!', 'success');
        } catch (err) {
            console.error(err);
            addToast(err?.response?.data?.message || 'Failed to generate outreach. Please try again.', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Copy to clipboard
    const handleCopy = () => {
        const textToCopy = generatedSubject 
            ? `Subject: ${generatedSubject}\n\n${generatedContent}`
            : generatedContent;

        if (!textToCopy) return;
        navigator.clipboard?.writeText(textToCopy);
        setCopied(true);
        addToast('Copied to clipboard!', 'success');
        setTimeout(() => setCopied(false), 2000);
    };

    const currentTabObj = OUTREACH_TABS.find((t) => t.id === activeTab) || OUTREACH_TABS[0];

    return (
        <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-300">
            {/* Header */}
            <div className="wise-page-header flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2.5">
                        <Send className="w-5 h-5 text-[#163300] dark:text-[#9FE870]" />
                        <span>Outreach Hub</span>
                    </h1>
                    <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                        Turn your resume match into high-converting referral DMs, cold emails, cover letters, and portal responses.
                    </p>
                </div>

                {/* Autofill from Saved Jobs */}
                {savedJobsList.length > 0 && (
                    <div className="flex items-center gap-2 self-start sm:self-auto">
                        <Bookmark className="w-4 h-4 text-zinc-400 flex-shrink-0" />
                        <select
                            value={selectedSavedJobId}
                            onChange={(e) => handleSelectSavedJob(e.target.value)}
                            className="text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 py-2 px-3 focus:outline-none focus:ring-1 focus:ring-[#9FE870] cursor-pointer shadow-xs"
                        >
                            <option value="">Autofill from Saved Jobs...</option>
                            {savedJobsList.map((job) => (
                                <option key={job._id || job.id} value={job._id || job.id}>
                                    {job.company} — {job.title}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            {/* 4-Tab Switcher */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 p-1.5 rounded-2xl bg-zinc-100 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800">
                {OUTREACH_TABS.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => {
                                setActiveTab(tab.id);
                                setGeneratedSubject('');
                                setGeneratedContent('');
                            }}
                            className={`flex items-center gap-2.5 p-3 rounded-xl text-left transition-all cursor-pointer ${
                                isActive
                                    ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs font-semibold'
                                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-white/50 dark:hover:bg-zinc-800/50'
                            }`}
                        >
                            <div className={`p-2 rounded-lg flex-shrink-0 ${
                                isActive 
                                    ? 'bg-[#9FE870] text-[#163300]' 
                                    : 'bg-zinc-200/60 dark:bg-zinc-800 text-zinc-500'
                            }`}>
                                <Icon className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                                <div className="text-xs sm:text-sm font-bold truncate leading-tight">
                                    {tab.label}
                                </div>
                                <div className="text-[10px] text-zinc-400 truncate hidden sm:block">
                                    {tab.id === 'referral_dm' ? '< 100 words' : tab.id === 'cold_email' ? 'Subject + Body' : tab.id === 'cover_letter' ? '3 paragraphs' : 'First-person'}
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Two Column Layout: Controls & Output */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column: Form Controls */}
                <form onSubmit={handleGenerate} className="lg:col-span-5 space-y-4">
                    <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs space-y-4">
                        <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
                            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-mono">
                                Target Details
                            </span>
                            <span className="text-[11px] text-zinc-400">
                                {currentTabObj.label} Mode
                            </span>
                        </div>

                        {/* Role & Company */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
                                    Target Role *
                                </label>
                                <div className="relative">
                                    <Briefcase className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        value={role}
                                        onChange={(e) => setRole(e.target.value)}
                                        placeholder="e.g. Senior Frontend Eng"
                                        className="w-full text-xs pl-8 pr-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-[#9FE870]"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
                                    Company *
                                </label>
                                <div className="relative">
                                    <Building2 className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        value={company}
                                        onChange={(e) => setCompany(e.target.value)}
                                        placeholder="e.g. Stripe, Linear"
                                        className="w-full text-xs pl-8 pr-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-[#9FE870]"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Tone Selector */}
                        <div className="space-y-1.5 pt-1">
                            <label className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
                                Desired Tone
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                {TONES.map((t) => (
                                    <button
                                        key={t.id}
                                        type="button"
                                        onClick={() => setTone(t.id)}
                                        className={`px-3 py-2 rounded-xl text-xs font-semibold text-center transition-all cursor-pointer border ${
                                            tone === t.id
                                                ? 'bg-[#163300] text-[#9FE870] border-[#163300] dark:bg-[#9FE870] dark:text-[#163300] dark:border-[#9FE870]'
                                                : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-600 dark:text-zinc-300 hover:border-zinc-300'
                                        }`}
                                    >
                                        <div>{t.label}</div>
                                        <div className="text-[9px] opacity-75 font-normal truncate">{t.desc}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Conditional Custom Question for App Q&A */}
                        {activeTab === 'app_qa' && (
                            <div className="space-y-1 pt-1 animate-in fade-in duration-200">
                                <label className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
                                    Application Portal Question
                                </label>
                                <textarea
                                    rows={2}
                                    value={customQuestion}
                                    onChange={(e) => setCustomQuestion(e.target.value)}
                                    placeholder="e.g. Why do you want to join our engineering team?"
                                    className="w-full text-xs p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-[#9FE870] resize-none"
                                />
                            </div>
                        )}

                        {/* Optional Job Description Snippet */}
                        <div className="space-y-1 pt-1">
                            <div className="flex items-center justify-between">
                                <label className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
                                    Target JD Requirements (Optional)
                                </label>
                                <span className="text-[10px] text-zinc-400">Helps tailor key achievements</span>
                            </div>
                            <textarea
                                rows={3}
                                value={jobDescription}
                                onChange={(e) => setJobDescription(e.target.value)}
                                placeholder="Paste job description snippets or tech stack..."
                                className="w-full text-xs p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-[#9FE870] resize-none"
                            />
                        </div>

                        {/* Generate CTA Button */}
                        <button
                            type="submit"
                            disabled={loading || (!role.trim() && !company.trim())}
                            className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-full bg-[#9FE870] hover:bg-[#8dd461] disabled:opacity-50 text-[#163300] font-bold text-xs sm:text-sm transition-all shadow-xs cursor-pointer"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Crafting {currentTabObj.label}...</span>
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-4 h-4" />
                                    <span>Generate {currentTabObj.label}</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>

                {/* Right Column: Generated Output Card */}
                <div className="lg:col-span-7">
                    <div className="h-full min-h-[460px] p-5 sm:p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs flex flex-col justify-between space-y-4">
                        <div className="space-y-3">
                            {/* Output Header */}
                            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-[#9FE870]" />
                                    <span className="text-xs font-mono font-semibold text-zinc-700 dark:text-zinc-300 uppercase">
                                        Generated Output
                                    </span>
                                </div>

                                {generatedContent && (
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={handleCopy}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#9FE870] hover:bg-[#8dd461] text-[#163300] text-xs font-bold transition-all shadow-xs cursor-pointer"
                                        >
                                            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                            <span>{copied ? 'Copied!' : 'Copy to Clipboard'}</span>
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Optional Subject Line box for cold emails */}
                            {generatedSubject && (
                                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 flex items-start gap-2">
                                    <span className="text-[11px] font-mono font-bold text-zinc-500 uppercase flex-shrink-0 mt-0.5">
                                        Subject:
                                    </span>
                                    <input
                                        type="text"
                                        value={generatedSubject}
                                        onChange={(e) => setGeneratedSubject(e.target.value)}
                                        className="w-full text-xs font-semibold text-zinc-900 dark:text-zinc-100 bg-transparent focus:outline-none"
                                    />
                                </div>
                            )}

                            {/* Main Content Area */}
                            {loading ? (
                                <div className="min-h-[300px] flex flex-col items-center justify-center text-center space-y-3">
                                    <Loader2 className="w-8 h-8 text-[#163300] dark:text-[#9FE870] animate-spin" />
                                    <div className="space-y-1">
                                        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                                            Synthesizing tailored outreach...
                                        </p>
                                        <p className="text-xs text-zinc-400">
                                            Matching your credentials to {company || 'target company'}'s culture.
                                        </p>
                                    </div>
                                </div>
                            ) : generatedContent ? (
                                <textarea
                                    rows={14}
                                    value={generatedContent}
                                    onChange={(e) => setGeneratedContent(e.target.value)}
                                    className="w-full p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 text-xs sm:text-sm font-sans text-zinc-800 dark:text-zinc-200 leading-relaxed focus:outline-none focus:ring-1 focus:ring-[#9FE870] resize-y"
                                />
                            ) : (
                                <div className="min-h-[320px] flex flex-col items-center justify-center text-center p-6 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl space-y-3">
                                    <div className="p-3 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400">
                                        <Send className="w-6 h-6" />
                                    </div>
                                    <div className="space-y-1 max-w-sm">
                                        <p className="text-xs sm:text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                                            Ready to generate your {currentTabObj.label}
                                        </p>
                                        <p className="text-xs text-zinc-400">
                                            {currentTabObj.description} Fill in the target role and company on the left to start.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Bottom stats / tips */}
                        {generatedContent && (
                            <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-[11px] text-zinc-400">
                                <span>
                                    {generatedContent.trim().split(/\s+/).filter(Boolean).length} words · {generatedContent.length} characters
                                </span>
                                <span className="text-[#163300] dark:text-[#9FE870] font-semibold">
                                    Direct & Editable
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Outreach;
