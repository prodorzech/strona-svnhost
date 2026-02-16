import { createContext, useContext } from 'react';
import type { Language, Translations } from './i18n';
import { translations } from './i18n';

export type Theme = 'dark' | 'light';

export interface AppContextType {
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
  language: Language;
  setLanguage: (l: Language) => void;
  t: Translations;
}

export const AppContext = createContext<AppContextType>({
  theme: 'dark',
  setTheme: () => {},
  toggleTheme: () => {},
  language: 'pl',
  setLanguage: () => {},
  t: translations.pl,
});

export const useApp = () => useContext(AppContext);
