"use client";

import { cn } from "@/lib/cn";

interface SectionLoadingProps {
  className?: string;
}

export function SectionLoading({ className }: SectionLoadingProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg",
        className
      )}
    >
      <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
      </div>
    </div>
  );
}
