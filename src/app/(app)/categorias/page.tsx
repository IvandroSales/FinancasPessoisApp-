import { createClient } from "@/lib/supabase/server";
import type { Category } from "@/lib/supabase/types";
import {
  Card,
  CardContent,
  CardDescription,
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
import { CategoryFormDialog } from "@/components/categories/category-form-dialog";
import { DeleteCategoryButton } from "@/components/categories/delete-category-button";
import { KIND_LABELS } from "@/lib/categories/constants";

export default async function CategoriasPage() {
  const supabase = createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("kind", { ascending: true })
    .order("name", { ascending: true })
    .returns<Category[]>();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Categorias</h1>
          <p className="mt-1 text-muted-foreground">
            Organize suas transações em categorias personalizadas.
          </p>
        </div>
        <CategoryFormDialog />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Suas categorias</CardTitle>
          <CardDescription>
            {categories?.length ?? 0}{" "}
            {categories?.length === 1 ? "categoria" : "categorias"} no total.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!categories || categories.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Nenhuma categoria ainda. Clique em &quot;Nova categoria&quot; para
              começar.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="w-24 text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>
                      <span
                        aria-hidden
                        className="block size-4 rounded-full"
                        style={{ backgroundColor: c.color }}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center rounded-full border bg-muted/50 px-2 py-0.5 text-xs font-medium">
                        {KIND_LABELS[c.kind]}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <CategoryFormDialog category={c} />
                        <DeleteCategoryButton id={c.id} name={c.name} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
