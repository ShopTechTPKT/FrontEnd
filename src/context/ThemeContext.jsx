import { createContext, useContext, useState, useEffect, useMemo } from "react";

const ThemeContext = createContext();

/**
 * ThemeProvider — Manages theme state.
 * Forced to "light" as per user request to disable dark mode.
 */
export function ThemeProvider({ children }) {
  const [theme] = useState("light");

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("dark");
    root.classList.remove("dark-mode");
    localStorage.setItem("theme", "light");
  }, []);

  const toggleTheme = () => {
    // Disabled
  };

  const value = useMemo(() => ({ theme: "light", toggleTheme }), []);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}

export default ThemeContext;
