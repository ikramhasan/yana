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
  
  export function AppSidebar() {
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
              <ContextMenuItem>
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
  