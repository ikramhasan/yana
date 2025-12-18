"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { Separator } from "@/components/ui/separator";
import { IconPencil, IconLayoutSidebar } from "@tabler/icons-react";

type ShortcutItem = {
  label: string;
  keys: string[];
};

type ShortcutSection = {
  title: string;
  icon: React.ReactNode;
  shortcuts: ShortcutItem[];
};

const sections: ShortcutSection[] = [
  {
    title: "Writing",
    icon: <IconPencil className="size-4" />,
    shortcuts: [
      { label: "Bold", keys: ["⌘", "B"] },
      { label: "Italic", keys: ["⌘", "I"] },
      { label: "Underline", keys: ["⌘", "U"] },
      { label: "Strikethrough", keys: ["⌘", "⇧", "S"] },
      { label: "Inline Code", keys: ["⌘", "E"] },
      { label: "Link", keys: ["⌘", "K"] },
    ],
  },
  {
    title: "Editor",
    icon: <IconLayoutSidebar className="size-4" />,
    shortcuts: [
      { label: "Toggle Sidebar", keys: ["⌘", "S"] },
      { label: "Command Menu", keys: ["⌘", "K"] },
      { label: "Undo", keys: ["⌘", "Z"] },
      { label: "Redo", keys: ["⌘", "⇧", "Z"] },
    ],
  },
];

export function KeyboardShortcutsDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-6 gap-6">
        <DialogHeader className="p-0">
          <DialogTitle className="text-xl font-bold uppercase tracking-wide">
            Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-6">
          {sections.map((section) => (
            <div key={section.title} className="space-y-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide">
                  {section.icon}
                  <span>{section.title}</span>
                </div>
                <Separator />
              </div>

              <div className="space-y-2">
                {section.shortcuts.map((shortcut) => (
                  <div
                    key={shortcut.label}
                    className="flex items-center justify-between py-1"
                  >
                    <span className="text-sm text-muted-foreground">
                      {shortcut.label}
                    </span>
                    <KbdGroup>
                      {shortcut.keys.map((key, index) => (
                        <Kbd key={index}>{key}</Kbd>
                      ))}
                    </KbdGroup>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
