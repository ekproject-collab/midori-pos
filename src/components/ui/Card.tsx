import type { HTMLAttributes } from "react";

import { cn } from "@/lib/cn";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Add a hard offset shadow (used for elevated / interactive cards). */
  raised?: boolean;
}

export function Card({ raised = false, className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "border-border bg-surface rounded-md border",
        raised && "shadow-hard-sm",
        className,
      )}
      {...props}
    />
  );
}

export function CardBody({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-4", className)} {...props} />;
}

export function CardHeader({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "border-border border-b px-4 py-3 font-semibold",
        className,
      )}
      {...props}
    />
  );
}
