"use client";

import { SidebarProvider } from "@/components/ui/sidebar";
import { ThemeProvider } from "./theme-provider";
import { VaultProvider } from "@/contexts/vault-context";
import { SettingsProvider } from "@/contexts/settings-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <SettingsProvider>
        <VaultProvider>
          <SidebarProvider>{children}</SidebarProvider>
        </VaultProvider>
      </SettingsProvider>
    </ThemeProvider>
  );
}
