import { Suspense } from "react";
import { RouterProvider } from "react-router-dom";

import { router } from "./router";
import SuspenseLoader from "@/components/ui/suspense-loader";

export function AppProviders() {
  return (
    // <ThemeProvider>
    <Suspense fallback={<SuspenseLoader />}>
      <RouterProvider router={router} />
    </Suspense>
    // </ThemeProvider>
  );
}
