import { ArrowDownCircle, ArrowUpCircle } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DeleteTransactionButton } from "@/components/transactions/delete-transaction-button";
import { TransactionFilters } from "@/components/transactions/transaction-filters";
import { TransactionFormDialog } from "@/components/transactions/transaction-form-dialog";
import { formatCurrency, formatDate } from "@/lib/format";
import { buildMonthOptions, monthRange } from "@/lib/periods";
import { createClient } from "@/lib/supabase/server";
import type { Category, TransactionWithCategory } from "@/lib/supabase/types";

type SearchParams = { mes?: string; categoria?: string };

export default async function TransacoesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const supabase = createClient();
  const monthOptions = buildMonthOptions(12);

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("name")
    .returns<Category[]>();

  let query = supabase
    .from("transactions")
    .select("*, category:categories(*)")
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

  if (searchParams.mes) {
    const range = monthRange(searchParams.mes);
    if (range) {
      query = query.gte("date", range.start).lt("date", range.endExclusive);
    }
  }
  if (searchParams.categoria) {
    query = query.eq("category_id", searchParams.categoria);
  }

  const { data: transactions } = await query.returns<TransactionWithCategory[]>();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Transações</h1>
          <p className="mt-1 text-muted-foreground">
            Registre e acompanhe todas as suas receitas e despesas.
          </p>
        </div>
        <TransactionFormDialog categories={categories ?? []} />
      </div>

      <Card>
        <CardHeader className="gap-4">
          <CardTitle className="text-base">Filtros</CardTitle>
          <TransactionFilters
            categories={categories ?? []}
            monthOptions={monthOptions}
          />
        </CardHeader>
        <CardContent>
          {!transactions || transactions.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              Nenhuma transação encontrada com os filtros selecionados.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10"></TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead className="w-24 text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((t) => {
                  const isIncome = t.type === "income";
                  return (
                    <TableRow key={t.id}>
                      <TableCell>
                        {isIncome ? (
                          <ArrowUpCircle
                            className="size-5 text-success"
                            aria-label="Receita"
                          />
                        ) : (
                          <ArrowDownCircle
                            className="size-5 text-destructive"
                            aria-label="Despesa"
                          />
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(t.date)}
                      </TableCell>
                      <TableCell className="max-w-[280px] truncate">
                        {t.description || (
                          <span className="italic text-muted-foreground">
                            Sem descrição
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-2 text-sm">
                          <span
                            aria-hidden
                            className="size-2.5 rounded-full"
                            style={{ backgroundColor: t.category.color }}
                          />
                          {t.category.name}
                        </span>
                      </TableCell>
                      <TableCell
                        className={`text-right font-medium ${
                          isIncome ? "text-success" : "text-destructive"
                        }`}
                      >
                        {isIncome ? "+ " : "− "}
                        {formatCurrency(Number(t.amount))}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <TransactionFormDialog
                            transaction={t}
                            categories={categories ?? []}
                          />
                          <DeleteTransactionButton id={t.id} />
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
