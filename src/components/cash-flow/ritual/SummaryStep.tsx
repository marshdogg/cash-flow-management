"use client";

import type {
  WizardRecurringExpense,
  WizardOneOffExpense,
  RevenueLineItem,
} from "@/types/cash-flow";
import { REVENUE_WEEK_OPTIONS } from "@/constants/cash-flow";

interface SummaryStepProps {
  bankBalance: number;
  accountsPayable: number;
  netCashPosition: number;
  // Revenue
  arItems: RevenueLineItem[];
  arCollectionRate: number;
  arRealized: number;
  salesItems: RevenueLineItem[];
  salesCancellationRate: number;
  salesLikely: number;
  proposalItems: RevenueLineItem[];
  proposalsCloseRate: number;
  proposalsExpected: number;
  // Expenses
  recurringExpenses: WizardRecurringExpense[];
  totalRecurringExpenses: number;
  oneOffExpenses: WizardOneOffExpense[];
  totalOneOffExpenses: number;
  // Totals
  projectedWeekEndBalance: number;
  threshold: number;
}

function fmt(n: number): string {
  const sign = n < 0 ? "-" : "";
  return sign + "$" + Math.abs(Math.round(n)).toLocaleString();
}

function weekLabel(week: string): string {
  return REVENUE_WEEK_OPTIONS.find((w) => w.value === week)?.label ?? week;
}

export function SummaryStep(props: SummaryStepProps) {
  const isHealthy = props.projectedWeekEndBalance >= props.threshold;

  return (
    <>
      {/* Soft band */}
      <div className="border-b border-[#f2f1ef] border-l-[3px] border-l-[#3d6b14] bg-[#f7f6f3] px-8 py-6">
        <div className="text-[22px] font-extrabold tracking-[-0.03em] text-[#1a1a1a]">
          Weekly Summary
        </div>
        <div className="mt-1 text-[13px] text-[#6b7280]">
          Here&apos;s your full picture for the week
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-col gap-2 p-7">
        {/* Revenue Breakdown */}
        <SectionLabel>Revenue Breakdown</SectionLabel>

        <SumRow
          dotColor="#3d6b14"
          label="Money in Bank"
          value={fmt(props.bankBalance)}
          positive
        />

        <SumRow
          dotColor="#5e9422"
          label="Realized AR"
          rateNote={`${props.arCollectionRate}%`}
          value={fmt(props.arRealized)}
          positive
        />
        <SubItems items={props.arItems} />

        <SumRow
          dotColor="#8BC34A"
          label="Likely Sales"
          rateNote={`${100 - props.salesCancellationRate}%`}
          value={fmt(props.salesLikely)}
          positive
        />
        <SubItems items={props.salesItems} />

        <SumRow
          dotColor="#b5d96e"
          dotBorder="#9ecb55"
          label="Expected Proposals"
          rateNote={`${props.proposalsCloseRate}%`}
          value={fmt(props.proposalsExpected)}
          positive
        />
        <SubItems items={props.proposalItems} />

        {/* Expenses */}
        <SectionLabel>Expenses</SectionLabel>
        <SumRow label="🔄 Recurring Expenses" value={`−${fmt(props.totalRecurringExpenses)}`} negative />
        <SumRow label="📋 One-Off Expenses" value={`−${fmt(props.totalOneOffExpenses)}`} negative />

        {/* Cash Position */}
        <SectionLabel>Cash Position</SectionLabel>
        <SumRow label="Bank Balance" value={fmt(props.bankBalance)} />
        <SumRow label="Net Position (after AP)" value={fmt(props.netCashPosition)} />

        {/* Projected balance — hero callout */}
        <div className="mt-4 overflow-hidden rounded-[14px] bg-gradient-to-br from-[#3d6b14] via-[#5e9422] to-[#8BC34A] px-6 py-6">
          <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-white/60">
            Projected Week-End Balance
          </div>
          <div className="mt-1 font-mono text-[36px] font-bold tracking-[-0.03em] text-white">
            {fmt(props.projectedWeekEndBalance)}
          </div>
          <div className="mt-1 text-[12px] font-medium text-white/50">
            Bank + AR − All Expenses
          </div>
        </div>

        {/* Health check */}
        <div
          className="mt-3 flex items-center gap-3 rounded-[12px] border-[2px] px-4 py-4"
          style={{
            background: isHealthy ? "#f1f8e9" : "#fef2f2",
            borderColor: isHealthy ? "#c5e49a" : "#fecaca",
          }}
        >
          <span className="text-xl">{isHealthy ? "✅" : "⚠️"}</span>
          <p
            className="text-[13px] font-semibold leading-[1.5]"
            style={{ color: isHealthy ? "#3d6b14" : "#ef4444" }}
          >
            {isHealthy
              ? `Projected balance is above your minimum threshold of ${fmt(props.threshold)}. Cash position looks healthy.`
              : `Projected balance is below your minimum threshold of ${fmt(props.threshold)}. Review your expenses or follow up on outstanding AR.`}
          </p>
        </div>
      </div>
    </>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-1 mt-4 text-[10px] font-bold uppercase tracking-[0.09em] text-[#a0aab4] first:mt-0">
      {children}
    </div>
  );
}

function SumRow({
  dotColor,
  dotBorder,
  label,
  rateNote,
  value,
  positive,
  negative,
}: {
  dotColor?: string;
  dotBorder?: string;
  label: string;
  rateNote?: string;
  value: string;
  positive?: boolean;
  negative?: boolean;
}) {
  return (
    <div className="flex items-center justify-between border-b border-[#f2f1ef] py-2.5 last:border-b-0">
      <div className="flex items-center gap-2 text-[13px] font-semibold text-[#6b7280]">
        {dotColor && (
          <div
            className="h-2 w-2 rounded-sm"
            style={{
              background: dotColor,
              border: dotBorder ? `1px solid ${dotBorder}` : undefined,
            }}
          />
        )}
        {label}
        {rateNote && (
          <span className="ml-1 text-[11px] text-[#a0aab4]">{rateNote}</span>
        )}
      </div>
      <div
        className={`font-mono text-[13px] font-bold ${
          positive ? "text-[#6a9e32]" : negative ? "text-[#ef4444]" : "text-[#1a1a1a]"
        }`}
      >
        {value}
      </div>
    </div>
  );
}

function SubItems({ items }: { items: RevenueLineItem[] }) {
  const visible = items.filter((i) => i.amount > 0);
  if (visible.length === 0) return null;

  return (
    <div className="ml-4 flex flex-col gap-0.5 pb-1">
      {visible.map((item) => (
        <div key={item.id} className="flex items-center justify-between gap-2 text-[11px]">
          <span className="flex-1 font-medium text-[#a0aab4]">
            {item.note || "—"}
            <span className="ml-1 text-[10px] text-[#a0aab4]">{weekLabel(item.week)}</span>
          </span>
          <span className="font-mono text-[11px] text-[#6b7280]">{fmt(item.amount)}</span>
        </div>
      ))}
    </div>
  );
}
