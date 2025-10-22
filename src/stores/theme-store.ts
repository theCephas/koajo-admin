// import { create } from "zustand";

// type Theme = "light" | "dark";
// type ThemePreference = Theme | "system";

// interface ThemeState {
//   theme: ThemePreference;
//   resolvedTheme: Theme;
//   initialized: boolean;
//   setTheme: (theme: ThemePreference) => void;
//   toggleTheme: () => void;
//   initialize: () => void;
// }

// const storageKey = "koajo:theme";

// const getSystemTheme = (): Theme =>
//   typeof window !== "undefined" &&
//   window.matchMedia("(prefers-color-scheme: dark)").matches
//     ? "dark"
//     : "light";

// const applyThemeClass = (theme: Theme) => {
//   if (typeof document === "undefined") return;
//   const root = document.documentElement;
//   root.classList.remove("light", "dark");
//   root.classList.add(theme);
// };

// export const useThemeStore = create<ThemeState>((set, get) => ({
//   theme: "system",
//   resolvedTheme: "light",
//   initialized: false,
//   setTheme: (theme) => {
//     const next: Theme = theme === "system" ? getSystemTheme() : theme;

//     set({ theme, resolvedTheme: next });

//     if (typeof window !== "undefined") {
//       localStorage.setItem(storageKey, theme);
//     }

//     applyThemeClass(next);
//   },
//   toggleTheme: () => {
//     const state = get();
//     const next = state.resolvedTheme === "dark" ? "light" : "dark";
//     state.setTheme(next);
//   },
//   initialize: () => {
//     if (get().initialized || typeof window === "undefined") return;

//     const stored = localStorage.getItem(storageKey) as ThemePreference | null;
//     const theme = stored ?? "system";
//     const resolved: Theme =
//       theme === "system" ? getSystemTheme() : theme;

//     set({
//       theme,
//       resolvedTheme: resolved,
//       initialized: true
//     });

//     applyThemeClass(resolved);
//   }
// }));
