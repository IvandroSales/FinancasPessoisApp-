"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Evita mismatch de hidratação — o tema real só é conhecido no client.
  useEffect(() => setMounted(true), []);

  const toggle = () =>
    setTheme(resolvedTheme === "dark" ? "light" : "dark");

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      aria-label="Alternar tema claro/escuro"
      className="relative"
    >
      <Sun
        className={`size-4 transition-all ${
          mounted && resolvedTheme === "dark"
            ? "-rotate-90 scale-0"
            : "rotate-0 scale-100"
        }`}
      />
      <Moon
        className={`absolute size-4 transition-all ${
          mounted && resolvedTheme === "dark"
            ? "rotate-0 scale-100"
            : "rotate-90 scale-0"
        }`}
      />
      <span className="sr-only">Alternar tema</span>
    </Button>
  );
}
