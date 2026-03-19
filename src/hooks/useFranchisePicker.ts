"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCallback, useMemo } from "react";
import type { AssignedFranchise } from "@/types/cash-flow";

export function useFranchisePicker(assignedFranchises: AssignedFranchise[]) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const sorted = useMemo(
    () => [...assignedFranchises].sort((a, b) => a.name.localeCompare(b.name)),
    [assignedFranchises]
  );

  const rawFranchise = searchParams.get("franchise");

  const selectedFranchise = useMemo(() => {
    if (rawFranchise) {
      const found = sorted.find((f) => f.id === rawFranchise);
      if (found) return found;
    }
    // Default: first franchise alphabetically
    return sorted[0] ?? null;
  }, [rawFranchise, sorted]);

  const setSelectedFranchise = useCallback(
    (franchiseId: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("franchise", franchiseId);
      router.push(`${pathname}?${params.toString()}`);
    },
    [searchParams, router, pathname]
  );

  return {
    selectedFranchise,
    setSelectedFranchise,
    franchises: sorted,
  };
}
