"use client";

import { RefreshButton } from "./RefreshButton";
import { StaleBadge } from "./StaleBadge";
import type { RefreshState } from "@/types/dashboard";

interface DashboardHeaderProps {
  franchiseName: string;
  periodLabel: string;
  lastUpdate: string | null;
  isStale: boolean;
  refreshState: RefreshState;
  onRefresh: () => void;
}

export function DashboardHeader({
  franchiseName,
  periodLabel,
  lastUpdate,
  isStale,
  refreshState,
  onRefresh,
}: DashboardHeaderProps) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-[13px] text-gray-500 truncate max-w-[300px]" title={`${periodLabel} · ${franchiseName}`}>
          {periodLabel} · {franchiseName}
        </p>
      </div>

      <div className="flex items-center gap-3">
        {lastUpdate && (
          <span className="flex items-center gap-1.5 text-xs text-gray-500">
            Last update: {lastUpdate}
            <StaleBadge isStale={isStale} />
          </span>
        )}
        <RefreshButton state={refreshState} onClick={onRefresh} />
      </div>
    </div>
  );
}
