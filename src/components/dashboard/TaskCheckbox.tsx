"use client";

import { cn } from "@/lib/cn";

interface TaskCheckboxProps {
  checked: boolean;
  completing: boolean;
  shaking: boolean;
  disabled: boolean;
  onToggle: () => void;
  taskTitle: string;
}

export function TaskCheckbox({
  checked,
  completing,
  shaking,
  disabled,
  onToggle,
  taskTitle,
}: TaskCheckboxProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked || completing}
      aria-label={`Mark "${taskTitle}" as complete`}
      disabled={disabled}
      onClick={onToggle}
      className={cn(
        "flex h-11 w-11 items-center justify-center",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2",
        "rounded-full",
        disabled && "cursor-not-allowed opacity-50"
      )}
    >
      <span
        className={cn(
          "flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all",
          (checked || completing) && "border-success-600 bg-success-600 animate-check-pop",
          !(checked || completing) && "border-gray-300 bg-white hover:border-gray-500",
          shaking && "animate-shake"
        )}
      >
        {(checked || completing) && (
          <svg className="h-3 w-3 text-white" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
    </button>
  );
}
