import React, { createContext, useContext, useState, useEffect } from 'react';
import { THEMES, Theme } from '../themes';
import { hexToRgbTriplet, getContrastTextColor } from '../utils/colorUtils';

interface ThemeContextType {
  currentTheme: Theme;
  setThemeId: (id: string) => void;
  availableThemes: Theme[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeId, setThemeIdState] = useState<string>(() => {
    return localStorage.getItem('keywarp_theme') || localStorage.getItem('typepulse_theme') || 'earth-minimal';
  });

  const currentTheme = THEMES[themeId] || THEMES['earth-minimal'];

  const setThemeId = (id: string) => {
    if (THEMES[id]) {
      setThemeIdState(id);
      localStorage.setItem('keywarp_theme', id);
    }
  };

  useEffect(() => {
    const root = document.documentElement;
    const contrastColor = getContrastTextColor(currentTheme.main);

    // Set RGB channel triplets for Tailwind opacity calculation
    root.style.setProperty('--color-bg-rgb', hexToRgbTriplet(currentTheme.bg));
    root.style.setProperty('--color-surface-rgb', hexToRgbTriplet(currentTheme.surface));
    root.style.setProperty('--color-ink-100-rgb', hexToRgbTriplet(currentTheme.text));
    root.style.setProperty('--color-ink-400-rgb', hexToRgbTriplet(currentTheme.sub));
    root.style.setProperty('--color-accent-rgb', hexToRgbTriplet(currentTheme.main));
    root.style.setProperty('--color-incorrect-rgb', hexToRgbTriplet(currentTheme.error));
    root.style.setProperty('--color-correct-rgb', hexToRgbTriplet(currentTheme.errorExtra));
    root.style.setProperty('--color-accent-contrast-rgb', hexToRgbTriplet(contrastColor));

    // Hex variables for direct CSS usage
    root.style.setProperty('--color-bg', currentTheme.bg);
    root.style.setProperty('--color-surface', currentTheme.surface);
    root.style.setProperty('--color-ink-100', currentTheme.text);
    root.style.setProperty('--color-ink-400', currentTheme.sub);
    root.style.setProperty('--color-accent', currentTheme.main);
    root.style.setProperty('--color-incorrect', currentTheme.error);
    root.style.setProperty('--color-correct', currentTheme.errorExtra);
    root.style.setProperty('--color-accent-contrast', contrastColor);

    document.body.style.backgroundColor = currentTheme.bg;
    document.body.style.color = currentTheme.text;
  }, [currentTheme]);

  return (
    <ThemeContext.Provider value={{ currentTheme, setThemeId, availableThemes: Object.values(THEMES) }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return ctx;
};
