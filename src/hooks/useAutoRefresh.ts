"use client";

import { useRef, useCallback } from "react";

/**
 * Tracks task IDs currently in undo window to exclude from auto-refresh updates.
 * Works with SWR's onSuccess callback to filter refreshed data.
 */
export function useAutoRefresh() {
  const completingTaskIds = useRef<Set<string>>(new Set());

  const addCompletingTask = useCallback((taskId: string) => {
    completingTaskIds.current.add(taskId);
  }, []);

  const removeCompletingTask = useCallback((taskId: string) => {
    completingTaskIds.current.delete(taskId);
  }, []);

  const isTaskCompleting = useCallback((taskId: string) => {
    return completingTaskIds.current.has(taskId);
  }, []);

  return {
    addCompletingTask,
    removeCompletingTask,
    isTaskCompleting,
    completingTaskIds,
  };
}
