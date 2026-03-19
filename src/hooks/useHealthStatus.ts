"use client";

import { useMemo } from "react";
import type { HealthStatus } from "@/types/cash-flow";
import {
  calculateHealthStatus,
  calculateWeeksOfRunway,
  formatRunway,
} from "@/lib/cash-flow/calculations";
import { HEALTH_LABELS, HEALTH_COLORS } from "@/constants/cash-flow";

interface HealthStatusResult {
  status: HealthStatus;
  weeksOfRunway: number | null;
  label: string;
  color: string;
  formattedRunway: string;
}

export function useHealthStatus(
  tcp: number | null,
  weeklyExpenses: number
): HealthStatusResult {
  return useMemo(() => {
    const status = calculateHealthStatus(tcp, weeklyExpenses);
    const weeksOfRunway = calculateWeeksOfRunway(tcp, weeklyExpenses);

    return {
      status,
      weeksOfRunway,
      label: HEALTH_LABELS[status],
      color: HEALTH_COLORS[status],
      formattedRunway: formatRunway(weeksOfRunway),
    };
  }, [tcp, weeklyExpenses]);
}
