import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 px-6 py-16">
      <div className="flex max-w-xl flex-col items-center gap-6 text-center">
        <div className="inline-flex items-center rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
          Curso NoCodeBR · Claude Code
        </div>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          FinançasPessoais <span className="text-primary">App</span>
        </h1>
        <p className="text-balance text-muted-foreground">
          Organize suas receitas e despesas, acompanhe seu saldo mensal e veja
          para onde seu dinheiro está indo — tudo em um só lugar.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/login"
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
          >
            Entrar
          </Link>
          <Link
            href="/cadastro"
            className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-5 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            Criar conta
          </Link>
        </div>
        <p className="text-xs text-muted-foreground">
          Milestone 1 · Bootstrap concluído ✨
        </p>
      </div>
    </main>
  );
}
