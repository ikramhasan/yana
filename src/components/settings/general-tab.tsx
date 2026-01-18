"use client";

import { useThemeTransition } from "@/hooks/use-theme-transition";
import { useSettings } from "@/contexts/settings-context";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { IconSun, IconMoon, IconDeviceDesktop, IconRefresh, IconLoader } from "@tabler/icons-react";
import { useUpdate } from "@/hooks/use-update";
import { Button } from "@/components/ui/button";

export function GeneralTab() {
  const { theme, setTheme } = useThemeTransition();
  const { settings, updateSetting } = useSettings();
  const { version, isChecking, checkForUpdates } = useUpdate();

  return (
    <div className="space-y-6">
      {/* Theme Section */}
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
            if (val) {
              setTheme(val as "light" | "dark" | "system");
            }
          }}
          className="grid grid-cols-3 gap-3"
        >
          <ToggleGroupItem
            value="light"
            aria-label="Light"
            className="flex h-auto gap-2 py-2 border data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:border-primary hover:bg-accent hover:text-accent-foreground"
          >
            <IconSun className="size-5" />
            <span className="text-xs font-bold uppercase">Light</span>
          </ToggleGroupItem>
          <ToggleGroupItem
            value="dark"
            aria-label="Dark"
            className="flex h-auto gap-2 py-2 border data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:border-primary hover:bg-accent hover:text-accent-foreground"
          >
            <IconMoon className="size-5" />
            <span className="text-xs font-bold uppercase">Dark</span>
          </ToggleGroupItem>
          <ToggleGroupItem
            value="system"
            aria-label="System"
            className="flex h-auto gap-2 py-2 border data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:border-primary hover:bg-accent hover:text-accent-foreground"
          >
            <IconDeviceDesktop className="size-5" />
            <span className="text-xs font-bold uppercase">System</span>
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      <Separator className="opacity-50" />

      {/* Updates Section */}
      <div className="space-y-4">
        <div className="space-y-1">
          <h3 className="text-sm font-medium">Updates</h3>
          <p className="text-xs text-muted-foreground">
            Current version: <span className="font-mono">{version}</span>
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="auto-check" className="text-sm font-normal">
              Automatically check for updates
            </Label>
            <p className="text-xs text-muted-foreground">
              Yana will notify you when a new version is available
            </p>
          </div>
          <Switch
            id="auto-check"
            checked={settings.autoCheckUpdates}
            onCheckedChange={(checked) => updateSetting('autoCheckUpdates', checked)}
          />
        </div>

        <div className="pt-1">
          <Button
            variant="outline"
            className="w-full justify-start gap-2 h-9"
            onClick={() => checkForUpdates(true)}
            disabled={isChecking}
          >
            {isChecking ? (
              <IconLoader className="size-4 animate-spin text-muted-foreground" />
            ) : (
              <IconRefresh className="size-4 text-muted-foreground" />
            )}
            <span className="flex-1 text-left">Check for Updates</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
