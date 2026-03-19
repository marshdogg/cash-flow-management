import { cn } from "@/lib/cn";

interface SkeletonRowProps {
  className?: string;
}

export function SkeletonRow({ className }: SkeletonRowProps) {
  return (
    <div
      className={cn(
        "flex animate-pulse items-center gap-3 rounded-md bg-neutral-50 p-3",
        className
      )}
      aria-hidden="true"
    >
      <div className="h-5 w-5 rounded-full bg-gray-200" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-3/4 rounded bg-gray-200" />
        <div className="h-2 w-1/2 rounded bg-gray-200" />
      </div>
    </div>
  );
}
