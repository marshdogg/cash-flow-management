"use client";

import { cn } from "@/lib/cn";

interface SkeletonCardProps {
  lines?: number;
  hasChart?: boolean;
  className?: string;
}

export function SkeletonCard({
  lines = 3,
  hasChart = false,
  className,
}: SkeletonCardProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg border border-neutral-200 bg-white p-6 shadow-sm",
        className
      )}
      aria-hidden="true"
    >
      {/* Title skeleton */}
      <div className="mb-4 h-4 w-1/3 rounded bg-neutral-200" />

      {/* Value skeleton */}
      <div className="mb-6 h-8 w-1/2 rounded bg-neutral-200" />

      {/* Line skeletons */}
      {Array.from({ length: lines }, (_, i) => (
        <div
          key={i}
          className={cn("mb-2 h-3 rounded bg-neutral-200", {
            "w-full": i === 0,
            "w-4/5": i === 1,
            "w-3/5": i >= 2,
          })}
        />
      ))}

      {/* Chart skeleton */}
      {hasChart && (
        <div className="mt-4 h-40 w-full rounded bg-neutral-200" />
      )}
    </div>
  );
}
