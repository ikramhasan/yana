"use client";

import { useTheme } from "next-themes";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { IconSun, IconMoon, IconDeviceDesktop } from "@tabler/icons-react";

export function GeneralTab() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div className="space-y-1">
          <h3 className="text-sm font-medium">Theme</h3>
          <p className="text-xs text-muted-foreground">
            Choose your preferred theme
          </p>
        </div>
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
  );
}
