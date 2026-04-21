import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 px-4 py-12">
      <Link
        href="/"
        className="mb-8 text-lg font-semibold tracking-tight text-foreground"
      >
        FinançasPessoais <span className="text-primary">App</span>
      </Link>
      {children}
    </div>
  );
}
