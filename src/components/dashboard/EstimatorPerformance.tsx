"use client";

import Link from "next/link";
import { cn } from "@/lib/cn";
import type { EstimatorPerformance as EstimatorType } from "@/types/dashboard";

interface EstimatorPerformanceProps {
  estimators: EstimatorType[];
  totalCount?: number;
}

export function EstimatorPerformance({ estimators, totalCount }: EstimatorPerformanceProps) {
  return (
    <div className="space-y-3">
      {estimators.map((est) => (
        <Link
          key={est.id}
          href={est.profileUrl}
          className={cn(
            "flex items-center gap-3 rounded-md p-3 transition-all",
            "hover:bg-gray-100",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
          )}
        >
          {/* Avatar */}
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-medium text-white"
            style={{ backgroundColor: est.avatarColor }}
            aria-hidden="true"
          >
            {est.name.split(" ").map(n => n[0]).join("")}
          </div>

          {/* Name + Estimates */}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-700 truncate" style={{ maxWidth: "24ch" }}>{est.name}</p>
            <p className="text-xs text-gray-500">{est.estimateCount} estimates</p>
          </div>

          {/* Close Rate — 0% renders in danger red per edge value spec */}
          <span
            aria-label={`Close rate: ${est.closeRate}%`}
            className={cn(
              "text-sm font-semibold",
              est.closeRate === 0 && "text-danger-600",
              est.closeRateStyle === "success" && est.closeRate > 0 && "text-success-600",
              est.closeRateStyle === "warning" && est.closeRate > 0 && "text-warning-500",
              est.closeRateStyle === "danger" && est.closeRate > 0 && "text-danger-600"
            )}
          >
            {est.closeRate}%
          </span>
        </Link>
      ))}

      {totalCount && totalCount > estimators.length && (
        <Link
          href="/technicians"
          className="block text-center text-xs text-primary-500 hover:underline py-2"
        >
          View All {totalCount} Estimators →
        </Link>
      )}
    </div>
  );
}
