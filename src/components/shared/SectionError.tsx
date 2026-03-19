"use client";

interface SectionErrorProps {
  sectionName: string;
  onRetry: () => void;
}

export function SectionError({ sectionName, onRetry }: SectionErrorProps) {
  return (
    <div className="flex items-center justify-center py-6 text-center">
      <div>
        <p className="text-sm text-gray-500">Unable to load {sectionName}</p>
        <button
          onClick={onRetry}
          className="mt-2 text-sm text-primary-500 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
        >
          Retry
        </button>
      </div>
    </div>
  );
}
