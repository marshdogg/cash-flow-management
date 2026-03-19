"use client";

import { KpiCard } from "./KpiCard";
import type { KpiData, KpiVariant } from "@/types/dashboard";

interface KpiItem {
  label: string;
  data: KpiData;
  variant?: KpiVariant;
  onClick?: () => void;
}

interface KpiGridProps {
  items: KpiItem[];
}

export function KpiGrid({ items }: KpiGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <KpiCard
          key={item.label}
          label={item.label}
          data={item.data}
          variant={item.variant}
          onClick={item.onClick}
        />
      ))}
    </div>
  );
}
