import React, { useState, useEffect } from 'react';
import { 
    Sparkles, 
    KeyRound, 
    Zap, 
    HardDrive, 
    CheckCircle2, 
    AlertCircle, 
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
    ShieldCheck,
    Lock,
    Key
} from 'lucide-react';
import { useAuth } from '../../auth/hooks/useAuth';
import { useTheme } from '../../theme/theme.context';
import { useToast } from '../../../components/Toast';
import { getStoredByokConfig, saveByokConfig } from '../services/interview.api';
import { updatePassword } from '../../auth/services/auth.api';

const PROVIDER_OPTIONS = [
    { id: 'default', label: 'System Default (Gemini)' },
    { id: 'openai', label: 'OpenAI (GPT-3.5/4o)' },
    { id: 'gemini', label: 'Google Gemini (Custom Key)' },
    { id: 'groq', label: 'Groq Cloud' },
    { id: 'ollama', label: 'Ollama (Local AI)' }
];

const OPENAI_MODELS = [
    { id: 'gpt-4o-mini', name: 'GPT-4o Mini (Fast & Recommended)' },
    { id: 'gpt-4o', name: 'GPT-4o (Flagship Multimodal)' },
    { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo (Legacy)' }
];

const GEMINI_MODELS = [
    { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash (Recommended)' },
    { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro (Deep Reasoning)' },
    { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash (Legacy)' }
];

const GROQ_MODELS = [
    { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B Versatile (Recommended)' },
    { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B Instant (Fast)' },
    { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B 32k' }
];

const Settings = () => {
    const { user } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const { addToast } = useToast();

    // AI Provider Configuration State
    const [selectedProvider, setSelectedProvider] = useState('default');
    const [apiKey, setApiKey] = useState('');
    const [selectedModel, setSelectedModel] = useState('');
    const [ollamaEndpoint, setOllamaEndpoint] = useState('http://localhost:11434');
    const [showKey, setShowKey] = useState(false);
    const [testingOllama, setTestingOllama] = useState(false);

    // Change Password State
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrentPass, setShowCurrentPass] = useState(false);
    const [showNewPass, setShowNewPass] = useState(false);
    const [showConfirmPass, setShowConfirmPass] = useState(false);
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

    // Free Scans Simulation Counter
    const usedScans = 3;
    const totalScans = 10;
    const scansPercentage = Math.round((usedScans / totalScans) * 100);
    const circleRadius = 38;
    const circumference = 2 * Math.PI * circleRadius;
    const strokeDashoffset = circumference - (circumference * scansPercentage) / 100;

    // Load initial settings on mount
    useEffect(() => {
        const stored = getStoredByokConfig();
        setSelectedProvider(stored.provider || 'default');
        setApiKey(stored.apiKey || '');
        setSelectedModel(stored.model || '');
        setOllamaEndpoint(stored.endpoint || 'http://localhost:11434');
    }, []);

    const handleProviderChange = (e) => {
        const prov = e.target.value;
        setSelectedProvider(prov);
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

    const handleSaveAiConfig = () => {
        if (['openai', 'gemini', 'groq'].includes(selectedProvider) && !apiKey.trim()) {
            addToast(`Please provide a valid API key for ${selectedProvider.toUpperCase()}.`, "warning");
            return;
        }

        const configToSave = {
            provider: selectedProvider,
            apiKey: apiKey.trim(),
            model: selectedModel,
            endpoint: ollamaEndpoint.trim() || 'http://localhost:11434'
        };

        saveByokConfig(configToSave);
        addToast(`AI Engine settings saved! Active Provider: ${selectedProvider.toUpperCase()}`, "success");
    };

    const handleResetAiConfig = () => {
        const resetConfig = {
            provider: 'default',
            apiKey: '',
            model: '',
            endpoint: 'http://localhost:11434'
        };
        saveByokConfig(resetConfig);
        setSelectedProvider('default');
        setApiKey('');
        setSelectedModel('');
        setOllamaEndpoint('http://localhost:11434');
        addToast("Reset to system default AI provider.", "info");
    };

    const handleTestOllama = async () => {
        setTestingOllama(true);
        try {
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

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        if (!currentPassword || !newPassword || !confirmPassword) {
            addToast("Please fill in all password fields.", "warning");
            return;
        }

        if (newPassword !== confirmPassword) {
            addToast("New password and confirmation password do not match.", "warning");
            return;
        }

        if (newPassword.length < 6) {
            addToast("New password must be at least 6 characters long.", "warning");
            return;
        }

        setIsUpdatingPassword(true);
        try {
            await updatePassword({
                currentPassword,
                newPassword
            });
            addToast("Password changed successfully!", "success");
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

    return (
        <div className="min-h-screen flex flex-col w-full overflow-y-scroll space-y-8 max-w-4xl animate-in fade-in duration-300 pb-16">
            {/* Header */}
            <div className="pb-6 border-b border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                        Settings & Preferences
                    </h1>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                        BYOK & Local AI
                    </span>
                </div>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                    Manage your AI inference provider, API credentials, local models, interface appearance, and account security.
                </p>
            </div>

            {/* Section 1: AI Provider Selection & BYOK Config Card (Rigid min-h constraint) */}
            <div className="min-h-[420px] p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs flex flex-col justify-between space-y-6">
                <div className="space-y-6">
                    <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
                        <div className="flex items-center gap-2.5">
                            <Cpu className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                                AI Provider Selection
                            </h2>
                        </div>
                        <span className="text-xs text-zinc-400 dark:text-zinc-500 font-mono">
                            Client-Side BYOK Encrypted
                        </span>
                    </div>

                    {/* Dropdown Selector */}
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block">
                            Choose AI Engine
                        </label>
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
                            {selectedProvider === 'default' && 'Hosted Google Gemini credentials managed by the server.'}
                            {selectedProvider === 'openai' && 'Direct client-side generation using your personal OpenAI API Key.'}
                            {selectedProvider === 'gemini' && 'Direct requests using your Google AI Studio Gemini API Key.'}
                            {selectedProvider === 'groq' && 'Ultra-low latency inference via Groq LPUs.'}
                            {selectedProvider === 'ollama' && '100% private, on-device generation running locally on your hardware.'}
                        </p>
                    </div>

                    {/* Conditional Rendering Below Dropdown */}
                    {/* a) System Default: Circular Progress Indicator */}
                    {selectedProvider === 'default' && (
                        <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950/40 flex flex-col sm:flex-row items-center gap-6">
                            {/* Circular Meter */}
                            <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
                                <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 96 96">
                                    <circle
                                        cx="48"
                                        cy="48"
                                        r={circleRadius}
                                        stroke="currentColor"
                                        strokeWidth="8"
                                        className="text-zinc-200 dark:text-zinc-800"
                                        fill="transparent"
                                    />
                                    <circle
                                        cx="48"
                                        cy="48"
                                        r={circleRadius}
                                        stroke="currentColor"
                                        strokeWidth="8"
                                        strokeDasharray={circumference}
                                        strokeDashoffset={strokeDashoffset}
                                        strokeLinecap="round"
                                        className="text-indigo-600 dark:text-indigo-500 transition-all duration-700 ease-out"
                                        fill="transparent"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                                    <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 font-mono">
                                        {usedScans}/{totalScans}
                                    </span>
                                    <span className="text-[9px] uppercase tracking-wider text-zinc-400 font-semibold">
                                        Used
                                    </span>
                                </div>
                            </div>

                            {/* Details text */}
                            <div className="space-y-1.5 text-center sm:text-left">
                                <div className="flex items-center justify-center sm:justify-start gap-2">
                                    <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                                        Free Tier Monthly Allowance
                                    </span>
                                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                                        Active
                                    </span>
                                </div>
                                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                    You have utilized <strong className="font-semibold text-zinc-900 dark:text-zinc-200">{usedScans} of {totalScans} free scans</strong> for this billing cycle. To lift scan limits or customize reasoning models, switch to your own OpenAI, Gemini, or Groq API key above.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* b) OpenAI BYOK Input */}
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
                                    <button
                                        type="button"
                                        onClick={() => setShowKey(!showKey)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                                    >
                                        {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                <div className="flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400 pt-1">
                                    <span>Direct client-side requests to <code>https://api.openai.com/v1/chat/completions</code>.</span>
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

                    {/* c) Google Gemini BYOK Input */}
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
                                    <span>Stored locally in browser and attached via request headers.</span>
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

                    {/* d) Groq Cloud BYOK Input */}
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
                                    <span>Sub-second response speed powered by Groq LPUs.</span>
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

                    {/* e) Ollama Local Inputs */}
                    {selectedProvider === 'ollama' && (
                        <div className="space-y-4 animate-in fade-in duration-200">
                            <div className="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20 text-xs text-emerald-800 dark:text-emerald-300 space-y-1">
                                <div className="flex items-center gap-1.5 font-semibold">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                    <span>100% Local On-Device Inference</span>
                                </div>
                                <p className="text-[11px] text-emerald-700 dark:text-emerald-400 leading-relaxed">
                                    When Ollama is selected, the application communicates directly with your machine at <code>http://localhost:11434/api/generate</code>.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block">
                                        Local Endpoint URL
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
                                        Model Name
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

                            <div className="flex items-center justify-between pt-1">
                                <button
                                    type="button"
                                    onClick={handleTestOllama}
                                    disabled={testingOllama}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-xs font-medium text-zinc-800 dark:text-zinc-200 transition-colors cursor-pointer disabled:opacity-50"
                                >
                                    <Server className="w-3.5 h-3.5" />
                                    <span>{testingOllama ? "Testing Connection..." : "Test Local Endpoint"}</span>
                                </button>
                                <span className="text-[11px] text-zinc-400 font-mono">
                                    Run 'ollama serve' in background
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Save & Reset Actions Toolbar */}
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
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900 shadow-sm transition-all cursor-pointer"
                    >
                        <Save className="w-3.5 h-3.5" />
                        <span>Save Configuration</span>
                    </button>
                </div>
            </div>

            {/* Section 2: Appearance Section (Rigid min-h constraint) */}
            <div className="min-h-[140px] p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs flex flex-col justify-between space-y-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                        {theme === 'dark' ? <Moon className="w-4 h-4 text-indigo-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
                        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Interface Appearance</h2>
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        Choose between Vercel-inspired clean Light mode and Anthropic-inspired Dark mode.
                    </p>
                </div>
                <div>
                    <button
                        onClick={toggleTheme}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800 text-xs font-medium text-zinc-800 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
                    >
                        {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-zinc-600" />}
                        <span>Current: {theme === 'dark' ? 'Dark Theme' : 'Light Theme'} (Click to toggle)</span>
                    </button>
                </div>
            </div>

            {/* Section 3: Account Information & Change Password (Rigid min-h constraint) */}
            <div className="min-h-[440px] p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
                    <div className="flex items-center gap-2.5">
                        <User className="w-4 h-4 text-indigo-500" />
                        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Account Information</h2>
                    </div>
                    <span className="text-xs text-zinc-400 dark:text-zinc-500 font-mono">
                        Active Profile
                    </span>
                </div>

                {/* Profile Overview */}
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

                {/* Change Password Form */}
                <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-4">
                    <div className="flex items-center gap-2">
                        <Lock className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
                        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                            Change Password
                        </h3>
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        Ensure your account stays secure by using a strong password of at least 6 characters.
                    </p>

                    <form onSubmit={handlePasswordUpdate} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {/* Current Password */}
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

                            {/* New Password */}
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

                            {/* Confirm New Password */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block">
                                    Confirm New Password
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

                        <div className="pt-2 flex justify-end">
                            <button
                                type="submit"
                                disabled={isUpdatingPassword}
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                            >
                                <Key className="w-3.5 h-3.5" />
                                <span>{isUpdatingPassword ? "Updating..." : "Update Password"}</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Settings;
