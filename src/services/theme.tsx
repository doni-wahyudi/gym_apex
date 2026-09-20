import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemeId = 'cyan' | 'emerald' | 'crimson' | 'amber' | 'violet';

export interface ThemeOption {
  id: ThemeId;
  name: string;
  nameId: string;
  color: string;
  bgGrad: string;
  badge: string;
  badgeId: string;
}

export const THEMES: ThemeOption[] = [
  { 
    id: 'cyan', 
    name: 'Cyan Cyber',
    nameId: 'Siberian Sian',
    color: '#06b6d4', 
    bgGrad: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
    badge: 'Default',
    badgeId: 'Bawaan'
  },
  { 
    id: 'emerald', 
    name: 'Emerald Power',
    nameId: 'Zamrud Perkasa',
    color: '#10b981', 
    bgGrad: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    badge: 'Vitality',
    badgeId: 'Vitalitas'
  },
  { 
    id: 'crimson', 
    name: 'Crimson Fury',
    nameId: 'Merah Membara',
    color: '#f43f5e', 
    bgGrad: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)',
    badge: 'Intensity',
    badgeId: 'Intensitas'
  },
  { 
    id: 'amber', 
    name: 'Solar Amber',
    nameId: 'Kuning Surya',
    color: '#f59e0b', 
    bgGrad: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    badge: 'Gold VIP',
    badgeId: 'Emas VIP'
  },
  { 
    id: 'violet', 
    name: 'Ultraviolet',
    nameId: 'Ungu Elektrik',
    color: '#a855f7', 
    bgGrad: 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)',
    badge: 'Studio',
    badgeId: 'Studio'
  },
];

const THEME_STORAGE_KEY = 'apex_gym_theme';

export function getInitialTheme(): ThemeId {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY) as ThemeId;
    if (saved && THEMES.some((t) => t.id === saved)) {
      return saved;
    }
  } catch {
    // fallback
  }
  return 'cyan';
}

export function applyTheme(theme: ThemeId) {
  document.documentElement.setAttribute('data-theme', theme);
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // ignore
  }
}

interface ThemeContextType {
  currentTheme: ThemeId;
  changeTheme: (theme: ThemeId) => void;
  themes: ThemeOption[];
}

const ThemeContext = createContext<ThemeContextType>({
  currentTheme: 'cyan',
  changeTheme: () => {},
  themes: THEMES,
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<ThemeId>(getInitialTheme());

  useEffect(() => {
    applyTheme(currentTheme);
  }, [currentTheme]);

  const changeTheme = (theme: ThemeId) => {
    setCurrentTheme(theme);
    applyTheme(theme);
  };

  return (
    <ThemeContext.Provider value={{ currentTheme, changeTheme, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
};

export function useTheme() {
  return useContext(ThemeContext);
}
