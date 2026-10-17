"use server";

import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { isValidLocalPhone, toLocalPhone } from "@/lib/format";
import { looksLikeEmail, phoneToAuthEmail } from "@/lib/customer";
import type { FormState } from "@/lib/admin-types";

function text(fd: FormData, key: string): string {
  return String(fd.get(key) ?? "").trim();
}

export async function loginAction(fd: FormData): Promise<FormState> {
  const identifier = text(fd, "identifier");
  const password = String(fd.get("password") ?? "");
  if (!identifier || !password) return { error: "Enter your mobile number (or email) and password." };

  let email: string;
  if (looksLikeEmail(identifier)) {
    email = identifier.toLowerCase();
    try {
      // Customers who gave a contact email at signup can log in with it.
      const service = createServiceClient();
      const { data } = await service.from("profiles").select("phone").eq("contact_email", email).maybeSingle();
      if (data?.phone) email = phoneToAuthEmail(toLocalPhone(data.phone));
    } catch {
      // fall back to treating it as the account email
    }
  } else {
    const phone = toLocalPhone(identifier);
    if (!isValidLocalPhone(phone)) return { error: "Enter a valid mobile number like 03001234567." };
    email = phoneToAuthEmail(phone);
  }

  const supabase = await createServerSupabase();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: "Wrong mobile number / email or password." };
  redirect("/account");
}

export async function signupAction(fd: FormData): Promise<FormState> {
  const fullName = text(fd, "full_name");
  const phone = toLocalPhone(text(fd, "phone"));
  const contactEmail = text(fd, "contact_email").toLowerCase();
  const password = String(fd.get("password") ?? "");
  const confirm = String(fd.get("confirm") ?? "");

  if (fullName.length < 2) return { error: "Please enter your name." };
  if (!isValidLocalPhone(phone)) return { error: "Enter a valid mobile number like 03001234567." };
  if (contactEmail && !looksLikeEmail(contactEmail)) return { error: "That email address does not look right." };
  if (password.length < 6) return { error: "Password must be at least 6 characters." };
  if (password !== confirm) return { error: "The two passwords do not match." };

  let service;
  try {
    service = createServiceClient();
  } catch {
    return { error: "Sign up is temporarily unavailable. Please try again later." };
  }

  const { data: samePhone } = await service.from("profiles").select("id").eq("phone", phone).maybeSingle();
  if (samePhone) return { error: "This mobile number is already registered. Please log in." };
  if (contactEmail) {
    const { data: sameEmail } = await service.from("profiles").select("id").eq("contact_email", contactEmail).maybeSingle();
    if (sameEmail) return { error: "This email is already registered. Please log in." };
  }

  const { error: createError } = await service.auth.admin.createUser({
    email: phoneToAuthEmail(phone),
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName, phone, contact_email: contactEmail },
  });
  if (createError) {
    if (/already/i.test(createError.message)) return { error: "This mobile number is already registered. Please log in." };
    return { error: "We could not create your account. Please try again." };
  }

  const supabase = await createServerSupabase();
  const { error: signInError } = await supabase.auth.signInWithPassword({ email: phoneToAuthEmail(phone), password });
  if (signInError) redirect("/account/login");
  redirect("/account");
}

export async function customerLogoutAction(): Promise<void> {
  const supabase = await createServerSupabase();
  await supabase.auth.signOut();
  redirect("/");
}
