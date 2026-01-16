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
} from "@/components/ui/collapsible"
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
  const { createNewNote, deleteNode, duplicateFile, renameNode } = useFileTree()
  const isFolder = node.type === "folder"
  const [isOpen, setIsOpen] = React.useState(false)
  const [isRenaming, setIsRenaming] = React.useState(false)
  const [newName, setNewName] = React.useState(node.name)
  const inputRef = React.useRef<HTMLInputElement>(null)

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
  
  const handleDuplicate = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!isFolder) {
      await duplicateFile(node.path)
    }
  }

  const handleRenameStart = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsRenaming(true)
    setNewName(node.name)
    // Focus after render
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  const handleRenameSubmit = async () => {
    if (newName.trim() === "" || newName === node.name) {
      setIsRenaming(false)
      return
    }

    const parentPath = node.path.substring(0, node.path.lastIndexOf('/'))
    const newPath = `${parentPath}/${newName}`

    try {
      await renameNode(node.path, newPath)
    } catch (err) {
      console.error("Rename failed", err)
      setNewName(node.name)
    } finally {
      setIsRenaming(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleRenameSubmit()
    } else if (e.key === "Escape") {
      setIsRenaming(false)
      setNewName(node.name)
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
                    {isRenaming ? (
                      <input
                        ref={inputRef}
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        onBlur={handleRenameSubmit}
                        onKeyDown={handleKeyDown}
                        className="bg-background border-none outline-none ring-1 ring-primary/50 rounded-sm px-1 w-full text-[13px] h-5 leading-none -ml-1"
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <span>{node.name}</span>
                    )}
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
              <ContextMenuItem onClick={handleRenameStart}>
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
              {isRenaming ? (
                <input
                  ref={inputRef}
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onBlur={handleRenameSubmit}
                  onKeyDown={handleKeyDown}
                  className="bg-background border-none outline-none ring-1 ring-primary/50 rounded-sm px-1 w-full text-[13px] h-5 leading-none -ml-1"
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <span>{node.name}</span>
              )}
            </SidebarMenuButton>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem onClick={() => onSelect(node)}>
              <IconFileText className="mr-2 size-4" />
              Open
            </ContextMenuItem>
            <ContextMenuItem onClick={handleDuplicate}>
              <IconCopy className="mr-2 size-4" />
              Duplicate
            </ContextMenuItem>
            <ContextMenuItem onClick={handleRenameStart}>
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
