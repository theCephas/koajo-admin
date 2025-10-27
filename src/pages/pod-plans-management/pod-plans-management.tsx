import React, { useEffect, useMemo, useState } from "react";
import { Loader2, MoreVertical, Plus, Search } from "lucide-react";

import DataTable, { type Column } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDebouncedValue } from "@/hooks/use-debounce";
import {
  useCreatePodPlanMutation,
  useDeletePodPlanMutation,
  usePodPlansQuery,
  useUpdatePodPlanMutation,
  type PodPlanMutationError,
  type PodPlansQueryError,
} from "@/hooks/queries/use-pod-plans";
import type { PodPlanSummary } from "@/services/api";
import { PodPlanStatusBadge } from "./components/pod-plan-status-badge";
import {
  PodPlanFormDialog,
  type PodPlanFormValues,
} from "./components/pod-plan-form-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";
import { toast } from "sonner";

const PAGE_SIZE_OPTIONS = [10, 20, 50];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(value);

const formatLifecycle = (weeks: number) =>
  `${weeks} week${weeks === 1 ? "" : "s"}`;

const formatDate = (isoString: string) => {
  if (!isoString) return "—";
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
};

const ErrorBanner = ({
  error,
  onRetry,
}: {
  error: PodPlansQueryError;
  onRetry: () => void;
}) => {
  const message =
    error.response?.data?.message ?? error.message ?? "Something went wrong.";

  return (
    <div className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span>{message}</span>
        <Button variant="outline" size="sm" onClick={onRetry}>
          Try again
        </Button>
      </div>
    </div>
  );
};

type DialogMode =
  | { type: "create" }
  | { type: "edit"; plan: PodPlanSummary }
  | null;

export default function PodPlansManagementPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<PodPlanSummary | null>(
    null,
  );
  const [lastError, setLastError] = useState<string | null>(null);

  const handleMutationError = React.useCallback(
    (mutationError: PodPlanMutationError) => {
      const message =
        mutationError.response?.data?.message ??
        mutationError.message ??
        "Unable to save pod plan.";
      setLastError(message);
    },
    [],
  );

  const debouncedSearch = useDebouncedValue(search.trim());

  const queryParams = useMemo(
    () => ({
      search: debouncedSearch || undefined,
      limit: pageSize,
      offset: (page - 1) * pageSize,
    }),
    [debouncedSearch, page, pageSize],
  );

  const { data, isLoading, isFetching, isError, error, refetch } =
    usePodPlansQuery(queryParams);

  const { mutate: createPlan, isPending: isCreating } =
    useCreatePodPlanMutation({
      onSuccess: () => {
        toast.success("Pod plan created");
        setDialogMode(null);
        setLastError(null);
      },
      onError: (mutationError) => {
        handleMutationError(mutationError);
      },
    });

  const { mutate: updatePlan, isPending: isUpdating } =
    useUpdatePodPlanMutation({
      onSuccess: () => {
        toast.success("Pod plan updated");
        setDialogMode(null);
        setLastError(null);
      },
      onError: (mutationError) => {
        handleMutationError(mutationError);
      },
    });

  const { mutate: deletePlan } = useDeletePodPlanMutation();

  const plans = data?.items ?? [];
  const totalCount = data?.total ?? 0;

  useEffect(() => {
    if (!data) return;
    const maxPage = Math.max(1, Math.ceil(data.total / pageSize));
    if (page > maxPage) {
      setPage(maxPage);
    }
  }, [data, page, pageSize]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  useEffect(() => {
    setPage(1);
  }, [pageSize]);

  const columns = useMemo<Column<PodPlanSummary>[]>(
    () => [
      {
        key: "code",
        label: "PLAN",
        width: 200,
        render: (_, plan) => (
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-[#111827]">
              {plan.code}
            </span>
            <span className="text-xs text-[#9CA3AF]">
              Created {formatDate(plan.createdAt)}
            </span>
          </div>
        ),
      },
      {
        key: "amount",
        label: "AMOUNT",
        width: 140,
        render: (value: number) => (
          <span className="text-sm text-[#374151]">
            {formatCurrency(value)}
          </span>
        ),
      },
      {
        key: "lifecycleWeeks",
        label: "LIFECYCLE",
        width: 120,
        render: (value: number) => (
          <span className="text-sm text-[#374151]">
            {formatLifecycle(value)}
          </span>
        ),
      },
      {
        key: "maxMembers",
        label: "MEMBERS",
        width: 120,
        render: (value: number) => (
          <span className="text-sm text-[#374151]">{value} members</span>
        ),
      },
      {
        key: "usage",
        label: "PODS",
        render: (_, plan) => (
          <div className="flex flex-col text-sm text-[#374151]">
            <span>{plan.totalPods} pods created</span>
            <span className="text-xs text-[#9CA3AF]">
              {plan.podsWithMembers} active pods
            </span>
          </div>
        ),
      },
      {
        key: "active",
        label: "STATUS",
        width: 120,
        render: (value: boolean) => <PodPlanStatusBadge active={value} />,
      },
      {
        key: "actions",
        label: "",
        width: 80,
        render: (_, plan) => (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4 text-[#6B7280]" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-40">
                <DropdownMenuItem
                  onSelect={(event) => {
                    event.preventDefault();
                    if (plan.canEdit) {
                      setDialogMode({ type: "edit", plan });
                    }
                  }}
                  disabled={!plan.canEdit}
                >
                  Edit plan
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={(event) => {
                    event.preventDefault();
                    if (plan.canDelete) {
                      setDeleteCandidate(plan);
                    }
                  }}
                  disabled={!plan.canDelete}
                  className="text-rose-600 focus:text-rose-700"
                >
                  Delete plan
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
      },
    ],
    [],
  );

  const handleSubmit = (values: PodPlanFormValues) => {
    setLastError(null);
    if (dialogMode?.type === "edit") {
      updatePlan({
        planId: dialogMode.plan.id,
        payload: values,
      });
    } else {
      createPlan(values);
    }
  };

  const activeDialog =
    dialogMode != null
      ? {
          open: true,
          title:
            dialogMode.type === "edit" ? "Edit pod plan" : "Create pod plan",
          submitLabel:
            dialogMode.type === "edit" ? "Save changes" : "Create plan",
          defaultValues:
            dialogMode.type === "edit"
              ? ({
                  code: dialogMode.plan.code,
                  amount: dialogMode.plan.amount,
                  lifecycleWeeks: dialogMode.plan.lifecycleWeeks,
                  maxMembers: dialogMode.plan.maxMembers,
                  active: dialogMode.plan.active,
                } satisfies PodPlanFormValues)
              : undefined,
        }
      : null;

  return (
    <section className="space-y-6">
      <header className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-[22px] font-semibold text-[#111827] md:text-[24px]">
              Pod Plans Management
            </h1>
            <p className="text-sm text-[#6B7280]">
              Configure the pod templates available to your community.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {/* <Button
              variant="outline"
              className="rounded-xl h-9 px-3 inline-flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </Button> */}
            <Button
              className="rounded-xl bg-[#FF8C42] hover:bg-[#f77f2f] text-white"
              onClick={() => {
                setDialogMode({ type: "create" });
                setLastError(null);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              New plan
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by code or amount"
              className="pl-9"
              aria-label="Search pod plans"
            />
          </div>
          <div className="text-xs font-medium uppercase tracking-wide text-[#9CA3AF]">
            Total plans: <span className="text-[#111827]">{totalCount}</span>
          </div>
          {isFetching && !isLoading && (
            <div className="inline-flex items-center gap-2 text-xs text-[#6B7280]">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Updating results…
            </div>
          )}
        </div>

        {isError && error && (
          <ErrorBanner
            error={error}
            onRetry={() => {
              void refetch();
            }}
          />
        )}
      </header>

      <DataTable<PodPlanSummary>
        title=""
        data={plans}
        columns={columns}
        showCheckboxes={false}
        searchable={false}
        filterable={false}
        page={page}
        pageSize={pageSize}
        totalCount={totalCount}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        pageSizeOptions={PAGE_SIZE_OPTIONS}
        loading={isFetching}
        onRefresh={() => {
          void refetch();
        }}
        emptyStateTitle={
          isLoading ? "Loading pod plans…" : "No pod plans found"
        }
        emptyStateDescription={
          isLoading
            ? "Fetching pod plans."
            : "Try adjusting your search to explore other plans."
        }
        className="mt-2"
      />

      {activeDialog && (
        <PodPlanFormDialog
          open={activeDialog.open}
          title={activeDialog.title}
          submitLabel={activeDialog.submitLabel}
          defaultValues={activeDialog.defaultValues}
          loading={isCreating || isUpdating}
          errorMessage={lastError}
          onOpenChange={(open) => {
            if (!open) {
              setDialogMode(null);
              setLastError(null);
            }
          }}
          onSubmit={handleSubmit}
        />
      )}

      <ConfirmDeleteDialog
        open={deleteCandidate != null}
        onOpenChange={(open) => {
          if (!open) setDeleteCandidate(null);
        }}
        title="Delete pod plan"
        itemName={deleteCandidate?.code}
        onConfirm={() => {
          if (!deleteCandidate) return;
          return new Promise<void>((resolve, reject) => {
            deletePlan(
              { planId: deleteCandidate.id },
              {
                onSuccess: () => {
                  toast.success("Pod plan removed");
                  setDeleteCandidate(null);
                  resolve();
                },
                onError: (mutationError) => {
                  const message =
                    mutationError.response?.data?.message ??
                    mutationError.message ??
                    "Unable to delete pod plan.";
                  toast.error(message);
                  reject(mutationError);
                },
              },
            );
          });
        }}
      />
    </section>
  );
}
