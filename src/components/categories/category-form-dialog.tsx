"use client";

import { useEffect, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Plus, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  createCategory,
  updateCategory,
  type CategoryFormState,
} from "@/lib/categories/actions";
import { CATEGORY_COLORS, KIND_LABELS } from "@/lib/categories/constants";
import type { Category, CategoryKind } from "@/lib/supabase/types";

type Props = { category?: Category };

export function CategoryFormDialog({ category }: Props) {
  const isEdit = !!category;
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<CategoryKind>(category?.kind ?? "expense");
  const [color, setColor] = useState<string>(category?.color ?? CATEGORY_COLORS[0]);

  const boundAction = isEdit
    ? updateCategory.bind(null, category!.id)
    : createCategory;
  const [state, formAction] = useFormState<CategoryFormState, FormData>(
    boundAction,
    null,
  );

  useEffect(() => {
    if (state?.success) setOpen(false);
  }, [state?.success]);

  useEffect(() => {
    if (open && category) {
      setKind(category.kind);
      setColor(category.color);
    }
  }, [open, category]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isEdit ? (
          <Button variant="ghost" size="icon" aria-label="Editar categoria">
            <Pencil className="size-4" />
          </Button>
        ) : (
          <Button className="gap-2">
            <Plus className="size-4" />
            Nova categoria
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Editar categoria" : "Nova categoria"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Atualize o nome, tipo ou cor."
              : "Defina o nome, o tipo (receita/despesa) e a cor."}
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cat-name">Nome</Label>
            <Input
              id="cat-name"
              name="name"
              required
              maxLength={40}
              defaultValue={category?.name ?? ""}
              placeholder="Ex: Mercado, Uber, Salário extra"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cat-kind">Tipo</Label>
            <Select
              value={kind}
              onValueChange={(v) => setKind(v as CategoryKind)}
            >
              <SelectTrigger id="cat-kind">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="expense">{KIND_LABELS.expense}</SelectItem>
                <SelectItem value="income">{KIND_LABELS.income}</SelectItem>
                <SelectItem value="both">{KIND_LABELS.both}</SelectItem>
              </SelectContent>
            </Select>
            <input type="hidden" name="kind" value={kind} />
          </div>

          <div className="space-y-2">
            <Label>Cor</Label>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  aria-label={`Cor ${c}`}
                  className={cn(
                    "size-8 rounded-full border-2 transition-all",
                    color === c
                      ? "border-foreground scale-110"
                      : "border-transparent hover:scale-105",
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
            <input type="hidden" name="color" value={color} />
          </div>

          {state?.error && (
            <p
              role="alert"
              className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              {state.error}
            </p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <SubmitButton isEdit={isEdit} />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function SubmitButton({ isEdit }: { isEdit: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Salvando..." : isEdit ? "Salvar" : "Criar"}
    </Button>
  );
}
