// react context and state hooks
import React, { createContext, useContext, useEffect, useState } from 'react';

// theme context instance
const ThemeContext = createContext();

// theme provider component managing light/dark mode
export const ThemeProvider = ({ children }) => {
    const [theme, setThemeState] = useState(() => {
        const saved = localStorage.getItem('theme');
        return saved === 'light' || saved === 'dark' || saved === 'system'
            ? saved
            : 'system';
    });
    const [resolvedTheme, setResolvedTheme] = useState(() =>
        (theme === 'system')
            ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
            : theme
    );

    const applyTheme = (mode) => {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const resolved = mode === 'system' ? (prefersDark ? 'dark' : 'light') : mode;
        document.documentElement.classList.toggle('dark', resolved === 'dark');
        document.documentElement.dataset.mode = resolved;
        document.documentElement.dataset.theme = mode;
        setResolvedTheme(resolved);
    };

    useEffect(() => {
        applyTheme(theme);
        if (theme === 'system') {
            localStorage.removeItem('theme');
        } else {
            localStorage.setItem('theme', theme);
        }

        const media = window.matchMedia('(prefers-color-scheme: dark)');
        const handleSystemChange = () => {
            if (theme === 'system') applyTheme('system');
        };
        media.addEventListener?.('change', handleSystemChange);
        return () => media.removeEventListener?.('change', handleSystemChange);
    }, [theme]);

    const setTheme = (mode) => {
        if (mode === 'light' || mode === 'dark' || mode === 'system') {
            setThemeState(mode);
        }
    };

    const toggleTheme = () => {
        setThemeState((current) => {
            const resolved = current === 'system'
                ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
                : current;
            return resolved === 'light' ? 'dark' : 'light';
        });
    };

    return (
        <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

// custom hook to access theme
export const useTheme = () => {
    // get theme context value
    const context = useContext(ThemeContext);
    // ensure within provider
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
