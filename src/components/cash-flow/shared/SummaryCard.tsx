import { cn } from "@/lib/cn";

interface SummaryCardProps {
  label: string;
  value: string;
  valueColor: string;
  sub: string;
}

export function SummaryCard({ label, value, valueColor, sub }: SummaryCardProps) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-[#e5e7eb] bg-white px-[18px] py-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-colors hover:border-[#c5e49a]">
      <div className="text-[11px] font-bold uppercase tracking-[0.07em] text-[#6b7280]">
        {label}
      </div>
      <div className={cn("font-mono tabular-nums text-xl font-medium leading-none tracking-[-0.02em]", valueColor)}>
        {value}
      </div>
      <div className="mt-0.5 text-[11px] font-medium text-[#6b7280]">{sub}</div>
    </div>
  );
}
