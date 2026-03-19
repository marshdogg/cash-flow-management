"use client";

import useSWR from "swr";
import { useRef, useCallback } from "react";
import type {
  RevenueItemsResponse,
  UpdateRevenueItemRequest,
  CreateRevenueItemRequest,
} from "@/types/cash-flow";
import {
  fetchRevenueItems,
  updateRevenueItem,
  deleteRevenueItems,
  createRevenueItem,
} from "@/lib/cash-flow/cash-flow-api";
import { CASH_FLOW_DEDUPING_INTERVAL } from "@/constants/cash-flow";

export function useRevenueItems(franchiseId: string) {
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetcher = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      return await fetchRevenueItems(franchiseId, {
        signal: controller.signal,
      });
    } finally {
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
      }
    }
  }, [franchiseId]);

  const { data, error, isLoading, mutate } =
    useSWR<RevenueItemsResponse>(
      ["cash-flow-revenue-items", franchiseId],
      fetcher,
      {
        dedupingInterval: CASH_FLOW_DEDUPING_INTERVAL,
        revalidateOnFocus: true,
        errorRetryCount: 3,
        onError: (err) => {
          if (err.name === "AbortError") return;
          console.error("Revenue items error:", err);
        },
      }
    );

  const handleCreate = useCallback(
    async (data: CreateRevenueItemRequest) => {
      await createRevenueItem(franchiseId, data);
      await mutate();
    },
    [franchiseId, mutate]
  );

  const handleUpdate = useCallback(
    async (itemId: string, request: UpdateRevenueItemRequest) => {
      await updateRevenueItem(itemId, request);
      await mutate();
    },
    [mutate]
  );

  const handleDelete = useCallback(
    async (ids: string[]) => {
      await deleteRevenueItems(ids);
      await mutate();
    },
    [mutate]
  );

  return {
    items: data?.items ?? [],
    meta: data?.meta ?? {
      total: 0,
      arCount: 0,
      salesCount: 0,
      proposalCount: 0,
      openCount: 0,
      collectedCount: 0,
      totalGross: 0,
      totalAdjusted: 0,
    },
    isLoading,
    error,
    mutate,
    createItem: handleCreate,
    updateItem: handleUpdate,
    deleteItems: handleDelete,
  };
}
