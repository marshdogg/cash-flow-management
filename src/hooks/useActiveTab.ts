"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCallback } from "react";
import { DEFAULT_TAB, TABS } from "@/constants/dashboard";
import type { TabId } from "@/types/dashboard";

const VALID_TABS = new Set(TABS.map((t) => t.id));

export function useActiveTab(allowedTabs: TabId[]) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const rawTab = searchParams.get("tab");
  const activeTab: TabId =
    rawTab && VALID_TABS.has(rawTab as TabId) && allowedTabs.includes(rawTab as TabId)
      ? (rawTab as TabId)
      : DEFAULT_TAB;

  const setActiveTab = useCallback(
    (tab: TabId) => {
      if (!allowedTabs.includes(tab)) return;
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", tab);
      router.push(`${pathname}?${params.toString()}`);
    },
    [searchParams, router, pathname, allowedTabs]
  );

  return { activeTab, setActiveTab };
}
