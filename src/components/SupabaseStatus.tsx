"use client";

import { useEffect, useState } from "react";

import { Badge } from "@/components/ui";
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

  if (status === "checking") {
    return <Badge tone="neutral">Memeriksa koneksi Supabase…</Badge>;
  }
  if (status === "ok") {
    return <Badge tone="success">Supabase terhubung</Badge>;
  }
  return <Badge tone="danger">Supabase gagal: {message}</Badge>;
}
