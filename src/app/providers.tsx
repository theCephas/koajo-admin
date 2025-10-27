import { Suspense } from "react";
import { RouterProvider } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";

import { router } from "./router";
import SuspenseLoader from "@/components/ui/suspense-loader";
import { queryClient } from "@/lib/query-client";

export function AppProviders() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* <ThemeProvider> */}
      <Suspense fallback={<SuspenseLoader />}>
        <RouterProvider router={router} />
      </Suspense>
      <Toaster richColors closeButton />
      {/* </ThemeProvider> */}
    </QueryClientProvider>
  );
}
