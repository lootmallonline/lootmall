"use server";

import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { toLocalPhone } from "@/lib/format";
import { phoneToAuthEmail } from "@/lib/customer";
import type { FormState } from "@/lib/admin-types";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const text = (fd: FormData, key: string) => String(fd.get(key) ?? "").trim();

export async function signupAction(_prev: FormState, fd: FormData): Promise<FormState> {
  if (text(fd, "website")) return { error: "Invalid request." }; // spam trap
  
  const phone = toLocalPhone(text(fd, "phone"));
  const password = text(fd, "password");
  const fullName = text(fd, "full_name");

  if (!phone || !password) {
    return { error: "Phone and password are required." };
  }

  const email = phoneToAuthEmail(phone);
  const supabase = await createServerSupabase();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, phone },
    },
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/account");
}

export async function loginAction(_prev: FormState, fd: FormData): Promise<FormState> {
  if (text(fd, "website")) return { error: "Invalid request." };

  const phone = toLocalPhone(text(fd, "phone"));
  const password = text(fd, "password");

  if (!phone || !password) {
    return { error: "Phone and password are required." };
  }

  const email = phoneToAuthEmail(phone);
  const supabase = await createServerSupabase();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: "Invalid phone number or password." };
  }

  redirect("/account");
}

export async function customerLogoutAction() {
  const supabase = await createServerSupabase();
  await supabase.auth.signOut();
  redirect("/login");
}
