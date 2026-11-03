import React from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router';
import { 
    Home, 
    Briefcase, 
    History, 
    Settings, 
    Sun, 
    Moon, 
    LogOut, 
    Sparkles, 
    Plus, 
    FileText,
    ArrowUpRight,
    User
} from 'lucide-react';
import { useAuth } from '../features/auth/hooks/useAuth';
import { useTheme } from '../features/theme/theme.context';

const navItems = [
    { label: 'Home', path: '/', icon: Home, description: 'Analyze & Match' },
    { label: 'Jobs', path: '/jobs', icon: Briefcase, description: 'AI Recommender' },
    { label: 'History', path: '/history', icon: History, description: 'Past Analyses' },
    { label: 'Settings', path: '/settings', icon: Settings, description: 'Preferences' }
];

const Layout = () => {
    const { user, handleLogout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();

    // Derive active page title
    let pageTitle = 'ResumeAI';
    if (location.pathname === '/') {
        pageTitle = 'Home';
    } else if (location.pathname.startsWith('/interview')) {
        pageTitle = 'Interview Report';
    } else if (location.pathname.startsWith('/history')) {
        pageTitle = 'Scan History';
    } else if (location.pathname.startsWith('/jobs')) {
        pageTitle = 'Job Recommendations';
    } else if (location.pathname.startsWith('/settings')) {
        pageTitle = 'Settings';
    }

    const userInitial = user?.username ? user.username.charAt(0).toUpperCase() : (user?.email ? user.email.charAt(0).toUpperCase() : 'U');

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex antialiased transition-colors duration-200">
            {/* Fixed Left Sidebar */}
            <aside className="fixed top-0 bottom-0 left-0 w-64 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 z-30 flex flex-col justify-between select-none">
                {/* Brand / Top Section */}
                <div className="p-5">
                    <div className="flex items-center justify-between pb-6 border-b border-zinc-200/80 dark:border-zinc-800">
                        <NavLink to="/" className="flex items-center gap-2.5 group">
                            <div className="w-8 h-8 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                                <Sparkles className="w-4 h-4 text-indigo-400 dark:text-indigo-600" />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-semibold text-sm tracking-tight text-zinc-900 dark:text-zinc-100">
                                    ResumeAI
                                </span>
                                <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono tracking-wider uppercase">
                                    Screener Pro
                                </span>
                            </div>
                        </NavLink>
                        <span className="text-[10px] font-medium font-mono px-1.5 py-0.5 rounded border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                            v2.4
                        </span>
                    </div>

                    {/* Quick CTA */}
                    <div className="mt-5 mb-3">
                        <button 
                            onClick={() => navigate('/')}
                            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900 shadow-sm transition-all"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            <span>New Scan</span>
                        </button>
                    </div>

                    {/* Navigation Items */}
                    <nav className="mt-4 space-y-1">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = item.path === '/' 
                                ? location.pathname === '/' 
                                : location.pathname.startsWith(item.path);

                            return (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                                        isActive
                                            ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white font-semibold shadow-xs'
                                            : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100/60 dark:hover:bg-zinc-800/60 hover:text-zinc-900 dark:hover:text-zinc-200'
                                    }`}
                                >
                                    <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-zinc-500 dark:text-zinc-400'}`} />
                                    <span>{item.label}</span>
                                </NavLink>
                            );
                        })}
                    </nav>
                </div>

                {/* Sidebar Footer / User Profile */}
                <div className="p-4 border-t border-zinc-200/80 dark:border-zinc-800 space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5 overflow-hidden">
                            <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center text-xs font-semibold flex-shrink-0">
                                {userInitial}
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="text-xs font-medium text-zinc-900 dark:text-zinc-100 truncate">
                                    {user?.username || 'User Profile'}
                                </span>
                                <span className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                                    {user?.email || 'Logged in'}
                                </span>
                            </div>
                        </div>

                        <button 
                            onClick={handleLogout}
                            title="Log Out"
                            className="p-1.5 rounded-md text-zinc-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area (offset by sidebar width 64 = 16rem = 256px) */}
            <div className="flex-1 ml-64 flex flex-col min-h-screen">
                {/* Minimalist Top Bar */}
                <header className="sticky top-0 z-20 h-14 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 px-8 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs">
                        <span className="text-zinc-400 dark:text-zinc-500">Workspace</span>
                        <span className="text-zinc-300 dark:text-zinc-700">/</span>
                        <span className="font-semibold text-zinc-800 dark:text-zinc-200">{pageTitle}</span>
                    </div>

                    {/* Best-Fit Top-Right Corner Theme Toggle & Actions */}
                    <div className="flex items-center gap-2.5">
                        <button
                            onClick={toggleTheme}
                            aria-label="Toggle Theme"
                            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
                            className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all shadow-xs"
                        >
                            {theme === 'light' ? (
                                <Moon className="w-4 h-4 text-zinc-700" />
                            ) : (
                                <Sun className="w-4 h-4 text-amber-400" />
                            )}
                        </button>
                    </div>
                </header>

                {/* Page Outlet Container */}
                <main className="flex-1 p-8 max-w-7xl w-full mx-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;
