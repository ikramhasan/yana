"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Card, CardContent } from "@/components/ui/card";
import { useTheme } from "next-themes";
import {
  IconSun,
  IconMoon,
  IconDeviceDesktop,
  IconPalette,
  IconFolder,
  IconFolderOpen,
} from "@tabler/icons-react";
import { Separator } from "@/components/ui/separator";

export function SettingsDialog({
  children,
  open,
  onOpenChange,
  versions = ["Notes", "Blogs"],
  defaultVault = "Notes",
}: {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  versions?: string[];
  defaultVault?: string;
}) {
  const { theme, setTheme } = useTheme();
  const [selectedVault, setSelectedVault] = React.useState(defaultVault);

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

              <Card className="rounded-none border shadow-none bg-transparent">
                <CardContent className="flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                      Current Vault
                    </span>
                    <span className="font-bold text-base">{selectedVault}</span>
                    <span className="text-xs text-neutral-400">
                      ~/Documents/yana/{selectedVault.toLowerCase()}
                    </span>
                  </div>
                  <div className="size-2 rounded-full bg-green-500" />
                </CardContent>
              </Card>

              <div>
                <Select
                  value={selectedVault}
                  onValueChange={(val) => val && setSelectedVault(val)}
                >
                  <SelectTrigger className="w-full h-12 border-dashed border-2 hover:bg-neutral-50 hover:border-neutral-300 transition-colors [&>svg]:hidden justify-center text-neutral-500 font-medium uppercase tracking-wide text-xs">
                    <div className="flex items-center gap-2">
                      <IconFolderOpen className="size-4" />
                      <span>Change Vault</span>
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {versions.map((v) => (
                      <SelectItem key={v} value={v}>
                        {v}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
