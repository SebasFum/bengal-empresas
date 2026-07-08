import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { sql } from "@/lib/db";
import MiCuentaClient from "./MiCuentaClient";

export default async function MiCuentaPage() {
  const session = await auth();
  const userId  = session?.user?.id;

  const profileRows = userId ? await sql`
    SELECT full_name, phone, dietary_restrictions, role, company_id
    FROM profiles WHERE id = ${userId} LIMIT 1
  ` : [];
  const profile = profileRows[0] ?? null;

  const companyRows = profile?.company_id ? await sql`
    SELECT name, delivery_time FROM companies WHERE id = ${profile.company_id as string} LIMIT 1
  ` : [];
  const company = companyRows[0] ?? null;

  return (
    <Suspense>
      <MiCuentaClient
        initialName={(profile?.full_name as string | null) ?? ""}
        initialPhone={(profile?.phone as string | null) ?? ""}
        initialRestrictions={(profile?.dietary_restrictions as string[] | null) ?? []}
        email={session?.user?.email ?? ""}
        role={(profile?.role as string | null) ?? "empresa"}
        companyName={(company?.name as string | null) ?? null}
        deliveryTime={(company?.delivery_time as string | null) ?? null}
      />
    </Suspense>
  );
}
