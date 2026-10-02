"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface ThemeContextType {
  theme: string;
  setTheme: (theme: string) => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

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
  // Must render the same value on the server and on the first client render,
  // otherwise hydration mismatches. The stored theme is read after mount.
  const [theme, setCurrentTheme] = useState<string>(defaultTheme);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setCurrentTheme(localStorage.getItem(storageKey) || defaultTheme);
    setIsHydrated(true);
  }, [storageKey, defaultTheme]);

  useEffect(() => {
    if (!isHydrated) return;
    applyThemeToDocument(theme);
  }, [theme, isHydrated]);

  const setTheme = (newTheme: string) => {
    localStorage.setItem(storageKey, newTheme);
    setCurrentTheme(newTheme);
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
