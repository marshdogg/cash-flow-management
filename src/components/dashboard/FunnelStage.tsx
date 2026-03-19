"use client";

import Link from "next/link";
import { cn } from "@/lib/cn";
import { TrendBadge } from "./TrendBadge";
import type { PipelineStage } from "@/types/dashboard";

interface FunnelStageProps {
  stage: PipelineStage;
}

export function FunnelStage({ stage }: FunnelStageProps) {
  const isNull = stage.count === null;
  const displayCount = isNull ? "—" : stage.count;

  const ariaLabel = isNull
    ? `${stage.name}: no data available`
    : `${stage.name}: ${stage.count} deals`;

  return (
    <Link
      href={stage.destinationUrl}
      aria-label={ariaLabel}
      className={cn(
        "flex flex-col items-center gap-1 rounded-lg border border-gray-200 bg-white px-4 py-3 transition-all",
        "hover:shadow-md hover:border-gray-300",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
      )}
    >
      <span className="text-[11px] text-gray-500">{stage.name}</span>
      <span className={cn("text-funnel-value", isNull ? "text-gray-500" : "text-gray-900")}>{displayCount}</span>
      {!isNull && <TrendBadge direction={stage.trend.direction} percentage={stage.trend.percentage} />}
    </Link>
  );
}
