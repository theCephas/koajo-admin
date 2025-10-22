import { Button } from "@/components/ui/button";

export function RequestAccessPage() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col justify-center gap-6">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-semibold tracking-tight">
          Request access to Koajo
        </h2>
        <p className="text-sm text-muted-foreground">
          Tell us a bit about your team so we can help you get started quickly.
        </p>
      </div>

      <form className="space-y-4 rounded-xl border bg-card p-6 shadow-sm">
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="company">
            Company name
          </label>
          <input
            id="company"
            className="flex h-11 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            placeholder="Koajo Inc."
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="team">
            Team size
          </label>
          <input
            id="team"
            className="flex h-11 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            placeholder="15"
          />
        </div>

        <Button type="submit">Submit request</Button>
      </form>
    </div>
  );
}
