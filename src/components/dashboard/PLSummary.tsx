"use client";

import { PLRow } from "./PLRow";
import type { PLLine } from "@/types/dashboard";

interface PLSummaryProps {
  lines: PLLine[];
}

export function PLSummary({ lines }: PLSummaryProps) {
  return (
    <div className="space-y-0">
      {lines.map((line, i) => (
        <PLRow key={`${line.label}-${i}`} line={line} />
      ))}
    </div>
  );
}
