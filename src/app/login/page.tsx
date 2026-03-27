import { LoginForm } from "./login-form";
import Link from "next/link";
import { Suspense } from "react";

export default function LoginPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center gap-8 bg-zinc-100 px-4 py-16 dark:bg-zinc-950">
      <div className="text-center">
        <p className="text-sm font-medium text-emerald-800 dark:text-emerald-400">
          TrackPro
        </p>
        <h1 className="mt-2 text-2xl font-semibold">تسجيل الدخول</h1>
      </div>
      <Suspense fallback={<div className="h-64 w-full max-w-sm animate-pulse rounded-2xl bg-zinc-200 dark:bg-zinc-800" />}>
        <LoginForm />
      </Suspense>
      <Link
        href="/"
        className="text-sm text-zinc-600 underline hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
      >
        العودة للرئيسية
      </Link>
    </div>
  );
}
