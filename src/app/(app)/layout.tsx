import Link from "next/link";
import { redirect } from "next/navigation";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { signOut } from "@/app/actions";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen flex-col bg-muted/20">
      <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur">
        <div className="container flex h-14 items-center justify-between">
          <nav className="flex items-center gap-6">
            <Link
              href="/dashboard"
              className="text-base font-semibold tracking-tight"
            >
              FinançasPessoais <span className="text-primary">App</span>
            </Link>
            <div className="hidden items-center gap-4 text-sm text-muted-foreground sm:flex">
              <Link
                href="/dashboard"
                className="transition-colors hover:text-foreground"
              >
                Dashboard
              </Link>
              <Link
                href="/transacoes"
                className="transition-colors hover:text-foreground"
              >
                Transações
              </Link>
              <Link
                href="/categorias"
                className="transition-colors hover:text-foreground"
              >
                Categorias
              </Link>
            </div>
          </nav>
          <div className="flex items-center gap-2">
            <span className="hidden text-sm text-muted-foreground sm:inline">
              {user.email}
            </span>
            <ThemeToggle />
            <form action={signOut}>
              <Button
                type="submit"
                variant="ghost"
                size="sm"
                className="gap-2"
              >
                <LogOut className="size-4" />
                Sair
              </Button>
            </form>
          </div>
        </div>
      </header>
      <main className="container flex-1 py-8">{children}</main>
    </div>
  );
}
