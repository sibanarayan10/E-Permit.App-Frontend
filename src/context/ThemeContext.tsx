/**
 * Theme Context - Manages application theme (light/dark mode)
 */

import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    type ReactNode,
} from 'react';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
    themeMode: ThemeMode;
    isDarkMode: boolean;
    setThemeMode: (mode: ThemeMode) => void;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'app-theme-mode';

/**
 * Get stored theme preference from localStorage
 */
const getStoredTheme = (): ThemeMode => {
    try {
        const stored = localStorage.getItem(THEME_STORAGE_KEY);
        if (stored === 'light' || stored === 'dark' || stored === 'system') {
            return stored;
        }
    } catch {
        // Storage unavailable
    }
    return 'light'; // Default to light theme
};

/**
 * Check if system prefers dark mode
 */
const getSystemPreference = (): boolean => {
    if (typeof window !== 'undefined' && window.matchMedia) {
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
};

interface ThemeProviderProps {
    children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
    const [themeMode, setThemeModeState] = useState<ThemeMode>(getStoredTheme);

    // Calculate actual dark mode based on theme mode and system preference
    const isDarkMode = themeMode === 'dark' || (themeMode === 'system' && getSystemPreference());

    // Set theme mode and persist to localStorage
    const setThemeMode = useCallback((mode: ThemeMode) => {
        setThemeModeState(mode);
        try {
            localStorage.setItem(THEME_STORAGE_KEY, mode);
        } catch {
            // Storage unavailable
        }
    }, []);

    // Toggle between light and dark mode
    const toggleTheme = useCallback(() => {
        setThemeMode(isDarkMode ? 'light' : 'dark');
    }, [isDarkMode, setThemeMode]);

    // Listen for system preference changes
    useEffect(() => {
        if (themeMode !== 'system') return;

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => {
            // This will trigger a re-render with the new system preference
            setThemeModeState('system');
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [themeMode]);

    // Apply dark mode class to document for CSS variables if needed
    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark-mode');
        } else {
            document.documentElement.classList.remove('dark-mode');
        }
    }, [isDarkMode]);

    return (
        <ThemeContext.Provider value={{ themeMode, isDarkMode, setThemeMode, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

/**
 * Custom hook to use theme context
 */
export const useTheme = (): ThemeContextType => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

export default ThemeContext;
