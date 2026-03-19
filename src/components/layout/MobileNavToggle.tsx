"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";

interface MobileNavToggleProps {
  onToggle: () => void;
  isOpen: boolean;
}

export function MobileNavToggle({ onToggle, isOpen }: MobileNavToggleProps) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        "fixed left-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-lg shadow-lg lg:hidden",
        "bg-white border border-gray-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
      )}
      aria-label={isOpen ? "Close navigation" : "Open navigation"}
      aria-expanded={isOpen}
    >
      <svg className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        {isOpen ? (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        ) : (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        )}
      </svg>
    </button>
  );
}
