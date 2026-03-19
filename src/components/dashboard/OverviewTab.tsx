"use client";

import { useRouter } from "next/navigation";
import { KpiGrid } from "./KpiGrid";
import { FocusSection } from "./FocusSection";
import { QuickStats } from "./QuickStats";
import type { OverviewResponse, DashboardTask, KpiVariant } from "@/types/dashboard";

interface OverviewTabProps {
  data: OverviewResponse;
  tasks: DashboardTask[];
  taskTotal: number;
  taskHasMore: boolean;
  isFomContext: boolean;
  completingIds: Set<string>;
  slidingOutIds: Set<string>;
  shakingIds: Set<string>;
  disabledIds: Set<string>;
  onToggleTask: (taskId: string) => void;
}

export function OverviewTab({
  data,
  tasks,
  taskTotal,
  taskHasMore,
  isFomContext,
  completingIds,
  slidingOutIds,
  shakingIds,
  disabledIds,
  onToggleTask,
}: OverviewTabProps) {
  const router = useRouter();

  const kpiItems: { label: string; data: OverviewResponse["kpis"][keyof OverviewResponse["kpis"]]; variant?: KpiVariant; onClick?: () => void }[] = [
    { label: "Revenue", data: data.kpis.revenue, variant: "highlight", onClick: () => router.push("/projects?status=completed") },
    { label: "Gross Profit", data: data.kpis.grossProfit, onClick: () => router.push("/projects?view=profitability") },
    {
      label: "Close Rate",
      data: data.kpis.closeRate,
      variant: data.kpis.closeRate.alert ? "alert" : undefined,
      onClick: () => router.push("/funnel"),
    },
    { label: "Callback Rate", data: data.kpis.callbackRate, onClick: () => router.push("/customer-care") },
  ];

  const focusItems = [
    data.focus.qualCallsNeeded,
    data.focus.estimatesScheduled,
    data.focus.followUpsDue,
    data.focus.projectsInProgress,
    data.focus.casesNeedingAttention,
  ];

  return (
    <div
      role="tabpanel"
      id="tabpanel-overview"
      aria-labelledby="tab-overview"
      className="space-y-6"
    >
      {/* KPI Cards */}
      <KpiGrid items={kpiItems} />

      {/* Two-column layout: Focus + Quick Stats */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
        {/* Column 1: Today's Focus + My Tasks */}
        <FocusSection
          focusItems={focusItems}
          tasks={tasks}
          taskTotal={taskTotal}
          taskHasMore={taskHasMore}
          isFomContext={isFomContext}
          completingIds={completingIds}
          slidingOutIds={slidingOutIds}
          shakingIds={shakingIds}
          disabledIds={disabledIds}
          onToggleTask={onToggleTask}
        />

        {/* Column 2: Quick Stats */}
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <h2 className="text-[15px] font-semibold text-gray-900">Quick Stats</h2>
          <div className="mt-3">
            <QuickStats
              completedJobs={data.quickStats.completedJobs}
              inPipeline={data.quickStats.inPipeline}
              collected={data.quickStats.collected}
              outstanding={data.quickStats.outstanding}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
