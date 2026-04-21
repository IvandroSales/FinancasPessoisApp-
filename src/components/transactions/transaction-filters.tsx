"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Category } from "@/lib/supabase/types";

type Props = {
  categories: Category[];
  monthOptions: { value: string; label: string }[];
};

const ALL = "all";

export function TransactionFilters({ categories, monthOptions }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const mes = searchParams.get("mes") ?? monthOptions[0]?.value ?? ALL;
  const categoria = searchParams.get("categoria") ?? ALL;

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === ALL) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
      router.push(`${pathname}?${params.toString()}`);
    },
    [searchParams, router, pathname],
  );

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-1.5">
        <Label htmlFor="f-mes" className="text-xs text-muted-foreground">
          Período
        </Label>
        <Select
          value={mes}
          onValueChange={(v) => updateParam("mes", v)}
        >
          <SelectTrigger id="f-mes">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Todos os períodos</SelectItem>
            {monthOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="f-cat" className="text-xs text-muted-foreground">
          Categoria
        </Label>
        <Select
          value={categoria}
          onValueChange={(v) => updateParam("categoria", v)}
        >
          <SelectTrigger id="f-cat">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Todas as categorias</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                <span className="flex items-center gap-2">
                  <span
                    className="size-3 rounded-full"
                    style={{ backgroundColor: c.color }}
                  />
                  {c.name}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
