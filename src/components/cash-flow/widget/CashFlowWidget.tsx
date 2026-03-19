"use client";

import Link from "next/link";
import useSWR from "swr";
import { cn } from "@/lib/cn";
import { DollarSign } from "lucide-react";
import { fetchWidget } from "@/lib/cash-flow/cash-flow-api";
import type { CashFlowWidgetResponse } from "@/types/cash-flow";
import {
  HEALTH_COLORS,
  CASH_FLOW_ROUTES,
  EMPTY_STATE_MESSAGES,
  CASH_FLOW_DEDUPING_INTERVAL,
} from "@/constants/cash-flow";
import { formatRelativeDate, getTcpColor } from "@/lib/cash-flow/format-utils";
import { track } from "@/lib/analytics";

interface CashFlowWidgetProps {
  franchiseId: string;
}

export function CashFlowWidget({ franchiseId }: CashFlowWidgetProps) {
  const { data, isLoading } = useSWR<CashFlowWidgetResponse>(
    ["cash-flow-widget", franchiseId],
    () => fetchWidget(franchiseId),
    {
      dedupingInterval: CASH_FLOW_DEDUPING_INTERVAL,
      revalidateOnFocus: true,
      errorRetryCount: 3,
    }
  );

  if (isLoading) {
    return (
      <div className="animate-pulse rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
        <div className="mb-3 h-4 w-24 rounded bg-neutral-200" />
        <div className="mb-2 h-6 w-32 rounded bg-neutral-200" />
        <div className="h-3 w-20 rounded bg-neutral-200" />
      </div>
    );
  }

  const isNoData = !data || data.tcp.value === null;

  return (
    <Link
      href={CASH_FLOW_ROUTES.dashboard}
      onClick={() => {
        track("cash_flow_widget_clicked", {
          franchise_id: franchiseId,
          health_status: data?.health.status ?? "not_available",
        });
      }}
      className="block min-w-[280px] rounded-lg border border-neutral-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
      aria-label="Cash Flow Guide — click to view dashboard"
    >
      <div className="flex items-center gap-2 text-xs font-medium text-neutral-500">
        <DollarSign className="h-4 w-4" />
        Cash Flow Guide
      </div>

      {isNoData ? (
        <>
          <p className="mt-2 text-lg font-bold text-neutral-400">
            {EMPTY_STATE_MESSAGES.widget.title}
          </p>
          <p className="mt-1 text-xs text-neutral-400">
            {EMPTY_STATE_MESSAGES.widget.description}
          </p>
        </>
      ) : (
        <>
          <p
            className={cn("mt-2 text-lg font-bold", getTcpColor(data.tcp.value))}
          >
            {data.tcp.formattedValue}
          </p>

          <div className="mt-2 flex items-center justify-between">
            <span
              className={cn(
                "text-xs font-medium",
                HEALTH_COLORS[data.health.status]
              )}
            >
              {data.health.label}
            </span>
            <span className="text-xs text-neutral-400">
              {formatRelativeDate(data.lastReviewed)}
            </span>
          </div>
        </>
      )}
    </Link>
  );
}
