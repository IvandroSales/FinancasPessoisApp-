"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Props = {
  monthOptions: { value: string; label: string }[];
  current: string;
};

export function MonthSelector({ monthOptions, current }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const onChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("mes", value);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-3">
      <Label htmlFor="dash-mes" className="text-sm text-muted-foreground">
        Período
      </Label>
      <Select value={current} onValueChange={onChange}>
        <SelectTrigger id="dash-mes" className="w-[180px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {monthOptions.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
