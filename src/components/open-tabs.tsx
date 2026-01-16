"use client";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuAction,
} from "@/components/ui/sidebar";
import { useTabs } from "@/contexts/tabs-context";
import { IconMarkdown, IconX } from "@tabler/icons-react";

/**
 * Displays the list of open tabs above the file tree.
 * Each tab shows the file name and has a close button.
 * Clicking a tab switches to that file.
 */
export function OpenTabs() {
  const { tabs, activeTabId, closeTab, setActiveTab } = useTabs();

  // Don't render if no tabs are open
  if (tabs.length === 0) {
    return null;
  }

  return (
    <SidebarGroup className="py-0">
      <SidebarGroupLabel className="pl-0">Tabs</SidebarGroupLabel>
      <SidebarMenu>
        {tabs.map((tab) => (
          <SidebarMenuItem key={tab.id} className="group/menu-item">
            <SidebarMenuButton
              isActive={tab.id === activeTabId}
              onClick={() => setActiveTab(tab.id)}
              className="pr-8 text-sm"
              tooltip={tab.path}
            >
              <IconMarkdown className="size-4 shrink-0" />
              <span className="truncate">{tab.name}</span>
            </SidebarMenuButton>
            <SidebarMenuAction
              onClick={(e) => {
                e.stopPropagation();
                closeTab(tab.id);
              }}
              showOnHover
              aria-label={`Close ${tab.name}`}
            >
              <IconX className="size-4" />
            </SidebarMenuAction>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
