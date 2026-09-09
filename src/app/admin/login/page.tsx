"use client";

import { useActionState } from "react";

import { Button, Field, Input } from "@/components/ui";
import { signInAdmin, type LoginState } from "@/services/supabase/auth-actions";

const initialState: LoginState = { error: null };

export default function AdminLoginPage() {
  const [state, formAction, pending] = useActionState(
    signInAdmin,
    initialState,
  );

  return (
    <main className="bg-background flex min-h-dvh items-center justify-center p-6">
      <div className="border-border bg-surface shadow-hard-sm w-full max-w-sm space-y-6 border p-6">
        <div className="space-y-1 text-center">
          <p className="text-3xl" aria-hidden>
            茶
          </p>
          <h1 className="text-xl font-bold">Midori Admin</h1>
          <p className="text-muted text-sm">Masuk untuk mengelola pesanan.</p>
        </div>

        <form action={formAction} className="space-y-4">
          <Field label="Email" htmlFor="email">
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="username"
              required
            />
          </Field>
          <Field label="Password" htmlFor="password">
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
          </Field>

          {state.error && (
            <p className="border-danger-700/30 bg-danger-100 text-danger-700 border px-3 py-2 text-sm font-medium">
              {state.error}
            </p>
          )}

          <Button type="submit" size="lg" block disabled={pending}>
            {pending ? "Memproses…" : "Masuk"}
          </Button>
        </form>
      </div>
    </main>
  );
}
