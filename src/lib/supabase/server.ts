// Reemplazado — Supabase removido. DB → @/lib/db (Neon), Auth → @/lib/auth (Auth.js v5).
export { auth } from "@/lib/auth";
export { sql as db } from "@/lib/db";

import { auth } from "@/lib/auth";

export async function getSessionUser() {
  const session = await auth();
  if (!session?.user) return null;
  return {
    id:         session.user.id,
    email:      session.user.email ?? "",
    role:       session.user.role,
    company_id: session.user.company_id ?? null,
  };
}

// Shim de compatibilidad para código no migrado aún
export async function createClient() {
  const session = await auth();
  const userId  = session?.user?.id ?? null;
  return {
    auth: {
      getUser: async () => ({ data: { user: userId ? { id: userId, email: session?.user?.email ?? "" } : null }, error: null }),
    },
  };
}
