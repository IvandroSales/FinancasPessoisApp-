import Link from "next/link";
import { ArrowRight, ArrowDownCircle, ArrowUpCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CategoryBreakdownChart,
  type CategorySlice,
} from "@/components/dashboard/category-breakdown-chart";
import { MonthSelector } from "@/components/dashboard/month-selector";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { formatCurrency, formatDate, formatMonthYear } from "@/lib/format";
import { buildMonthOptions, monthRange } from "@/lib/periods";
import { createClient } from "@/lib/supabase/server";
import type {
  TransactionType,
  TransactionWithCategory,
} from "@/lib/supabase/types";

type SearchParams = { mes?: string };

function defaultMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function groupByCategory(
  transactions: TransactionWithCategory[],
  type: TransactionType,
): CategorySlice[] {
  const map = new Map<string, CategorySlice>();
  for (const t of transactions) {
    if (t.type !== type) continue;
    const existing = map.get(t.category.id);
    if (existing) {
      existing.value += Number(t.amount);
    } else {
      map.set(t.category.id, {
        categoryId: t.category.id,
        name: t.category.name,
        color: t.category.color,
        value: Number(t.amount),
      });
    }
  }
  return Array.from(map.values()).sort((a, b) => b.value - a.value);
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const supabase = createClient();
  const monthOptions = buildMonthOptions(12);
  const currentMonth = searchParams.mes ?? defaultMonth();
  const range = monthRange(currentMonth) ?? monthRange(defaultMonth())!;

  const { data: transactions } = await supabase
    .from("transactions")
    .select("*, category:categories(*)")
    .gte("date", range.start)
    .lt("date", range.endExclusive)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false })
    .returns<TransactionWithCategory[]>();

  const list = transactions ?? [];

  const income = list
    .filter((t) => t.type === "income")
    .reduce((acc, t) => acc + Number(t.amount), 0);

  const expense = list
    .filter((t) => t.type === "expense")
    .reduce((acc, t) => acc + Number(t.amount), 0);

  const incomeByCategory = groupByCategory(list, "income");
  const expenseByCategory = groupByCategory(list, "expense");

  const recent = list.slice(0, 5);
  const periodLabel = formatMonthYear(`${currentMonth}-01`).replace(
    /^./,
    (c) => c.toUpperCase(),
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-muted-foreground">
            Resumo de {periodLabel}.
          </p>
        </div>
        <MonthSelector monthOptions={monthOptions} current={currentMonth} />
      </div>

      <SummaryCards income={income} expense={expense} />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowUpCircle className="size-5 text-success" />
              Receitas por categoria
            </CardTitle>
            <CardDescription>
              De onde veio o dinheiro em {periodLabel}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CategoryBreakdownChart
              data={incomeByCategory}
              emptyMessage="Nenhuma receita registrada neste período."
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowDownCircle className="size-5 text-destructive" />
              Despesas por categoria
            </CardTitle>
            <CardDescription>
              Para onde foi o dinheiro em {periodLabel}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CategoryBreakdownChart
              data={expenseByCategory}
              emptyMessage="Nenhuma despesa registrada neste período."
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Transações recentes</CardTitle>
            <CardDescription>
              Últimas movimentações do período.
            </CardDescription>
          </div>
          <Button asChild variant="ghost" size="sm" className="gap-2">
            <Link href="/transacoes">
              Ver todas <ArrowRight className="size-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {recent.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Nenhuma transação no período.
            </p>
          ) : (
            <ul className="divide-y">
              {recent.map((t) => {
                const isIncome = t.type === "income";
                return (
                  <li
                    key={t.id}
                    className="flex items-center justify-between gap-4 py-3"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      {isIncome ? (
                        <ArrowUpCircle className="size-5 shrink-0 text-success" />
                      ) : (
                        <ArrowDownCircle className="size-5 shrink-0 text-destructive" />
                      )}
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {t.description || t.category.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(t.date)} · {t.category.name}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`shrink-0 text-sm font-medium tabular-nums ${
                        isIncome ? "text-success" : "text-destructive"
                      }`}
                    >
                      {isIncome ? "+ " : "− "}
                      {formatCurrency(Number(t.amount))}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
