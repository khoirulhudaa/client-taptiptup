import { useEffect, useState } from 'react';

export const useTheme = () => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('sawer-theme') || 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('sawer-theme', theme);
  }, [theme]);

  const toggle = () => setTheme(t => t === 'light' ? 'dark' : 'light');
  const isDark = theme === 'dark';

  return { theme, toggle, isDark };
};