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

  const name = text(fd, "full_name");
  if (name.length < 2) return { error: "Enter your full name." };
  const phone = toLocalPhone(text(fd, "phone"));
  if (!phone) return { error: "Enter a valid mobile number, for example 03XXXXXXXXX." };
  const email = text(fd, "email").toLowerCase();
  if (email && !EMAIL_RE.test(email)) return { error: "Enter a valid email address or leave it empty." };
  const password = String(fd.get("password") ?? "");
  if (password.length < 8) return { error: "Password must be at least 8 characters." };

  let service: ReturnType<typeof createServiceClient>;
  try {
    service = createServiceClient();
  } catch {
    return { error: "Sign up is not available right now. Please try again later." };
  }

  const authEmail = phoneToAuthEmail(phone);
  const { error } = await service.auth.admin.createUser({
    email: authEmail,
    password,
    email_confirm: true,
    user_metadata: { full_name: name, phone, contact_email: email },
  });
  if (error) {
    console.error("signup failed:", error.message);
    if (/password/i.test(error.message)) return { error: error.message };
    return { error: "This mobile number or email is already registered. Please log in instead." };
  }

  const supabase = await createServerSupabase();
  const { error: signInError } = await supabase.auth.signInWithPassword({ email: authEmail, password });
  if (signInError) redirect("/account/login");
  redirect("/account");
}

export async function loginAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const identifier = text(fd, "identifier");
  const password = String(fd.get("password") ?? "");
  if (!identifier || !password) return { error: "Enter your mobile number (or email) and password." };

  let authEmail: string | null = null;
  if (identifier.includes("@")) {
    // Email login: find the mobile number registered with this email.
    try {
      const service = createServiceClient();
      const { data } = await service
        .from("profiles")
        .select("phone")
        .eq("contact_email", identifier.toLowerCase())
        .maybeSingle();
      if (data?.phone) authEmail = phoneToAuthEmail(data.phone as string);
    } catch {
      authEmail = null;
    }
  } else {
    const phone = toLocalPhone(identifier);
    if (phone) authEmail = phoneToAuthEmail(phone);
  }

  const wrong: FormState = { error: "Wrong mobile number / email or password." };
  if (!authEmail) return wrong;

  const supabase = await createServerSupabase();
  const { error } = await supabase.auth.signInWithPassword({ email: authEmail, password });
  if (error) return wrong;
  redirect("/account");
}

export async function customerLogoutAction(): Promise<void> {
  const supabase = await createServerSupabase();
  await supabase.auth.signOut();
  redirect("/");
}
