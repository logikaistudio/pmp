import React from 'react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="btn btn-ghost"
            style={{
                padding: '0.5rem 1rem',
                fontSize: '1.2rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
            }}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
            {theme === 'dark' ? '☀️' : '🌙'}
        </button>
    );
};

export default ThemeToggle;
