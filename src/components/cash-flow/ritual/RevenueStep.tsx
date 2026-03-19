"use client";

import type { RevenueLineItem, RevenueWeek } from "@/types/cash-flow";
import { REVENUE_WEEK_OPTIONS } from "@/constants/cash-flow";

interface RevenueStepProps {
  bankBalance: number | null;
  // AR
  arItems: RevenueLineItem[];
  arCollectionRate: number;
  arGross: number;
  arRealized: number;
  onAddArItem: () => void;
  onUpdateArItem: (id: string, updates: Partial<RevenueLineItem>) => void;
  onRemoveArItem: (id: string) => void;
  onSetArRate: (rate: number) => void;
  // Sales
  salesItems: RevenueLineItem[];
  salesCancellationRate: number;
  salesGross: number;
  salesLikely: number;
  onAddSalesItem: () => void;
  onUpdateSalesItem: (id: string, updates: Partial<RevenueLineItem>) => void;
  onRemoveSalesItem: (id: string) => void;
  onSetSalesRate: (rate: number) => void;
  // Proposals
  proposalItems: RevenueLineItem[];
  proposalsCloseRate: number;
  proposalsGross: number;
  proposalsExpected: number;
  onAddProposalItem: () => void;
  onUpdateProposalItem: (id: string, updates: Partial<RevenueLineItem>) => void;
  onRemoveProposalItem: (id: string) => void;
  onSetProposalsRate: (rate: number) => void;
  // Total
  totalProjectedRevenue: number;
}

function fmt(n: number): string {
  const sign = n < 0 ? "-" : "";
  return sign + "$" + Math.abs(Math.round(n)).toLocaleString();
}

export function RevenueStep(props: RevenueStepProps) {
  const bank = props.bankBalance ?? 0;

  return (
    <>
      {/* Soft band */}
      <div className="border-b border-[#f2f1ef] border-l-[3px] border-l-[#8BC34A] bg-[#f7f6f3] px-8 py-6">
        <div className="text-[22px] font-extrabold tracking-[-0.03em] text-[#1a1a1a]">
          What&apos;s your revenue picture?
        </div>
        <div className="mt-1 text-[13px] text-[#6b7280]">
          Add individual items to each category — name them, set the amount, and pick which week you expect them.
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-col gap-4 p-7">
        {/* Callout */}
        <div className="flex items-start gap-2 rounded-[9px] border-[1.5px] border-[#bfdbfe] bg-[#eff6ff] px-3.5 py-3">
          <span className="mt-px flex-shrink-0 text-sm">💡</span>
          <p className="text-xs font-medium leading-relaxed text-[#1e40af]">
            Items assigned to <strong>future weeks</strong> show as projected bars on your cash flow chart. Rates apply across all items in that category.
          </p>
        </div>

        {/* Segment 1: Money in Bank (readonly) */}
        <div className="overflow-hidden rounded-xl border-[1.5px] border-[#e8e8e5]">
          <div className="flex items-center justify-between border-b-[1.5px] border-[#e8e8e5] bg-[#f2f1ef] px-4 py-3">
            <div className="flex items-center gap-2.5">
              <div className="h-[11px] w-[11px] rounded-[3px]" style={{ background: "#3d6b14" }} />
              <div>
                <div className="text-sm font-extrabold text-[#1a1a1a]">Money in Bank</div>
                <div className="text-[11px] font-medium text-[#a0aab4]">Confirmed balance carried from Step 2</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-[#a0aab4]">Amount</span>
              <span className="min-w-[80px] rounded-[7px] border-[1.5px] border-[#c5e49a] bg-[#f1f8e9] px-3 py-0.5 text-right font-mono text-[15px] font-bold text-[#3d6b14]">
                {fmt(bank)}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3 px-4 py-4">
            <span className="flex items-center gap-1 rounded bg-[#f1f8e9] px-2 py-0.5 text-[10px] font-bold text-[#3d6b14]">
              ✓ From Step 2
            </span>
            <span className="font-mono text-[26px] font-medium tracking-[-0.02em] text-[#3d6b14]">
              {fmt(bank)}
            </span>
            <span className="ml-auto flex items-center gap-1 rounded border border-[#c5e49a] bg-[#f1f8e9] px-2 py-0.5 text-[10px] font-bold text-[#3d6b14]">
              📅 This week
            </span>
          </div>
        </div>

        {/* Segment 2: AR */}
        <RevenueSegment
          color="#5e9422"
          title="Accounts Receivable"
          desc="Outstanding invoices — assign the week you expect payment"
          grossLabel="Gross"
          grossValue={props.arGross}
          items={props.arItems}
          noteHeader="Note / Customer"
          amountHeader="Amount"
          weekHeader="Expected Week"
          addLabel="Add AR item"
          onAdd={props.onAddArItem}
          onUpdate={props.onUpdateArItem}
          onRemove={props.onRemoveArItem}
          rateLabel="Collection rate"
          rateValue={props.arCollectionRate}
          rateMin={50}
          rateMax={100}
          onSetRate={props.onSetArRate}
          resultLabel="Realized →"
          resultValue={props.arRealized}
        />

        {/* Segment 3: Sales */}
        <RevenueSegment
          color="#8BC34A"
          title="Sales — Scheduled Estimates"
          desc="Estimates booked — assign to the week of the appointment"
          grossLabel="Gross"
          grossValue={props.salesGross}
          items={props.salesItems}
          noteHeader="Note / Customer"
          amountHeader="Estimate Value"
          weekHeader="Appointment Week"
          addLabel="Add estimate"
          onAdd={props.onAddSalesItem}
          onUpdate={props.onUpdateSalesItem}
          onRemove={props.onRemoveSalesItem}
          rateLabel="Cancellation rate"
          rateValue={props.salesCancellationRate}
          rateMin={0}
          rateMax={50}
          onSetRate={props.onSetSalesRate}
          resultLabel="Likely →"
          resultValue={props.salesLikely}
        />

        {/* Segment 4: Proposals */}
        <RevenueSegment
          color="#b5d96e"
          colorBorder="#9ecb55"
          title="Proposals Presented"
          desc="Proposals out — assign to the week you expect a decision"
          grossLabel="Gross"
          grossValue={props.proposalsGross}
          items={props.proposalItems}
          noteHeader="Note / Customer"
          amountHeader="Proposal Value"
          weekHeader="Decision Week"
          addLabel="Add proposal"
          onAdd={props.onAddProposalItem}
          onUpdate={props.onUpdateProposalItem}
          onRemove={props.onRemoveProposalItem}
          rateLabel="Close rate"
          rateValue={props.proposalsCloseRate}
          rateMin={10}
          rateMax={90}
          onSetRate={props.onSetProposalsRate}
          resultLabel="Expected →"
          resultValue={props.proposalsExpected}
        />

        {/* Total bar */}
        <div className="flex items-center justify-between rounded-[10px] bg-gradient-to-br from-[#3d6b14] to-[#6a9e32] px-5 py-4">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.07em] text-white/60">
              Total projected revenue
            </div>
            <div className="mt-0.5 text-[11px] text-white/45">
              Bank + AR + Sales + Proposals (adjusted)
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="font-mono text-[28px] font-medium tracking-[-0.03em] text-white">
              {fmt(props.totalProjectedRevenue)}
            </div>
            {/* Stacked bar */}
            <div className="flex h-1.5 w-[140px] gap-px overflow-hidden rounded-full">
              <div style={{ background: "#3d6b14", flex: bank || 1 }} />
              <div style={{ background: "#5e9422", flex: props.arRealized || 0 }} />
              <div style={{ background: "#8BC34A", flex: props.salesLikely || 0 }} />
              <div style={{ background: "#b5d96e", flex: props.proposalsExpected || 0 }} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Reusable Revenue Segment ──

interface RevenueSegmentProps {
  color: string;
  colorBorder?: string;
  title: string;
  desc: string;
  grossLabel: string;
  grossValue: number;
  items: RevenueLineItem[];
  noteHeader: string;
  amountHeader: string;
  weekHeader: string;
  addLabel: string;
  onAdd: () => void;
  onUpdate: (id: string, updates: Partial<RevenueLineItem>) => void;
  onRemove: (id: string) => void;
  rateLabel: string;
  rateValue: number;
  rateMin: number;
  rateMax: number;
  onSetRate: (rate: number) => void;
  resultLabel: string;
  resultValue: number;
}

function RevenueSegment(props: RevenueSegmentProps) {
  return (
    <div className="overflow-hidden rounded-xl border-[1.5px] border-[#e8e8e5] transition-colors focus-within:border-[#c5e49a]">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b-[1.5px] border-[#e8e8e5] bg-[#f2f1ef] px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div
            className="h-[11px] w-[11px] rounded-[3px]"
            style={{
              background: props.color,
              border: props.colorBorder ? `1px solid ${props.colorBorder}` : undefined,
            }}
          />
          <div>
            <div className="text-sm font-extrabold text-[#1a1a1a]">{props.title}</div>
            <div className="text-[11px] font-medium text-[#a0aab4]">{props.desc}</div>
          </div>
        </div>
        <div className="flex flex-shrink-0 items-center gap-2">
          <span className="text-[11px] font-semibold text-[#a0aab4]">{props.grossLabel}</span>
          <span className="min-w-[80px] rounded-[7px] border-[1.5px] border-[#c5e49a] bg-[#f1f8e9] px-3 py-0.5 text-right font-mono text-[15px] font-bold text-[#3d6b14]">
            {fmt(props.grossValue)}
          </span>
        </div>
      </div>

      {/* Column headers */}
      <div className="grid grid-cols-[1fr_155px_145px_32px] gap-2 px-4 pb-0.5 pt-2.5">
        <div className="text-[10px] font-bold uppercase tracking-[0.07em] text-[#a0aab4]">{props.noteHeader}</div>
        <div className="text-[10px] font-bold uppercase tracking-[0.07em] text-[#a0aab4]">{props.amountHeader}</div>
        <div className="text-[10px] font-bold uppercase tracking-[0.07em] text-[#a0aab4]">{props.weekHeader}</div>
        <div />
      </div>

      {/* Items */}
      <div className="flex flex-col px-4">
        {props.items.length === 0 && (
          <div className="py-3 text-center text-xs italic text-[#a0aab4]">
            No items yet — add one below
          </div>
        )}
        {props.items.map((item) => (
          <div
            key={item.id}
            className="grid grid-cols-[1fr_155px_145px_32px] items-center gap-2 border-b border-[#f2f1ef] py-2 last:border-b-0"
          >
            {/* Note */}
            <div className="flex items-center gap-1.5 rounded-lg border-[1.5px] border-[#e8e8e5] px-2.5 py-[7px] focus-within:border-[#8BC34A] focus-within:shadow-[0_0_0_3px_rgba(139,195,74,0.1)]">
              <span className="flex-shrink-0 text-xs text-[#a0aab4]">📝</span>
              <input
                type="text"
                value={item.note}
                onChange={(e) => props.onUpdate(item.id, { note: e.target.value })}
                placeholder="e.g. Customer name…"
                className="w-full border-none bg-transparent text-[13px] font-semibold text-[#1a1a1a] outline-none placeholder:font-medium placeholder:text-[#a0aab4]"
              />
            </div>

            {/* Amount */}
            <div className="flex items-center overflow-hidden rounded-lg border-[1.5px] border-[#e8e8e5] bg-white focus-within:border-[#8BC34A] focus-within:shadow-[0_0_0_3px_rgba(139,195,74,0.1)]">
              <div className="flex items-center self-stretch border-r-[1.5px] border-[#e8e8e5] bg-[#f2f1ef] px-2 font-mono text-xs font-bold text-[#a0aab4]">
                $
              </div>
              <input
                type="text"
                value={item.amount > 0 ? item.amount.toLocaleString() : ""}
                onChange={(e) => {
                  const val = parseInt(e.target.value.replace(/[^0-9]/g, "")) || 0;
                  props.onUpdate(item.id, { amount: val });
                }}
                onBlur={(e) => {
                  if (item.amount > 0) e.target.value = item.amount.toLocaleString();
                }}
                placeholder="0"
                className="w-full border-none bg-transparent px-2 py-[7px] text-right font-mono text-[13px] font-semibold text-[#1a1a1a] outline-none placeholder:text-[#a0aab4]"
              />
            </div>

            {/* Week */}
            <div className="flex items-center gap-1 rounded-lg border-[1.5px] border-[#e8e8e5] px-2 py-[7px] focus-within:border-[#8BC34A]">
              <span className="flex-shrink-0 text-[11px] text-[#a0aab4]">📅</span>
              <select
                value={item.week}
                onChange={(e) => props.onUpdate(item.id, { week: e.target.value as RevenueWeek })}
                className="w-full cursor-pointer border-none bg-transparent text-[11px] font-semibold text-[#6b7280] outline-none"
              >
                {REVENUE_WEEK_OPTIONS.map((w) => (
                  <option key={w.value} value={w.value}>{w.label}</option>
                ))}
              </select>
            </div>

            {/* Delete */}
            <button
              type="button"
              onClick={() => props.onRemove(item.id)}
              className="flex h-7 w-7 items-center justify-center rounded-[7px] border-[1.5px] border-[#e8e8e5] text-[13px] text-[#a0aab4] transition-all hover:border-[#ef4444] hover:bg-[#fef2f2] hover:text-[#ef4444]"
              aria-label="Remove item"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* Add button */}
      <button
        type="button"
        onClick={props.onAdd}
        className="mx-4 mb-2.5 mt-1.5 flex w-[calc(100%-32px)] items-center gap-2 rounded-lg border-[1.5px] border-dashed border-[#e8e8e5] bg-transparent px-3 py-2 text-xs font-bold text-[#6b7280] transition-all hover:border-[#8BC34A] hover:bg-[#f1f8e9] hover:text-[#3d6b14]"
      >
        <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M8 2v12M2 8h12" />
        </svg>
        {props.addLabel}
      </button>

      {/* Rate row */}
      <div className="flex items-center justify-between gap-4 border-t-[1.5px] border-[#f2f1ef] bg-[#fafaf8] px-4 py-3">
        <div className="flex flex-1 items-center gap-2.5">
          <span className="flex-shrink-0 whitespace-nowrap text-xs font-bold text-[#6b7280]">
            {props.rateLabel}
          </span>
          <input
            type="range"
            min={props.rateMin}
            max={props.rateMax}
            value={props.rateValue}
            onChange={(e) => props.onSetRate(parseInt(e.target.value))}
            className="h-[5px] flex-1 cursor-pointer appearance-none rounded bg-[#e8e8e5] outline-none [&::-webkit-slider-thumb]:h-[18px] [&::-webkit-slider-thumb]:w-[18px] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-[3px] [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-[#8BC34A] [&::-webkit-slider-thumb]:shadow-[0_1px_4px_rgba(0,0,0,0.2)]"
          />
          <span className="min-w-[48px] flex-shrink-0 rounded-md border-[1.5px] border-[#c5e49a] bg-[#f1f8e9] px-2 py-0.5 text-center font-mono text-xs font-bold text-[#3d6b14]">
            {props.rateValue}%
          </span>
        </div>
        <div className="flex flex-shrink-0 items-center gap-1.5">
          <span className="text-[11px] font-semibold text-[#a0aab4]">{props.resultLabel}</span>
          <span className="font-mono text-sm font-bold text-[#3d6b14]">{fmt(props.resultValue)}</span>
        </div>
      </div>
    </div>
  );
}
