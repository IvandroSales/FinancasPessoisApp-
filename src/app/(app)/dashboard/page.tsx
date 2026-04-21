import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function DashboardPage() {
  const supabase = createClient();
  const { count } = await supabase
    .from("categories")
    .select("*", { count: "exact", head: true });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-muted-foreground">
          Visão geral das suas finanças.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Milestone 3 · Autenticação ✓</CardTitle>
          <CardDescription>
            Você está autenticado e vendo dados do Supabase com RLS ativo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Categorias cadastradas para você:{" "}
            <span className="font-semibold text-foreground">{count ?? 0}</span>
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            O CRUD de transações e o dashboard completo chegam no Milestone 4
            e 5.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
