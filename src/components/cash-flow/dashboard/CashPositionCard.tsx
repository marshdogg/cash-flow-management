"use client";

import { cn } from "@/lib/cn";
import { DollarSign } from "lucide-react";
import { getTcpColor } from "@/lib/cash-flow/format-utils";
import { EMPTY_STATE_MESSAGES } from "@/constants/cash-flow";
import type { HealthStatus } from "@/types/cash-flow";

const HEALTH_BORDER_COLOR: Record<HealthStatus, string> = {
  healthy: "border-t-success-600",
  caution: "border-t-warning-500",
  critical: "border-t-danger-600",
  not_available: "border-t-neutral-200",
};

interface CashPositionCardProps {
  value: number | null;
  formattedValue: string;
  bankBalance: number | null;
  pendingInflows: number;
  pendingOutflows: number;
  healthStatus?: HealthStatus;
}

export function CashPositionCard({
  value,
  formattedValue,
  bankBalance,
  pendingInflows,
  pendingOutflows,
  healthStatus = "not_available",
}: CashPositionCardProps) {
  const isNoData = value === null;

  return (
    <div
      className={cn(
        "rounded-lg border border-neutral-200 border-t-[3px] bg-white p-6 shadow-sm",
        HEALTH_BORDER_COLOR[healthStatus]
      )}
      role="region"
      aria-label="True Cash Position"
    >
      <div className="flex items-center gap-2">
        <DollarSign className="h-5 w-5 text-neutral-400" />
        <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
          True Cash Position
        </p>
      </div>

      <div aria-live="polite" aria-atomic="true">
        <p
          className={cn(
            "mt-2 text-kpi-value",
            isNoData ? "text-neutral-400" : getTcpColor(value)
          )}
        >
          {formattedValue}
        </p>
      </div>

      {isNoData ? (
        <p className="mt-2 text-xs text-neutral-400">
          {EMPTY_STATE_MESSAGES.noDataTcp}
        </p>
      ) : (
        <div className="mt-3 space-y-1 text-xs text-neutral-500">
          <p>
            Bank Balance:{" "}
            <span className="font-medium text-neutral-700">
              ${bankBalance?.toLocaleString("en-US", { minimumFractionDigits: 2 }) ?? "—"}
            </span>
          </p>
          <p>
            + Pending Inflows:{" "}
            <span className="font-medium text-success-600">
              ${pendingInflows.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
          </p>
          <p>
            − Pending Outflows:{" "}
            <span className="font-medium text-danger-600">
              ${pendingOutflows.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
          </p>
        </div>
      )}
    </div>
  );
}
