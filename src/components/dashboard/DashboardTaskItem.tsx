"use client";

import Link from "next/link";
import { cn } from "@/lib/cn";
import { TaskCheckbox } from "./TaskCheckbox";
import { TASK_TYPE_CONFIG } from "@/constants/dashboard";
import type { DashboardTask } from "@/types/dashboard";

interface DashboardTaskItemProps {
  task: DashboardTask;
  completing: boolean;
  slidingOut: boolean;
  shaking: boolean;
  disabled: boolean;
  onToggle: (taskId: string) => void;
}

export function DashboardTaskItem({
  task,
  completing,
  slidingOut,
  shaking,
  disabled,
  onToggle,
}: DashboardTaskItemProps) {
  const typeConfig = TASK_TYPE_CONFIG[task.type];

  return (
    <div
      className={cn(
        "flex items-start gap-2 rounded-md bg-neutral-50 px-3 py-3 transition-all",
        "hover:bg-gray-100",
        task.isOverdue && "border-l-[3px] border-l-danger-600",
        !task.isOverdue && task.daysOverdue === 0 && "border-l-[3px] border-l-warning-500",
        completing && "opacity-50",
        slidingOut && "animate-slide-out"
      )}
    >
      <TaskCheckbox
        checked={false}
        completing={completing}
        shaking={shaking}
        disabled={disabled}
        onToggle={() => onToggle(task.id)}
        taskTitle={task.title}
      />

      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "text-[13px] font-medium text-gray-900 line-clamp-2",
            completing && "line-through"
          )}
          title={task.title}
        >
          {task.title}
        </p>

        <div className="mt-1 flex flex-wrap items-center gap-2">
          {/* Type badge */}
          <span
            className={cn(
              "inline-flex rounded-pill px-2 py-0.5 text-[11px] font-medium",
              typeConfig.bgColor,
              typeConfig.textColor
            )}
          >
            {typeConfig.label}
          </span>

          {/* Due label */}
          <span
            className={cn(
              "text-[11px] font-medium",
              task.isOverdue ? "text-danger-600" : "text-warning-500"
            )}
          >
            {task.isOverdue
              ? `${task.daysOverdue}d overdue`
              : task.dueTime
                ? `Due ${task.dueTime}`
                : "Due today"}
          </span>

          {/* Record link */}
          {task.recordName && (
            <>
              <span className="text-gray-300">·</span>
              {task.recordUrl ? (
                <Link
                  href={task.recordUrl}
                  className="text-[11px] text-primary-500 hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  {task.recordName}
                </Link>
              ) : (
                <span className="text-[11px] text-gray-400">{task.recordName}</span>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
