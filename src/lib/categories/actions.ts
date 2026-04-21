"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "./constants";
import type { CategoryKind } from "@/lib/supabase/types";

const VALID_KINDS: CategoryKind[] = ["income", "expense", "both"];

export type CategoryFormState = {
  error?: string;
  success?: boolean;
} | null;

function validate(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const kind = String(formData.get("kind") ?? "") as CategoryKind;
  const color = String(formData.get("color") ?? "#64748b").trim();

  if (!name) return { error: "Informe um nome para a categoria." };
  if (name.length > 40) return { error: "O nome deve ter no máximo 40 caracteres." };
  if (!VALID_KINDS.includes(kind))
    return { error: "Selecione se é Receita, Despesa ou Ambos." };
  if (!/^#[0-9a-f]{6}$/i.test(color))
    return { error: "Cor inválida." };

  return { name, kind, color };
}

export async function createCategory(
  _prev: CategoryFormState,
  formData: FormData,
): Promise<CategoryFormState> {
  const parsed = validate(formData);
  if ("error" in parsed) return parsed;

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sessão expirada. Faça login novamente." };

  const baseSlug = slugify(parsed.name);
  // Garante slug único por usuário tentando sufixos incrementais.
  let finalSlug = baseSlug;
  for (let i = 2; i < 50; i++) {
    const { data } = await supabase
      .from("categories")
      .select("id")
      .eq("user_id", user.id)
      .eq("slug", finalSlug)
      .maybeSingle();
    if (!data) break;
    finalSlug = `${baseSlug}-${i}`;
  }

  const { error } = await supabase.from("categories").insert({
    user_id: user.id,
    name: parsed.name,
    slug: finalSlug,
    kind: parsed.kind,
    color: parsed.color,
  });

  if (error) return { error: "Não foi possível criar a categoria." };

  revalidatePath("/categorias");
  revalidatePath("/transacoes");
  return { success: true };
}

export async function updateCategory(
  id: string,
  _prev: CategoryFormState,
  formData: FormData,
): Promise<CategoryFormState> {
  const parsed = validate(formData);
  if ("error" in parsed) return parsed;

  const supabase = createClient();
  const { error } = await supabase
    .from("categories")
    .update({
      name: parsed.name,
      kind: parsed.kind,
      color: parsed.color,
    })
    .eq("id", id);

  if (error) return { error: "Não foi possível atualizar a categoria." };

  revalidatePath("/categorias");
  revalidatePath("/transacoes");
  return { success: true };
}

export async function deleteCategory(id: string): Promise<CategoryFormState> {
  const supabase = createClient();
  const { error } = await supabase.from("categories").delete().eq("id", id);

  if (error) {
    // FK violation (transações vinculadas)
    if (error.code === "23503") {
      return {
        error:
          "Esta categoria tem transações vinculadas. Exclua ou mova as transações antes.",
      };
    }
    return { error: "Não foi possível excluir a categoria." };
  }

  revalidatePath("/categorias");
  revalidatePath("/transacoes");
  return { success: true };
}
