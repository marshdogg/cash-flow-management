import { SkeletonCard } from "@/components/shared/SkeletonCard";
import { SkeletonRow } from "@/components/shared/SkeletonRow";

export default function DashboardLoading() {
  return (
    <div className="flex min-h-screen bg-neutral-50">
      {/* Sidebar skeleton */}
      <aside className="hidden w-60 border-r border-gray-200 bg-white lg:block" aria-hidden="true">
        <div className="animate-pulse space-y-4 p-4">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-full bg-gray-200" />
            <div className="space-y-1">
              <div className="h-3 w-16 rounded bg-gray-200" />
              <div className="h-2 w-24 rounded bg-gray-200" />
            </div>
          </div>
          <div className="mt-8 space-y-2">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="h-10 rounded-md bg-gray-100" />
            ))}
          </div>
        </div>
      </aside>

      {/* Main content skeleton */}
      <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="animate-pulse">
            <div className="h-8 w-48 rounded bg-gray-200" />
            <div className="mt-1 h-4 w-72 rounded bg-gray-200" />
          </div>

          {/* Tabs */}
          <div className="flex gap-4 border-b border-gray-200 pb-3">
            <div className="h-5 w-20 rounded bg-gray-200" />
            <div className="h-5 w-16 rounded bg-gray-200" />
            <div className="h-5 w-24 rounded bg-gray-200" />
          </div>

          {/* Period selector */}
          <div className="h-9 w-96 rounded-lg bg-gray-100" />

          {/* KPI grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>

          {/* Two-column layout */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
            <div className="space-y-3 rounded-lg border border-gray-200 bg-white p-5">
              <div className="h-5 w-32 rounded bg-gray-200" />
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
            </div>
            <div className="space-y-3 rounded-lg border border-gray-200 bg-white p-5">
              <div className="h-5 w-24 rounded bg-gray-200" />
              <div className="grid grid-cols-2 gap-3">
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
