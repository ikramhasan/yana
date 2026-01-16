"use client"

import * as React from "react"
import {
  IconFolder,
  IconFolderOpen,
  IconCopy,
  IconFilePlus,
  IconFolderPlus,
  IconPencil,
  IconTrash,
  IconFileText,
  IconMarkdown,
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
} from "@/components/editor/ui/collapsible"
import { useFileTree } from "@/contexts/file-tree-context"
import type { FileNode } from "@/types/file-tree"

export function FileTree() {
  const { nodes, selectedFile, isLoading, error, selectFile } = useFileTree()

  // Show loading state
  if (isLoading && nodes.length === 0) {
    return (
      <SidebarGroup className="p-0">
        <SidebarGroupLabel>Workspace</SidebarGroupLabel>
        <SidebarMenu className="gap-0">
          <div className="px-4 py-2 text-sm text-muted-foreground">
            Loading...
          </div>
        </SidebarMenu>
      </SidebarGroup>
    )
  }

  // Show error state
  if (error) {
    return (
      <SidebarGroup className="p-0">
        <SidebarGroupLabel>Workspace</SidebarGroupLabel>
        <SidebarMenu className="gap-0">
          <div className="px-4 py-2 text-sm text-destructive">
            Error: {error.message}
          </div>
        </SidebarMenu>
      </SidebarGroup>
    )
  }

  // Show empty state
  if (nodes.length === 0) {
    return (
      <SidebarGroup className="p-0">
        <SidebarGroupLabel>Workspace</SidebarGroupLabel>
        <SidebarMenu className="gap-0">
          <div className="px-4 py-2 text-sm text-muted-foreground">
            No files found
          </div>
        </SidebarMenu>
      </SidebarGroup>
    )
  }

  return (
    <SidebarGroup className="p-0">
      <SidebarGroupLabel>Workspace</SidebarGroupLabel>
      <SidebarMenu className="gap-0">
        {nodes.map((node) => (
          <FileTreeNode
            key={node.id}
            node={node}
            selectedId={selectedFile?.id ?? null}
            onSelect={selectFile}
            depth={0}
          />
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}

import { ask } from "@tauri-apps/plugin-dialog"

interface FileTreeNodeProps {
  node: FileNode
  selectedId: string | null
  onSelect: (node: FileNode) => void
  depth?: number
}

function FileTreeNode({ node, selectedId, onSelect, depth = 0 }: FileTreeNodeProps) {
  const { createNewNote, deleteNode } = useFileTree()
  const isFolder = node.type === "folder"
  const [isOpen, setIsOpen] = React.useState(false)

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isFolder) {
      setIsOpen(!isOpen)
    } else {
      // Only call onSelect for files
      onSelect(node)
    }
  }

  const handleNewNote = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isFolder) {
      createNewNote(node.path)
      setIsOpen(true) // Open folder if it's not open
    }
  }
  
  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    const confirmed = await ask(
      `Are you sure you want to delete ${node.name}? This action cannot be undone.`,
      {
        title: 'Delete confirmation',
        kind: 'warning',
      }
    )

    if (confirmed) {
      await deleteNode(node.path)
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
              <ContextMenuItem onClick={handleNewNote}>
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
              <ContextMenuItem className="text-destructive" onClick={handleDelete}>
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
              <IconMarkdown className="size-4" />
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
            <ContextMenuItem className="text-destructive" onClick={handleDelete}>
              <IconTrash className="mr-2 size-4" />
              Delete
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      )}
    </SidebarMenuItem>
  )
}
