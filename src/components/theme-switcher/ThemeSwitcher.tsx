'use client';
import { useTheme, ACCENT_OPTIONS } from '@/components/theme-provider/ThemeProvider';

export function ThemeSwitcher() {
  const { mode, accent, toggleMode, setAccent } = useTheme();

  return (
    <div className="theme-switcher">
      {ACCENT_OPTIONS.map((a) => (
        <button
          key={a}
          className={`accent-dot${accent === a ? ' active' : ''}`}
          data-accent={a}
          onClick={() => setAccent(a)}
          aria-label={`Accent color: ${a}`}
        />
      ))}
      <button
        className={`theme-btn${mode === 'dark' ? ' active' : ''}`}
        onClick={toggleMode}
        aria-label={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {mode === 'dark' ? (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M8 1v1m0 12v1m7-7h-1M2 8H1m12.07-4.07-.71.71M3.64 12.36l-.71.71m10.14 0-.71-.71M3.64 3.64l-.71-.71M11 8a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M14 9.68A6.5 6.5 0 0 1 6.32 2 6.5 6.5 0 1 0 14 9.68Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>
    </div>
  );
}
