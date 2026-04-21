"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { TransactionType } from "@/lib/supabase/types";

export type TransactionFormState = {
  error?: string;
  success?: boolean;
} | null;

function validate(formData: FormData) {
  const type = String(formData.get("type") ?? "") as TransactionType;
  const amountRaw = String(formData.get("amount") ?? "").trim();
  const date = String(formData.get("date") ?? "").trim();
  const categoryId = String(formData.get("category_id") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();

  if (type !== "income" && type !== "expense")
    return { error: "Tipo inválido." };

  // Aceita tanto "1500.50" quanto "1500,50"
  const normalized = amountRaw.replace(/\./g, "").replace(",", ".");
  const amount = Number.parseFloat(normalized);
  if (!Number.isFinite(amount) || amount <= 0)
    return { error: "Informe um valor maior que zero." };

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date))
    return { error: "Data inválida." };

  if (!categoryId) return { error: "Selecione uma categoria." };

  if (description.length > 200)
    return { error: "A descrição deve ter no máximo 200 caracteres." };

  return {
    type,
    amount: Math.round(amount * 100) / 100,
    date,
    category_id: categoryId,
    description: description || null,
  };
}

export async function createTransaction(
  _prev: TransactionFormState,
  formData: FormData,
): Promise<TransactionFormState> {
  const parsed = validate(formData);
  if ("error" in parsed) return parsed;

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sessão expirada. Faça login novamente." };

  const { error } = await supabase
    .from("transactions")
    .insert({ user_id: user.id, ...parsed });

  if (error) return { error: "Não foi possível criar a transação." };

  revalidatePath("/transacoes");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateTransaction(
  id: string,
  _prev: TransactionFormState,
  formData: FormData,
): Promise<TransactionFormState> {
  const parsed = validate(formData);
  if ("error" in parsed) return parsed;

  const supabase = createClient();
  const { error } = await supabase
    .from("transactions")
    .update(parsed)
    .eq("id", id);

  if (error) return { error: "Não foi possível atualizar a transação." };

  revalidatePath("/transacoes");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteTransaction(
  id: string,
): Promise<TransactionFormState> {
  const supabase = createClient();
  const { error } = await supabase.from("transactions").delete().eq("id", id);
  if (error) return { error: "Não foi possível excluir a transação." };

  revalidatePath("/transacoes");
  revalidatePath("/dashboard");
  return { success: true };
}
