"use server";

import { redirect } from "next/navigation";

import { env } from "@/lib/env";

import { getSupabaseServerClient } from "./server";

export interface LoginState {
  error: string | null;
}

/** Server Action: sign the admin in with email + password. */
export async function signInAdmin(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email dan password wajib diisi." };
  }

  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    return { error: "Email atau password salah." };
  }

  if (
    env.adminEmail &&
    data.user.email?.toLowerCase() !== env.adminEmail.toLowerCase()
  ) {
    await supabase.auth.signOut();
    return { error: "Akun ini tidak memiliki akses admin." };
  }

  redirect("/admin");
}

/** Server Action: sign out and return to the login screen. */
export async function signOutAdmin(): Promise<void> {
  const supabase = await getSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
