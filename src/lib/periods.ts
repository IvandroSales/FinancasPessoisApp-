import { formatMonthYear } from "./format";

/**
 * Gera as opções dos últimos N meses (incluindo o atual) no formato
 * `YYYY-MM` com label capitalizado em pt-BR (ex: "Abril 2026").
 */
export function buildMonthOptions(count = 12) {
  const now = new Date();
  const options: { value: string; label: string }[] = [];

  for (let i = 0; i < count; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const label = formatMonthYear(d).replace(/^./, (c) => c.toUpperCase());
    options.push({ value: `${yyyy}-${mm}`, label });
  }

  return options;
}

/**
 * Dado "YYYY-MM", retorna o intervalo [first, lastExclusive] em formato ISO
 * date (YYYY-MM-DD) para uso em filtros SQL `>= first AND < lastExclusive`.
 */
export function monthRange(value: string): { start: string; endExclusive: string } | null {
  const match = /^(\d{4})-(\d{2})$/.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const start = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(Date.UTC(year, month, 1));
  return {
    start: start.toISOString().slice(0, 10),
    endExclusive: end.toISOString().slice(0, 10),
  };
}
