"use client";

import { SidebarProvider } from "@/components/ui/sidebar";
import { ThemeProvider } from "./theme-provider";
import { VaultProvider } from "@/contexts/vault-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <VaultProvider>
        <SidebarProvider>{children}</SidebarProvider>
      </VaultProvider>
    </ThemeProvider>
  );
}
