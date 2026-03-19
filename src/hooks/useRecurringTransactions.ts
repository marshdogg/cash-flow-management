"use client";

import useSWR from "swr";
import { useRef, useCallback } from "react";
import type {
  RecurringTransactionsResponse,
  CreateTransactionRequest,
  UpdateTransactionRequest,
  BulkAction,
} from "@/types/cash-flow";
import {
  fetchRecurringTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  bulkActionTransactions,
} from "@/lib/cash-flow/cash-flow-api";
import { CASH_FLOW_DEDUPING_INTERVAL } from "@/constants/cash-flow";

export function useRecurringTransactions(franchiseId: string) {
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetcher = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      return await fetchRecurringTransactions(franchiseId, {
        signal: controller.signal,
      });
    } finally {
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
      }
    }
  }, [franchiseId]);

  const { data, error, isLoading, mutate } =
    useSWR<RecurringTransactionsResponse>(
      ["cash-flow-recurring", franchiseId],
      fetcher,
      {
        dedupingInterval: CASH_FLOW_DEDUPING_INTERVAL,
        revalidateOnFocus: true,
        errorRetryCount: 3,
        onError: (err) => {
          if (err.name === "AbortError") return;
          console.error("Recurring transactions error:", err);
        },
      }
    );

  const handleCreate = useCallback(
    async (request: CreateTransactionRequest) => {
      const result = await createTransaction(franchiseId, request);
      await mutate();
      return result;
    },
    [franchiseId, mutate]
  );

  const handleUpdate = useCallback(
    async (transactionId: string, request: UpdateTransactionRequest) => {
      const result = await updateTransaction(transactionId, request);
      await mutate();
      return result;
    },
    [mutate]
  );

  const handleDelete = useCallback(
    async (transactionId: string) => {
      await deleteTransaction(transactionId);
      await mutate();
    },
    [mutate]
  );

  const handleBulkAction = useCallback(
    async (transactionIds: string[], action: BulkAction) => {
      await bulkActionTransactions(transactionIds, action);
      await mutate();
    },
    [mutate]
  );

  return {
    transactions: data?.transactions ?? [],
    meta: data?.meta ?? { total: 0, activeCount: 0, totalMonthlyRecurring: 0, incomeCount: 0, expenseCount: 0 },
    isLoading,
    error,
    mutate,
    createTransaction: handleCreate,
    updateTransaction: handleUpdate,
    deleteTransaction: handleDelete,
    bulkAction: handleBulkAction,
  };
}
