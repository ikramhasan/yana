"use client"

import * as React from "react"
import {
  IconFilePlus,
  IconFileText,
  IconSun,
  IconMoon,
  IconFolderPlus,
  IconLayoutSidebar,
  IconKeyboard,
} from "@tabler/icons-react";
import { useTheme } from "next-themes";
import { useVault } from "@/contexts/vault-context";
import { useFileTree } from "@/contexts/file-tree-context";
import type { FileNode } from "@/types/file-tree";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  Command,
} from "@/components/ui/command"
import {
  registerKeyboardShortcuts,
  type KeyboardShortcut,
} from "@/lib/keyboard-shortcuts";
import { useSidebar } from "./ui/sidebar";
import { KeyboardShortcutsDialog } from "./keyboard-shortcuts-dialog";

export function CommandMenu() {
  const [open, setOpen] = React.useState(false);
  const [shortcutsOpen, setShortcutsOpen] = React.useState(false);
  const { toggleSidebar } = useSidebar();
  const { theme, setTheme } = useTheme();
  const { currentVault } = useVault();
  const { nodes, selectFile, createNewNote, createNewFolder } = useFileTree();

  React.useEffect(() => {
    const handleOpenOpen = () => setOpen(true);
    window.addEventListener("open-command-menu", handleOpenOpen);

    const shortcuts: KeyboardShortcut[] = [
      {
        id: "toggle-command-menu",
        key: "k",
        metaOrCtrl: true,
        description: "Toggle command menu",
        action: () => {
          setOpen((open) => !open);
        },
      },
    ];

    const cleanup = registerKeyboardShortcuts(shortcuts);
    return () => {
      cleanup();
      window.removeEventListener("open-command-menu", handleOpenOpen);
    };
  }, []);

  const runCommand = React.useCallback((command: () => unknown) => {
    setOpen(false);
    command();
  }, []);

  const allFiles = React.useMemo(() => {
    const files: FileNode[] = [];
    const flatten = (nodesList: FileNode[]) => {
      for (const node of nodesList) {
        if (node.type === "file") {
          files.push(node);
        }
        if (node.children) {
          flatten(node.children);
        }
      }
    };
    flatten(nodes);
    return files;
  }, [nodes]);

  return (
    <>
    <CommandDialog open={open} onOpenChange={setOpen}>
      <Command>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Suggestions">
            <CommandItem
              onSelect={() => {
                runCommand(() => {
                  if (currentVault?.path) createNewNote(currentVault.path);
                });
              }}
            >
              <IconFilePlus className="mr-2 size-4" />
              <span>New Note</span>
            </CommandItem>
            <CommandItem
              onSelect={() => {
                runCommand(() => {
                  if (currentVault?.path) createNewFolder(currentVault.path);
                });
              }}
            >
              <IconFolderPlus className="mr-2 size-4" />
              <span>New Folder</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Theme">
            <CommandItem
              onSelect={() =>
                runCommand(() => setTheme(theme === "dark" ? "light" : "dark"))
              }
            >
              <div className="flex items-center">
                <IconSun className="mr-2 size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <IconMoon className="absolute mr-2 size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span>Switch Theme</span>
              </div>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Others">
            <CommandItem onSelect={() => runCommand(() => toggleSidebar())}>
              <div className="flex items-center">
                <IconLayoutSidebar className="mr-2 size-4" />
                <span>Toggle Sidebar</span>
              </div>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => setShortcutsOpen(true))}>
              <div className="flex items-center">
                <IconKeyboard className="mr-2 size-4" />
                <span>Keyboard Shortcuts</span>
              </div>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Files">
            {allFiles.map((file) => (
              <CommandItem
                key={file.id}
                onSelect={() => {
                  runCommand(() => selectFile(file));
                }}
              >
                <IconFileText className="mr-2 size-4" />
                <span>{file.name}</span>
                <span className="text-muted-foreground ml-2 text-[10px] truncate">
                  {file.path.replace(currentVault?.path ?? "", "")}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
    <KeyboardShortcutsDialog open={shortcutsOpen} onOpenChange={setShortcutsOpen} />
    </>
  );
}
