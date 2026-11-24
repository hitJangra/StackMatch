// react hooks
import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
// icons
import { 
    KeyRound, 
    CheckCircle2, 
    Eye, 
    EyeOff, 
    ExternalLink, 
    Save, 
    RotateCcw, 
    Cpu, 
    User, 
    Moon, 
    Sun,
    Server,
    Lock,
    Key,
    LogOut,
    Monitor,
    Trash2,
    X,
    AlertTriangle
} from 'lucide-react';
// auth hook
import { useAuth } from '../../auth/hooks/useAuth';
// theme hook
import { useTheme } from '../../theme/theme.context';
// toast alerts hook
import { useToast } from '../../../components/Toast';
// byok storage helpers
import { getStoredByokConfig, saveByokConfig } from '../services/interview.api';
// password update api
import { updatePassword } from '../../auth/services/auth.api';

// provider choices
const PROVIDER_OPTIONS = [
    { id: 'default', label: 'System default (Gemini)' },
    { id: 'openai', label: 'OpenAI' },
    { id: 'gemini', label: 'Google Gemini' },
    { id: 'groq', label: 'Groq Cloud' },
    { id: 'ollama', label: 'Ollama (local)' }
];

// openai model choices
const OPENAI_MODELS = [
    { id: 'gpt-4o-mini', name: 'GPT-4o mini' },
    { id: 'gpt-4o', name: 'GPT-4o' },
    { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' }
];

// gemini model choices
const GEMINI_MODELS = [
    { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash' },
    { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro' },
    { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash' }
];

// groq model choices — current Llama-3 lineup (Mixtral removed: deprecated on Groq)
const GROQ_MODELS = [
    { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B' },
    { id: 'llama-3.1-70b-versatile', name: 'Llama 3.1 70B' },
    { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B' }
];

// settings view for api keys, theme, and password
const Settings = () => {
    // authenticated user
    const { user, handleLogout, handleDeleteAccount } = useAuth();
    // theme switcher
    const { theme, setTheme } = useTheme();
    // toast notifications
    const { addToast } = useToast();

    // byok provider state
    const [selectedProvider, setSelectedProvider] = useState('default');
    const [apiKey, setApiKey] = useState('');
    const [selectedModel, setSelectedModel] = useState('');
    const [ollamaEndpoint, setOllamaEndpoint] = useState('http://localhost:11434');
    const [showKey, setShowKey] = useState(false);
    const [testingOllama, setTestingOllama] = useState(false);

    // change password form state
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrentPass, setShowCurrentPass] = useState(false);
    const [showNewPass, setShowNewPass] = useState(false);
    const [showConfirmPass, setShowConfirmPass] = useState(false);
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [deleteConfirmation, setDeleteConfirmation] = useState('');
    const [deletingAccount, setDeletingAccount] = useState(false);

    // load saved settings from storage
    useEffect(() => {
        const stored = getStoredByokConfig();
        setSelectedProvider(stored.provider || 'default');
        setApiKey(stored.apiKey || '');
        setSelectedModel(stored.model || '');
        setOllamaEndpoint(stored.endpoint || 'http://localhost:11434');
    }, []);

    useEffect(() => {
        if (!deleteModalOpen) return;
        const handleEscape = (event) => {
            if (event.key === 'Escape') setDeleteModalOpen(false);
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [deleteModalOpen]);

    // handle provider dropdown change
    const handleProviderChange = (e) => {
        const prov = e.target.value;
        setSelectedProvider(prov);
        // set default recommended model for selected provider
        if (prov === 'openai') {
            setSelectedModel('gpt-4o-mini');
        } else if (prov === 'gemini') {
            setSelectedModel('gemini-2.5-flash');
        } else if (prov === 'groq') {
            setSelectedModel('llama-3.3-70b-versatile');
        } else if (prov === 'ollama') {
            setSelectedModel('llama3');
        } else {
            setSelectedModel('');
        }
    };

    // save ai engine configuration
    const handleSaveAiConfig = () => {
        // require api key for cloud providers
        if (['openai', 'gemini', 'groq'].includes(selectedProvider) && !apiKey.trim()) {
            addToast(`Enter an API key for ${selectedProvider.toUpperCase()}.`, "warning");
            return;
        }

        // construct settings payload
        const configToSave = {
            provider: selectedProvider,
            apiKey: apiKey.trim(),
            model: selectedModel,
            endpoint: ollamaEndpoint.trim() || 'http://localhost:11434'
        };

        // persist in localstorage
        saveByokConfig(configToSave);
        addToast("AI settings saved.", "success");
    };

    // reset ai settings back to system default
    const handleResetAiConfig = () => {
        const resetConfig = {
            provider: 'default',
            apiKey: '',
            model: '',
            endpoint: 'http://localhost:11434'
        };
        // write defaults
        saveByokConfig(resetConfig);
        setSelectedProvider('default');
        setApiKey('');
        setSelectedModel('');
        setOllamaEndpoint('http://localhost:11434');
        addToast("Reset to system default.", "info");
    };

    // test local ollama connection
    const handleTestOllama = async () => {
        setTestingOllama(true);
        try {
            // ping ollama tags endpoint
            const cleanUrl = (ollamaEndpoint.trim() || 'http://localhost:11434').replace(/\/$/, '');
            const res = await fetch(`${cleanUrl}/api/tags`);
            if (res.ok) {
                const data = await res.json();
                const modelNames = data.models?.map(m => m.name).join(', ') || 'No local models found';
                addToast(`Connected to Ollama! Available models: ${modelNames}`, "success");
            } else {
                addToast(`Ollama responded with status: ${res.status}`, "warning");
            }
        } catch {
            addToast(`Could not reach Ollama at ${ollamaEndpoint}. Ensure 'ollama serve' is running.`, "error");
        } finally {
            setTestingOllama(false);
        }
    };

    // submit password change
    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        // validate required inputs
        if (!currentPassword || !newPassword || !confirmPassword) {
            addToast("Please fill in all password fields.", "warning");
            return;
        }

        // check password confirmation
        if (newPassword !== confirmPassword) {
            addToast("Passwords do not match.", "warning");
            return;
        }

        // check length
        if (newPassword.length < 6) {
            addToast("Password must be at least 6 characters.", "warning");
            return;
        }

        setIsUpdatingPassword(true);
        try {
            // call backend update password endpoint
            await updatePassword({
                currentPassword,
                newPassword
            });
            addToast("Password updated.", "success");
            // clear form
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            const msg = err.response?.data?.message || "Failed to update password. Please check your credentials.";
            addToast(msg, "error");
        } finally {
            setIsUpdatingPassword(false);
        }
    };

    const handleConfirmDelete = async () => {
        if (deleteConfirmation !== 'DELETE') return;
        setDeletingAccount(true);
        const result = await handleDeleteAccount();
        setDeletingAccount(false);
        if (!result?.success) {
            addToast(result?.message || "Could not delete account.", "error");
        }
    };

    return (
        // settings page container
        <div className="min-h-screen flex flex-col w-full overflow-y-scroll space-y-8 max-w-4xl animate-in fade-in duration-300 pb-16">
            {/* page header */}
            <div className="wise-page-header">
                <div className="flex items-center gap-2">
                    <h1 className="text-xl font-semibold tracking-tight">
                        Settings
                    </h1>
                </div>
            </div>

            {/* ai engine provider configuration card */}
            <div className="min-h-[420px] p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs flex flex-col justify-between space-y-6">
                <div className="space-y-6">
                    <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
                        <div className="flex items-center gap-2.5">
                            <Cpu className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                                AI provider
                            </h2>
                        </div>
                        <span className="text-xs text-zinc-400 dark:text-zinc-500">
                            Stored locally
                        </span>
                    </div>

                    {/* provider selector dropdown */}
                    <div className="space-y-2">
                        <select
                            value={selectedProvider}
                            onChange={handleProviderChange}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm font-medium text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-all shadow-xs cursor-pointer"
                        >
                            {PROVIDER_OPTIONS.map((opt) => (
                                <option key={opt.id} value={opt.id} className="dark:bg-zinc-900 py-1">
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                            {selectedProvider === 'default' && 'Uses the default Gemini key.'}
                            {selectedProvider === 'openai' && 'Uses your OpenAI key.'}
                            {selectedProvider === 'gemini' && 'Uses your Google AI Studio key.'}
                            {selectedProvider === 'groq' && 'Uses your Groq key.'}
                            {selectedProvider === 'ollama' && 'Runs on your machine.'}
                        </p>
                    </div>

                    {/* openai api key input */}
                    {selectedProvider === 'openai' && (
                        <div className="space-y-4 animate-in fade-in duration-200">
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block">
                                    OpenAI API Key
                                </label>
                                <div className="relative">
                                    <input
                                        type={showKey ? "text" : "password"}
                                        value={apiKey}
                                        onChange={(e) => setApiKey(e.target.value)}
                                        placeholder="sk-proj-..."
                                        className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40 text-xs font-mono text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-all shadow-xs"
                                    />
                                    {/* toggle key visibility */}
                                    <button
                                        type="button"
                                        onClick={() => setShowKey(!showKey)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                                    >
                                        {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                <div className="flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400 pt-1">
                                    <span>Requests go directly to OpenAI.</span>
                                    <a 
                                        href="https://platform.openai.com/api-keys" 
                                        target="_blank" 
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline"
                                    >
                                        <span>Get OpenAI Key</span>
                                        <ExternalLink className="w-3 h-3" />
                                    </a>
                                </div>
                            </div>

                            {/* model dropdown */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block">
                                    OpenAI Model
                                </label>
                                <select
                                    value={selectedModel || 'gpt-4o-mini'}
                                    onChange={(e) => setSelectedModel(e.target.value)}
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-all shadow-xs cursor-pointer"
                                >
                                    {OPENAI_MODELS.map((m) => (
                                        <option key={m.id} value={m.id} className="dark:bg-zinc-900">
                                            {m.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}

                    {/* gemini api key input */}
                    {selectedProvider === 'gemini' && (
                        <div className="space-y-4 animate-in fade-in duration-200">
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block">
                                    Google Gemini API Key
                                </label>
                                <div className="relative">
                                    <input
                                        type={showKey ? "text" : "password"}
                                        value={apiKey}
                                        onChange={(e) => setApiKey(e.target.value)}
                                        placeholder="AIzaSy..."
                                        className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40 text-xs font-mono text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-all shadow-xs"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowKey(!showKey)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                                    >
                                        {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                <div className="flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400 pt-1">
                                    <span>Stored in your browser.</span>
                                    <a 
                                        href="https://aistudio.google.com/app/apikey" 
                                        target="_blank" 
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline"
                                    >
                                        <span>Get Gemini Key</span>
                                        <ExternalLink className="w-3 h-3" />
                                    </a>
                                </div>
                            </div>

                            {/* gemini model dropdown */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block">
                                    Gemini Model
                                </label>
                                <select
                                    value={selectedModel || 'gemini-2.5-flash'}
                                    onChange={(e) => setSelectedModel(e.target.value)}
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-all shadow-xs cursor-pointer"
                                >
                                    {GEMINI_MODELS.map((m) => (
                                        <option key={m.id} value={m.id} className="dark:bg-zinc-900">
                                            {m.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}

                    {/* groq api key input */}
                    {selectedProvider === 'groq' && (
                        <div className="space-y-4 animate-in fade-in duration-200">
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block">
                                    Groq Cloud API Key
                                </label>
                                <div className="relative">
                                    <input
                                        type={showKey ? "text" : "password"}
                                        value={apiKey}
                                        onChange={(e) => setApiKey(e.target.value)}
                                        placeholder="gsk_..."
                                        className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40 text-xs font-mono text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-all shadow-xs"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowKey(!showKey)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                                    >
                                        {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                <div className="flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400 pt-1">
                                    <span>Stored in your browser.</span>
                                    <a 
                                        href="https://console.groq.com/keys" 
                                        target="_blank" 
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline"
                                    >
                                        <span>Get Groq Key</span>
                                        <ExternalLink className="w-3 h-3" />
                                    </a>
                                </div>
                            </div>

                            {/* groq model dropdown */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block">
                                    Groq Model
                                </label>
                                <select
                                    value={selectedModel || 'llama-3.3-70b-versatile'}
                                    onChange={(e) => setSelectedModel(e.target.value)}
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-all shadow-xs cursor-pointer"
                                >
                                    {GROQ_MODELS.map((m) => (
                                        <option key={m.id} value={m.id} className="dark:bg-zinc-900">
                                            {m.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}

                    {/* ollama local host and model input */}
                    {selectedProvider === 'ollama' && (
                        <div className="space-y-4 animate-in fade-in duration-200">
                            {/* info badge */}
                            <div className="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20 text-xs text-emerald-800 dark:text-emerald-300 space-y-1">
                                <div className="flex items-center gap-1.5 font-semibold">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                    <span>Runs locally</span>
                                </div>
                                <p className="text-[11px] text-emerald-700 dark:text-emerald-400 leading-relaxed">
                                    Talks to Ollama at <code>http://localhost:11434</code>.
                                </p>
                            </div>

                            {/* host and model inputs */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block">
                                        Endpoint
                                    </label>
                                    <input
                                        type="text"
                                        value={ollamaEndpoint}
                                        onChange={(e) => setOllamaEndpoint(e.target.value)}
                                        placeholder="http://localhost:11434"
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40 text-xs font-mono text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-all shadow-xs"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block">
                                        Model
                                    </label>
                                    <input
                                        type="text"
                                        value={selectedModel || 'llama3'}
                                        onChange={(e) => setSelectedModel(e.target.value)}
                                        placeholder="llama3, mistral, deepseek-r1..."
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40 text-xs font-mono text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-all shadow-xs"
                                    />
                                </div>
                            </div>

                            {/* test connection button */}
                            <div className="flex items-center justify-between pt-1">
                                <button
                                    type="button"
                                    onClick={handleTestOllama}
                                    disabled={testingOllama}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-xs font-medium text-zinc-800 dark:text-zinc-200 transition-colors cursor-pointer disabled:opacity-50"
                                >
                                    <Server className="w-3.5 h-3.5" />
                                    <span>{testingOllama ? "Testing..." : "Test connection"}</span>
                                </button>
                                <span className="text-[11px] text-zinc-400 font-mono">
                                    Run ollama serve first
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* save / reset buttons */}
                <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                    <button
                        type="button"
                        onClick={handleResetAiConfig}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                    >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reset to Default</span>
                    </button>

                    <button
                        type="button"
                        onClick={handleSaveAiConfig}
                        className="wise-primary-pill"
                    >
                        <Save className="w-3.5 h-3.5" />
                        <span>Save</span>
                    </button>
                </div>
            </div>

            <div className="appearance-card p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
                <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Appearance</h2>
                <div className="theme-segmented" role="radiogroup" aria-label="Theme">
                    {[
                        { id: 'system', label: 'System', icon: Monitor },
                        { id: 'light', label: 'Light', icon: Sun },
                        { id: 'dark', label: 'Dark', icon: Moon }
                    ].map((option) => {
                        const Icon = option.icon;
                        const active = theme === option.id;
                        return (
                            <button
                                key={option.id}
                                type="button"
                                role="radio"
                                aria-checked={active}
                                className={active ? 'theme-segmented-active' : ''}
                                onClick={() => setTheme(option.id)}
                            >
                                <Icon size={15} />
                                <span>{option.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* profile information & change password */}
            <div className="min-h-[440px] p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
                    <div className="flex items-center gap-2.5">
                        <User className="w-4 h-4 text-indigo-500" />
                        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Profile</h2>
                    </div>
                </div>

                {/* read-only profile overview */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 block mb-1">Username</label>
                        <div className="px-3.5 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 text-xs font-mono text-zinc-800 dark:text-zinc-200">
                            {user?.username || 'user'}
                        </div>
                    </div>
                    <div>
                        <label className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 block mb-1">Email</label>
                        <div className="px-3.5 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 text-xs font-mono text-zinc-800 dark:text-zinc-200">
                            {user?.email || 'user@example.com'}
                        </div>
                    </div>
                </div>

                {/* change password form */}
                <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-4">
                    <div className="flex items-center gap-2">
                        <Lock className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
                        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                            Change password
                        </h3>
                    </div>

                    <form onSubmit={handlePasswordUpdate} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {/* current password */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block">
                                    Current Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showCurrentPass ? "text" : "password"}
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full pl-3 pr-8 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40 text-xs font-mono text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-all shadow-xs"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowCurrentPass(!showCurrentPass)}
                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                                    >
                                        {showCurrentPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                    </button>
                                </div>
                            </div>

                            {/* new password */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block">
                                    New Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showNewPass ? "text" : "password"}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Min. 6 characters"
                                        className="w-full pl-3 pr-8 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40 text-xs font-mono text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-all shadow-xs"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPass(!showNewPass)}
                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                                    >
                                        {showNewPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                    </button>
                                </div>
                            </div>

                            {/* confirm password */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block">
                                    Confirm password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showConfirmPass ? "text" : "password"}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Repeat new password"
                                        className="w-full pl-3 pr-8 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40 text-xs font-mono text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-all shadow-xs"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPass(!showConfirmPass)}
                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                                    >
                                        {showConfirmPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* submit password button */}
                        <div className="pt-2 flex justify-end">
                            <button
                                type="submit"
                                disabled={isUpdatingPassword}
                                className="wise-primary-pill disabled:opacity-50"
                            >
                                <Key className="w-3.5 h-3.5" />
                                <span>{isUpdatingPassword ? "Updating..." : "Update password"}</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <div className="p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-between gap-4">
                <div>
                    <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Account</h2>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">{user?.email || 'Signed in'}</p>
                </div>
                <button
                    type="button"
                    onClick={async () => {
                        await handleLogout();
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-zinc-200 dark:border-zinc-700 text-sm font-semibold text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                    <LogOut size={16} />
                    Log out
                </button>
            </div>

            <div className="danger-zone-card p-6 rounded-2xl border border-red-500/25 bg-white dark:bg-zinc-900 flex items-center justify-between gap-4">
                <div>
                    <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Danger zone</h2>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                        Permanently delete your account and saved data.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => {
                        setDeleteConfirmation('');
                        setDeleteModalOpen(true);
                    }}
                    className="delete-account-button"
                >
                    <Trash2 size={16} />
                    Delete Account
                </button>
            </div>

            <AnimatePresence>
                {deleteModalOpen && (
                    <motion.div
                        className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onMouseDown={(event) => {
                            if (event.target === event.currentTarget) setDeleteModalOpen(false);
                        }}
                    >
                        <motion.div
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="delete-account-title"
                            className="w-full max-w-md rounded-3xl border border-red-500/30 bg-white dark:bg-zinc-900 p-6 space-y-5"
                            initial={{ opacity: 0, scale: 0.96, y: 8 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.96, y: 8 }}
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-full bg-red-500/10 text-red-600 flex items-center justify-center flex-shrink-0">
                                        <AlertTriangle size={18} />
                                    </div>
                                    <div>
                                        <h2 id="delete-account-title" className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                                            Delete account
                                        </h2>
                                        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                                            This permanently removes your account, saved jobs, and interview reports.
                                        </p>
                                    </div>
                                </div>
                                <button type="button" className="saved-job-delete" onClick={() => setDeleteModalOpen(false)} aria-label="Close">
                                    <X size={18} />
                                </button>
                            </div>

                            <div>
                                <label htmlFor="delete-confirmation" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                                    Type DELETE to confirm
                                </label>
                                <input
                                    id="delete-confirmation"
                                    value={deleteConfirmation}
                                    onChange={(event) => setDeleteConfirmation(event.target.value)}
                                    className="w-full min-h-11 px-4 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                                    autoComplete="off"
                                />
                            </div>

                            <div className="flex justify-end gap-2">
                                <button type="button" className="wise-secondary-pill" onClick={() => setDeleteModalOpen(false)}>
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="delete-account-confirm"
                                    disabled={deleteConfirmation !== 'DELETE' || deletingAccount}
                                    onClick={handleConfirmDelete}
                                >
                                    {deletingAccount ? 'Deleting...' : 'Delete Account'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// export settings page
export default Settings;
