import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import MiCuentaClient from "./MiCuentaClient";

export default async function MiCuentaPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase
        .from("profiles")
        .select("full_name, phone, dietary_restrictions, role, company_id")
        .eq("id", user.id)
        .single()
    : { data: null };

  const { data: company } = profile?.company_id
    ? await supabase
        .from("companies")
        .select("name, delivery_time, budget_per_person")
        .eq("id", profile.company_id)
        .single()
    : { data: null };

  return (
    <Suspense>
      <MiCuentaClient
        initialName={profile?.full_name ?? ""}
        initialPhone={profile?.phone ?? ""}
        initialRestrictions={profile?.dietary_restrictions ?? []}
        email={user?.email ?? ""}
        role={profile?.role ?? "employee"}
        companyName={company?.name ?? null}
        deliveryTime={company?.delivery_time ?? null}
      />
    </Suspense>
  );
}
