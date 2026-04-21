"use client";

import { useEffect, useMemo, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { ArrowDownCircle, ArrowUpCircle, Pencil, Plus } from "lucide-react";

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
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  createTransaction,
  updateTransaction,
  type TransactionFormState,
} from "@/lib/transactions/actions";
import type {
  Category,
  Transaction,
  TransactionType,
} from "@/lib/supabase/types";

type Props = {
  transaction?: Transaction;
  categories: Category[];
};

function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function TransactionFormDialog({ transaction, categories }: Props) {
  const isEdit = !!transaction;
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<TransactionType>(
    transaction?.type ?? "expense",
  );
  const [categoryId, setCategoryId] = useState<string>(
    transaction?.category_id ?? "",
  );

  const availableCategories = useMemo(
    () =>
      categories.filter((c) => c.kind === type || c.kind === "both"),
    [categories, type],
  );

  useEffect(() => {
    if (!open) return;
    // Se a categoria atual não é compatível com o novo tipo, seleciona a primeira
    const valid = availableCategories.some((c) => c.id === categoryId);
    if (!valid) {
      setCategoryId(availableCategories[0]?.id ?? "");
    }
  }, [type, availableCategories, categoryId, open]);

  useEffect(() => {
    if (open && transaction) {
      setType(transaction.type);
      setCategoryId(transaction.category_id);
    }
  }, [open, transaction]);

  const boundAction = isEdit
    ? updateTransaction.bind(null, transaction!.id)
    : createTransaction;
  const [state, formAction] = useFormState<TransactionFormState, FormData>(
    boundAction,
    null,
  );

  useEffect(() => {
    if (state?.success) setOpen(false);
  }, [state?.success]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isEdit ? (
          <Button variant="ghost" size="icon" aria-label="Editar transação">
            <Pencil className="size-4" />
          </Button>
        ) : (
          <Button className="gap-2">
            <Plus className="size-4" />
            Nova transação
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Editar transação" : "Nova transação"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Atualize os dados da transação."
              : "Registre uma receita ou despesa."}
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setType("expense")}
              className={cn(
                "flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-colors",
                type === "expense"
                  ? "border-destructive bg-destructive/10 text-destructive"
                  : "border-input hover:bg-muted",
              )}
            >
              <ArrowDownCircle className="size-4" />
              Despesa
            </button>
            <button
              type="button"
              onClick={() => setType("income")}
              className={cn(
                "flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-colors",
                type === "income"
                  ? "border-success bg-success/10 text-success"
                  : "border-input hover:bg-muted",
              )}
            >
              <ArrowUpCircle className="size-4" />
              Receita
            </button>
          </div>
          <input type="hidden" name="type" value={type} />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tx-amount">Valor (R$)</Label>
              <Input
                id="tx-amount"
                name="amount"
                type="text"
                inputMode="decimal"
                required
                placeholder="0,00"
                defaultValue={
                  transaction
                    ? String(transaction.amount).replace(".", ",")
                    : ""
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tx-date">Data</Label>
              <Input
                id="tx-date"
                name="date"
                type="date"
                required
                defaultValue={transaction?.date ?? todayISO()}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tx-category">Categoria</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger id="tx-category">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {availableCategories.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-muted-foreground">
                    Nenhuma categoria disponível para este tipo.
                  </div>
                ) : (
                  availableCategories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      <span className="flex items-center gap-2">
                        <span
                          className="size-3 rounded-full"
                          style={{ backgroundColor: c.color }}
                        />
                        {c.name}
                      </span>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <input type="hidden" name="category_id" value={categoryId} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tx-description">Descrição (opcional)</Label>
            <Textarea
              id="tx-description"
              name="description"
              maxLength={200}
              placeholder="Ex: Almoço no restaurante, pagamento mensal..."
              defaultValue={transaction?.description ?? ""}
            />
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
