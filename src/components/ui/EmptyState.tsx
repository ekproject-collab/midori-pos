import type { ReactNode } from "react";

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export function EmptyState({
  title,
  description,
  icon,
  action,
}: EmptyStateProps) {
  return (
    <div className="border-border bg-surface flex flex-col items-center justify-center gap-2 rounded-md border border-dashed px-6 py-12 text-center">
      {icon && <div className="text-muted text-3xl">{icon}</div>}
      <p className="text-ink-900 font-semibold">{title}</p>
      {description && (
        <p className="text-muted max-w-sm text-sm">{description}</p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
