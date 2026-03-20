"use client";

import { useCallback } from "react";

interface BankBalanceStepProps {
  bankBalance: number | null;
  accountsPayable: number | null;
  onSetBankBalance: (amount: number) => void;
  onSetAccountsPayable: (amount: number) => void;
}

function parseMoney(val: string): number {
  return parseInt(val.replace(/[^0-9]/g, "")) || 0;
}

function fmtInput(n: number): string {
  return n > 0 ? n.toLocaleString() : "";
}

function fmt(n: number): string {
  const sign = n < 0 ? "-" : "";
  return sign + "$" + Math.abs(n).toLocaleString();
}

export function BankBalanceStep({
  bankBalance,
  accountsPayable,
  onSetBankBalance,
  onSetAccountsPayable,
}: BankBalanceStepProps) {
  const netCash = (bankBalance ?? 0) - (accountsPayable ?? 0);

  const handleBankChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = parseMoney(e.target.value);
      e.target.value = fmtInput(val);
      onSetBankBalance(val);
    },
    [onSetBankBalance]
  );

  const handleApChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = parseMoney(e.target.value);
      e.target.value = fmtInput(val);
      onSetAccountsPayable(val);
    },
    [onSetAccountsPayable]
  );

  return (
    <>
      {/* Soft band */}
      <div className="border-b border-[#f2f1ef] border-l-[3px] border-l-[#8BC34A] bg-[#f7f6f3] px-8 py-6">
        <div className="text-[22px] font-bold tracking-[-0.03em] text-[#1a1a1a]">
          What&apos;s your current bank balance?
        </div>
        <div className="mt-1 text-[13px] text-[#6b7280]">
          Log in to your business bank account and enter the balance you see right now.
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-col gap-4 p-7">
        {/* Callout */}
        <div className="flex items-start gap-2 rounded-[9px] border border-[#bfdbfe] bg-[#eff6ff] px-3.5 py-3">
          <span className="mt-px flex-shrink-0 text-sm">💡</span>
          <p className="text-xs font-medium leading-relaxed text-[#1e40af]">
            This will carry forward as <strong>Money in Bank</strong> in the Revenue step — you won&apos;t need to enter it again.
          </p>
        </div>

        {/* Bank Balance */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-[#1a1a1a]">Current Bank Balance</label>
          <p className="text-[11px] font-medium text-[#a0aab4]">
            As shown in your business bank account right now
          </p>
          <div className="mt-1 flex items-center overflow-hidden rounded-[10px] border border-[#e8e8e5] bg-white transition-all focus-within:border-[#8BC34A] focus-within:ring-2 focus-within:ring-[#8BC34A]/15">
            <div className="flex items-center self-stretch border-r border-[#e8e8e5] bg-[#f2f1ef] px-3 font-mono text-sm font-bold text-[#6b7280]">
              $
            </div>
            <input
              type="text"
              className="min-h-[44px] flex-1 border-none bg-transparent px-4 py-3.5 font-mono text-[22px] font-medium text-[#1a1a1a] outline-none placeholder:text-[#a0aab4]"
              defaultValue={bankBalance != null ? fmtInput(bankBalance) : ""}
              onChange={handleBankChange}
              placeholder="0"
              autoFocus
            />
          </div>
        </div>

        {/* Accounts Payable */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-[#1a1a1a]">
            Accounts Payable — <span className="font-medium text-[#a0aab4]">Optional</span>
          </label>
          <p className="text-[11px] font-medium text-[#a0aab4]">
            Outstanding bills you owe but haven&apos;t paid yet
          </p>
          <div className="mt-1 flex items-center overflow-hidden rounded-[10px] border border-[#e8e8e5] bg-white transition-all focus-within:border-[#8BC34A] focus-within:ring-2 focus-within:ring-[#8BC34A]/15">
            <div className="flex items-center self-stretch border-r border-[#e8e8e5] bg-[#f2f1ef] px-3 font-mono text-sm font-bold text-[#6b7280]">
              $
            </div>
            <input
              type="text"
              className="min-h-[44px] flex-1 border-none bg-transparent px-3.5 py-3 font-mono text-[15px] font-medium text-[#1a1a1a] outline-none placeholder:text-[#a0aab4]"
              defaultValue={accountsPayable != null ? fmtInput(accountsPayable) : ""}
              onChange={handleApChange}
              placeholder="0"
            />
          </div>
        </div>

        {/* Net Cash Position */}
        <div className="flex items-center justify-between rounded-[12px] border-[2px] border-[#c5e49a] bg-[#f1f8e9] px-5 py-4">
          <div>
            <div className="text-[13px] font-bold text-[#3d6b14]">Net Cash Position</div>
            <div className="mt-0.5 text-[11px] font-medium text-[#6a9e32]">
              Bank Balance minus Accounts Payable
            </div>
          </div>
          <div className="font-mono text-2xl font-bold text-[#3d6b14]">{fmt(netCash)}</div>
        </div>
      </div>
    </>
  );
}
