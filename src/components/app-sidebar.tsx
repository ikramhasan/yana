import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenuItem,
    SidebarMenuButton,
  } from "@/components/ui/sidebar";
  import { VaultSwitcher } from "./vault-switcher";
  import SearchBar from "./search-bar";
  import { IconSettings, IconFilePlus, IconFolderPlus } from "@tabler/icons-react";
  
  import { SettingsDialog } from "./settings";
  import { FileTree } from "./file-tree";
  import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuTrigger,
  } from "@/components/ui/context-menu";
  import { useVault } from "@/contexts/vault-context";
  import { useFileTree } from "@/contexts/file-tree-context";
  
  export function AppSidebar() {
    const { currentVault } = useVault();
    const { createNewNote } = useFileTree();

    const handleNewNote = () => {
      if (currentVault?.path) {
        createNewNote(currentVault.path);
      }
    };

    return (
      <Sidebar>
        <SidebarHeader>
          <VaultSwitcher />
          <SearchBar />
        </SidebarHeader>
        <SidebarContent>
          <ContextMenu>
            <ContextMenuTrigger className="flex min-h-full w-full flex-col">
              <FileTree />
              <div className="flex-1" />
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuItem onClick={handleNewNote}>
                <IconFilePlus className="mr-2 size-4" />
                New note
              </ContextMenuItem>
              <ContextMenuItem>
                <IconFolderPlus className="mr-2 size-4" />
                New folder
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenuItem>
            <SettingsDialog>
              <SidebarMenuButton>
                Settings
                <IconSettings className="ml-auto" />
              </SidebarMenuButton>
            </SettingsDialog>
          </SidebarMenuItem>
        </SidebarFooter>
      </Sidebar>
    );
  }
  