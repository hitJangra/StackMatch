import React, { useState, useRef } from 'react';
import { 
    FlaskConical, 
    UploadCloud, 
    FileText, 
    CheckCircle2, 
    AlertTriangle, 
    PenLine, 
    Target, 
    ArrowRight, 
    Copy, 
    Check, 
    Loader2, 
    ShieldCheck, 
    Zap, 
    Hash, 
    Layout, 
    RefreshCw,
    X,
    FileCheck
} from 'lucide-react';
import { useToast } from '../../../components/Toast';
import { auditResume, enhanceResumeBullet } from '../../interview/services/interview.api';

export const ResumeLab = () => {
    const { addToast } = useToast();
    const fileInputRef = useRef(null);

    // ATS Audit State
    const [auditFile, setAuditFile] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [auditLoading, setAuditLoading] = useState(false);
    const [auditResult, setAuditResult] = useState(null);

    // Bullet Enhancer State
    const [bulletInput, setBulletInput] = useState('');
    const [targetRole, setTargetRole] = useState('');
    const [enhanceLoading, setEnhanceLoading] = useState(false);
    const [rewrites, setRewrites] = useState([]);
    const [copiedIndex, setCopiedIndex] = useState(null);

    // File Drag & Drop Handlers
    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer?.files?.[0];
        if (file && file.type === 'application/pdf') {
            setAuditFile(file);
        } else {
            addToast('Please upload a valid PDF document.', 'warning');
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.type !== 'application/pdf') {
                addToast('Only PDF files are supported.', 'warning');
                return;
            }
            setAuditFile(file);
        }
    };

    // Run ATS Audit
    const handleRunAudit = async () => {
        if (!auditFile) {
            addToast('Please select or drop a resume PDF first.', 'warning');
            return;
        }

        setAuditLoading(true);
        try {
            const data = await auditResume({ resumeFile: auditFile });
            if (data?.audit) {
                setAuditResult(data.audit);
                addToast('Audit complete.', 'success');
            }
        } catch (err) {
            console.error(err);
            addToast(err?.response?.data?.message || 'Failed to audit resume. Please verify PDF is text-selectable.', 'error');
        } finally {
            setAuditLoading(false);
        }
    };

    // Run Bullet Enhancer
    const handleEnhanceBullet = async (e) => {
        e?.preventDefault();
        if (!bulletInput.trim() || bulletInput.trim().length < 5) {
            addToast('Enter a bullet first.', 'warning');
            return;
        }

        setEnhanceLoading(true);
        try {
            const data = await enhanceResumeBullet({
                bullet: bulletInput.trim(),
                targetRole: targetRole.trim()
            });

            if (Array.isArray(data?.rewrites)) {
                setRewrites(data.rewrites);
                addToast('3 rewrites generated.', 'success');
            }
        } catch (err) {
            console.error(err);
            addToast(err?.response?.data?.message || 'Failed to enhance bullet point.', 'error');
        } finally {
            setEnhanceLoading(false);
        }
    };

    // Copy Bullet
    const handleCopyRewrite = (text, idx) => {
        navigator.clipboard?.writeText(text);
        setCopiedIndex(idx);
        addToast('Bullet copied.', 'success');
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    return (
        <div className="space-y-10 max-w-7xl mx-auto animate-in fade-in duration-300 pb-12">
            {/* Page Header */}
            <div className="wise-page-header">
                <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2.5">
                    <FlaskConical className="w-5 h-5 text-[#163300] dark:text-[#9FE870]" />
                    <span>Resume Lab</span>
                </h1>
            </div>

            {/* ── Section 1: Standalone ATS Audit ── */}
            <section className="space-y-6" aria-labelledby="audit-heading">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-[#163300] dark:text-[#9FE870]" />
                        <h2 id="audit-heading" className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                            Resume audit
                        </h2>
                    </div>
                </div>

                {/* Dropzone & Action Bar */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Left: Dropzone Box */}
                    <div className="lg:col-span-5 space-y-4">
                        <div
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                            className={`p-6 sm:p-8 rounded-2xl border-2 border-dashed text-center transition-all cursor-pointer ${
                                isDragging
                                    ? 'border-[#9FE870] bg-[#9FE870]/10 scale-[1.01]'
                                    : auditFile
                                        ? 'border-emerald-500/40 bg-emerald-50/20 dark:bg-emerald-950/20'
                                        : 'border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-600 bg-white dark:bg-zinc-900/60'
                            }`}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".pdf,application/pdf"
                                onChange={handleFileChange}
                                className="hidden"
                            />

                            <div className="flex flex-col items-center justify-center space-y-3">
                                {auditFile ? (
                                    <>
                                        <div className="p-3 rounded-2xl bg-[#9FE870] text-[#163300]">
                                            <FileCheck className="w-8 h-8" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate max-w-xs">
                                                {auditFile.name}
                                            </p>
                                            <p className="text-xs text-zinc-500 font-mono">
                                                {(auditFile.size / (1024 * 1024)).toFixed(2)} MB · PDF Document
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setAuditFile(null);
                                                setAuditResult(null);
                                            }}
                                            className="text-xs text-zinc-400 hover:text-red-500 transition-colors inline-flex items-center gap-1 cursor-pointer"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                            <span>Remove file</span>
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <div className="p-3.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
                                            <UploadCloud className="w-8 h-8 text-[#163300] dark:text-[#9FE870]" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100">
                                                Upload or drop your resume PDF
                                            </p>
                                            <p className="text-xs text-zinc-400">
                                                PDF up to 3MB
                                            </p>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Audit Action Button */}
                        <button
                            type="button"
                            onClick={handleRunAudit}
                            disabled={auditLoading || !auditFile}
                            className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-full bg-[#9FE870] hover:bg-[#8dd461] disabled:opacity-50 text-[#163300] font-bold text-xs sm:text-sm transition-all shadow-xs cursor-pointer"
                        >
                            {auditLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Scanning resume...</span>
                                </>
                            ) : (
                                <>
                                    <FileCheck className="w-4 h-4" />
                                    <span>Run resume audit</span>
                                </>
                            )}
                        </button>
                    </div>

                    {/* Right: Audit Report Output */}
                    <div className="lg:col-span-7">
                        {auditLoading ? (
                            <div className="min-h-[340px] p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs flex flex-col items-center justify-center text-center space-y-3">
                                <Loader2 className="w-8 h-8 text-[#163300] dark:text-[#9FE870] animate-spin" />
                                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                                    Reading layout, verbs, and metrics...
                                </p>
                            </div>
                        ) : auditResult ? (
                            <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs space-y-5 animate-in fade-in duration-200">
                                {/* Score Header */}
                                <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
                                    <div>
                                        <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-semibold block">
                                            ATS score
                                        </span>
                                        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                                            {auditResult.overallScore >= 85 
                                                ? 'Strong resume' 
                                                : auditResult.overallScore >= 70 
                                                    ? 'Needs fixes' 
                                                    : 'Major fixes needed'}
                                        </h3>
                                    </div>

                                    {/* Circular score badge */}
                                    <div className="flex items-center gap-3 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2">
                                        <div className="relative w-11 h-11 flex items-center justify-center">
                                            <svg className="w-11 h-11 -rotate-90" viewBox="0 0 36 36">
                                                <path
                                                    className="text-zinc-200 dark:text-zinc-700"
                                                    strokeWidth="3.2"
                                                    stroke="currentColor"
                                                    fill="none"
                                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                />
                                                <path
                                                    className="text-[#163300] dark:text-[#9FE870] transition-all duration-700"
                                                    strokeDasharray={`${auditResult.overallScore}, 100`}
                                                    strokeWidth="3.2"
                                                    strokeLinecap="round"
                                                    stroke="currentColor"
                                                    fill="none"
                                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                />
                                            </svg>
                                            <span className="absolute text-xs font-bold font-mono text-zinc-900 dark:text-zinc-100">
                                                {auditResult.overallScore}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-mono text-zinc-400 block uppercase">Score</span>
                                            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                                / 100 pts
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Categorized Feedback Cards */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* Strengths */}
                                    <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-500/20 space-y-2">
                                        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                                            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                                            <span>Strengths</span>
                                        </div>
                                        <ul className="space-y-1.5 text-xs text-zinc-700 dark:text-zinc-300">
                                            {auditResult.strengths?.map((s, i) => (
                                                <li key={i} className="flex items-start gap-1.5 leading-snug">
                                                    <span className="text-emerald-500 font-bold">•</span>
                                                    <span>{s}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Weak Verbs to Fix */}
                                    <div className="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-500/20 space-y-2">
                                        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-400">
                                            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                                            <span>Weak verbs</span>
                                        </div>
                                        <ul className="space-y-1.5 text-xs text-zinc-700 dark:text-zinc-300">
                                            {auditResult.weakVerbs?.map((v, i) => (
                                                <li key={i} className="flex items-start gap-1.5 leading-snug">
                                                    <span className="text-amber-500 font-bold">•</span>
                                                    <span>{v}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Missing Metrics */}
                                    <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 space-y-2">
                                        <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-800 dark:text-zinc-200">
                                            <Hash className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                                            <span>Missing metrics</span>
                                        </div>
                                        <ul className="space-y-1.5 text-xs text-zinc-600 dark:text-zinc-300">
                                            {auditResult.missingMetrics?.map((m, i) => (
                                                <li key={i} className="flex items-start gap-1.5 leading-snug">
                                                    <span className="text-indigo-400 font-bold">•</span>
                                                    <span>{m}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Quick Wins */}
                                    <div className="p-4 rounded-xl bg-[#9FE870]/10 border border-[#9FE870]/30 space-y-2">
                                        <div className="flex items-center gap-1.5 text-xs font-bold text-[#163300] dark:text-[#9FE870]">
                                            <Zap className="w-4 h-4 flex-shrink-0" />
                                            <span>Quick wins</span>
                                        </div>
                                        <ul className="space-y-1.5 text-xs text-zinc-700 dark:text-zinc-300">
                                            {auditResult.quickWins?.map((w, i) => (
                                                <li key={i} className="flex items-start gap-1.5 leading-snug">
                                                    <span className="text-[#163300] dark:text-[#9FE870] font-bold">✓</span>
                                                    <span>{w}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="min-h-[340px] p-8 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 flex flex-col items-center justify-center text-center space-y-2">
                                <div className="p-3 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400">
                                    <FileCheck className="w-6 h-6 text-[#163300] dark:text-[#9FE870]" />
                                </div>
                                <p className="text-xs sm:text-sm font-medium text-zinc-500 dark:text-zinc-400">
                                    Upload a PDF to run an audit
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* ── Section 2: Bullet Enhancer ── */}
            <section className="space-y-6 pt-4 border-t border-zinc-200 dark:border-zinc-800" aria-labelledby="enhancer-heading">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
                    <div className="flex items-center gap-2">
                        <PenLine className="w-4 h-4 text-[#163300] dark:text-[#9FE870]" />
                        <h2 id="enhancer-heading" className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                            Bullet enhancer
                        </h2>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Left: Input Form */}
                    <form onSubmit={handleEnhanceBullet} className="lg:col-span-5 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs space-y-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                                Resume bullet *
                            </label>
                            <textarea
                                rows={4}
                                required
                                value={bulletInput}
                                onChange={(e) => setBulletInput(e.target.value)}
                                placeholder="e.g. Worked on the payment checkout page in React and helped fix user conversion issues."
                                className="w-full text-xs p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-[#9FE870] resize-none leading-relaxed"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                                Target role (optional)
                            </label>
                            <input
                                type="text"
                                value={targetRole}
                                onChange={(e) => setTargetRole(e.target.value)}
                                placeholder="e.g. Senior Full-Stack Engineer / Product Lead"
                                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-[#9FE870]"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={enhanceLoading || !bulletInput.trim()}
                            className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-full bg-[#163300] text-[#9FE870] hover:bg-[#204a00] dark:bg-[#9FE870] dark:text-[#163300] dark:hover:bg-[#8dd461] disabled:opacity-50 font-bold text-xs sm:text-sm transition-all shadow-xs cursor-pointer"
                        >
                            {enhanceLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Writing rewrites...</span>
                                </>
                            ) : (
                                <>
                                    <Zap className="w-4 h-4" />
                                    <span>Enhance Bullet Point</span>
                                </>
                            )}
                        </button>
                    </form>

                    {/* Right: 3 Rewrite Cards */}
                    <div className="lg:col-span-7 space-y-3">
                        {enhanceLoading ? (
                            <div className="min-h-[260px] p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs flex flex-col items-center justify-center text-center space-y-3">
                                <Loader2 className="w-8 h-8 text-[#163300] dark:text-[#9FE870] animate-spin" />
                                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                                    Rewriting bullet...
                                </p>
                            </div>
                        ) : rewrites.length > 0 ? (
                            rewrites.map((rewrite, idx) => {
                                const angleLabels = [
                                    { title: 'Metrics', badge: 'High impact' },
                                    { title: 'Architecture', badge: 'Technical depth' },
                                    { title: 'Problem solving', badge: 'Execution' }
                                ];
                                const info = angleLabels[idx] || { title: `Rewrite Variation ${idx + 1}`, badge: 'Quantified' };
                                const isCopied = copiedIndex === idx;

                                return (
                                    <div
                                        key={idx}
                                        className="p-4 sm:p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs space-y-3 hover:border-[#9FE870]/60 transition-colors"
                                    >
                                        <div className="flex items-center justify-between text-xs">
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono text-[10px] uppercase font-bold text-zinc-400">
                                                    Option {idx + 1}
                                                </span>
                                                <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                                                    {info.title}
                                                </span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleCopyRewrite(rewrite, idx)}
                                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#9FE870] hover:bg-[#8dd461] text-[#163300] text-xs font-bold transition-all shadow-xs cursor-pointer"
                                            >
                                                {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                                <span>{isCopied ? 'Copied' : 'Copy'}</span>
                                            </button>
                                        </div>

                                        <p className="text-xs sm:text-sm text-zinc-800 dark:text-zinc-100 font-sans leading-relaxed pl-2 border-l-2 border-[#9FE870]">
                                            {rewrite}
                                        </p>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="min-h-[240px] p-6 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 flex flex-col items-center justify-center text-center space-y-2">
                                <div className="p-3 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400">
                                    <PenLine className="w-6 h-6 text-[#163300] dark:text-[#9FE870]" />
                                </div>
                                <p className="text-xs sm:text-sm font-medium text-zinc-500 dark:text-zinc-400">
                                    Paste a bullet to generate rewrites
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default ResumeLab;
