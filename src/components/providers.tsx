"use client";

import { SidebarProvider } from "@/components/ui/sidebar";
import { ThemeProvider } from "./theme-provider";
import { VaultProvider } from "@/contexts/vault-context";
import { SettingsProvider } from "@/contexts/settings-context";
import { FileTreeProvider } from "@/contexts/file-tree-context";

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
          <FileTreeProvider>
            <SidebarProvider>{children}</SidebarProvider>
          </FileTreeProvider>
        </VaultProvider>
      </SettingsProvider>
    </ThemeProvider>
  );
}
