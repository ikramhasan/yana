"use client";

import * as React from "react";
import { IconCheck, IconChevronsDown, IconFolder } from "@tabler/icons-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useVault } from "@/contexts/vault-context";

export function VaultSwitcher() {
  const { vaults, currentVault, setDefaultVault } = useVault();

  return (
    <SidebarMenu className="w-full">
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground w-full text-left"
            >
              <div className="bg-sidebar-accent text-sidebar-accent-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                <IconFolder className="size-4" />
              </div>
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="text-[10px] text-muted-foreground">Vault</span>
                <span className="font-medium">
                  {currentVault?.name ?? "No vault"}
                </span>
              </div>
              <IconChevronsDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {vaults.map((vault) => (
              <DropdownMenuItem
                key={vault.id}
                onSelect={() => setDefaultVault(vault.id)}
              >
                {vault.name}
                {vault.isDefault && <IconCheck className="ml-auto" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
