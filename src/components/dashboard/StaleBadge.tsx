"use client";

import { cn } from "@/lib/cn";

interface StaleBadgeProps {
  isStale: boolean;
}

export function StaleBadge({ isStale }: StaleBadgeProps) {
  if (!isStale) return null;

  return (
    <span
      className="relative inline-flex"
      title="Data may be outdated. Click Refresh to update."
    >
      <span className="inline-block h-2 w-2 rounded-full bg-warning-500" aria-hidden="true" />
      <span className="sr-only">Data may be outdated</span>
    </span>
  );
}
