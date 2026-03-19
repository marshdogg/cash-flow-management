"use client";

import useSWR, { type SWRConfiguration } from "swr";
import { useRef, useCallback } from "react";
import type { CashFlowDashboardResponse } from "@/types/cash-flow";
import { fetchDashboard } from "@/lib/cash-flow/cash-flow-api";
import {
  CASH_FLOW_REFRESH_INTERVAL,
  CASH_FLOW_DEDUPING_INTERVAL,
} from "@/constants/cash-flow";

const SWR_CONFIG: SWRConfiguration = {
  dedupingInterval: CASH_FLOW_DEDUPING_INTERVAL,
  revalidateOnFocus: true,
  refreshWhenHidden: false,
  refreshInterval: CASH_FLOW_REFRESH_INTERVAL,
  errorRetryCount: 3,
};

export function useCashFlowDashboard(franchiseId: string) {
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetcher = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      return await fetchDashboard(franchiseId, {
        signal: controller.signal,
      });
    } finally {
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
      }
    }
  }, [franchiseId]);

  const { data, error, isLoading, isValidating, mutate } =
    useSWR<CashFlowDashboardResponse>(
      ["cash-flow-dashboard", franchiseId],
      fetcher,
      {
        ...SWR_CONFIG,
        onError: (err) => {
          if (err.name === "AbortError") return;
          console.error("Cash flow dashboard error:", err);
        },
      }
    );

  return {
    data,
    error,
    isLoading,
    isValidating,
    mutate,
    isSessionExpired: error?.code === "SESSION_EXPIRED",
  };
}
