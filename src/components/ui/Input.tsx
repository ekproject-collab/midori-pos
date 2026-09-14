import type {
  InputHTMLAttributes,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
  ReactNode,
} from "react";

import { cn } from "@/lib/cn";

type FieldSize = "md" | "lg";

const fieldBase =
  "w-full rounded-md border border-border bg-surface text-ink-900 placeholder:text-muted focus-visible:border-matcha-600 disabled:opacity-50";

const fieldSizes: Record<FieldSize, string> = {
  md: "px-3 py-2 text-sm",
  lg: "px-4 py-3 text-base",
};

interface FieldWrapProps {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
  htmlFor?: string;
  /** Bumps label/hint/error text to match a "lg" Input/Select/Textarea. */
  size?: FieldSize;
}

export function Field({
  label,
  hint,
  error,
  required,
  children,
  htmlFor,
  size = "md",
}: FieldWrapProps) {
  const labelSize = size === "lg" ? "text-base" : "text-sm";
  const noteSize = size === "lg" ? "text-sm" : "text-xs";
  return (
    <div className="space-y-1">
      {label && (
        <label
          htmlFor={htmlFor}
          className={cn("text-ink-700 block font-semibold", labelSize)}
        >
          {label}
          {required && <span className="text-danger-700"> *</span>}
        </label>
      )}
      {children}
      {error ? (
        <p className={cn("text-danger-700 font-medium", noteSize)}>{error}</p>
      ) : hint ? (
        <p className={cn("text-muted", noteSize)}>{hint}</p>
      ) : null}
    </div>
  );
}

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  invalid?: boolean;
  /** Shadows the native (character-width) `size` attribute — unused here. */
  size?: FieldSize;
}

export function Input({
  invalid,
  size = "md",
  className,
  ...props
}: InputProps) {
  return (
    <input
      className={cn(
        fieldBase,
        fieldSizes[size],
        invalid && "border-danger-700",
        className,
      )}
      aria-invalid={invalid || undefined}
      {...props}
    />
  );
}

export interface SelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  invalid?: boolean;
  /** Shadows the native (visible-rows) `size` attribute — unused here. */
  size?: FieldSize;
}

export function Select({
  invalid,
  size = "md",
  className,
  ...props
}: SelectProps) {
  return (
    <select
      className={cn(
        fieldBase,
        fieldSizes[size],
        invalid && "border-danger-700",
        className,
      )}
      aria-invalid={invalid || undefined}
      {...props}
    />
  );
}

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
  size?: FieldSize;
}

export function Textarea({
  invalid,
  size = "md",
  className,
  ...props
}: TextareaProps) {
  return (
    <textarea
      className={cn(
        fieldBase,
        fieldSizes[size],
        invalid && "border-danger-700",
        className,
      )}
      aria-invalid={invalid || undefined}
      {...props}
    />
  );
}
