"use client";

import { cn } from "@/lib/cn";

interface AlertBannerProps {
  type: "error" | "session-expired";
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function AlertBanner({ type, message, actionLabel, onAction }: AlertBannerProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg border-l-4 p-4",
        type === "error" && "border-l-danger-600 bg-danger-50",
        type === "session-expired" && "border-l-warning-500 bg-warning-50"
      )}
      role="alert"
    >
      <span className="text-lg" aria-hidden="true">
        {type === "error" ? "❌" : "⚠️"}
      </span>
      <p className="flex-1 text-sm text-gray-700">{message}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className={cn(
            "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2",
            type === "error" && "bg-danger-600 text-white hover:bg-red-700",
            type === "session-expired" && "bg-warning-500 text-white hover:bg-amber-600"
          )}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
