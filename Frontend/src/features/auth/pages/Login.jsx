import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../../theme/theme.context';
import { useToast } from '../../../components/Toast';
import Spinner from '../../../components/Spinner';
import { 
    Mail, 
    Lock, 
    Eye, 
    EyeOff, 
    ArrowRight, 
    Sparkles, 
    Sun, 
    Moon,
    ShieldCheck
} from 'lucide-react';

const Login = () => {
    const { loading, handleLogin } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const { addToast } = useToast();
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email.trim() || !password.trim()) {
            addToast("Please fill in all fields.", "warning");
            return;
        }

        setSubmitting(true);
        const result = await handleLogin({ email, password });
        setSubmitting(false);

        if (result?.success) {
            addToast("Logged in successfully!", "success");
            navigate('/');
        } else {
            addToast(result?.message || "Login failed. Please check your credentials.", "error");
        }
    };

    if (loading) {
        return <Spinner message="Checking session..." />;
    }

    return (
        <div className="relative min-h-screen w-full flex items-center justify-center p-4 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 overflow-hidden select-none">
            {/* Ambient Background Glow Elements for Glassmorphic refraction */}
            <div className="absolute top-1/4 -left-20 w-80 h-80 bg-zinc-300/40 dark:bg-zinc-800/30 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-zinc-400/20 dark:bg-zinc-700/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Top-Right Theme Toggle */}
            <div className="absolute top-6 right-6 z-20">
                <button
                    onClick={toggleTheme}
                    className="p-2.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md shadow-xs hover:bg-white dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-300 transition-all cursor-pointer"
                    title="Toggle Theme"
                    type="button"
                >
                    {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-zinc-700" />}
                </button>
            </div>

            {/* Glassmorphic Container Card */}
            <div className="relative z-10 w-full max-w-md">
                <div className="p-8 sm:p-10 rounded-2xl bg-white/75 dark:bg-zinc-900/65 backdrop-blur-xl border border-white/60 dark:border-zinc-800/80 shadow-2xl shadow-zinc-900/10 dark:shadow-black/60 ring-1 ring-black/5 dark:ring-white/10 space-y-6">
                    
                    {/* Header with App Badge */}
                    <div className="text-center space-y-2">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-md mb-2">
                            <Sparkles className="w-6 h-6" />
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                            Welcome Back
                        </h1>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            Sign in to your AI Resume Screener & Job Recommender account
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Email Input */}
                        <div className="space-y-1.5">
                            <label 
                                htmlFor="email" 
                                className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block"
                            >
                                Email Address
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400 dark:text-zinc-500">
                                    <Mail className="w-4 h-4" />
                                </div>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-zinc-200/90 dark:border-zinc-800/90 bg-white/60 dark:bg-zinc-950/50 backdrop-blur-xs text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 focus:bg-white dark:focus:bg-zinc-950 transition-all shadow-xs"
                                    autoComplete="email"
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <label 
                                    htmlFor="password" 
                                    className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block"
                                >
                                    Password
                                </label>
                            </div>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400 dark:text-zinc-500">
                                    <Lock className="w-4 h-4" />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-zinc-200/90 dark:border-zinc-800/90 bg-white/60 dark:bg-zinc-950/50 backdrop-blur-xs text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 focus:bg-white dark:focus:bg-zinc-950 transition-all shadow-xs"
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                                    tabIndex={-1}
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Submit Button (Deep Black with Vercel styling) */}
                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900 font-medium text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-[0.99]"
                            >
                                {submitting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                        <span>Signing in...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Sign in</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    {/* Footer Links & Status */}
                    <div className="pt-2 border-t border-zinc-100/80 dark:border-zinc-800/80 text-center space-y-3">
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            Don't have an account?{' '}
                            <Link 
                                to="/register" 
                                className="font-semibold text-zinc-900 dark:text-zinc-100 hover:underline transition-colors"
                            >
                                Create an account
                            </Link>
                        </p>

                        <div className="flex items-center justify-center gap-1.5 text-[11px] text-zinc-400 dark:text-zinc-500">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                            <span>Protected by JWT and bcrypt encryption</span>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Login;
