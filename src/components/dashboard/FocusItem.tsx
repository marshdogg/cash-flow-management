"use client";

import Link from "next/link";
import { cn } from "@/lib/cn";
import type { FocusItem as FocusItemType } from "@/types/dashboard";

interface FocusItemProps {
  item: FocusItemType;
}

export function FocusItem({ item }: FocusItemProps) {
  return (
    <Link
      href={item.destinationUrl}
      className={cn(
        "flex items-center gap-3 rounded-md p-3 transition-all",
        "hover:border-gray-300",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2",
        item.style === "standard" && "bg-neutral-50 hover:bg-gray-100",
        item.style === "urgent" && "border-l-[3px] border-l-danger-600 bg-danger-50 hover:bg-danger-100",
        item.style === "warning" && "border-l-[3px] border-l-warning-500 bg-warning-50 hover:bg-warning-100"
      )}
    >
      <span className="text-base" aria-hidden="true">{item.icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-sm text-gray-700">{item.title}</p>
        <p className="text-xs text-gray-500">{item.detail}</p>
      </div>
      <span className="text-focus-count text-gray-900">{item.count}</span>
    </Link>
  );
}
