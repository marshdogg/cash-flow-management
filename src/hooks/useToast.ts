"use client";

import { useContext } from "react";
import { ToastContext } from "@/components/shared/ToastProvider";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastOptions {
  type: ToastType;
  message: string;
  duration?: number;
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
