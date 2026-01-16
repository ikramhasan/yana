"use client";

import { useThemeTransition } from "@/hooks/use-theme-transition";
import { useSettings } from "@/contexts/settings-context";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { IconSun, IconMoon, IconDeviceDesktop } from "@tabler/icons-react";

export function GeneralTab() {
  const { theme, setTheme } = useThemeTransition();
  const { settings, updateSetting } = useSettings();

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
              // We don't easily get the event here from ToggleGroup's onValueChange,
              // but we can try to find the button that was clicked or just use center.
              setTheme(val as "light" | "dark" | "system");
            }
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

      <Separator />

      {/* Tabs Section */}
      <div className="space-y-3">
        <div className="space-y-1">
          <h3 className="text-sm font-medium">Tabs</h3>
          <p className="text-xs text-muted-foreground">
            Configure how tabs behave
          </p>
        </div>
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="max-tabs" className="text-sm font-normal">
              Maximum open tabs
            </Label>
            <p className="text-xs text-muted-foreground">
              Oldest tabs will close automatically when limit is reached
            </p>
          </div>
          <Input
            id="max-tabs"
            type="number"
            min={1}
            max={20}
            value={settings.maxTabs}
            onChange={(e) => {
              const value = parseInt(e.target.value, 10);
              if (!isNaN(value) && value >= 1 && value <= 20) {
                updateSetting("maxTabs", value);
              }
            }}
            className="w-20"
          />
        </div>
      </div>

      {/* <Separator /> */}

      {/* Editor Section */}
      {/* <div className="space-y-3">
        <div className="space-y-1">
          <h3 className="text-sm font-medium">Editor</h3>
          <p className="text-xs text-muted-foreground">
            Customize your editor experience
          </p>
        </div>
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="hide-toolbar" className="text-sm font-normal">
              Hide Editor Toolbar
            </Label>
            <p className="text-xs text-muted-foreground">
              Hide the fixed toolbar at the top of the editor
            </p>
          </div>
          <Switch
            id="hide-toolbar"
            checked={settings.hideEditorToolbar}
            onCheckedChange={(checked) => updateSetting('hideEditorToolbar', checked)}
          />
        </div>
      </div> */}
    </div>
  );
}
