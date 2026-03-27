import { createClient } from "@/lib/supabase/server";
import {
  PRIORITY_LABELS,
  STATUS_LABELS,
  TYPE_LABELS,
} from "@/lib/labels";
import Link from "next/link";

type DeptRow = { name_ar: string };
type RequestRow = {
  id: string;
  request_number: number;
  organization_name: string;
  status: string;
  priority: string;
  due_at: string | null;
  created_at: string;
  request_type_slug: string;
  departments: DeptRow | DeptRow[] | null;
};

function deptName(row: RequestRow): string {
  const d = row.departments;
  if (!d) return "—";
  return Array.isArray(d) ? (d[0]?.name_ar ?? "—") : d.name_ar;
}

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: raw, error } = await supabase
    .from("requests")
    .select(
      `
      id,
      request_number,
      organization_name,
      status,
      priority,
      due_at,
      created_at,
      request_type_slug,
      departments ( name_ar )
    `,
    )
    .order("created_at", { ascending: false });

  const requests = (raw ?? []) as RequestRow[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">الطلبات</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          آخر الطلبات حسب تاريخ التسجيل.
        </p>
      </div>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
          تعذر تحميل الطلبات: {error.message}
        </p>
      )}

      {!error && requests.length === 0 && (
        <p className="rounded-xl border border-dashed border-zinc-300 bg-white p-12 text-center text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400">
          لا توجد طلبات بعد. أنشئ طلبًا جديدًا من الشريط العلوي.
        </p>
      )}

      {!error && requests.length > 0 && (
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
                      #{r.request_number}
                    </span>
                    <h2 className="font-medium text-zinc-900 dark:text-zinc-50">
                      {r.organization_name}
                    </h2>
                    <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                      {TYPE_LABELS[r.request_type_slug] ?? r.request_type_slug}{" "}
                      · {deptName(r)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full bg-zinc-100 px-2 py-1 dark:bg-zinc-800">
                      {STATUS_LABELS[r.status] ?? r.status}
                    </span>
                    <span
                      className={
                        r.priority === "urgent"
                          ? "rounded-full bg-amber-100 px-2 py-1 text-amber-900 dark:bg-amber-950 dark:text-amber-200"
                          : "rounded-full bg-zinc-100 px-2 py-1 dark:bg-zinc-800"
                      }
                    >
                      {PRIORITY_LABELS[r.priority] ?? r.priority}
                    </span>
                  </div>
                </div>
                <p className="mt-2 text-xs text-zinc-500">
                  {new Date(r.created_at).toLocaleString("ar-SA", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                  {r.due_at &&
                    ` · التسليم: ${new Date(r.due_at).toLocaleString("ar-SA", {
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
