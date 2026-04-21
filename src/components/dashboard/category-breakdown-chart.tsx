"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { formatCurrency } from "@/lib/format";

export type CategorySlice = {
  categoryId: string;
  name: string;
  value: number;
  color: string;
};

type Props = {
  data: CategorySlice[];
  emptyMessage?: string;
};

export function CategoryBreakdownChart({
  data,
  emptyMessage = "Nenhum dado neste período.",
}: Props) {
  if (data.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </p>
    );
  }

  const total = data.reduce((acc, d) => acc + d.value, 0);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="flex min-h-[260px] items-center justify-center">
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              innerRadius={60}
              paddingAngle={2}
              strokeWidth={2}
              stroke="hsl(var(--background))"
            >
              {data.map((entry) => (
                <Cell key={entry.categoryId} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number, name) => [formatCurrency(value), name]}
              contentStyle={{
                borderRadius: 8,
                border: "1px solid hsl(var(--border))",
                backgroundColor: "hsl(var(--background))",
                fontSize: 12,
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="space-y-3">
        {data.map((d) => {
          const pct = total > 0 ? (d.value / total) * 100 : 0;
          return (
            <div
              key={d.categoryId}
              className="flex items-center justify-between gap-4 border-b pb-2 last:border-none"
            >
              <div className="flex min-w-0 items-center gap-2">
                <span
                  aria-hidden
                  className="size-3 shrink-0 rounded-full"
                  style={{ backgroundColor: d.color }}
                />
                <span className="truncate text-sm font-medium">{d.name}</span>
              </div>
              <div className="flex items-baseline gap-3 text-right">
                <span className="text-xs tabular-nums text-muted-foreground">
                  {pct.toFixed(1).replace(".", ",")}%
                </span>
                <span className="text-sm font-medium tabular-nums">
                  {formatCurrency(d.value)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
