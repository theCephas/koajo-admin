import { Button } from "@/components/ui/button";

export function SettingsPage() {
  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold tracking-tight">
          Workspace settings
        </h2>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Configure preferences, billing, and integrations for your Koajo
          workspace.
        </p>
      </header>

      <div className="rounded-xl border bg-card shadow-sm">
        <div className="border-b px-6 py-4">
          <h3 className="text-lg font-semibold">Notifications</h3>
          <p className="text-sm text-muted-foreground">
            Choose how the team receives alerts.
          </p>
        </div>
        <div className="space-y-4 px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-medium">Email digests</p>
              <p className="text-sm text-muted-foreground">
                Send a summary every weekday at 9AM.
              </p>
            </div>
            <Button variant="outline">Edit</Button>
          </div>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-medium">Escalations</p>
              <p className="text-sm text-muted-foreground">
                Alert ops when SLAs are at risk.
              </p>
            </div>
            <Button variant="outline">Manage rules</Button>
          </div>
        </div>
      </div>
    </section>
  );
}
