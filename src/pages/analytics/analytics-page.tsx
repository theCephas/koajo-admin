import { Button } from "@/components/ui/button";

export function AnalyticsPage() {
  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold tracking-tight">
          Analytics overview
        </h2>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Monitor customer engagement, resolution trends, and operational health
          across the Koajo platform.
        </p>
      </header>

      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold">Performance snapshot</h3>
            <p className="text-sm text-muted-foreground">
              Ingest metrics from your data warehouse for richer insights.
            </p>
          </div>
          <Button>Connect source</Button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
            Traffic composition will appear here after you connect an analytics
            provider.
          </div>
          <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
            Funnel analysis is ready to configure once events are mapped.
          </div>
        </div>
      </div>
    </section>
  );
}
