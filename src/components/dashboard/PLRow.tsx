"use client";

import { cn } from "@/lib/cn";
import type { PLLine } from "@/types/dashboard";

interface PLRowProps {
  line: PLLine;
}

export function PLRow({ line }: PLRowProps) {
  const isNull = line.amount === null;
  const displayAmount = isNull ? "—" : line.formattedAmount;

  return (
    <div
      className={cn(
        "flex items-center justify-between py-2",
        line.style === "standard" && "text-sm text-gray-700",
        line.style === "subtotal" && "text-sm font-semibold text-gray-900 border-t border-gray-200 pt-3",
        line.style === "total" && "text-base font-bold text-gray-900 border-t-2 border-gray-900 pt-3 mt-1"
      )}
    >
      <span>{line.label}</span>
      <span className={cn(!isNull && line.amount !== null && line.amount < 0 && "text-danger-600", isNull && "text-gray-500")}>
        {displayAmount}
      </span>
    </div>
  );
}
