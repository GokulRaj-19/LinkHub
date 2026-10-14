import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

const ThemeContext = createContext();

export const THEMES = {
  SKETCH: "sketch",
  BRAND: "brand",
  DARK: "dark",
  HIGH_CONTRAST: "hc",
};

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    return localStorage.getItem("linkhub_theme") || THEMES.SKETCH;
  });

  const setTheme = useCallback((newTheme) => {
    if (Object.values(THEMES).includes(newTheme)) {
      setThemeState(newTheme);
      localStorage.setItem("linkhub_theme", newTheme);
      document.documentElement.setAttribute("data-theme", newTheme);
    }
  }, []);

  const resetTheme = useCallback(() => {
    setTheme(THEMES.SKETCH);
  }, [setTheme]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resetTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
}
