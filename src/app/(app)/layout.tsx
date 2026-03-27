import { AppHeader } from "@/components/app-header";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const userId = session.user.id as string | undefined;
  const user = userId
    ? await db.user.findUnique({ where: { id: userId } })
    : null;

  const role = user?.role ?? "DEPARTMENT_STAFF";
  const canCreateRequest = role === "COMMUNICATION_OFFICER" || role === "MANAGER";

  return (
    <div className="flex min-h-full flex-1 flex-col bg-zinc-50 dark:bg-zinc-900">
      <AppHeader
        fullName={user?.name ?? session.user.email ?? ""}
        role={role}
        canCreateRequest={canCreateRequest}
      />
      <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">{children}</div>
    </div>
  );
}
