"use client";

import { useState, useRef, useCallback } from "react";
import { UNDO_WINDOW_MS, CHECKBOX_DEBOUNCE_MS } from "@/constants/dashboard";
import type { DashboardTask } from "@/types/dashboard";

interface TaskCompletionState {
  completingIds: Set<string>;
  slidingOutIds: Set<string>;
  shakingIds: Set<string>;
  disabledIds: Set<string>;
}

interface UseTaskCompletionOptions {
  tasks: DashboardTask[];
  onComplete: (taskId: string) => Promise<void>;
  onUndoComplete: (taskId: string) => void;
}

export function useTaskCompletion({ tasks, onComplete, onUndoComplete }: UseTaskCompletionOptions) {
  const [state, setState] = useState<TaskCompletionState>({
    completingIds: new Set(),
    slidingOutIds: new Set(),
    shakingIds: new Set(),
    disabledIds: new Set(),
  });

  // Timers for undo window and slide-out
  const undoTimers = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const slideTimers = useRef<Map<string, NodeJS.Timeout>>(new Map());
  // Debounce guard
  const lastToggle = useRef<Map<string, number>>(new Map());

  const toggleTask = useCallback(
    (taskId: string) => {
      // Debounce check
      const now = Date.now();
      const lastTime = lastToggle.current.get(taskId) ?? 0;
      if (now - lastTime < CHECKBOX_DEBOUNCE_MS) return;
      lastToggle.current.set(taskId, now);

      // If already completing → undo
      if (state.completingIds.has(taskId)) {
        // Cancel pending PATCH
        const timer = undoTimers.current.get(taskId);
        if (timer) {
          clearTimeout(timer);
          undoTimers.current.delete(taskId);
        }

        setState((prev) => {
          const next = { ...prev };
          next.completingIds = new Set(prev.completingIds);
          next.completingIds.delete(taskId);
          return next;
        });

        onUndoComplete(taskId);
        return;
      }

      // Mark as completing (optimistic UI)
      setState((prev) => {
        const next = { ...prev };
        next.completingIds = new Set(prev.completingIds);
        next.completingIds.add(taskId);
        return next;
      });

      // Start undo window timer → fire PATCH after 3 seconds
      const timer = setTimeout(async () => {
        undoTimers.current.delete(taskId);

        try {
          await onComplete(taskId);

          // Slide out animation
          setState((prev) => {
            const next = { ...prev };
            next.slidingOutIds = new Set(prev.slidingOutIds);
            next.slidingOutIds.add(taskId);
            next.completingIds = new Set(prev.completingIds);
            next.completingIds.delete(taskId);
            return next;
          });

          // Remove from DOM after slide animation (300ms)
          const slideTimer = setTimeout(() => {
            setState((prev) => {
              const next = { ...prev };
              next.slidingOutIds = new Set(prev.slidingOutIds);
              next.slidingOutIds.delete(taskId);
              return next;
            });
            slideTimers.current.delete(taskId);
          }, 300);
          slideTimers.current.set(taskId, slideTimer);
        } catch (error) {
          // Revert — shake animation
          setState((prev) => {
            const next = { ...prev };
            next.completingIds = new Set(prev.completingIds);
            next.completingIds.delete(taskId);
            next.shakingIds = new Set(prev.shakingIds);
            next.shakingIds.add(taskId);
            return next;
          });

          // Clear shake after animation
          setTimeout(() => {
            setState((prev) => {
              const next = { ...prev };
              next.shakingIds = new Set(prev.shakingIds);
              next.shakingIds.delete(taskId);
              return next;
            });
          }, 200);
        }
      }, UNDO_WINDOW_MS);

      undoTimers.current.set(taskId, timer);
    },
    [state.completingIds, onComplete, onUndoComplete]
  );

  // Filter out tasks that have completed the slide-out
  const visibleTasks = tasks.filter(
    (t) => !state.slidingOutIds.has(t.id)
  );

  return {
    ...state,
    toggleTask,
    visibleTasks,
    isCompletingAny: state.completingIds.size > 0,
  };
}
