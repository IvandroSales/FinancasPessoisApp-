import type { CategoryKind } from "@/lib/supabase/types";

export const CATEGORY_COLORS: string[] = [
  "#22c55e", // verde
  "#10b981", // esmeralda
  "#3b82f6", // azul
  "#8b5cf6", // violeta
  "#ef4444", // vermelho
  "#f97316", // laranja
  "#eab308", // amarelo
  "#ec4899", // rosa
  "#14b8a6", // teal
  "#64748b", // slate
];

export const KIND_LABELS: Record<CategoryKind, string> = {
  income: "Receita",
  expense: "Despesa",
  both: "Ambos",
};

export function slugify(text: string): string {
  const slug = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || `cat-${Date.now()}`;
}
