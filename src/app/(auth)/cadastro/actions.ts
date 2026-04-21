"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { translateAuthError } from "@/lib/auth-errors";
import type { AuthFormState } from "../login/actions";

export async function signUp(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Preencha email e senha." };
  }

  if (password.length < 6) {
    return { error: "A senha deve ter pelo menos 6 caracteres." };
  }

  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    return { error: translateAuthError(error.message) };
  }

  // Com mailer_autoconfirm=true, o usuário já vem com session.
  // Caso contrário, data.session seria null e redirecionaríamos pro login.
  if (!data.session) {
    redirect("/login?cadastrado=1");
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}
