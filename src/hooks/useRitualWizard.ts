"use client";

import { useReducer, useCallback, useEffect, useRef, useState } from "react";
import type {
  RitualWizardState,
  RitualWelcomeData,
  WizardRecurringExpense,
  WizardOneOffExpense,
  RevenueLineItem,
  RevenueWeek,
  CompleteRitualRequest,
  CompleteRitualResponse,
} from "@/types/cash-flow";
import {
  WIZARD_STATE_KEY,
  WIZARD_TTL_MS,
  WIZARD_TOTAL_STEPS,
  DEFAULT_AR_COLLECTION_RATE,
  DEFAULT_SALES_CANCELLATION_RATE,
  DEFAULT_PROPOSALS_CLOSE_RATE,
} from "@/constants/cash-flow";
import { startOfWeek, endOfWeek, format } from "date-fns";

// ============================================
// Actions
// ============================================

type WizardAction =
  | { type: "INIT"; state: RitualWizardState }
  | { type: "GO_TO_STEP"; step: number }
  // Step 2: Bank Balance
  | { type: "SET_BANK_BALANCE"; amount: number }
  | { type: "SET_ACCOUNTS_PAYABLE"; amount: number }
  // Step 3: Recurring Expenses
  | { type: "SET_RECURRING_EXPENSES"; expenses: WizardRecurringExpense[] }
  | { type: "TOGGLE_RECURRING_EXPENSE"; transactionId: string }
  // Step 4: One-Off Expenses
  | { type: "ADD_ONE_OFF_EXPENSE"; expense: WizardOneOffExpense }
  | { type: "REMOVE_ONE_OFF_EXPENSE"; id: string }
  | { type: "TOGGLE_ONE_OFF_CHECKED"; id: string }
  | { type: "TOGGLE_MAKE_RECURRING"; id: string }
  // Step 5: Revenue — AR
  | { type: "ADD_AR_ITEM"; item: RevenueLineItem }
  | { type: "UPDATE_AR_ITEM"; id: string; updates: Partial<RevenueLineItem> }
  | { type: "REMOVE_AR_ITEM"; id: string }
  | { type: "SET_AR_COLLECTION_RATE"; rate: number }
  // Step 5: Revenue — Sales
  | { type: "ADD_SALES_ITEM"; item: RevenueLineItem }
  | { type: "UPDATE_SALES_ITEM"; id: string; updates: Partial<RevenueLineItem> }
  | { type: "REMOVE_SALES_ITEM"; id: string }
  | { type: "SET_SALES_CANCELLATION_RATE"; rate: number }
  // Step 5: Revenue — Proposals
  | { type: "ADD_PROPOSAL_ITEM"; item: RevenueLineItem }
  | { type: "UPDATE_PROPOSAL_ITEM"; id: string; updates: Partial<RevenueLineItem> }
  | { type: "REMOVE_PROPOSAL_ITEM"; id: string }
  | { type: "SET_PROPOSALS_CLOSE_RATE"; rate: number }
  // Week
  | { type: "SET_WEEK"; weekStart: string; weekEnd: string }
  // Reset
  | { type: "RESET" };

// ============================================
// Reducer
// ============================================

function updateItem(items: RevenueLineItem[], id: string, updates: Partial<RevenueLineItem>): RevenueLineItem[] {
  return items.map((item) => (item.id === id ? { ...item, ...updates } : item));
}

function wizardReducer(
  state: RitualWizardState,
  action: WizardAction
): RitualWizardState {
  switch (action.type) {
    case "INIT":
      return action.state;

    case "GO_TO_STEP":
      if (action.step < 1 || action.step > WIZARD_TOTAL_STEPS) return state;
      return { ...state, currentStep: action.step };

    // Step 2
    case "SET_BANK_BALANCE":
      return { ...state, bankBalance: action.amount };
    case "SET_ACCOUNTS_PAYABLE":
      return { ...state, accountsPayable: action.amount };

    // Step 3
    case "SET_RECURRING_EXPENSES":
      return { ...state, recurringExpenses: action.expenses };
    case "TOGGLE_RECURRING_EXPENSE":
      return {
        ...state,
        recurringExpenses: state.recurringExpenses.map((e) =>
          e.transactionId === action.transactionId
            ? { ...e, checked: !e.checked }
            : e
        ),
      };

    // Step 4
    case "ADD_ONE_OFF_EXPENSE":
      return { ...state, oneOffExpenses: [...state.oneOffExpenses, action.expense] };
    case "REMOVE_ONE_OFF_EXPENSE":
      return { ...state, oneOffExpenses: state.oneOffExpenses.filter((e) => e.id !== action.id) };
    case "TOGGLE_ONE_OFF_CHECKED":
      return {
        ...state,
        oneOffExpenses: state.oneOffExpenses.map((e) =>
          e.id === action.id ? { ...e, checked: !e.checked } : e
        ),
      };
    case "TOGGLE_MAKE_RECURRING":
      return {
        ...state,
        oneOffExpenses: state.oneOffExpenses.map((e) =>
          e.id === action.id ? { ...e, makeRecurring: !e.makeRecurring } : e
        ),
      };

    // Step 5 — AR
    case "ADD_AR_ITEM":
      return { ...state, arItems: [...state.arItems, action.item] };
    case "UPDATE_AR_ITEM":
      return { ...state, arItems: updateItem(state.arItems, action.id, action.updates) };
    case "REMOVE_AR_ITEM":
      return { ...state, arItems: state.arItems.filter((i) => i.id !== action.id) };
    case "SET_AR_COLLECTION_RATE":
      return { ...state, arCollectionRate: action.rate };

    // Step 5 — Sales
    case "ADD_SALES_ITEM":
      return { ...state, salesItems: [...state.salesItems, action.item] };
    case "UPDATE_SALES_ITEM":
      return { ...state, salesItems: updateItem(state.salesItems, action.id, action.updates) };
    case "REMOVE_SALES_ITEM":
      return { ...state, salesItems: state.salesItems.filter((i) => i.id !== action.id) };
    case "SET_SALES_CANCELLATION_RATE":
      return { ...state, salesCancellationRate: action.rate };

    // Step 5 — Proposals
    case "ADD_PROPOSAL_ITEM":
      return { ...state, proposalItems: [...state.proposalItems, action.item] };
    case "UPDATE_PROPOSAL_ITEM":
      return { ...state, proposalItems: updateItem(state.proposalItems, action.id, action.updates) };
    case "REMOVE_PROPOSAL_ITEM":
      return { ...state, proposalItems: state.proposalItems.filter((i) => i.id !== action.id) };
    case "SET_PROPOSALS_CLOSE_RATE":
      return { ...state, proposalsCloseRate: action.rate };

    case "SET_WEEK":
      return { ...state, weekStart: action.weekStart, weekEnd: action.weekEnd };

    case "RESET":
      return createFreshState();

    default:
      return state;
  }
}

// ============================================
// State Creation
// ============================================

function createFreshState(): RitualWizardState {
  const now = new Date();
  const ws = startOfWeek(now, { weekStartsOn: 1 });
  const we = endOfWeek(now, { weekStartsOn: 1 });
  return {
    currentStep: 1,
    bankBalance: null,
    accountsPayable: null,
    recurringExpenses: [],
    oneOffExpenses: [],
    arItems: [],
    arCollectionRate: DEFAULT_AR_COLLECTION_RATE,
    salesItems: [],
    salesCancellationRate: DEFAULT_SALES_CANCELLATION_RATE,
    proposalItems: [],
    proposalsCloseRate: DEFAULT_PROPOSALS_CLOSE_RATE,
    weekStart: format(ws, "yyyy-MM-dd"),
    weekEnd: format(we, "yyyy-MM-dd"),
    startedAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + WIZARD_TTL_MS).toISOString(),
  };
}

function loadSavedState(): RitualWizardState | null {
  try {
    const saved = sessionStorage.getItem(WIZARD_STATE_KEY);
    if (!saved) return null;

    const state = JSON.parse(saved);
    const now = new Date();

    // Check TTL
    if (new Date(state.expiresAt) <= now) {
      sessionStorage.removeItem(WIZARD_STATE_KEY);
      return null;
    }

    // Version check — discard old v2 state that lacks new fields
    if (!("arItems" in state) || !("recurringExpenses" in state)) {
      sessionStorage.removeItem(WIZARD_STATE_KEY);
      return null;
    }

    // Migrate: add weekStart/weekEnd if missing (older saved states)
    if (!state.weekStart) {
      const ref = new Date(state.startedAt);
      const ws = startOfWeek(ref, { weekStartsOn: 1 });
      const we = endOfWeek(ref, { weekStartsOn: 1 });
      state.weekStart = format(ws, "yyyy-MM-dd");
      state.weekEnd = format(we, "yyyy-MM-dd");
    }

    return state as RitualWizardState;
  } catch {
    return null;
  }
}

function saveState(state: RitualWizardState): void {
  try {
    sessionStorage.setItem(WIZARD_STATE_KEY, JSON.stringify(state));
  } catch {
    // sessionStorage may be unavailable
  }
}

function clearState(): void {
  try {
    sessionStorage.removeItem(WIZARD_STATE_KEY);
  } catch {
    // Ignore
  }
}

function uid(): string {
  return "_" + Math.random().toString(36).slice(2, 8);
}

// ============================================
// Hook
// ============================================

export function useRitualWizard(franchiseId: string) {
  const savedState = useRef<RitualWizardState | null>(null);
  const [isResuming, setIsResuming] = useState(false);
  const [welcomeData, setWelcomeData] = useState<RitualWelcomeData | null>(null);

  // Try to load saved state on first render (client-side only)
  if (typeof window !== "undefined" && savedState.current === null) {
    const loaded = loadSavedState();
    savedState.current = loaded ?? createFreshState();
    if (loaded) setIsResuming(true);
  }

  const initialState = savedState.current ?? createFreshState();
  const [state, dispatch] = useReducer(wizardReducer, initialState);

  // Fetch welcome data on mount
  useEffect(() => {
    async function fetchWelcome() {
      try {
        const res = await fetch(
          `/api/cash-flow/ritual?franchise=${encodeURIComponent(franchiseId)}`
        );
        if (res.ok) {
          const json = await res.json();
          const data = json.data ?? json;
          setWelcomeData(data);
        }
      } catch {
        // Non-critical
      }
    }
    fetchWelcome();
  }, [franchiseId]);

  // Persist state on every change
  useEffect(() => {
    saveState(state);
  }, [state]);

  // ── Navigation ──

  const goToStep = useCallback((step: number) => {
    dispatch({ type: "GO_TO_STEP", step });
  }, []);

  const nextStep = useCallback(() => {
    dispatch({ type: "GO_TO_STEP", step: state.currentStep + 1 });
  }, [state.currentStep]);

  const prevStep = useCallback(() => {
    dispatch({ type: "GO_TO_STEP", step: state.currentStep - 1 });
  }, [state.currentStep]);

  // ── Week ──

  const setWeek = useCallback((weekStart: string, weekEnd: string) => {
    dispatch({ type: "SET_WEEK", weekStart, weekEnd });
  }, []);

  // ── Step 2: Bank Balance ──

  const setBankBalance = useCallback((amount: number) => {
    dispatch({ type: "SET_BANK_BALANCE", amount });
  }, []);

  const setAccountsPayable = useCallback((amount: number) => {
    dispatch({ type: "SET_ACCOUNTS_PAYABLE", amount });
  }, []);

  // ── Step 3: Recurring Expenses ──

  const setRecurringExpenses = useCallback((expenses: WizardRecurringExpense[]) => {
    dispatch({ type: "SET_RECURRING_EXPENSES", expenses });
  }, []);

  const toggleRecurringExpense = useCallback((transactionId: string) => {
    dispatch({ type: "TOGGLE_RECURRING_EXPENSE", transactionId });
  }, []);

  // ── Step 4: One-Off Expenses ──

  const addOneOffExpense = useCallback(
    (description: string, amount: number, icon = "📋") => {
      const expense: WizardOneOffExpense = {
        id: uid(),
        description,
        icon,
        amount,
        checked: true,
        makeRecurring: false,
      };
      dispatch({ type: "ADD_ONE_OFF_EXPENSE", expense });
    },
    []
  );

  const removeOneOffExpense = useCallback((id: string) => {
    dispatch({ type: "REMOVE_ONE_OFF_EXPENSE", id });
  }, []);

  const toggleOneOffChecked = useCallback((id: string) => {
    dispatch({ type: "TOGGLE_ONE_OFF_CHECKED", id });
  }, []);

  const toggleMakeRecurring = useCallback((id: string) => {
    dispatch({ type: "TOGGLE_MAKE_RECURRING", id });
  }, []);

  // ── Step 5: Revenue — AR ──

  const addArItem = useCallback((note = "", amount = 0, week: RevenueWeek = "w0") => {
    dispatch({ type: "ADD_AR_ITEM", item: { id: uid(), note, amount, week } });
  }, []);

  const updateArItem = useCallback((id: string, updates: Partial<RevenueLineItem>) => {
    dispatch({ type: "UPDATE_AR_ITEM", id, updates });
  }, []);

  const removeArItem = useCallback((id: string) => {
    dispatch({ type: "REMOVE_AR_ITEM", id });
  }, []);

  const setArCollectionRate = useCallback((rate: number) => {
    dispatch({ type: "SET_AR_COLLECTION_RATE", rate });
  }, []);

  // ── Step 5: Revenue — Sales ──

  const addSalesItem = useCallback((note = "", amount = 0, week: RevenueWeek = "w0") => {
    dispatch({ type: "ADD_SALES_ITEM", item: { id: uid(), note, amount, week } });
  }, []);

  const updateSalesItem = useCallback((id: string, updates: Partial<RevenueLineItem>) => {
    dispatch({ type: "UPDATE_SALES_ITEM", id, updates });
  }, []);

  const removeSalesItem = useCallback((id: string) => {
    dispatch({ type: "REMOVE_SALES_ITEM", id });
  }, []);

  const setSalesCancellationRate = useCallback((rate: number) => {
    dispatch({ type: "SET_SALES_CANCELLATION_RATE", rate });
  }, []);

  // ── Step 5: Revenue — Proposals ──

  const addProposalItem = useCallback((note = "", amount = 0, week: RevenueWeek = "w0") => {
    dispatch({ type: "ADD_PROPOSAL_ITEM", item: { id: uid(), note, amount, week } });
  }, []);

  const updateProposalItem = useCallback((id: string, updates: Partial<RevenueLineItem>) => {
    dispatch({ type: "UPDATE_PROPOSAL_ITEM", id, updates });
  }, []);

  const removeProposalItem = useCallback((id: string) => {
    dispatch({ type: "REMOVE_PROPOSAL_ITEM", id });
  }, []);

  const setProposalsCloseRate = useCallback((rate: number) => {
    dispatch({ type: "SET_PROPOSALS_CLOSE_RATE", rate });
  }, []);

  // ── Computed Values ──

  const netCashPosition = (state.bankBalance ?? 0) - (state.accountsPayable ?? 0);

  const totalRecurringExpenses = state.recurringExpenses
    .filter((e) => e.checked)
    .reduce((sum, e) => sum + e.amount, 0);

  const totalOneOffExpenses = state.oneOffExpenses
    .filter((e) => e.checked)
    .reduce((sum, e) => sum + e.amount, 0);

  const arGross = state.arItems.reduce((sum, i) => sum + i.amount, 0);
  const arRealized = Math.round(arGross * (state.arCollectionRate / 100));

  const salesGross = state.salesItems.reduce((sum, i) => sum + i.amount, 0);
  const salesLikely = Math.round(salesGross * ((100 - state.salesCancellationRate) / 100));

  const proposalsGross = state.proposalItems.reduce((sum, i) => sum + i.amount, 0);
  const proposalsExpected = Math.round(proposalsGross * (state.proposalsCloseRate / 100));

  const totalProjectedRevenue = (state.bankBalance ?? 0) + arRealized + salesLikely + proposalsExpected;

  const projectedWeekEndBalance = totalProjectedRevenue - totalRecurringExpenses - totalOneOffExpenses;

  // ── Complete Ritual ──

  const completeRitual = useCallback(async (): Promise<CompleteRitualResponse> => {
    const request: CompleteRitualRequest = {
      franchiseId,
      completedBy: "usr_001", // TODO: inject from session
      weekStart: state.weekStart,
      weekEnd: state.weekEnd,
      bankBalance: state.bankBalance ?? 0,
      accountsPayable: state.accountsPayable ?? 0,
      recurringExpenses: state.recurringExpenses.map((e) => ({
        transactionId: e.transactionId,
        name: e.name,
        amount: e.amount,
        checked: e.checked,
      })),
      oneOffExpenses: state.oneOffExpenses
        .filter((e) => e.checked)
        .map((e) => ({
          description: e.description,
          amount: e.amount,
          makeRecurring: e.makeRecurring,
        })),
      arItems: state.arItems.map((i) => ({ note: i.note, amount: i.amount, week: i.week })),
      arCollectionRate: state.arCollectionRate,
      salesItems: state.salesItems.map((i) => ({ note: i.note, amount: i.amount, week: i.week })),
      salesCancellationRate: state.salesCancellationRate,
      proposalItems: state.proposalItems.map((i) => ({ note: i.note, amount: i.amount, week: i.week })),
      proposalsCloseRate: state.proposalsCloseRate,
    };

    const res = await fetch("/api/cash-flow/ritual", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(errBody.error ?? "Failed to save ritual");
    }

    const json = await res.json();
    const result: CompleteRitualResponse = json.data ?? json;

    // Keep state in sessionStorage so "Edit This Week" shows previous values.
    // The TTL will naturally expire it for the next week.

    // Persist completion date + bank balance so dashboard updates immediately
    try {
      localStorage.setItem(
        `lastRitualDate_${franchiseId}`,
        new Date().toISOString().slice(0, 10)
      );
      localStorage.setItem(
        `ritualBankBalance_${franchiseId}`,
        String(state.bankBalance ?? 0)
      );
    } catch {}

    return result;
  }, [franchiseId, state]);

  const abandonRitual = useCallback(() => {
    // State remains in sessionStorage for resume (24h TTL)
  }, []);

  const resetRitual = useCallback(() => {
    clearState();
    dispatch({ type: "RESET" });
  }, []);

  return {
    state,
    isResuming,
    welcomeData,
    // Week
    setWeek,
    // Navigation
    goToStep,
    nextStep,
    prevStep,
    // Step 2
    setBankBalance,
    setAccountsPayable,
    // Step 3
    setRecurringExpenses,
    toggleRecurringExpense,
    // Step 4
    addOneOffExpense,
    removeOneOffExpense,
    toggleOneOffChecked,
    toggleMakeRecurring,
    // Step 5 — AR
    addArItem,
    updateArItem,
    removeArItem,
    setArCollectionRate,
    // Step 5 — Sales
    addSalesItem,
    updateSalesItem,
    removeSalesItem,
    setSalesCancellationRate,
    // Step 5 — Proposals
    addProposalItem,
    updateProposalItem,
    removeProposalItem,
    setProposalsCloseRate,
    // Computed
    netCashPosition,
    totalRecurringExpenses,
    totalOneOffExpenses,
    arGross,
    arRealized,
    salesGross,
    salesLikely,
    proposalsGross,
    proposalsExpected,
    totalProjectedRevenue,
    projectedWeekEndBalance,
    // Actions
    completeRitual,
    abandonRitual,
    resetRitual,
  };
}

export type RitualWizardHook = ReturnType<typeof useRitualWizard>;
