import { signOut } from "@/app/(app)/actions";
import { ROLE_LABELS } from "@/lib/labels";
import Link from "next/link";

type Props = {
  fullName: string;
  role: string;
  canCreateRequest: boolean;
};

export function AppHeader({ fullName, role, canCreateRequest }: Props) {
  const roleLabel = ROLE_LABELS[role] ?? role;

  return (
    <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-4">
        <Link
          href="/dashboard"
          className="text-sm font-semibold text-emerald-900 dark:text-emerald-400"
        >
          TrackPro
        </Link>
        <nav className="flex flex-1 items-center justify-end gap-4 text-sm">
          <Link
            href="/dashboard"
            className="text-zinc-700 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white"
          >
            الطلبات
          </Link>
          {canCreateRequest && (
            <Link
              href="/requests/new"
              className="rounded-lg bg-emerald-800 px-3 py-1.5 font-medium text-white hover:bg-emerald-900 dark:bg-emerald-700 dark:hover:bg-emerald-600"
            >
              طلب جديد
            </Link>
          )}
          <span className="hidden text-zinc-500 sm:inline dark:text-zinc-400">
            {fullName || "—"} · {roleLabel}
          </span>
          <form action={signOut}>
            <button
              type="submit"
              className="text-zinc-600 underline hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
            >
              خروج
            </button>
          </form>
        </nav>
      </div>
    </header>
  );
}
