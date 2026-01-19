"use client";

import { SidebarProvider } from "@/components/ui/sidebar";
import { ThemeProvider } from "./theme-provider";
import { VaultProvider } from "@/contexts/vault-context";
import { SettingsProvider } from "@/contexts/settings-context";
import { FileTreeProvider } from "@/contexts/file-tree-context";
import { UpdateManager } from "./update-manager";
import { Toaster } from "@/components/ui/sonner";

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
            <SidebarProvider>
              <Toaster />
              <UpdateManager />
              {children}
            </SidebarProvider>
          </FileTreeProvider>
        </VaultProvider>
      </SettingsProvider>
    </ThemeProvider>
  );
}
