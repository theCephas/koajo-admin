import { apiClient } from "@/lib/api-client";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  expiresAt: string;
  role: string;
  isSuperAdmin: boolean;
}

export const login = async (payload: LoginPayload) => {
  const { data } = await apiClient.post<LoginResponse>("/auth/login", payload);
  return data;
};

export interface DashboardMetrics {
  totalActiveUsers: {
    value: number;
    percentageChange: number;
  };
  newSignupsToday: {
    value: number;
    percentageChange: number;
  };
  averageDailyUserGrowth: {
    value: number;
    percentageChange: number;
  };
  averageMonthlyUserGrowth: {
    value: number;
    percentageChange: number;
  };
}

export interface DashboardIncomeAnalysis {
  totalIncoming: string;
  percentageChange: number;
  monthlyTotals: {
    month: string;
    total: string;
  }[];
}

export interface DashboardPayoutAnalysis {
  totalPayouts: string;
  percentageChange: number;
  monthlyTotals: {
    month: string;
    total: string;
  }[];
}

export interface DashboardPodContribution {
  planCode: string;
  totalContributed: string;
}

export interface DashboardKycAttempt {
  id: string;
  accountEmail: string;
  status: string;
  type: string;
  stripeReference: Record<string, unknown>;
  recordedAt: string;
}

export interface DashboardKycSummary {
  successPercentage: number;
  rejectedPercentage: number;
  pendingPercentage: number;
  lastAttempts: DashboardKycAttempt[];
}

export interface DashboardTransaction {
  id: string;
  type: string;
  amount: string;
  currency: string;
  status: string;
  stripeReference: string;
  recordedAt: string;
  accountEmail: string;
  podId: string;
  podPlanCode: string;
}

export interface DashboardResponse {
  metrics: DashboardMetrics;
  incomeAnalysis: DashboardIncomeAnalysis;
  payoutAnalysis: DashboardPayoutAnalysis;
  podContributions: DashboardPodContribution[];
  kycSummary: DashboardKycSummary;
  recentTransactions: DashboardTransaction[];
}

export const getDashboard = async () => {
  const { data } = await apiClient.get<DashboardResponse>("/dashboard");
  return data;
};

export interface AccountSummary {
  id: string;
  email: string;
  phoneNumber: string;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  createdAt: string;
  isActive: boolean;
  emailNotificationsEnabled: boolean;
  transactionNotificationsEnabled: boolean;
}

export interface AccountsResponse {
  total: number;
  items: AccountSummary[];
}

export interface AccountsQueryParams {
  search?: string;
  limit?: number;
  offset?: number;
}

export const getAccounts = async ({
  search,
  limit = 20,
  offset = 0,
}: AccountsQueryParams) => {
  const { data } = await apiClient.get<AccountsResponse>("/accounts", {
    params: {
      search: search ?? undefined,
      limit,
      offset,
    },
  });

  return data;
};

export type AccountDetails = AccountSummary;

export const getAccountById = async (accountId: string) => {
  const { data } = await apiClient.get<AccountDetails>(
    `/accounts/${accountId}`,
  );
  return data;
};

export interface UpdateAccountNotificationsPayload {
  emailNotificationsEnabled: boolean;
  transactionNotificationsEnabled: boolean;
}

export type UpdateAccountNotificationsResponse =
  UpdateAccountNotificationsPayload;

export const updateAccountNotifications = async ({
  accountId,
  payload,
}: {
  accountId: string;
  payload: UpdateAccountNotificationsPayload;
}) => {
  const { data } = await apiClient.patch<UpdateAccountNotificationsResponse>(
    `/accounts/${accountId}/notifications`,
    payload,
  );

  return data;
};

export interface AccountAchievement {
  code: string;
  name: string;
  description: string;
  progress?: number;
  remaining?: number;
  earnedAt?: string;
}

export interface AccountAchievementsResponse {
  totalEarned: number;
  totalAvailable: number;
  earned: AccountAchievement[];
  pending: AccountAchievement[];
}

export const getAccountAchievements = async (accountId: string) => {
  const { data } = await apiClient.get<AccountAchievementsResponse>(
    `/accounts/${accountId}/achievements`,
  );

  return data;
};

export interface PodSummary {
  id: string;
  type: string;
  status: string;
  amount: number;
  lifecycleWeeks: number;
  maxMembers: number;
  currentMembers: number;
  creatorId: string | null;
  createdAt: string;
}

export interface PodsResponse {
  total: number;
  items: PodSummary[];
}

export interface PodsQueryParams {
  search?: string;
  limit?: number;
  offset?: number;
}

export const getPods = async ({
  search,
  limit = 20,
  offset = 0,
}: PodsQueryParams) => {
  const { data } = await apiClient.get<PodsResponse>("/pods", {
    params: {
      search: search ?? undefined,
      limit,
      offset,
    },
  });

  return data;
};

export interface PodMembership {
  id?: string;
  accountId?: string;
  accountEmail?: string;
  joinedAt?: string;
  status?: string;
  [key: string]: unknown;
}

export interface PodDetails extends PodSummary {
  memberships: PodMembership[];
}

export const getPodById = async (podId: string) => {
  const { data } = await apiClient.get<PodDetails>(`/pods/${podId}`);
  return data;
};

export interface PodPlanSummary {
  id: string;
  code: string;
  amount: number;
  lifecycleWeeks: number;
  maxMembers: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  totalPods: number;
  podsWithMembers: number;
  canEdit: boolean;
  canDelete: boolean;
}

export interface PodPlansResponse {
  total: number;
  items: PodPlanSummary[];
}

export interface PodPlansQueryParams {
  search?: string;
  limit?: number;
  offset?: number;
}

export interface PodPlanPayload {
  code: string;
  amount: number;
  lifecycleWeeks: number;
  maxMembers: number;
  active: boolean;
}

export const getPodPlans = async ({
  search,
  limit = 20,
  offset = 0,
}: PodPlansQueryParams) => {
  const { data } = await apiClient.get<PodPlansResponse>("/pod-plans", {
    params: {
      search: search ?? undefined,
      limit,
      offset,
    },
  });

  return data;
};

export const createPodPlan = async (payload: PodPlanPayload) => {
  const { data } = await apiClient.post<PodPlanSummary>("/pod-plans", payload);
  return data;
};

export const updatePodPlan = async ({
  planId,
  payload,
}: {
  planId: string;
  payload: PodPlanPayload;
}) => {
  const { data } = await apiClient.patch<PodPlanSummary>(
    `/pod-plans/${planId}`,
    payload,
  );

  return data;
};

export const deletePodPlan = async (planId: string) => {
  await apiClient.delete(`/pod-plans/${planId}`);
};
