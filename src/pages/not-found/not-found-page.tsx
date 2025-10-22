import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";

export function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <span className="rounded-full border border-dashed px-4 py-1 text-xs font-semibold uppercase text-muted-foreground">
        404
      </span>
      <h2 className="text-3xl font-bold tracking-tight">Page not found</h2>
      <p className="max-w-md text-sm text-muted-foreground">
        The page you are looking for may have been moved or removed. Check the
        address or head back to the dashboard.
      </p>
      <Button asChild>
        <Link to="/">Back to dashboard</Link>
      </Button>
    </div>
  );
}
