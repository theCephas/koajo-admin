import { Loader2, RefreshCw } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { StatsRow } from "@/components/dashboard/stats-row";
import { IncomeAnalysis } from "@/components/dashboard/income-analysis";
import { PodContributions } from "@/components/dashboard/pod-contributions";
import { TransactionRate } from "@/components/dashboard/transaction-rate";
import { KycStatus } from "@/components/dashboard/kyc-status";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { OnlineUsers } from "@/components/dashboard/online-users";
import { useDashboardQuery } from "@/hooks/queries/use-dashboard";
import { Button } from "@/components/ui/button";

export function DashboardPage() {
  const { data, isLoading, isError, refetch } = useDashboardQuery();

  if (isLoading) {
    return (
      <section className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading dashboard...</span>
        </div>
      </section>
    );
  }

  if (isError || !data) {
    return (
      <section className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">
            Unable to load dashboard data
          </h2>
          <p className="text-sm text-muted-foreground">
            Please check your network connection and try again.
          </p>
        </div>
        <Button onClick={() => void refetch()} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Retry
        </Button>
      </section>
    );
  }

  const {
    metrics,
    incomeAnalysis,
    payoutAnalysis,
    podContributions,
    kycSummary,
    recentTransactions,
  } = data;

  return (
    <section className="space-y-6">
      <DashboardHeader />
      <StatsRow metrics={metrics} />

      <div className="grid gap-4 lg:grid-cols-2">
        <IncomeAnalysis
          incomeAnalysis={incomeAnalysis}
          payoutAnalysis={payoutAnalysis}
        />
        <PodContributions podContributions={podContributions} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <TransactionRate
          transactions={recentTransactions}
          kycSummary={kycSummary}
        />
        <KycStatus summary={kycSummary} />
      </div>

      <div className="flex items-center w-full gap-4 h-auto">
        <div className="w-[70%]">
          <RecentTransactions transactions={recentTransactions} />
        </div>
        <div className="w-[30%]">
          <OnlineUsers transactions={recentTransactions} />
        </div>
      </div>
    </section>
  );
}
