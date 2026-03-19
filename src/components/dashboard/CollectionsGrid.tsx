"use client";

import { StatCard } from "./StatCard";
import type { StatData } from "@/types/dashboard";

interface CollectionsGridProps {
  invoiced: StatData;
  collected: StatData;
  outstanding: StatData;
  avgDaysToPay: StatData;
}

export function CollectionsGrid({ invoiced, collected, outstanding, avgDaysToPay }: CollectionsGridProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <StatCard label="Invoiced" data={invoiced} />
      <StatCard label="Collected" data={collected} />
      <StatCard label="Outstanding" data={outstanding} />
      <StatCard label="Avg. Days to Pay" data={avgDaysToPay} />
    </div>
  );
}
