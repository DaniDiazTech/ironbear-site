import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/app.css';
import { applyTheme } from './components/ThemeToggle';

// Apply persisted theme before render to avoid flash
try {
  const stored = localStorage.getItem('ib-theme');
  if (stored === 'dark' || stored === 'light') {
    applyTheme(stored);
  } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    applyTheme('dark');
  }
} catch {
  /* ignore */
}

const el = document.getElementById('root');
if (!el) throw new Error('No #root');
createRoot(el).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
