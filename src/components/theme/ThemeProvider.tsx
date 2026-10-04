"use client";

import React, { createContext, useCallback, useContext, useEffect, useSyncExternalStore } from "react";

interface ThemeContextType {
  theme: string;
  setTheme: (theme: string) => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);
const THEME_CHANGE_EVENT = "motor-theme-change";

function applyThemeToDocument(theme: string) {
  const isDark =
    theme === "dark" ||
    (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);

  const root = document.documentElement;
  root.classList.toggle("dark", isDark);
  root.style.colorScheme = isDark ? "dark" : "light";
}

export const ThemeProvider: React.FC<{
  children: React.ReactNode;
  defaultTheme?: string;
  storageKey?: string;
}> = ({ children, defaultTheme = "dark", storageKey = "motor-theme" }) => {
  const subscribe = useCallback((onStoreChange: () => void) => {
    window.addEventListener("storage", onStoreChange);
    window.addEventListener(THEME_CHANGE_EVENT, onStoreChange);
    return () => {
      window.removeEventListener("storage", onStoreChange);
      window.removeEventListener(THEME_CHANGE_EVENT, onStoreChange);
    };
  }, []);

  const getSnapshot = useCallback(
    () => localStorage.getItem(storageKey) || defaultTheme,
    [storageKey, defaultTheme],
  );
  const getServerSnapshot = useCallback(() => defaultTheme, [defaultTheme]);
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    applyThemeToDocument(theme);
  }, [theme]);

  const setTheme = (newTheme: string) => {
    localStorage.setItem(storageKey, newTheme);
    window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
};
