// import { useEffect, type ReactNode } from "react";

// import { useThemeStore } from "@/stores/theme-store";

// interface ThemeProviderProps {
//   children: ReactNode;
// }

// export function ThemeProvider({ children }: ThemeProviderProps) {
//   const initialize = useThemeStore((state) => state.initialize);

//   useEffect(() => {
//     initialize();
//   }, [initialize]);

//   return <>{children}</>;
// }
