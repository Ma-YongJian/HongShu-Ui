import { defineStore } from "pinia";
import { store } from "@/store";

const THEME_KEY = "theme";

export type ThemeMode = "light" | "dark";

function readStoredTheme(): ThemeMode {
  if (typeof window === "undefined") {
    return "light";
  }
  return window.localStorage.getItem(THEME_KEY) === "dark" ? "dark" : "light";
}

function applyDocumentTheme(theme: ThemeMode) {
  const dark = theme === "dark";
  document.documentElement.classList.toggle("dark-mode", dark);
  document.documentElement.classList.toggle("dark", dark);
}

export const themeStore = defineStore("themeStore", {
  state: () => ({
    theme: readStoredTheme(),
  }),
  actions: {
    initTheme() {
      this.theme = readStoredTheme();
      applyDocumentTheme(this.theme);
    },
    setTheme(theme: ThemeMode) {
      this.theme = theme;
      window.localStorage.setItem(THEME_KEY, theme);
      applyDocumentTheme(theme);
    },
  },
});

export function useThemeStore() {
  return themeStore(store);
}
