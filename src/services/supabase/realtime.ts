import type { Pesanan } from "@/types";

import { getSupabaseClient } from "./client";

export interface OrderChangeHandlers {
  onInsert: (row: Pesanan) => void;
  onUpdate: (row: Pesanan) => void;
}

/**
 * Subscribe to live `pesanan` INSERT/UPDATE events (admin order queue).
 * Returns an unsubscribe function. Auth is taken from the current session so
 * RLS applies — only the admin receives events.
 */
export function subscribeToOrderChanges(
  handlers: OrderChangeHandlers,
): () => void {
  const supabase = getSupabaseClient();
  let disposed = false;

  const setup = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session) await supabase.realtime.setAuth(session.access_token);
    if (disposed) return null;

    return supabase
      .channel("admin-order-queue")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "pesanan" },
        (payload) => handlers.onInsert(payload.new as Pesanan),
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "pesanan" },
        (payload) => handlers.onUpdate(payload.new as Pesanan),
      )
      .subscribe();
  };

  const channelPromise = setup();

  return () => {
    disposed = true;
    channelPromise.then((channel) => {
      if (channel) supabase.removeChannel(channel);
    });
  };
}
