import { auth } from "@/auth";
import { db } from "@/lib/db";
import {
  PRIORITY_LABELS,
  STATUS_LABELS,
  TYPE_LABELS,
} from "@/lib/labels";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const requests = await db.request.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      requestNumber: true,
      organizationName: true,
      status: true,
      priority: true,
      dueAt: true,
      createdAt: true,
      requestType: true,
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">الطلبات</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          آخر الطلبات حسب تاريخ التسجيل.
        </p>
      </div>

      {requests.length === 0 && (
        <p className="rounded-xl border border-dashed border-zinc-300 bg-white p-12 text-center text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400">
          لا توجد طلبات بعد. أنشئ طلبًا جديدًا من الشريط العلوي.
        </p>
      )}

      {requests.length > 0 && (
        <ul className="space-y-3">
          {requests.map((r) => (
            <li key={r.id}>
              <Link
                href={`/requests/${r.id}`}
                className="block rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:border-emerald-300 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-emerald-800"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <span className="font-mono text-sm text-zinc-500">
                      #{r.requestNumber}
                    </span>
                    <h2 className="font-medium text-zinc-900 dark:text-zinc-50">
                      {r.organizationName}
                    </h2>
                    <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                      {TYPE_LABELS[r.requestType.toLowerCase()] ??
                        r.requestType}{" "}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full bg-zinc-100 px-2 py-1 dark:bg-zinc-800">
                      {STATUS_LABELS[r.status.toLowerCase()] ?? r.status}
                    </span>
                    <span
                      className={
                        r.priority === "URGENT"
                          ? "rounded-full bg-amber-100 px-2 py-1 text-amber-900 dark:bg-amber-950 dark:text-amber-200"
                          : "rounded-full bg-zinc-100 px-2 py-1 dark:bg-zinc-800"
                      }
                    >
                      {PRIORITY_LABELS[r.priority.toLowerCase()] ?? r.priority}
                    </span>
                  </div>
                </div>
                <p className="mt-2 text-xs text-zinc-500">
                  {new Date(r.createdAt).toLocaleString("ar-SA", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                  {r.dueAt &&
                    ` · التسليم: ${new Date(r.dueAt).toLocaleString("ar-SA", {
                      dateStyle: "medium",
                    })}`}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
