"use client"

import * as React from "react"
import {
  IconFile,
  IconFolder,
  IconFolderOpen,
  IconCopy,
  IconFilePlus,
  IconFolderPlus,
  IconPencil,
  IconTrash,
  IconFileText,
} from "@tabler/icons-react"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  Collapsible,
  CollapsibleContent,
} from "@/components/ui/collapsible"

export type FileNode = {
  id: string
  name: string
  type: "file" | "folder"
  children?: FileNode[]
}

interface FileTreeProps {
  data: FileNode[]
}

export function FileTree({ data }: FileTreeProps) {
  const [selectedId, setSelectedId] = React.useState<string | null>(null)

  return (
    <SidebarGroup className="p-0">
      <SidebarGroupLabel>Workspace</SidebarGroupLabel>
      <SidebarMenu className="gap-0">
        {data.map((node) => (
          <FileTreeNode
            key={node.id}
            node={node}
            selectedId={selectedId}
            onSelect={setSelectedId}
            depth={0}
          />
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}

interface FileTreeNodeProps {
  node: FileNode
  selectedId: string | null
  onSelect: (id: string) => void
  depth?: number
}

function FileTreeNode({ node, selectedId, onSelect, depth = 0 }: FileTreeNodeProps) {
  const isFolder = node.type === "folder"
  const [isOpen, setIsOpen] = React.useState(false)

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onSelect(node.id)
    if (isFolder) {
      setIsOpen(!isOpen)
    }
  }
  
  // Base padding (8px) + Indentation per level (12px)
  const paddingLeft = 8 + depth * 12

  return (
    <SidebarMenuItem>
      {isFolder ? (
        <Collapsible 
            open={isOpen} 
            onOpenChange={setIsOpen} 
            className="group/collapsible"
        >
          <ContextMenu>
            <ContextMenuTrigger>
              <SidebarMenuButton
                  onClick={handleClick}
                  isActive={false}
                  size="sm"
                  className="w-full justify-start rounded-none"
                  style={{ paddingLeft: `${paddingLeft}px` }}
                >
                    {isOpen ? <IconFolderOpen className="size-4" /> : <IconFolder className="size-4" />}
                    <span>{node.name}</span>
              </SidebarMenuButton>
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
              <ContextMenuItem>
                <IconPencil className="mr-2 size-4" />
                Rename
              </ContextMenuItem>
              <ContextMenuItem className="text-destructive">
                <IconTrash className="mr-2 size-4" />
                Delete
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
          <CollapsibleContent>
            <SidebarMenu className="gap-0 border-l-0">
              {node.children?.map((child) => (
                <FileTreeNode
                  key={child.id}
                  node={child}
                  selectedId={selectedId}
                  onSelect={onSelect}
                  depth={depth + 1}
                />
              ))}
            </SidebarMenu>
          </CollapsibleContent>
        </Collapsible>
      ) : (
        <ContextMenu>
          <ContextMenuTrigger>
            <SidebarMenuButton
              onClick={handleClick}
              isActive={selectedId === node.id}
              size="sm"
              className="rounded-none w-full justify-start"
              style={{ paddingLeft: `${paddingLeft}px` }}
            >
              <IconFile className="size-4" />
              <span>{node.name}</span>
            </SidebarMenuButton>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem>
              <IconFileText className="mr-2 size-4" />
              Open
            </ContextMenuItem>
            <ContextMenuItem>
              <IconCopy className="mr-2 size-4" />
              Duplicate
            </ContextMenuItem>
            <ContextMenuItem>
              <IconPencil className="mr-2 size-4" />
              Rename
            </ContextMenuItem>
            <ContextMenuItem className="text-destructive">
              <IconTrash className="mr-2 size-4" />
              Delete
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      )}
    </SidebarMenuItem>
  )
}
