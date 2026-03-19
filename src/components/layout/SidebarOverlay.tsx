"use client";

import { cn } from "@/lib/cn";

interface SidebarOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SidebarOverlay({ isOpen, onClose }: SidebarOverlayProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-20 bg-black/50 lg:hidden"
      onClick={onClose}
      aria-hidden="true"
    />
  );
}
