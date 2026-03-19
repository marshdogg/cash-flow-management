"use client";

import Link from "next/link";
import { DashboardTaskItem } from "./DashboardTaskItem";
import { MAX_TASKS_DISPLAYED } from "@/constants/dashboard";
import type { DashboardTask } from "@/types/dashboard";

interface TaskListProps {
  tasks: DashboardTask[];
  total: number;
  hasMore: boolean;
  completingIds: Set<string>;
  slidingOutIds: Set<string>;
  shakingIds: Set<string>;
  disabledIds: Set<string>;
  onToggleTask: (taskId: string) => void;
}

export function TaskList({
  tasks,
  total,
  hasMore,
  completingIds,
  slidingOutIds,
  shakingIds,
  disabledIds,
  onToggleTask,
}: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="py-6 text-center">
        <p className="text-sm text-gray-500">No tasks due today — you&apos;re all caught up!</p>
        <Link href="/tasks" className="mt-2 inline-block text-sm text-primary-500 hover:underline">
          View All Tasks →
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="space-y-2">
        {tasks.slice(0, MAX_TASKS_DISPLAYED).map((task) => (
          <DashboardTaskItem
            key={task.id}
            task={task}
            completing={completingIds.has(task.id)}
            slidingOut={slidingOutIds.has(task.id)}
            shaking={shakingIds.has(task.id)}
            disabled={disabledIds.has(task.id)}
            onToggle={onToggleTask}
          />
        ))}
      </div>

      {hasMore && (
        <Link
          href="/tasks?filter=due-today"
          className="mt-3 block text-center text-xs text-primary-500 hover:underline"
        >
          View All {total} Tasks →
        </Link>
      )}
    </div>
  );
}
