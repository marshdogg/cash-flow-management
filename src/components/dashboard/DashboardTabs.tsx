"use client";

import { useCallback, useRef } from "react";
import { cn } from "@/lib/cn";
import { TABS } from "@/constants/dashboard";
import type { TabId } from "@/types/dashboard";

interface DashboardTabsProps {
  activeTab: TabId;
  allowedTabs: TabId[];
  onTabChange: (tab: TabId) => void;
}

export function DashboardTabs({ activeTab, allowedTabs, onTabChange }: DashboardTabsProps) {
  const visibleTabs = TABS.filter((t) => allowedTabs.includes(t.id));
  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  // Arrow key navigation for tabs (WAI-ARIA tabs pattern)
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const currentIndex = visibleTabs.findIndex((t) => t.id === activeTab);
      let nextIndex: number | null = null;

      if (e.key === "ArrowRight") {
        nextIndex = (currentIndex + 1) % visibleTabs.length;
      } else if (e.key === "ArrowLeft") {
        nextIndex = (currentIndex - 1 + visibleTabs.length) % visibleTabs.length;
      } else if (e.key === "Home") {
        nextIndex = 0;
      } else if (e.key === "End") {
        nextIndex = visibleTabs.length - 1;
      }

      if (nextIndex !== null) {
        e.preventDefault();
        const nextTab = visibleTabs[nextIndex];
        onTabChange(nextTab.id);
        tabRefs.current.get(nextTab.id)?.focus();
      }
    },
    [activeTab, visibleTabs, onTabChange]
  );

  return (
    <div
      role="tablist"
      aria-label="Dashboard sections"
      className="flex gap-0 border-b border-gray-200"
      onKeyDown={handleKeyDown}
    >
      {visibleTabs.map((tab) => (
        <button
          key={tab.id}
          ref={(el) => {
            if (el) tabRefs.current.set(tab.id, el);
          }}
          role="tab"
          aria-selected={activeTab === tab.id}
          aria-controls={`tabpanel-${tab.id}`}
          id={`tab-${tab.id}`}
          tabIndex={activeTab === tab.id ? 0 : -1}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            "relative px-4 py-3 text-sm font-medium transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500",
            activeTab === tab.id
              ? "text-primary-600"
              : "text-gray-500 hover:text-gray-700"
          )}
        >
          {tab.label}
          {activeTab === tab.id && (
            <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-primary-500 rounded-t" />
          )}
        </button>
      ))}
    </div>
  );
}
