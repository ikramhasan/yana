"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import {
  IconSun,
  IconMoon,
  IconDeviceDesktop,
  IconPalette,
  IconFolder,
  IconPlus,
  IconCheck,
} from "@tabler/icons-react";
import { Separator } from "@/components/ui/separator";
import { useVault } from "@/contexts/vault-context";
import { Spinner } from "@/components/ui/spinner";

export function SettingsDialog({
  children,
  open,
  onOpenChange,
}: {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const { theme, setTheme } = useTheme();
  const { vaults, currentVault, isLoading, addVault, setDefaultVault } =
    useVault();
  const [isAddingVault, setIsAddingVault] = React.useState(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px] p-6 gap-6">
        <DialogHeader className="p-0">
          <DialogTitle className="text-xl font-bold uppercase tracking-wide">
            Settings
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-6">
          {/* Appearance Section */}
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide">
                <IconPalette className="size-4" />
                <span>Appearance</span>
              </div>
              <Separator />
            </div>

            <div className="space-y-3">
              <p className="text-sm text-neutral-500">
                Choose your preferred theme
              </p>
              <ToggleGroup
                type="single"
                value={theme ?? undefined}
                onValueChange={(val: string | null) => {
                  if (val) setTheme(val as "light" | "dark" | "system");
                }}
                className="grid grid-cols-3 gap-3"
              >
                <ToggleGroupItem
                  value="light"
                  aria-label="Light"
                  className="flex h-auto gap-2 py-2 border data-[state=on]:bg-black data-[state=on]:text-white data-[state=on]:border-black hover:bg-neutral-100 hover:text-black"
                >
                  <IconSun className="size-5" />
                  <span className="text-xs font-bold uppercase">Light</span>
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="dark"
                  aria-label="Dark"
                  className="flex h-auto gap-2 py-2 border data-[state=on]:bg-black data-[state=on]:text-white data-[state=on]:border-black hover:bg-neutral-100 hover:text-black"
                >
                  <IconMoon className="size-5" />
                  <span className="text-xs font-bold uppercase">Dark</span>
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="system"
                  aria-label="System"
                  className="flex h-auto gap-2 py-2 border data-[state=on]:bg-black data-[state=on]:text-white data-[state=on]:border-black hover:bg-neutral-100 hover:text-black"
                >
                  <IconDeviceDesktop className="size-5" />
                  <span className="text-xs font-bold uppercase">System</span>
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          </div>

          {/* Vault Section */}
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide">
                <IconFolder className="size-4" />
                <span>Vault</span>
              </div>
              <Separator />
            </div>

            <div className="space-y-3">
              <p className="text-sm text-neutral-500">
                Manage your note vaults
              </p>

              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Spinner className="size-6" />
                </div>
              ) : (
                <>
                  {vaults.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                        All Vaults
                      </span>
                      <div className="space-y-2 pt-2">
                        {vaults.map((vault) => (
                          <Card
                            key={vault.id}
                            className="rounded-none border shadow-none bg-transparent"
                          >
                            <CardContent className="flex items-center justify-between">
                              <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                  {vault.isDefault && (
                                    <div className="size-2 rounded-full bg-green-500" />
                                  )}
                                  <span className="font-bold text-base text-foreground">
                                    {vault.name}
                                  </span>
                                </div>
                                <span className="text-xs text-muted-foreground">
                                  {vault.path}
                                </span>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button
                    variant="outline"
                    className="w-full h-12 border-dashed border-2 hover:bg-neutral-50 hover:border-neutral-300 transition-colors"
                    onClick={async () => {
                      setIsAddingVault(true);
                      try {
                        await addVault();
                      } finally {
                        setIsAddingVault(false);
                      }
                    }}
                    disabled={isAddingVault}
                  >
                    {isAddingVault ? (
                      <Spinner className="size-4" />
                    ) : (
                      <>
                        <IconPlus className="size-4 mr-2" />
                        <span className="font-medium uppercase tracking-wide text-xs">
                          Add another vault
                        </span>
                      </>
                    )}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
