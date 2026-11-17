// react context and state hooks
import React, { createContext, useContext, useEffect, useState } from 'react';

// theme context instance
const ThemeContext = createContext();

// theme provider component managing light/dark mode
export const ThemeProvider = ({ children }) => {
    // initialize theme from localstorage or system preference
    // also apply the class synchronously here before the first paint
    // to avoid a light flash on reload when dark mode is preferred
    const [theme, setTheme] = useState(() => {
        const saved = localStorage.getItem('theme');
        const resolved =
            saved === 'light' || saved === 'dark'
                ? saved
                : window.matchMedia('(prefers-color-scheme: dark)').matches
                ? 'dark'
                : 'light';
        // apply immediately — before first render paints to the screen
        if (resolved === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        return resolved;
    });

    // keep useEffect only for subsequent toggles after mount
    useEffect(() => {
        const root = document.documentElement;
        // toggle tailwind 'dark' class
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        // persist choice in localstorage
        localStorage.setItem('theme', theme);
    }, [theme]);

    // toggle between light and dark
    const toggleTheme = () => {
        setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
    };

    return (
        // expose theme and toggleTheme helper
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
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
