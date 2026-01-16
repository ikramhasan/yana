import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarMenu,
    SidebarRail,
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
    const { createNewNote, createNewFolder } = useFileTree();

    const handleNewNote = () => {
      if (currentVault?.path) {
        createNewNote(currentVault.path);
      }
    };

    const handleNewFolder = () => {
      if (currentVault?.path) {
        createNewFolder(currentVault.path);
      }
    };

    return (
      <Sidebar>
        <ContextMenu>
          <ContextMenuTrigger asChild>
            <div className="flex flex-col h-full">
              <SidebarHeader data-tauri-drag-region>
                <VaultSwitcher />
                <SearchBar />
              </SidebarHeader>
              <SidebarContent>
                <FileTree />
              </SidebarContent>
              <SidebarFooter>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SettingsDialog>
                      <SidebarMenuButton>
                        Settings
                        <IconSettings className="ml-auto" />
                      </SidebarMenuButton>
                    </SettingsDialog>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarFooter>
            </div>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem onClick={handleNewNote}>
              <IconFilePlus className="mr-2 size-4" />
              New note
            </ContextMenuItem>
            <ContextMenuItem onClick={handleNewFolder}>
              <IconFolderPlus className="mr-2 size-4" />
              New folder
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
        <SidebarRail />
      </Sidebar>
    );
  }