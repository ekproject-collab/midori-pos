import { NextResponse } from "next/server";

import { pingSupabaseDatabase } from "@/services/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  const result = await pingSupabaseDatabase();

  if (!result.ok) {
    return NextResponse.json(
      {
        status: "error",
        database: "unreachable",
        message: result.message,
        timestamp: new Date().toISOString(),
      },
      {
        status: 503,
        headers: { "Cache-Control": "no-store, max-age=0" },
      },
    );
  }

  return NextResponse.json(
    {
      status: "ok",
      database: "connected",
      timestamp: new Date().toISOString(),
    },
    {
      status: 200,
      headers: { "Cache-Control": "no-store, max-age=0" },
    },
  );
}

export async function HEAD() {
  const result = await pingSupabaseDatabase();
  return new Response(null, {
    status: result.ok ? 200 : 503,
    headers: { "Cache-Control": "no-store, max-age=0" },
  });
}
