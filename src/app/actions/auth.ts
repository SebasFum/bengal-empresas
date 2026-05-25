"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function getCurrentUser() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, role, company_id, dietary_restrictions, phone")
    .eq("id", user.id)
    .single();

  return profile
    ? { ...profile, email: user.email ?? "" }
    : null;
}

export async function updateProfile(input: {
  full_name?: string;
  phone?: string;
  dietary_restrictions?: string[];
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "No autenticado." };

  const { error } = await supabase
    .from("profiles")
    .update(input)
    .eq("id", user.id);

  if (error) return { success: false, error: error.message };
  return { success: true };
}
