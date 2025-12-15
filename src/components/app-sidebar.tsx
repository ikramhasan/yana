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
  
  import { SettingsDialog } from "./settings-dialog";
  import { FileTree, type FileNode } from "./file-tree";
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
          <VaultSwitcher versions={["Notes", "Blogs"]} defaultVault="Notes" />
          <SearchBar />
        </SidebarHeader>
        <SidebarContent>
          <ContextMenu>
            <ContextMenuTrigger className="flex min-h-full w-full flex-col">
              <FileTree data={DUMMY_FILE_TREE} />
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
            <SettingsDialog versions={["Notes", "Blogs"]} defaultVault="Notes">
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
  
  const DUMMY_FILE_TREE: FileNode[] = [
    {
      id: "1",
      name: "Documents",
      type: "folder",
      children: [
        {
          id: "1-1",
          name: "Work",
          type: "folder",
          children: [
            { id: "1-1-1", name: "Report.md", type: "file" },
            { id: "1-1-2", name: "Stats.csv", type: "file" },
          ],
        },
        { id: "1-2", name: "Notes.txt", type: "file" },
      ],
    },
    {
      id: "2",
      name: "Images",
      type: "folder",
      children: [
        { id: "2-1", name: "Vacation.png", type: "file" },
        { id: "2-2", name: "Profile.jpg", type: "file" },
      ],
    },
    { id: "3", name: "Settings.json", type: "file" },
    { id: "4", name: "README.md", type: "file" },
  ];
  