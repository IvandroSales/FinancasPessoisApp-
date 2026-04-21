import { ArrowDownCircle, ArrowUpCircle, Wallet } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

type Props = {
  income: number;
  expense: number;
};

export function SummaryCards({ income, expense }: Props) {
  const balance = income - expense;
  const balancePositive = balance >= 0;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardDescription>Receitas</CardDescription>
          <ArrowUpCircle className="size-5 text-success" />
        </CardHeader>
        <CardContent>
          <CardTitle className="text-3xl font-semibold text-success">
            {formatCurrency(income)}
          </CardTitle>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardDescription>Despesas</CardDescription>
          <ArrowDownCircle className="size-5 text-destructive" />
        </CardHeader>
        <CardContent>
          <CardTitle className="text-3xl font-semibold text-destructive">
            {formatCurrency(expense)}
          </CardTitle>
        </CardContent>
      </Card>

      <Card className="sm:col-span-2 lg:col-span-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardDescription>Saldo</CardDescription>
          <Wallet
            className={cn(
              "size-5",
              balancePositive ? "text-primary" : "text-destructive",
            )}
          />
        </CardHeader>
        <CardContent>
          <CardTitle
            className={cn(
              "text-3xl font-semibold",
              balancePositive ? "text-foreground" : "text-destructive",
            )}
          >
            {formatCurrency(balance)}
          </CardTitle>
        </CardContent>
      </Card>
    </div>
  );
}
