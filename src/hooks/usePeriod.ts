"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCallback } from "react";
import { DEFAULT_PERIOD, PERIODS } from "@/constants/dashboard";
import type { PeriodId } from "@/types/dashboard";

const VALID_PERIODS = new Set(PERIODS.map((p) => p.id));

export function usePeriod() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const rawPeriod = searchParams.get("period");
  const activePeriod: PeriodId =
    rawPeriod && VALID_PERIODS.has(rawPeriod as PeriodId)
      ? (rawPeriod as PeriodId)
      : DEFAULT_PERIOD;

  const setActivePeriod = useCallback(
    (period: PeriodId) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("period", period);
      router.push(`${pathname}?${params.toString()}`);
    },
    [searchParams, router, pathname]
  );

  return { activePeriod, setActivePeriod };
}
