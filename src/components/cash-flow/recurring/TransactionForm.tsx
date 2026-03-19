"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/cn";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import type {
  RecurringTransaction,
  TransactionType,
  TransactionFrequency,
  TransactionCategory,
  CreateTransactionRequest,
  UpdateTransactionRequest,
} from "@/types/cash-flow";
import {
  MAX_TRANSACTION_AMOUNT,
  MAX_TRANSACTION_NAME_LENGTH,
  FREQUENCY_OPTIONS,
  CATEGORY_OPTIONS,
  DAY_OF_MONTH_OPTIONS,
  VALIDATION_MESSAGES,
} from "@/constants/cash-flow";

interface TransactionFormProps {
  open: boolean;
  transaction?: RecurringTransaction;
  onSubmit: (data: CreateTransactionRequest | UpdateTransactionRequest) => void;
  onClose: () => void;
}

export function TransactionForm({
  open,
  transaction,
  onSubmit,
  onClose,
}: TransactionFormProps) {
  const isEdit = !!transaction;
  const nameRef = useRef<HTMLInputElement>(null);
  const focusTrapRef = useFocusTrap(open);

  const [name, setName] = useState("");
  const [type, setType] = useState<TransactionType>("expense");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [frequency, setFrequency] = useState<TransactionFrequency>("monthly");
  const [dayOfMonth, setDayOfMonth] = useState<number>(1);
  const [secondDayOfMonth, setSecondDayOfMonth] = useState<number>(15);
  const [category, setCategory] = useState<TransactionCategory>("other");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open && transaction) {
      setName(transaction.name);
      setType(transaction.type ?? "expense");
      setDescription(transaction.description ?? "");
      setAmount(transaction.amount.toString());
      setFrequency(transaction.frequency);
      setDayOfMonth(transaction.dayOfMonth ?? 1);
      setSecondDayOfMonth(transaction.secondDayOfMonth ?? 15);
      setCategory(transaction.category ?? "other");
      setStartDate(transaction.startDate.split("T")[0]);
      setEndDate(transaction.endDate ?? "");
      setNotes(transaction.notes ?? "");
    } else if (open) {
      setName("");
      setType("expense");
      setDescription("");
      setAmount("");
      setFrequency("monthly");
      setDayOfMonth(1);
      setSecondDayOfMonth(15);
      setCategory("other");
      setStartDate(new Date().toISOString().split("T")[0]);
      setEndDate("");
      setNotes("");
    }
    setErrors({});
  }, [open, transaction]);

  useEffect(() => {
    if (open) {
      nameRef.current?.focus();
    }
  }, [open]);

  const validate = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim() || name.length > MAX_TRANSACTION_NAME_LENGTH) {
      newErrors.name = VALIDATION_MESSAGES.transactionNameRequired;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0 || numAmount > MAX_TRANSACTION_AMOUNT) {
      newErrors.amount = VALIDATION_MESSAGES.transactionAmountRequired;
    }

    if (!startDate) {
      newErrors.startDate = VALIDATION_MESSAGES.startDateRequired;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [name, amount, startDate]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!validate()) return;

      const data: CreateTransactionRequest = {
        name: name.trim(),
        type,
        amount: parseFloat(amount),
        frequency,
        startDate,
        description: description.trim() || undefined,
        category,
        dayOfMonth,
        secondDayOfMonth: frequency === "semimonthly" ? secondDayOfMonth : undefined,
        endDate: endDate || undefined,
        notes: notes.trim() || undefined,
      };

      onSubmit(data);
    },
    [name, type, description, amount, frequency, dayOfMonth, secondDayOfMonth, category, startDate, endDate, notes, validate, onSubmit]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    },
    [onClose]
  );

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="transaction-form-title"
      onKeyDown={handleKeyDown}
    >
      <div
        className="fixed inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      <div ref={focusTrapRef} className="relative z-10 w-full max-w-[520px] max-h-[80vh] overflow-y-auto rounded-lg bg-white shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-5">
          <h2
            id="transaction-form-title"
            className="text-lg font-bold text-neutral-800"
          >
            {isEdit ? "Edit Recurring Transaction" : "Add Recurring Transaction"}
          </h2>
          <button
            onClick={onClose}
            className="text-xl text-neutral-400 hover:text-neutral-600"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit}>
          <div className="space-y-[18px] px-6 py-6">
            {/* Payee */}
            <div>
              <label htmlFor="txn-name" className="mb-1.5 block text-[13px] font-semibold text-neutral-500">
                Payee <span className="text-danger-600">*</span>
              </label>
              <input
                ref={nameRef}
                id="txn-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={MAX_TRANSACTION_NAME_LENGTH}
                className={cn(
                  "block w-full rounded-md border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2c3e6b]",
                  errors.name ? "border-danger-600" : "border-neutral-200"
                )}
                placeholder="e.g., ABC Properties"
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? "txn-name-error" : undefined}
              />
              {errors.name && (
                <p id="txn-name-error" className="mt-1 text-xs text-danger-600">{errors.name}</p>
              )}
            </div>

            {/* Type */}
            <fieldset>
              <legend className="mb-1.5 block text-[13px] font-semibold text-neutral-500">
                Type <span className="text-danger-600">*</span>
              </legend>
              <div className="flex gap-4">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="txn-type"
                    value="expense"
                    checked={type === "expense"}
                    onChange={() => setType("expense")}
                    className="accent-[#8BC34A]"
                  />
                  <span className="text-sm text-neutral-700">Expense</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="txn-type"
                    value="income"
                    checked={type === "income"}
                    onChange={() => setType("income")}
                    className="accent-[#8BC34A]"
                  />
                  <span className="text-sm text-neutral-700">Income</span>
                </label>
              </div>
            </fieldset>

            {/* Description */}
            <div>
              <label htmlFor="txn-desc" className="mb-1.5 block text-[13px] font-semibold text-neutral-500">
                Description
              </label>
              <input
                id="txn-desc"
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="block w-full rounded-md border border-neutral-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2c3e6b]"
                placeholder="e.g., Office lease"
              />
            </div>

            {/* Amount + Frequency */}
            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <label htmlFor="txn-amount" className="mb-1.5 block text-[13px] font-semibold text-neutral-500">
                  Amount <span className="text-danger-600">*</span>
                </label>
                <input
                  id="txn-amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={MAX_TRANSACTION_AMOUNT}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className={cn(
                    "block w-full rounded-md border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2c3e6b]",
                    errors.amount ? "border-danger-600" : "border-neutral-200"
                  )}
                  placeholder="$0.00"
                  aria-invalid={!!errors.amount}
                  aria-describedby={errors.amount ? "txn-amount-error" : undefined}
                />
                {errors.amount && (
                  <p id="txn-amount-error" className="mt-1 text-xs text-danger-600">{errors.amount}</p>
                )}
              </div>
              <div>
                <label htmlFor="txn-frequency" className="mb-1.5 block text-[13px] font-semibold text-neutral-500">
                  Frequency <span className="text-danger-600">*</span>
                </label>
                <select
                  id="txn-frequency"
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value as TransactionFrequency)}
                  className="block w-full rounded-md border border-neutral-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2c3e6b]"
                >
                  {FREQUENCY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Day of Month + Category */}
            <div className={`grid gap-3.5 ${frequency === "semimonthly" ? "grid-cols-3" : "grid-cols-2"}`}>
              <div>
                <label htmlFor="txn-day" className="mb-1.5 block text-[13px] font-semibold text-neutral-500">
                  {frequency === "semimonthly" ? "1st Date" : "Day of Month"} <span className="text-danger-600">*</span>
                </label>
                <select
                  id="txn-day"
                  value={dayOfMonth}
                  onChange={(e) => setDayOfMonth(parseInt(e.target.value))}
                  className="block w-full rounded-md border border-neutral-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2c3e6b]"
                >
                  {DAY_OF_MONTH_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              {frequency === "semimonthly" && (
                <div>
                  <label htmlFor="txn-day-2" className="mb-1.5 block text-[13px] font-semibold text-neutral-500">
                    2nd Date <span className="text-danger-600">*</span>
                  </label>
                  <select
                    id="txn-day-2"
                    value={secondDayOfMonth}
                    onChange={(e) => setSecondDayOfMonth(parseInt(e.target.value))}
                    className="block w-full rounded-md border border-neutral-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2c3e6b]"
                  >
                    {DAY_OF_MONTH_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label htmlFor="txn-category" className="mb-1.5 block text-[13px] font-semibold text-neutral-500">
                  Category <span className="text-danger-600">*</span>
                </label>
                <select
                  id="txn-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as TransactionCategory)}
                  className="block w-full rounded-md border border-neutral-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2c3e6b]"
                >
                  {CATEGORY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Start Date + End Date */}
            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <label htmlFor="txn-start-date" className="mb-1.5 block text-[13px] font-semibold text-neutral-500">
                  Start Date <span className="text-danger-600">*</span>
                </label>
                <input
                  id="txn-start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={cn(
                    "block w-full rounded-md border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2c3e6b]",
                    errors.startDate ? "border-danger-600" : "border-neutral-200"
                  )}
                  aria-invalid={!!errors.startDate}
                  aria-describedby={errors.startDate ? "txn-start-error" : undefined}
                />
                {errors.startDate && (
                  <p id="txn-start-error" className="mt-1 text-xs text-danger-600">{errors.startDate}</p>
                )}
              </div>
              <div>
                <label htmlFor="txn-end-date" className="mb-1.5 block text-[13px] font-semibold text-neutral-500">
                  End Date
                </label>
                <input
                  id="txn-end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="block w-full rounded-md border border-neutral-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2c3e6b]"
                  placeholder="Optional"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label htmlFor="txn-notes" className="mb-1.5 block text-[13px] font-semibold text-neutral-500">
                Notes
              </label>
              <textarea
                id="txn-notes"
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="block w-full rounded-md border border-neutral-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2c3e6b]"
                placeholder="Any additional details..."
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 border-t border-neutral-200 px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-neutral-200 bg-white px-[18px] py-2.5 text-[13.5px] font-semibold text-neutral-800 hover:bg-neutral-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-primary-500 px-[18px] py-2.5 text-[13.5px] font-semibold text-white hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
