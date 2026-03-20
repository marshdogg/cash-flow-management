"use client";

import { cn } from "@/lib/cn";

interface MetricCardProps {
  label: string;
  value: string;
  subtitle?: string;
  valueColor?: string;
  trend?: string;
  className?: string;
}

export function MetricCard({
  label,
  value,
  subtitle,
  valueColor,
  trend,
  className,
}: MetricCardProps) {
  return (
    <div
      className={cn(
        "rounded-lg bg-white p-5 shadow-sm transition-shadow hover:shadow-md",
        className
      )}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.5px] text-neutral-500">
        {label}
      </p>
      <p
        className={cn(
          "mt-1.5 text-[22px] font-bold leading-tight",
          valueColor ?? "text-neutral-700"
        )}
      >
        {value}
      </p>
      {(subtitle || trend) && (
        <div className="mt-1.5 flex items-center gap-1.5">
          {trend && (
            <span className="text-xs text-neutral-400">{trend}</span>
          )}
          {subtitle && !trend && (
            <span className="text-xs text-neutral-400">{subtitle}</span>
          )}
        </div>
      )}
    </div>
  );
}
