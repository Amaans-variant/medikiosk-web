import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/**
 * Theme (Dark Mode) store
 * ------------------------------------------------------------------
 * Persists the user's light/dark preference to localStorage so it
 * survives reloads and is shared across every route (login, kiosk
 * intake, doctor console, admin analytics, chatbot).
 *
 * The actual DOM side-effect (toggling the `dark` class on <html>)
 * is applied by <ThemeInitializer /> (see components/ThemeInitializer.tsx)
 * plus a tiny blocking inline script in app/layout.tsx that runs
 * before paint, so there is no light-mode "flash" on reload.
 */

export type ThemeMode = "light" | "dark";

interface ThemeState {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
}

export const THEME_STORAGE_KEY = "medikiosk_theme_v1";

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: "light",
      setTheme: (theme) => {
        set({ theme });
        applyThemeClass(theme);
      },
      toggleTheme: () => {
        const next: ThemeMode = get().theme === "dark" ? "light" : "dark";
        set({ theme: next });
        applyThemeClass(next);
      },
    }),
    {
      name: THEME_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state) applyThemeClass(state.theme);
      },
    }
  )
);

/** Adds/removes the Tailwind `dark` class on <html>. Safe to call on the server (no-op). */
export function applyThemeClass(theme: ThemeMode) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
}
