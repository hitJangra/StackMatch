import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router';
import {
    Home,
    Briefcase,
    Bookmark,
    Settings,
    Sun,
    Moon,
    Menu,
    X,
    Plus,
    LogOut,
    ChevronRight,
    PanelLeftClose,
    PanelLeftOpen
} from 'lucide-react';
import { useAuth } from '../features/auth/hooks/useAuth';
import { useTheme } from '../features/theme/theme.context';
import StackMatchLogo from './StackMatchLogo';

const navItems = [
    { label: 'Home', path: '/home', icon: Home },
    { label: 'Jobs', path: '/jobs', icon: Briefcase },
    { label: 'Saved Jobs', path: '/saved-jobs', icon: Bookmark },
    { label: 'Settings', path: '/settings', icon: Settings }
];

const AppLayout = () => {
    const { user, handleLogout } = useAuth();
    const { theme, resolvedTheme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [desktopCollapsed, setDesktopCollapsed] = useState(() => {
        return localStorage.getItem('stackmatch_sidebar_collapsed') === 'true';
    });
    const profileRef = useRef(null);

    const toggleDesktopSidebar = () => {
        setDesktopCollapsed((collapsed) => {
            const next = !collapsed;
            localStorage.setItem('stackmatch_sidebar_collapsed', String(next));
            return next;
        });
    };

    useEffect(() => {
        setDrawerOpen(false);
        setProfileOpen(false);
    }, [location.pathname]);

    useEffect(() => {
        const handlePointerDown = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setProfileOpen(false);
            }
        };
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') setProfileOpen(false);
        };
        document.addEventListener('mousedown', handlePointerDown);
        document.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('mousedown', handlePointerDown);
            document.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    const userInitial = user?.username
        ? user.username.charAt(0).toUpperCase()
        : (user?.email ? user.email.charAt(0).toUpperCase() : 'U');

    const pageTitle = location.pathname.startsWith('/interview')
        ? 'Interview Report'
        : location.pathname.startsWith('/saved-jobs')
            ? 'Saved Jobs'
            : location.pathname.startsWith('/jobs')
                ? 'Job Recommendations'
                : location.pathname.startsWith('/settings')
                    ? 'Settings'
                    : 'Home';

    const sidebar = (
        <aside className="app-sidebar" aria-label="Workspace navigation">
            <div>
                <div className="sidebar-brand">
                    <NavLink to="/home" aria-label="StackMatch home">
                        <StackMatchLogo />
                    </NavLink>
                    <button
                        type="button"
                        className="desktop-sidebar-toggle"
                        onClick={toggleDesktopSidebar}
                        aria-label={desktopCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                        title={desktopCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    >
                        {desktopCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
                    </button>
                    <button type="button" className="drawer-close" onClick={() => setDrawerOpen(false)} aria-label="Close navigation">
                        <X size={20} />
                    </button>
                </div>
                <button
                    type="button"
                    className="btn sidebar-new"
                    onClick={() => navigate('/home')}
                    title={desktopCollapsed ? 'New match' : undefined}
                >
                    <Plus size={16} />
                    <span>New match</span>
                </button>
                <nav className="sidebar-nav">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = item.path === '/home'
                            ? location.pathname === '/home'
                            : location.pathname.startsWith(item.path);
                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={`sidebar-link ${isActive ? 'sidebar-link-active' : ''}`}
                                title={desktopCollapsed ? item.label : undefined}
                            >
                                <Icon size={18} />
                                <span>{item.label}</span>
                            </NavLink>
                        );
                    })}
                </nav>
            </div>
        </aside>
    );

    return (
        <div className="app-shell">
            <div className={`desktop-sidebar ${desktopCollapsed ? 'desktop-sidebar-collapsed' : ''}`}>{sidebar}</div>
            {drawerOpen && (
                <button
                    type="button"
                    className="drawer-backdrop"
                    aria-label="Close navigation"
                    onClick={() => setDrawerOpen(false)}
                />
            )}
            <div className={`mobile-drawer ${drawerOpen ? 'mobile-drawer-open' : ''}`}>
                {sidebar}
            </div>

            <div className="app-main">
                <header className="app-header">
                    <div className="header-left">
                        <button type="button" className="drawer-menu" onClick={() => setDrawerOpen(true)} aria-label="Open navigation">
                            <Menu size={20} />
                        </button>
                        <div className="breadcrumb">
                            <span>Workspace</span>
                            <span className="breadcrumb-slash">/</span>
                            <strong>{pageTitle}</strong>
                        </div>
                    </div>
                    <div className="header-actions" ref={profileRef}>
                        <button
                            type="button"
                            onClick={toggleTheme}
                            className="theme-icon"
                            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                        >
                            {resolvedTheme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                        </button>
                        <button
                            type="button"
                            onClick={() => setProfileOpen((open) => !open)}
                            className="profile-avatar-button"
                            aria-label="Open profile menu"
                            aria-expanded={profileOpen}
                        >
                            {userInitial}
                        </button>
                        <AnimatePresence>
                            {profileOpen && (
                                <motion.div
                                    className="profile-popover"
                                    initial={{ opacity: 0, scale: 0.96, y: -6 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.96, y: -6 }}
                                    transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                                    role="menu"
                                >
                                    <div className="profile-popover-user">
                                        <strong>{user?.username || 'StackMatch user'}</strong>
                                        <span>{user?.email || 'Signed in'}</span>
                                    </div>
                                    <div className="profile-popover-divider" />
                                    <button
                                        type="button"
                                        className="profile-popover-item"
                                        role="menuitem"
                                        onClick={() => navigate('/settings')}
                                    >
                                        <Settings size={16} />
                                        <span>Settings</span>
                                        <ChevronRight size={15} />
                                    </button>
                                    <button
                                        type="button"
                                        className="profile-popover-item"
                                        role="menuitem"
                                        onClick={async () => {
                                            await handleLogout();
                                        }}
                                    >
                                        <LogOut size={16} />
                                        <span>Log out</span>
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </header>
                <main className="app-content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AppLayout;
