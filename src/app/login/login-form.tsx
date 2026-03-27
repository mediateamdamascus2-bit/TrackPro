"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/dashboard";

  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    try {
      let supabase;
      try {
        supabase = createClient();
      } catch (err) {
        setMessage("Supabase غير مهيّأ. أضف مفاتيح Supabase ثم أعد تشغيل التطبيق.");
        return;
      }

      if (mode === "register") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
            emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
          },
        });
        if (error) {
          setMessage(error.message);
          return;
        }
        setMessage(
          "تم إنشاء الحساب. إن كان التأكيد بالبريد مفعّلًا، راجع بريدك ثم سجّل الدخول.",
        );
        setMode("login");
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setMessage(error.message);
        return;
      }

      router.push(next.startsWith("/") ? next : "/dashboard");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full max-w-sm flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
    >
      <div className="flex gap-2 rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800">
        <button
          type="button"
          className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
            mode === "login"
              ? "bg-white text-zinc-900 shadow dark:bg-zinc-700 dark:text-zinc-50"
              : "text-zinc-600 dark:text-zinc-400"
          }`}
          onClick={() => setMode("login")}
        >
          دخول
        </button>
        <button
          type="button"
          className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
            mode === "register"
              ? "bg-white text-zinc-900 shadow dark:bg-zinc-700 dark:text-zinc-50"
              : "text-zinc-600 dark:text-zinc-400"
          }`}
          onClick={() => setMode("register")}
        >
          حساب جديد
        </button>
      </div>

      {mode === "register" && (
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-zinc-600 dark:text-zinc-400">الاسم</span>
          <input
            required
            type="text"
            autoComplete="name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
          />
        </label>
      )}

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-zinc-600 dark:text-zinc-400">البريد</span>
        <input
          required
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
          dir="ltr"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-zinc-600 dark:text-zinc-400">كلمة المرور</span>
        <input
          required
          type="password"
          autoComplete={
            mode === "register" ? "new-password" : "current-password"
          }
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
          dir="ltr"
        />
      </label>

      {message && (
        <p className="text-sm text-amber-800 dark:text-amber-200">{message}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-emerald-800 py-2.5 text-sm font-medium text-white hover:bg-emerald-900 disabled:opacity-50 dark:bg-emerald-700 dark:hover:bg-emerald-600"
      >
        {loading ? "جارٍ التنفيذ…" : mode === "login" ? "دخول" : "تسجيل"}
      </button>

      <p className="text-center text-xs text-zinc-500">
        أول مستخدم؟ سجّل حسابًا ثم اجعل المدير يحدّث دورك في جدول{" "}
        <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">
          profiles
        </code>{" "}
        ليصبح بإمكانك إنشاء الطلبات.
      </p>
    </form>
  );
}
