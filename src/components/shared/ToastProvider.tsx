"use client";

import { createContext, useCallback, useReducer, useRef, useEffect } from "react";
import { cn } from "@/lib/cn";
import { track } from "@/lib/analytics";

// ─── Types ──────────────────────────────────────────────────────────

export type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration: number;
  exiting: boolean;
}

interface ToastContextValue {
  showToast: (type: ToastType, message: string, duration?: number) => void;
  dismissToast: (id: string) => void;
}

// ─── Context ────────────────────────────────────────────────────────

export const ToastContext = createContext<ToastContextValue | null>(null);

// ─── Reducer ────────────────────────────────────────────────────────

type Action =
  | { type: "ADD"; toast: Toast }
  | { type: "EXIT"; id: string }
  | { type: "REMOVE"; id: string };

function toastReducer(state: Toast[], action: Action): Toast[] {
  switch (action.type) {
    case "ADD":
      return [...state, action.toast];
    case "EXIT":
      return state.map((t) => (t.id === action.id ? { ...t, exiting: true } : t));
    case "REMOVE":
      return state.filter((t) => t.id !== action.id);
    default:
      return state;
  }
}

// ─── Toast Config ───────────────────────────────────────────────────

const TOAST_CONFIG: Record<ToastType, { icon: string; borderColor: string }> = {
  success: { icon: "✅", borderColor: "border-l-success-600" },
  error: { icon: "❌", borderColor: "border-l-danger-600" },
  warning: { icon: "⚠️", borderColor: "border-l-warning-500" },
  info: { icon: "ℹ️", borderColor: "border-l-[#3b82f6]" },
};

const DEFAULT_DURATION = 4000;

// ─── Individual Toast ───────────────────────────────────────────────

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: (id: string) => void;
}) {
  const config = TOAST_CONFIG[toast.type];

  return (
    <div
      role="status"
      className={cn(
        "flex items-start gap-3 rounded-lg border-l-4 bg-white px-4 py-3 shadow-md",
        "transition-all duration-200",
        toast.exiting ? "translate-x-full opacity-0" : "translate-x-0 opacity-100",
        config.borderColor
      )}
      style={{ width: 360, maxHeight: 120 }}
    >
      <span className="shrink-0 text-base" aria-hidden="true">
        {config.icon}
      </span>
      <p className="flex-1 text-[13px] text-gray-700">{toast.message}</p>
      <button
        onClick={() => onDismiss(toast.id)}
        className="shrink-0 text-gray-400 hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded"
        aria-label="Dismiss notification"
      >
        ×
      </button>
    </div>
  );
}

// ─── Provider ───────────────────────────────────────────────────────

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, dispatch] = useReducer(toastReducer, []);
  const counterRef = useRef(0);
  const timersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Cleanup timers on unmount
  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, []);

  const dismissToast = useCallback((id: string) => {
    // Clear auto-dismiss timer
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }

    // Start exit animation
    dispatch({ type: "EXIT", id });

    // Remove after animation
    setTimeout(() => {
      dispatch({ type: "REMOVE", id });
    }, 200);
  }, []);

  const showToast = useCallback(
    (type: ToastType, message: string, duration = DEFAULT_DURATION) => {
      const id = `toast-${++counterRef.current}`;
      const toast: Toast = { id, type, message, duration, exiting: false };

      dispatch({ type: "ADD", toast });

      // Track analytics
      track("dashboard_toast_shown", {
        toast_type: type,
        toast_message: message,
      });

      // Auto-dismiss timer
      const timer = setTimeout(() => {
        timersRef.current.delete(id);
        dismissToast(id);
      }, duration);

      timersRef.current.set(id, timer);
    },
    [dismissToast]
  );

  return (
    <ToastContext.Provider value={{ showToast, dismissToast }}>
      {children}

      {/* Toast Container — fixed bottom-right */}
      {toasts.length > 0 && (
        <div
          aria-live="polite"
          className="fixed bottom-4 right-4 z-50 flex flex-col gap-2"
        >
          {toasts.map((toast) => (
            <ToastItem key={toast.id} toast={toast} onDismiss={dismissToast} />
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
}
