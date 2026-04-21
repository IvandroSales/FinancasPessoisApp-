import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FinançasPessoais App",
  description:
    "Gestão de finanças pessoais: registre receitas e despesas, acompanhe seu saldo mensal e visualize gastos por categoria.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
