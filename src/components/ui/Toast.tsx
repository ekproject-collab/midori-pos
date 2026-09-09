"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { cn } from "@/lib/cn";

type ToastTone = "info" | "success" | "danger";

interface Toast {
  id: number;
  message: string;
  tone: ToastTone;
}

interface ToastContextValue {
  show: (message: string, tone?: ToastTone) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx;
}

const toneClasses: Record<ToastTone, string> = {
  info: "border-ink-900 bg-surface text-ink-900",
  success: "border-success-700 bg-success-100 text-success-700",
  danger: "border-danger-700 bg-danger-100 text-danger-700",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);

  const show = useCallback((message: string, tone: ToastTone = "info") => {
    const id = nextId.current++;
    setToasts((list) => [...list, { id, message, tone }]);
    setTimeout(() => {
      setToasts((list) => list.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const value = useMemo(() => ({ show }), [show]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex flex-col items-center gap-2 px-4">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={cn(
              "shadow-hard-sm pointer-events-auto w-full max-w-sm rounded-md border px-4 py-3 text-sm font-medium",
              toneClasses[t.tone],
            )}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
