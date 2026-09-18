import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppTheme } from '../types';
import { STORAGE_KEYS, loadFromStorage, saveToStorage } from '../utils/storage';

interface ThemeContextType {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  toggleTheme: () => void;
  isPink: boolean;
  colors: {
    primary: string;
    primaryHover: string;
    primaryLight: string;
    primarySubtle: string;
    primaryBorder: string;
    primaryText: string;
    badge: string;
    accentGradient: string;
    bannerGradient: string;
    chartColor: string;
    ring: string;
  };
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Always set to soft pastel pink as requested ("하늘색 선택은 삭제")
  const [theme] = useState<AppTheme>('pink');

  const setTheme = () => {
    // Locked to pastel pink theme
  };

  const toggleTheme = () => {
    // Locked to pastel pink theme
  };

  // Synchronize with document body attribute and background
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'pink');
    document.body.setAttribute('data-theme', 'pink');
    document.body.className = 'bg-[#fff8f9] text-stone-800 antialiased selection:bg-pink-100 transition-colors duration-300';
  }, []);

  const isPink = true;

  // Soft Pastel Pink Palette (no dark/harsh saturated pinks)
  const colors = {
    primary: 'bg-pink-400',
    primaryHover: 'hover:bg-pink-500',
    primaryLight: 'bg-[#fff5f7]',
    primarySubtle: 'bg-pink-100/70',
    primaryBorder: 'border-pink-200/80',
    primaryText: 'text-pink-600',
    badge: 'bg-pink-100/80 text-pink-700 border-pink-200/80',
    accentGradient: 'from-[#fff5f8] via-pink-50/70 to-rose-50/50',
    bannerGradient: 'from-pink-400 via-pink-300 to-rose-300',
    chartColor: '#f472b6',
    ring: 'focus:ring-pink-300/40 focus:border-pink-300',
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, isPink, colors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useAppTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useAppTheme must be used within a ThemeProvider');
  }
  return context;
}
