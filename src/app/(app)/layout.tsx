import { AppHeader } from "@/components/app-header";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .maybeSingle();

  const role = profile?.role ?? "department_staff";
  const canCreateRequest =
    role === "communication_officer" || role === "manager";

  return (
    <div className="flex min-h-full flex-1 flex-col bg-zinc-50 dark:bg-zinc-900">
      <AppHeader
        fullName={profile?.full_name ?? user.email ?? ""}
        role={role}
        canCreateRequest={canCreateRequest}
      />
      <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">{children}</div>
    </div>
  );
}
