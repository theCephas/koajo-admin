import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { StatsRow } from "@/components/dashboard/stats-row";
import { IncomeAnalysis } from "@/components/dashboard/income-analysis";
import { PodContributions } from "@/components/dashboard/pod-contributions";
import { TransactionRate } from "@/components/dashboard/transaction-rate";
import { KycStatus } from "@/components/dashboard/kyc-status";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { OnlineUsers } from "@/components/dashboard/online-users";

export function DashboardPage() {
  return (
    <section className="space-y-6">
      <DashboardHeader />
      <StatsRow />

      <div className="grid gap-4 lg:grid-cols-2">
        <IncomeAnalysis />
        <PodContributions />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <TransactionRate />
        <KycStatus />
      </div>

      <div className="flex items-center w-full gap-4 h-auto">
        <div className="w-[70%]">
          <RecentTransactions />
        </div>
        <div className="w-[30%]">
          <OnlineUsers />
        </div>
      </div>
    </section>
  );
}
