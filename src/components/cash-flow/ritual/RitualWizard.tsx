"use client";

import { Suspense, useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useRitualWizard } from "@/hooks/useRitualWizard";
import { useRecurringTransactions } from "@/hooks/useRecurringTransactions";
import { useToast } from "@/hooks/useToast";
import { cn } from "@/lib/cn";
import { WelcomeBanner } from "./WelcomeBanner";
import { BankBalanceStep } from "./BankBalanceStep";
import { RecurringExpensesStep } from "./RecurringExpensesStep";
import { OneOffExpensesStep } from "./OneOffExpensesStep";
import { RevenueStep } from "./RevenueStep";
import { SummaryStep } from "./SummaryStep";
import { SkeletonCard } from "@/components/cash-flow/shared/SkeletonCard";
import {
  CASH_FLOW_ROUTES,
  TOAST_MESSAGES,
} from "@/constants/cash-flow";
import type { WizardRecurringExpense } from "@/types/cash-flow";
import { track } from "@/lib/analytics";

// ── Helpers ──

function fmt(n: number): string {
  const sign = n < 0 ? "−" : "";
  return sign + "$" + Math.abs(Math.round(n)).toLocaleString();
}

// ── AccordionSection ──

interface AccordionSectionProps {
  id: number;
  title: string;
  compactTitle: string;
  subtitle: string;
  summaryValue: string;
  isOpen: boolean;
  isLast: boolean;
  onToggle: (id: number) => void;
  onContinue: (id: number) => void;
  children: React.ReactNode;
}

function AccordionSection({
  id,
  title,
  compactTitle,
  subtitle,
  summaryValue,
  isOpen,
  isLast,
  onToggle,
  onContinue,
  children,
}: AccordionSectionProps) {
  const panelId = `accordion-panel-${id}`;
  const headerId = `accordion-header-${id}`;

  return (
    <div
      className={cn(
        "border-l-4 transition-colors duration-300",
        isOpen ? "border-l-[#8BC34A]" : "border-l-[#c5e49a]"
      )}
    >
      {/* Header */}
      <button
        id={headerId}
        type="button"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={() => onToggle(id)}
        className="scroll-mt-[68px] flex w-full items-start gap-3 px-6 py-4 text-left transition-colors hover:bg-[#fafff5]"
      >
        {/* Chevron */}
        <svg
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={cn(
            "mt-0.5 h-5 w-5 shrink-0 text-[#8BC34A] transition-transform duration-300",
            isOpen ? "rotate-90" : "rotate-0"
          )}
        >
          <path d="M7 4l6 6-6 6" />
        </svg>

        {isOpen ? (
          /* Expanded: full title + subtitle */
          <div className="min-w-0 flex-1">
            <h2 className="text-[22px] font-extrabold leading-tight tracking-[-0.02em] text-[#1a1a1a]">
              {title}
            </h2>
            <p className="mt-1 text-[14px] font-medium text-[#a0aab4]">
              {subtitle}
            </p>
          </div>
        ) : (
          /* Collapsed: compact title + summary + checkmark */
          <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
            <span className="text-[15px] font-bold text-[#1a1a1a]">
              {compactTitle}
            </span>
            <div className="flex shrink-0 items-center gap-2">
              <span className="text-[13px] font-semibold text-[#6b7280]">
                {summaryValue}
              </span>
              <svg
                viewBox="0 0 20 20"
                fill="none"
                stroke="#8BC34A"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <path d="M5 10l4 4 6-7" />
              </svg>
            </div>
          </div>
        )}
      </button>

      {/* Panel — CSS grid 0fr/1fr animation */}
      <div
        id={panelId}
        role="region"
        aria-labelledby={headerId}
        className="grid transition-[grid-template-rows] duration-300"
        style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
      >
        <div className="min-h-0 overflow-hidden">
          {/* Hide the step component's own soft-band header */}
          <div className="[&>:first-child]:hidden">
            {children}
          </div>

          {/* Continue button (all except last/Summary section) */}
          {isOpen && !isLast && (
            <div className="flex justify-end px-8 pb-6 pt-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onContinue(id);
                }}
                className="flex items-center gap-2 rounded-[9px] border border-[#c5e49a] bg-[#f1f8e9] px-6 py-2.5 text-[14px] font-bold text-[#3d6b14] transition-all hover:bg-[#e8f5d6] active:scale-[0.98]"
              >
                Continue
                <svg
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  className="h-3.5 w-3.5"
                >
                  <path d="M5 3l5 5-5 5" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Constants ──

interface RitualWizardProps {
  franchiseId: string;
  userName: string;
}

const CATEGORY_ICONS: Record<string, string> = {
  rent: "🏢",
  royalty: "🏷",
  vehicle: "🚗",
  insurance: "🛡",
  draw: "💸",
  subscription: "💻",
  loan: "🏦",
  supplies: "🖌",
  other: "👥",
};

function frequencyLabel(freq: string): string {
  const map: Record<string, string> = {
    weekly: "Weekly",
    biweekly: "Bi-weekly",
    monthly: "Monthly",
    quarterly: "Quarterly",
    annually: "Annually",
  };
  return map[freq] || freq;
}

// ── Main Component ──

function RitualWizardInner({ franchiseId, userName }: RitualWizardProps) {
  const router = useRouter();
  const { showToast } = useToast();

  const wizard = useRitualWizard(franchiseId);
  const { transactions } = useRecurringTransactions(franchiseId);

  // ── Accordion state (ephemeral — not persisted) ──
  const [activeSection, setActiveSection] = useState(1);

  // Pre-populate recurring expenses from transactions
  useEffect(() => {
    if (transactions.length > 0 && wizard.state.recurringExpenses.length === 0) {
      const entries: WizardRecurringExpense[] = transactions
        .filter((t) => t.type === "expense" && t.status === "active")
        .map((t) => ({
          transactionId: t.id,
          name: t.name,
          icon: CATEGORY_ICONS[t.category ?? "other"] || "📋",
          meta: `${frequencyLabel(t.frequency)}${t.description ? ` · ${t.description}` : ""}`,
          amount: t.amount,
          checked: true,
        }));
      if (entries.length > 0) {
        wizard.setRecurringExpenses(entries);
      }
    }
  }, [transactions, wizard.state.recurringExpenses.length, wizard.setRecurringExpenses]);

  // Track ritual start
  useEffect(() => {
    track("cash_flow_ritual_started", { franchise_id: franchiseId });
  }, [franchiseId]);

  const handleCompleteRitual = useCallback(async () => {
    try {
      await wizard.completeRitual();
      const durationSeconds = Math.floor(
        (Date.now() - new Date(wizard.state.startedAt).getTime()) / 1000
      );
      track("cash_flow_ritual_completed", {
        franchise_id: franchiseId,
        duration_seconds: durationSeconds,
      });
      showToast("success", TOAST_MESSAGES.ritualCompleted);
      router.push(CASH_FLOW_ROUTES.dashboard);
    } catch {
      showToast("error", TOAST_MESSAGES.ritualSaveError);
    }
  }, [wizard, franchiseId, showToast, router]);

  // ── Accordion handlers ──

  const handleToggleSection = useCallback((id: number) => {
    setActiveSection(id);
  }, []);

  const handleContinue = useCallback((currentId: number) => {
    const nextId = currentId + 1;
    if (nextId > 5) return;
    setActiveSection(nextId);
    // Smooth-scroll to the next section header after React re-renders
    requestAnimationFrame(() => {
      const el = document.getElementById(`accordion-header-${nextId}`);
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, []);

  // ── Section config (needs computed values from wizard) ──

  const activeRecurring = wizard.state.recurringExpenses.filter((e) => e.checked).length;
  const totalRecurring = wizard.state.recurringExpenses.length;
  const checkedOneOff = wizard.state.oneOffExpenses.filter((e) => e.checked).length;

  const sections = [
    {
      id: 1,
      title: "What's your current bank balance?",
      compactTitle: "Bank Balance",
      subtitle: "Log in to your business bank account and enter today's balance.",
      summaryValue: `Net Cash: ${fmt(wizard.netCashPosition)}`,
    },
    {
      id: 2,
      title: "Review your recurring expenses",
      compactTitle: "Recurring Expenses",
      subtitle: "Confirm which recurring expenses apply this week.",
      summaryValue: `${fmt(-wizard.totalRecurringExpenses)} · ${activeRecurring} of ${totalRecurring} active`,
    },
    {
      id: 3,
      title: "Any one-off expenses this week?",
      compactTitle: "One-Off Expenses",
      subtitle: "Add any non-recurring expenses you expect this week.",
      summaryValue: `${fmt(-wizard.totalOneOffExpenses)} · ${checkedOneOff} items`,
    },
    {
      id: 4,
      title: "What revenue do you expect?",
      compactTitle: "Revenue",
      subtitle: "Enter accounts receivable, confirmed sales, and proposals.",
      summaryValue: `Projected: ${fmt(wizard.totalProjectedRevenue)}`,
    },
    {
      id: 5,
      title: "Weekly cash flow summary",
      compactTitle: "Summary",
      subtitle: "Review your projected cash position for the week.",
      summaryValue: `Projected Balance: ${fmt(wizard.projectedWeekEndBalance)}`,
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-[#f7f6f3]">
      {/* Topbar */}
      <div className="sticky top-0 z-[100] flex h-[60px] items-center justify-between border-b border-[#e8e8e5] bg-white px-8 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <div className="flex items-center gap-4">
          <Link
            href={CASH_FLOW_ROUTES.dashboard}
            className="flex items-center gap-1.5 rounded-[9px] px-2.5 py-1.5 text-[13px] font-semibold text-[#6b7280] transition-all hover:bg-[#f2f1ef] hover:text-[#1a1a1a]"
          >
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="h-4 w-4">
              <path d="M10 3L5 8l5 5" />
            </svg>
            Dashboard
          </Link>
          <div className="h-6 w-px bg-[#e8e8e5]" />
          <div>
            <h1 className="text-[15px] font-extrabold tracking-[-0.02em] text-[#1a1a1a]">
              Weekly Ritual
            </h1>
            <span className="text-[11px] font-medium text-[#a0aab4]">
              Cash flow check-in
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-[#a0aab4]">
          <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#8BC34A]" />
          Auto-saved
        </div>
      </div>

      {/* Main content */}
      <div className="mx-auto w-full max-w-[920px] flex-1 p-8 pb-24">
        <div className="overflow-hidden rounded-[16px] bg-white shadow-[0_8px_30px_rgba(0,0,0,0.08),0_2px_8px_rgba(0,0,0,0.04)]">
          {/* Welcome Banner — always visible outside accordion */}
          <WelcomeBanner
            userName={userName}
            welcomeData={wizard.welcomeData}
          />

          {/* Accordion sections */}
          {sections.map((section) => (
            <AccordionSection
              key={section.id}
              id={section.id}
              title={section.title}
              compactTitle={section.compactTitle}
              subtitle={section.subtitle}
              summaryValue={section.summaryValue}
              isOpen={activeSection === section.id}
              isLast={section.id === 5}
              onToggle={handleToggleSection}
              onContinue={handleContinue}
            >
              {section.id === 1 && (
                <BankBalanceStep
                  bankBalance={wizard.state.bankBalance}
                  accountsPayable={wizard.state.accountsPayable}
                  onSetBankBalance={wizard.setBankBalance}
                  onSetAccountsPayable={wizard.setAccountsPayable}
                />
              )}
              {section.id === 2 && (
                <RecurringExpensesStep
                  expenses={wizard.state.recurringExpenses}
                  onToggle={wizard.toggleRecurringExpense}
                />
              )}
              {section.id === 3 && (
                <OneOffExpensesStep
                  expenses={wizard.state.oneOffExpenses}
                  onToggleChecked={wizard.toggleOneOffChecked}
                  onToggleMakeRecurring={wizard.toggleMakeRecurring}
                  onAdd={wizard.addOneOffExpense}
                  onRemove={wizard.removeOneOffExpense}
                />
              )}
              {section.id === 4 && (
                <RevenueStep
                  bankBalance={wizard.state.bankBalance}
                  arItems={wizard.state.arItems}
                  arCollectionRate={wizard.state.arCollectionRate}
                  arGross={wizard.arGross}
                  arRealized={wizard.arRealized}
                  onAddArItem={wizard.addArItem}
                  onUpdateArItem={wizard.updateArItem}
                  onRemoveArItem={wizard.removeArItem}
                  onSetArRate={wizard.setArCollectionRate}
                  salesItems={wizard.state.salesItems}
                  salesCancellationRate={wizard.state.salesCancellationRate}
                  salesGross={wizard.salesGross}
                  salesLikely={wizard.salesLikely}
                  onAddSalesItem={wizard.addSalesItem}
                  onUpdateSalesItem={wizard.updateSalesItem}
                  onRemoveSalesItem={wizard.removeSalesItem}
                  onSetSalesRate={wizard.setSalesCancellationRate}
                  proposalItems={wizard.state.proposalItems}
                  proposalsCloseRate={wizard.state.proposalsCloseRate}
                  proposalsGross={wizard.proposalsGross}
                  proposalsExpected={wizard.proposalsExpected}
                  onAddProposalItem={wizard.addProposalItem}
                  onUpdateProposalItem={wizard.updateProposalItem}
                  onRemoveProposalItem={wizard.removeProposalItem}
                  onSetProposalsRate={wizard.setProposalsCloseRate}
                  totalProjectedRevenue={wizard.totalProjectedRevenue}
                />
              )}
              {section.id === 5 && (
                <SummaryStep
                  bankBalance={wizard.state.bankBalance ?? 0}
                  accountsPayable={wizard.state.accountsPayable ?? 0}
                  netCashPosition={wizard.netCashPosition}
                  arItems={wizard.state.arItems}
                  arCollectionRate={wizard.state.arCollectionRate}
                  arRealized={wizard.arRealized}
                  salesItems={wizard.state.salesItems}
                  salesCancellationRate={wizard.state.salesCancellationRate}
                  salesLikely={wizard.salesLikely}
                  proposalItems={wizard.state.proposalItems}
                  proposalsCloseRate={wizard.state.proposalsCloseRate}
                  proposalsExpected={wizard.proposalsExpected}
                  recurringExpenses={wizard.state.recurringExpenses}
                  totalRecurringExpenses={wizard.totalRecurringExpenses}
                  oneOffExpenses={wizard.state.oneOffExpenses}
                  totalOneOffExpenses={wizard.totalOneOffExpenses}
                  projectedWeekEndBalance={wizard.projectedWeekEndBalance}
                />
              )}
            </AccordionSection>
          ))}
        </div>
      </div>

      {/* Sticky submit footer */}
      <div className="sticky bottom-0 z-50 border-t-[2px] border-[#c5e49a] bg-[#fafff5] px-8 py-5 shadow-[0_-4px_16px_rgba(0,0,0,0.08)]">
        <div className="mx-auto flex max-w-[920px] items-center justify-between">
          <div className="flex items-center gap-2 text-[13px] font-semibold text-[#6a9e32]">
            <div className="h-2 w-2 animate-pulse rounded-full bg-[#8BC34A]" />
            Auto-saved
          </div>
          <button
            type="button"
            onClick={handleCompleteRitual}
            className="flex items-center gap-2.5 rounded-[11px] bg-gradient-to-b from-[#5e9422] to-[#3d6b14] px-8 py-4 text-base font-extrabold text-white shadow-[0_4px_14px_rgba(61,107,20,0.4),0_1px_3px_rgba(0,0,0,0.1)] transition-all hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(61,107,20,0.5),0_2px_6px_rgba(0,0,0,0.12)] active:translate-y-0 active:shadow-[0_2px_8px_rgba(61,107,20,0.3)]"
          >
            Save &amp; Update Dashboard
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
              <path d="M5 10l4 4 6-7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export function RitualWizard(props: RitualWizardProps) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-[920px] px-8 py-8">
          <SkeletonCard lines={8} />
        </div>
      }
    >
      <RitualWizardInner {...props} />
    </Suspense>
  );
}
