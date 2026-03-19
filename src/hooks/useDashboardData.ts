"use client";

import useSWR, { type SWRConfiguration } from "swr";
import { useRef, useCallback } from "react";
import { AUTO_REFRESH_INTERVAL } from "@/constants/dashboard";
import type { PeriodId } from "@/types/dashboard";

const DEFAULT_SWR_CONFIG: SWRConfiguration = {
  dedupingInterval: 2000,
  revalidateOnFocus: true,
  refreshWhenHidden: false,
  refreshInterval: AUTO_REFRESH_INTERVAL,
  errorRetryCount: 3,
};

interface UseDashboardDataOptions<T> {
  key: string;
  period: PeriodId;
  fetcher: (period: PeriodId, options?: { signal?: AbortSignal }) => Promise<T>;
  enabled?: boolean;
}

export function useDashboardData<T>({
  key,
  period,
  fetcher,
  enabled = true,
}: UseDashboardDataOptions<T>) {
  const abortControllerRef = useRef<AbortController | null>(null);

  const swrFetcher = useCallback(async () => {
    // Cancel any in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const data = await fetcher(period, { signal: controller.signal });
      return data;
    } finally {
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
      }
    }
  }, [fetcher, period]);

  const { data, error, isLoading, isValidating, mutate } = useSWR<T>(
    enabled ? [key, period] : null,
    swrFetcher,
    {
      ...DEFAULT_SWR_CONFIG,
      onError: (err) => {
        // AbortError is expected when period changes rapidly
        if (err.name === "AbortError") return;
        console.error(`Dashboard data error [${key}]:`, err);
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
