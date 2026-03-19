"use client";

import { FocusItem } from "./FocusItem";
import { TaskList } from "./TaskList";
import type { FocusItem as FocusItemType, DashboardTask } from "@/types/dashboard";

interface FocusSectionProps {
  focusItems: FocusItemType[];
  tasks: DashboardTask[];
  taskTotal: number;
  taskHasMore: boolean;
  isFomContext: boolean;
  completingIds: Set<string>;
  slidingOutIds: Set<string>;
  shakingIds: Set<string>;
  disabledIds: Set<string>;
  onToggleTask: (taskId: string) => void;
}

export function FocusSection({
  focusItems,
  tasks,
  taskTotal,
  taskHasMore,
  isFomContext,
  completingIds,
  slidingOutIds,
  shakingIds,
  disabledIds,
  onToggleTask,
}: FocusSectionProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      {/* Operational Focus */}
      <div className="border-b border-gray-200 p-5">
        <h2 className="text-[15px] font-semibold text-gray-900">Today&apos;s Focus</h2>
        <div className="mt-3 space-y-3">
          {focusItems.map((item) => (
            <FocusItem key={item.title} item={item} />
          ))}
        </div>
      </div>

      {/* My Tasks — hidden in FOM context */}
      {!isFomContext && (
        <div className="p-5">
          <h2 className="text-[15px] font-semibold text-gray-900">My Tasks</h2>
          <div className="mt-3">
            <TaskList
              tasks={tasks}
              total={taskTotal}
              hasMore={taskHasMore}
              completingIds={completingIds}
              slidingOutIds={slidingOutIds}
              shakingIds={shakingIds}
              disabledIds={disabledIds}
              onToggleTask={onToggleTask}
            />
          </div>
        </div>
      )}
    </div>
  );
}
