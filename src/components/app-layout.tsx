'use client';

import { useVault } from "@/contexts/vault-context";
import { AppSidebar } from "@/components/app-sidebar";
import { CommandMenu } from "@/components/command-menu";
import { WelcomeScreen } from "@/components/welcome-screen";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { currentVault, isLoading } = useVault();

  // Show loading state while checking for vaults
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  // Show welcome screen if no vault exists
  if (!currentVault) {
    return <WelcomeScreen />;
  }

  // Show full app with sidebar and command menu when vault exists
  return (
    <>
      <AppSidebar />
      <CommandMenu />
      {children}
    </>
  );
}
