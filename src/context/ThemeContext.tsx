import React, { createContext, useContext, useState, useEffect } from 'react';
import { THEMES, Theme } from '../themes';
import { hexToRgbTriplet, getContrastTextColor } from '../utils/colorUtils';
import { trackThemeChange } from '../utils/telemetry';

interface ThemeContextType {
  currentTheme: Theme;
  setThemeId: (id: string) => void;
  availableThemes: Theme[];
  isCookieUnlocked: boolean;
  enterCookieTheme: () => void;
  exitCookieTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeId, setThemeIdState] = useState<string>(() => {
    return localStorage.getItem('keywarp_theme') || localStorage.getItem('typepulse_theme') || 'earth-minimal';
  });

  const [isCookieUnlocked, setIsCookieUnlocked] = useState<boolean>(() => {
    try {
      return localStorage.getItem('keywarp_cookie_unlocked') === 'true' || localStorage.getItem('keywarp_cookie_mode') === 'true';
    } catch {
      return false;
    }
  });

  const currentTheme = THEMES[themeId] || THEMES['earth-minimal'];

  const setThemeId = (id: string) => {
    if (THEMES[id]) {
      setThemeIdState(id);
      localStorage.setItem('keywarp_theme', id);
      if (id !== 'warm-cookie') {
        localStorage.setItem('keywarp_prev_theme', id);
      }
      trackThemeChange(id);
    }
  };

  const enterCookieTheme = () => {
    setIsCookieUnlocked(true);
    try {
      localStorage.setItem('keywarp_cookie_unlocked', 'true');
      if (themeId !== 'warm-cookie') {
        localStorage.setItem('keywarp_prev_theme', themeId);
      }
    } catch {}
    setThemeIdState('warm-cookie');
    localStorage.setItem('keywarp_theme', 'warm-cookie');
    trackThemeChange('warm-cookie');
  };

  const exitCookieTheme = () => {
    let prev = 'earth-minimal';
    try {
      prev = localStorage.getItem('keywarp_prev_theme') || 'earth-minimal';
      if (prev === 'warm-cookie') prev = 'earth-minimal';
    } catch {}
    setThemeIdState(prev);
    localStorage.setItem('keywarp_theme', prev);
    trackThemeChange(prev);
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

  const availableThemes = Object.values(THEMES).filter(t => {
    if (t.id === 'warm-cookie') return isCookieUnlocked;
    return true;
  });

  return (
    <ThemeContext.Provider value={{ currentTheme, setThemeId, availableThemes, isCookieUnlocked, enterCookieTheme, exitCookieTheme }}>
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
