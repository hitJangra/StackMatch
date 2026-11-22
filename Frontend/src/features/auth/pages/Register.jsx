// react and state hook
import React, { useState } from 'react';
// navigation and router links
import { useNavigate, Link } from 'react-router';
// auth custom hook
import { useAuth } from '../hooks/useAuth';
// theme provider hook
import { useTheme } from '../../theme/theme.context';
// toast notifications hook
import { useToast } from '../../../components/Toast';
// icons
import { 
    Mail, 
    Lock, 
    Eye, 
    EyeOff, 
    ArrowRight, 
    Sun, 
    Moon,
    ArrowLeft
} from 'lucide-react';
import StackMatchLogo from '../../../components/StackMatchLogo';

// registration view component
const Register = () => {
    // router navigation
    const navigate = useNavigate();
    // auth state and register action (do NOT use `loading` for a full-page spinner —
    // that would unmount the form mid-submit; use local `submitting` state instead)
    const { handleRegister } = useAuth();
    // dark/light theme state
    const { theme, toggleTheme } = useTheme();
    // toast triggers
    const { addToast } = useToast();

    // form input states
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [authError, setAuthError] = useState('');

    // form submit handler
    const handleSubmit = async (e) => {
        // prevent page reload
        e.preventDefault();
        setAuthError('');

        // validate all inputs
        if (!email.trim() || !password.trim()) {
            setAuthError("Please fill in all fields.");
            addToast("Please fill in all fields.", "warning");
            return;
        }

        // enforce minimum password length
        if (password.length < 6) {
            setAuthError("Password must be at least 6 characters.");
            addToast("Password must be at least 6 characters.", "warning");
            return;
        }

        // call registration handler
        setSubmitting(true);
        const username = email.trim().split('@')[0] || 'stackmatch-user';
        const result = await handleRegister({ username, email: email.trim(), password });
        setSubmitting(false);

        // handle response
        if (result?.success) {
            addToast("Account created successfully!", "success");
            navigate("/home");
        } else {
            setAuthError(result?.message || "Registration failed.");
            addToast(result?.message || "Registration failed. Please try again.", "error");
        }
    };

    return (
        // registration page container
        <div className="auth-page">

            {/* light / dark mode toggle */}
            <div className="absolute top-6 right-6 z-20">
                <button
                    onClick={toggleTheme}
                    className="p-2.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 shadow-xs hover:bg-white dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-300 transition-colors cursor-pointer"
                    title="Toggle Theme"
                    type="button"
                >
                    {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-zinc-700" />}
                </button>
            </div>

            <Link to="/" className="auth-back"><ArrowLeft size={16} /> Back to StackMatch</Link>

            {/* card container */}
            <div className="relative z-10 w-full max-w-md">
                <div className="auth-card">
                    
                    {/* card branding and title */}
                    <div className="text-center space-y-2">
                        <StackMatchLogo compact />
                        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                            Create an Account
                        </h1>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            Create your StackMatch account
                        </p>
                    </div>

                    {/* signup form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {authError && (
                            <div className="auth-error-banner" role="alert">
                                {authError}
                            </div>
                        )}
                        {/* email address input */}
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
                                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-zinc-200/90 dark:border-zinc-800/90 bg-white dark:bg-zinc-950 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 focus:bg-white dark:focus:bg-zinc-950 transition-colors shadow-xs"
                                    autoComplete="email"
                                />
                            </div>
                        </div>

                        {/* password input */}
                        <div className="space-y-1.5">
                            <label 
                                htmlFor="password" 
                                className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block"
                            >
                                Password
                            </label>
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
                                    placeholder="At least 6 characters"
                                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-zinc-200/90 dark:border-zinc-800/90 bg-white dark:bg-zinc-950 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 focus:bg-white dark:focus:bg-zinc-950 transition-colors shadow-xs"
                                    autoComplete="new-password"
                                />
                                {/* show / hide password toggle */}
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

                        {/* submit registration button */}
                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="wise-primary-pill w-full"
                            >
                                {submitting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                        <span>Creating account</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Create account</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    {/* login link footer */}
                    <div className="pt-2 border-t border-zinc-100/80 dark:border-zinc-800/80 text-center space-y-3">
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            Already have an account?{' '}
                            <Link 
                                to="/login" 
                                className="font-semibold text-zinc-900 dark:text-zinc-100 hover:underline transition-colors"
                            >
                                Sign in
                            </Link>
                        </p>

                    </div>

                </div>
            </div>
        </div>
    );
};

// export register component
export default Register;
