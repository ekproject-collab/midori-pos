"use client";

import { useEffect, useState } from "react";

import { checkSupabaseConnection } from "@/services/supabase/health";

type Status = "checking" | "ok" | "error";

/**
 * Phase 0 scaffolding widget — confirms the app can reach Supabase.
 * Remove once real data flows exist.
 */
export function SupabaseStatus() {
  const [status, setStatus] = useState<Status>("checking");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    let active = true;
    checkSupabaseConnection().then((result) => {
      if (!active) return;
      if (result.ok) {
        setStatus("ok");
      } else {
        setStatus("error");
        setMessage(result.message);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const label =
    status === "checking"
      ? "Memeriksa koneksi Supabase…"
      : status === "ok"
        ? "Supabase terhubung"
        : `Supabase gagal terhubung: ${message}`;

  const dot =
    status === "checking"
      ? "bg-stone-400"
      : status === "ok"
        ? "bg-green-600"
        : "bg-red-600";

  return (
    <p className="inline-flex items-center gap-2 border border-stone-300 bg-white px-3 py-2 text-sm text-stone-700">
      <span className={`inline-block h-2 w-2 rounded-full ${dot}`} />
      {label}
    </p>
  );
}
