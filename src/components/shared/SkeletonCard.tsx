import { cn } from "@/lib/cn";

interface SkeletonCardProps {
  className?: string;
}

export function SkeletonCard({ className }: SkeletonCardProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg border border-gray-200 bg-white p-5",
        className
      )}
      aria-hidden="true"
    >
      <div className="h-3 w-20 rounded bg-gray-200" />
      <div className="mt-3 h-8 w-24 rounded bg-gray-200" />
      <div className="mt-3 h-2 w-full rounded bg-gray-200" />
      <div className="mt-2 h-2 w-16 rounded bg-gray-200" />
    </div>
  );
}
