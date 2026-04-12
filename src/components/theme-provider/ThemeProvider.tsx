'use client';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';

type Mode = 'light' | 'dark';
type Accent = 'blue' | 'violet' | 'emerald' | 'amber' | 'rose';

interface ThemeContextValue {
  mode: Mode;
  accent: Accent;
  setMode: (m: Mode) => void;
  setAccent: (a: Accent) => void;
  toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  mode: 'light',
  accent: 'blue',
  setMode: () => {},
  setAccent: () => {},
  toggleMode: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

const ACCENTS: Record<Accent, { color: string; dark: string; light: string }> = {
  blue: { color: '#3b82f6', dark: '#2563eb', light: '#eff6ff' },
  violet: { color: '#8b5cf6', dark: '#7c3aed', light: '#f5f3ff' },
  emerald: { color: '#10b981', dark: '#059669', light: '#ecfdf5' },
  amber: { color: '#f59e0b', dark: '#d97706', light: '#fffbeb' },
  rose: { color: '#f43f5e', dark: '#e11d48', light: '#fff1f2' },
};

export const ACCENT_OPTIONS: Accent[] = ['blue', 'violet', 'emerald', 'amber', 'rose'];

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<Mode>('light');
  const [accent, setAccentState] = useState<Accent>('blue');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedMode = localStorage.getItem('theme-mode') as Mode | null;
    const savedAccent = localStorage.getItem('theme-accent') as Accent | null;
    if (savedMode === 'light' || savedMode === 'dark') setModeState(savedMode);
    if (savedAccent && ACCENT_OPTIONS.includes(savedAccent)) setAccentState(savedAccent);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    root.setAttribute('data-theme', mode);
    root.setAttribute('data-accent', accent);
    localStorage.setItem('theme-mode', mode);
    localStorage.setItem('theme-accent', accent);

    const a = ACCENTS[accent];
    root.style.setProperty('--accent-color', a.color);
    root.style.setProperty('--accent-dark', a.dark);
    root.style.setProperty('--accent-light', a.light);
  }, [mode, accent, mounted]);

  const setMode = useCallback((m: Mode) => setModeState(m), []);
  const setAccent = useCallback((a: Accent) => setAccentState(a), []);
  const toggleMode = useCallback(() => setModeState((m) => (m === 'light' ? 'dark' : 'light')), []);

  return (
    <ThemeContext.Provider value={{ mode, accent, setMode, setAccent, toggleMode }}>
      {children}
    </ThemeContext.Provider>
  );
}
