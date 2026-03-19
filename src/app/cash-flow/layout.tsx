import type { Metadata } from "next";
import { CashFlowNav } from "@/components/cash-flow/shared/CashFlowNav";
import { getSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Cash Flow Guide — WOW OS",
  description: "Cash flow management tool for WOW 1 DAY PAINTING Franchise Partners",
};

export default async function CashFlowLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  // Map session role to cash flow role
  const cashFlowRole =
    session.role === "fom" ? "fom" : "franchise_partner";

  return (
    <div className="flex min-h-screen bg-[#f4f6f9]">
      <CashFlowNav userRole={cashFlowRole} />

      <main
        id="main-content"
        className="flex-1"
        aria-label="Cash Flow Guide content"
      >
        <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6 lg:px-8">{children}</div>
      </main>
    </div>
  );
}
