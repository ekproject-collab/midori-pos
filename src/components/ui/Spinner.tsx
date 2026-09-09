import { cn } from "@/lib/cn";

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      role="status"
      aria-label="Memuat"
      className={cn(
        "border-cream-300 border-t-matcha-600 inline-block h-5 w-5 animate-spin rounded-full border-2",
        className,
      )}
    />
  );
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("bg-cream-200 block animate-pulse rounded-sm", className)}
    />
  );
}
