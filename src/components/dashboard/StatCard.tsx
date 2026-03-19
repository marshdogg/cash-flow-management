"use client";

import Link from "next/link";
import { cn } from "@/lib/cn";
import type { StatData } from "@/types/dashboard";

interface StatCardProps {
  label: string;
  data: StatData;
}

export function StatCard({ label, data }: StatCardProps) {
  const isNull = data.value === null;
  const displayValue = isNull ? "—" : (data.formattedValue || "—");

  const ariaLabel = isNull
    ? `${label}: no data available`
    : `${label}: ${data.formattedValue}`;

  return (
    <Link
      href={data.destinationUrl}
      aria-label={ariaLabel}
      className={cn(
        "block rounded-lg border border-gray-200 p-4 transition-all",
        "hover:shadow-md hover:border-gray-300",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2",
        isNull && "bg-white",
        !isNull && data.style === "success" && "bg-success-50",
        !isNull && data.style === "alert" && "bg-danger-50",
        !isNull && data.style === "standard" && "bg-white"
      )}
    >
      <p className="text-xs text-gray-500">{label}</p>
      <p className={cn(
        "mt-1 text-stat-value",
        isNull ? "text-gray-500" :
        data.style === "success" ? "text-success-600" :
        data.style === "alert" ? "text-danger-600" :
        "text-gray-900"
      )}>
        {displayValue}
      </p>
      {!isNull && <p className="mt-1 text-xs text-gray-500">{data.subtitle}</p>}
    </Link>
  );
}
