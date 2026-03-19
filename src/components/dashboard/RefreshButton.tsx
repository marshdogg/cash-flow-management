"use client";

import { cn } from "@/lib/cn";
import type { RefreshState } from "@/types/dashboard";

interface RefreshButtonProps {
  state: RefreshState;
  onClick: () => void;
}

export function RefreshButton({ state, onClick }: RefreshButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={state === "loading"}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-[20px] px-4 py-2 text-[13px] font-medium transition-all",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2",
        state === "default" && "border border-primary-500 bg-white text-primary-500 hover:bg-primary-50",
        state === "loading" && "bg-primary-500 text-white cursor-not-allowed",
        state === "success" && "bg-success-600 text-white",
        state === "error" && "border border-danger-600 bg-white text-danger-600 hover:bg-danger-50"
      )}
      aria-label={
        state === "loading" ? "Refreshing data" :
        state === "success" ? "Data updated successfully" :
        state === "error" ? "Refresh failed, click to retry" :
        "Refresh dashboard data"
      }
    >
      {state === "default" && (
        <>
          <span aria-hidden="true">↻</span>
          Refresh
        </>
      )}
      {state === "loading" && (
        <>
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" aria-hidden="true" />
          Refreshing...
        </>
      )}
      {state === "success" && (
        <>
          <span aria-hidden="true">✓</span>
          Updated
        </>
      )}
      {state === "error" && (
        <>
          <span aria-hidden="true">⚠</span>
          Failed · Retry
        </>
      )}
    </button>
  );
}
