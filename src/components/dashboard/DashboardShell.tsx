"use client";

import { useState, useCallback, useEffect, Suspense } from "react";
import { DashboardHeader } from "./DashboardHeader";
import { DashboardTabs } from "./DashboardTabs";
import { PeriodSelector } from "./PeriodSelector";
import { OverviewTab } from "./OverviewTab";
import { SalesTab } from "./SalesTab";
import { ProfitabilityTab } from "./ProfitabilityTab";
import { SectionLoading } from "@/components/shared/SectionLoading";
import { SectionError } from "@/components/shared/SectionError";
import { useActiveTab } from "@/hooks/useActiveTab";
import { usePeriod } from "@/hooks/usePeriod";
import { useTaskCompletion } from "@/hooks/useTaskCompletion";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useToast } from "@/hooks/useToast";
import { STALE_DATA_THRESHOLD, REFRESH_SUCCESS_REVERT_MS, PERIODS } from "@/constants/dashboard";
import {
  trackDashboardViewed,
  trackTabSwitched,
  trackPeriodChanged,
  trackRefreshClicked,
  trackDashboardError,
} from "@/lib/analytics";
import {
  fetchOverview,
  fetchSales,
  fetchProfitability,
  fetchTasks,
} from "@/lib/dashboard-api";
import type { TabId, PeriodId, RefreshState, OverviewResponse, SalesResponse, ProfitabilityResponse, TasksResponse } from "@/types/dashboard";

interface DashboardShellProps {
  allowedTabs: TabId[];
  isFomContext: boolean;
  franchiseName: string;
}

function DashboardShellInner({
  allowedTabs,
  isFomContext,
  franchiseName,
}: DashboardShellProps) {
  const { activeTab, setActiveTab } = useActiveTab(allowedTabs);
  const { activePeriod, setActivePeriod } = usePeriod();
  const { showToast } = useToast();

  const [refreshState, setRefreshState] = useState<RefreshState>("default");
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);

  // Data hooks — replace all direct mock imports
  const overview = useDashboardData<OverviewResponse>({
    key: "overview",
    period: activePeriod,
    fetcher: fetchOverview,
  });

  const sales = useDashboardData<SalesResponse>({
    key: "sales",
    period: activePeriod,
    fetcher: fetchSales,
    enabled: activeTab === "sales",
  });

  const profitability = useDashboardData<ProfitabilityResponse>({
    key: "profitability",
    period: activePeriod,
    fetcher: fetchProfitability,
    enabled: activeTab === "profitability" && allowedTabs.includes("profitability"),
  });

  const tasks = useDashboardData<TasksResponse>({
    key: "tasks",
    period: activePeriod,
    fetcher: fetchTasks,
    enabled: activeTab === "overview",
  });

  // Set initial time and track dashboard view on mount
  useEffect(() => {
    setLastUpdateTime(new Date());
    trackDashboardViewed(activeTab, activePeriod);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Update lastUpdateTime when any data successfully loads
  useEffect(() => {
    if (overview.data && !overview.isValidating) {
      setLastUpdateTime(new Date());
    }
  }, [overview.data, overview.isValidating]);

  // Handle session expired
  useEffect(() => {
    if (overview.isSessionExpired || sales.isSessionExpired || profitability.isSessionExpired) {
      showToast("warning", "Your session has expired. Please refresh the page to continue.");
    }
  }, [overview.isSessionExpired, sales.isSessionExpired, profitability.isSessionExpired, showToast]);

  const periodLabel = PERIODS.find((p) => p.id === activePeriod)?.label ?? activePeriod;

  const lastUpdate = lastUpdateTime
    ? lastUpdateTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : null;
  const isStale = lastUpdateTime
    ? Date.now() - lastUpdateTime.getTime() >= STALE_DATA_THRESHOLD
    : false;

  // Task completion with undo flow + toast error feedback
  const taskCompletion = useTaskCompletion({
    tasks: tasks.data?.data ?? [],
    onComplete: async (taskId: string) => {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "completed" }),
      });
      if (!response.ok) {
        if (response.status === 404) {
          showToast("info", "This task is no longer available.");
        } else {
          showToast("error", "Unable to complete task. Please try again.");
        }
        throw new Error(`Task completion failed: ${response.status}`);
      }
    },
    onUndoComplete: (taskId: string) => {
      // Undo fires silently — no toast needed
      fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "open" }),
      }).catch(() => {
        // Undo failure is non-critical; task state will reconcile on next refresh
      });
    },
  });

  const handleRefresh = useCallback(async () => {
    trackRefreshClicked();
    setRefreshState("loading");

    try {
      await Promise.all([
        overview.mutate(),
        activeTab === "sales" ? sales.mutate() : Promise.resolve(),
        activeTab === "profitability" ? profitability.mutate() : Promise.resolve(),
        activeTab === "overview" ? tasks.mutate() : Promise.resolve(),
      ]);

      setRefreshState("success");
      setLastUpdateTime(new Date());
      showToast("success", "Dashboard data updated.");
      setTimeout(() => setRefreshState("default"), REFRESH_SUCCESS_REVERT_MS);
    } catch {
      setRefreshState("error");
      showToast("error", "Unable to refresh dashboard data. Please try again.");
      trackDashboardError("refresh_failed", "all");
    }
  }, [overview, sales, profitability, tasks, activeTab, showToast]);

  return (
    <div className="space-y-6">
      <DashboardHeader
        franchiseName={franchiseName}
        periodLabel={periodLabel}
        lastUpdate={lastUpdate}
        isStale={isStale}
        refreshState={refreshState}
        onRefresh={handleRefresh}
      />

      <DashboardTabs
        activeTab={activeTab}
        allowedTabs={allowedTabs}
        onTabChange={(tab: TabId) => {
          trackTabSwitched(activeTab, tab);
          setActiveTab(tab);
        }}
      />

      <PeriodSelector
        activePeriod={activePeriod}
        onPeriodChange={(period: PeriodId) => {
          trackPeriodChanged(activePeriod, period);
          setActivePeriod(period);
        }}
      />

      {activeTab === "overview" && (
        <>
          {overview.isLoading && <SectionLoading />}
          {overview.error && !overview.data && <SectionError sectionName="Overview" onRetry={() => overview.mutate()} />}
          {overview.data && (
            <OverviewTab
              data={overview.data}
              tasks={tasks.data?.data ?? []}
              taskTotal={tasks.data?.meta?.total ?? 0}
              taskHasMore={tasks.data?.meta?.hasMore ?? false}
              isFomContext={isFomContext}
              completingIds={taskCompletion.completingIds}
              slidingOutIds={taskCompletion.slidingOutIds}
              shakingIds={taskCompletion.shakingIds}
              disabledIds={taskCompletion.disabledIds}
              onToggleTask={taskCompletion.toggleTask}
            />
          )}
        </>
      )}

      {activeTab === "sales" && (
        <>
          {sales.isLoading && <SectionLoading />}
          {sales.error && !sales.data && <SectionError sectionName="Sales" onRetry={() => sales.mutate()} />}
          {sales.data && <SalesTab data={sales.data} />}
        </>
      )}

      {activeTab === "profitability" && allowedTabs.includes("profitability") && (
        <>
          {profitability.isLoading && <SectionLoading />}
          {profitability.error && !profitability.data && <SectionError sectionName="Profitability" onRetry={() => profitability.mutate()} />}
          {profitability.data && <ProfitabilityTab data={profitability.data} />}
        </>
      )}
    </div>
  );
}

// Wrap in Suspense for useSearchParams
export function DashboardShell(props: DashboardShellProps) {
  return (
    <Suspense fallback={<DashboardShellSkeleton />}>
      <DashboardShellInner {...props} />
    </Suspense>
  );
}

function DashboardShellSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-12 w-48 rounded bg-gray-200" />
      <div className="h-10 w-72 rounded bg-gray-200" />
      <div className="h-8 w-96 rounded bg-gray-200" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 rounded-lg border border-gray-200 bg-white" />
        ))}
      </div>
    </div>
  );
}
