"use client";

import { SidebarProvider } from "@/components/ui/sidebar";
import { ThemeProvider } from "./theme-provider";
import { VaultProvider } from "@/contexts/vault-context";
import { SettingsProvider } from "@/contexts/settings-context";
import { FileTreeProvider } from "@/contexts/file-tree-context";
import { TabsProvider } from "@/contexts/tabs-context";

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
            <TabsProvider>
              <SidebarProvider>{children}</SidebarProvider>
            </TabsProvider>
          </FileTreeProvider>
        </VaultProvider>
      </SettingsProvider>
    </ThemeProvider>
  );
}
