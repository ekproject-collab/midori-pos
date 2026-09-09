import type {
  InputHTMLAttributes,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
  ReactNode,
} from "react";

import { cn } from "@/lib/cn";

const fieldBase =
  "w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-ink-900 placeholder:text-muted focus-visible:border-matcha-600 disabled:opacity-50";

interface FieldWrapProps {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
  htmlFor?: string;
}

export function Field({
  label,
  hint,
  error,
  required,
  children,
  htmlFor,
}: FieldWrapProps) {
  return (
    <div className="space-y-1">
      {label && (
        <label
          htmlFor={htmlFor}
          className="text-ink-700 block text-sm font-semibold"
        >
          {label}
          {required && <span className="text-danger-700"> *</span>}
        </label>
      )}
      {children}
      {error ? (
        <p className="text-danger-700 text-xs font-medium">{error}</p>
      ) : hint ? (
        <p className="text-muted text-xs">{hint}</p>
      ) : null}
    </div>
  );
}

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export function Input({ invalid, className, ...props }: InputProps) {
  return (
    <input
      className={cn(fieldBase, invalid && "border-danger-700", className)}
      aria-invalid={invalid || undefined}
      {...props}
    />
  );
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean;
}

export function Select({ invalid, className, ...props }: SelectProps) {
  return (
    <select
      className={cn(fieldBase, invalid && "border-danger-700", className)}
      aria-invalid={invalid || undefined}
      {...props}
    />
  );
}

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export function Textarea({ invalid, className, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(fieldBase, invalid && "border-danger-700", className)}
      aria-invalid={invalid || undefined}
      {...props}
    />
  );
}
