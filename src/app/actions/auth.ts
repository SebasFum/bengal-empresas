"use server";

import { auth, signOut } from "@/lib/auth";
import { sql } from "@/lib/db";
import { redirect } from "next/navigation";

export async function logout() {
  await signOut({ redirectTo: "/login" });
  redirect("/login");
}

export async function getCurrentUser() {
  const session = await auth();
  if (!session?.user) return null;

  const rows = await sql`
    SELECT id, full_name, role, company_id, dietary_restrictions, phone
    FROM profiles
    WHERE id = ${session.user.id}
    LIMIT 1
  `;
  const profile = rows[0];
  if (!profile) return null;

  return {
    id:                   profile.id as string,
    full_name:            profile.full_name as string | null,
    role:                 profile.role as string,
    company_id:           profile.company_id as string | null,
    dietary_restrictions: (profile.dietary_restrictions as string[]) ?? [],
    phone:                profile.phone as string | null,
    email:                session.user.email ?? "",
  };
}

export async function updateProfile(input: {
  full_name?: string;
  phone?: string;
  dietary_restrictions?: string[];
}) {
  const session = await auth();
  if (!session?.user) return { success: false, error: "No autenticado." };

  await sql`
    UPDATE profiles SET
      full_name            = COALESCE(${input.full_name ?? null}, full_name),
      phone                = COALESCE(${input.phone ?? null}, phone),
      dietary_restrictions = COALESCE(${input.dietary_restrictions ?? null}, dietary_restrictions)
    WHERE id = ${session.user.id}
  `;

  return { success: true };
}

export async function registerUser(input: {
  email: string;
  password: string;
  full_name: string;
  role: string;
}) {
  const bcrypt = await import("bcryptjs");
  const hash   = await bcrypt.hash(input.password, 12);

  try {
    const rows = await sql`
      INSERT INTO users (email, password_hash)
      VALUES (${input.email}, ${hash})
      RETURNING id
    `;
    const userId = rows[0].id as string;

    await sql`
      INSERT INTO profiles (id, full_name, role, dietary_restrictions)
      VALUES (${userId}, ${input.full_name}, ${input.role}, '{}')
    `;

    return { success: true as const, userId };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("unique") || msg.includes("duplicate")) {
      return { success: false as const, error: "Ya existe una cuenta con ese email." };
    }
    return { success: false as const, error: "Error al crear la cuenta." };
  }
}
