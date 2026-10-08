import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface ThemeToggleProps {
  className?: string;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`theme-toggle-btn ${className}`}
      aria-label={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
      title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
    >
      <div className={`theme-toggle-track ${isDark ? 'track-dark' : 'track-light'}`}>
        <span className={`theme-toggle-icon icon-sun ${!isDark ? 'active' : ''}`}>
          <Sun size={14} strokeWidth={2.5} />
        </span>
        <span className={`theme-toggle-icon icon-moon ${isDark ? 'active' : ''}`}>
          <Moon size={14} strokeWidth={2.5} />
        </span>
        <div className={`theme-toggle-thumb ${isDark ? 'thumb-dark' : 'thumb-light'}`}>
          {isDark ? (
            <Moon size={12} strokeWidth={2.5} />
          ) : (
            <Sun size={12} strokeWidth={2.5} />
          )}
        </div>
      </div>
      <span className="theme-toggle-label">
        {isDark ? 'Dark' : 'Light'}
      </span>
    </button>
  );
};

export default ThemeToggle;
