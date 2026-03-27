"use server";

import { signOut as authSignOut } from "@/auth";
import { redirect } from "next/navigation";

export async function signOut() {
  await authSignOut();
  redirect("/login");
}
