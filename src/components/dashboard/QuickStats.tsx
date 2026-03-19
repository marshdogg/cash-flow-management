"use client";

import { StatCard } from "./StatCard";
import type { StatData } from "@/types/dashboard";

interface QuickStatsProps {
  completedJobs: StatData;
  inPipeline: StatData;
  collected: StatData;
  outstanding: StatData;
}

export function QuickStats({ completedJobs, inPipeline, collected, outstanding }: QuickStatsProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <StatCard label="Completed Jobs" data={completedJobs} />
      <StatCard label="In Pipeline" data={inPipeline} />
      <StatCard label="Collected" data={collected} />
      <StatCard label="Outstanding" data={outstanding} />
    </div>
  );
}
