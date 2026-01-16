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
} from "@/components/ui/sidebar"
import { Tree, Folder, File, type TreeViewElement } from "@/components/ui/file-tree"
import { useFileTree } from "@/contexts/file-tree-context"
import type { FileNode } from "@/types/file-tree"
import { ask } from "@tauri-apps/plugin-dialog"

// Convert FileNode to TreeViewElement format
function convertToTreeElements(nodes: FileNode[]): TreeViewElement[] {
  return nodes.map((node) => ({
    id: node.id,
    name: node.name,
    isSelectable: true,
    children: node.type === "folder" && node.children
      ? convertToTreeElements(node.children)
      : undefined,
  }))
}

// Create a map from id to FileNode for quick lookup
function createNodeMap(nodes: FileNode[]): Map<string, FileNode> {
  const map = new Map<string, FileNode>()

  function traverse(nodeList: FileNode[]) {
    for (const node of nodeList) {
      map.set(node.id, node)
      if (node.children) {
        traverse(node.children)
      }
    }
  }

  traverse(nodes)
  return map
}

export function FileTree() {
  const { nodes, selectedFile, isLoading, error, selectFile, createNewNote, deleteNode, duplicateFile, renameNode } = useFileTree()

  const treeElements = React.useMemo(() => convertToTreeElements(nodes), [nodes])
  const nodeMap = React.useMemo(() => createNodeMap(nodes), [nodes])

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
      <Tree
        className="px-0"
        indicator={true}
        initialSelectedId={selectedFile?.id}
        openIcon={<IconFolderOpen className="size-4" />}
        closeIcon={<IconFolder className="size-4" />}
      >
        {treeElements.map((element) => (
          <TreeNode
            key={element.id}
            element={element}
            nodeMap={nodeMap}
            selectedId={selectedFile?.id ?? undefined}
            onSelect={selectFile}
            onCreateNote={createNewNote}
            onDelete={deleteNode}
            onDuplicate={duplicateFile}
            onRename={renameNode}
          />
        ))}
      </Tree>
    </SidebarGroup>
  )
}

interface TreeNodeProps {
  element: TreeViewElement
  nodeMap: Map<string, FileNode>
  selectedId: string | undefined
  onSelect: (node: FileNode) => void
  onCreateNote: (parentPath: string) => Promise<void>
  onDelete: (path: string) => Promise<void>
  onDuplicate: (path: string) => Promise<void>
  onRename: (oldPath: string, newPath: string) => Promise<void>
}

function TreeNode({
  element,
  nodeMap,
  selectedId,
  onSelect,
  onCreateNote,
  onDelete,
  onDuplicate,
  onRename
}: TreeNodeProps) {
  const node = nodeMap.get(element.id)
  const isFolder = element.children !== undefined
  const [isRenaming, setIsRenaming] = React.useState(false)
  const [newName, setNewName] = React.useState(element.name)
  const inputRef = React.useRef<HTMLInputElement>(null)

  if (!node) return null

  const handleSelect = () => {
    if (!isFolder) {
      onSelect(node)
    }
  }

  const handleNewNote = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isFolder) {
      await onCreateNote(node.path)
    }
  }

  const handleDuplicate = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!isFolder) {
      await onDuplicate(node.path)
    }
  }

  const handleRenameStart = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsRenaming(true)
    setNewName(element.name)
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  const handleRenameSubmit = async () => {
    if (newName.trim() === "" || newName === element.name) {
      setIsRenaming(false)
      return
    }

    const parentPath = node.path.substring(0, node.path.lastIndexOf('/'))
    const newPath = `${parentPath}/${newName}`

    try {
      await onRename(node.path, newPath)
    } catch (err) {
      console.error("Rename failed", err)
      setNewName(element.name)
    } finally {
      setIsRenaming(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleRenameSubmit()
    } else if (e.key === "Escape") {
      setIsRenaming(false)
      setNewName(element.name)
    }
  }

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    const confirmed = await ask(
      `Are you sure you want to delete ${element.name}? This action cannot be undone.`,
      {
        title: 'Delete confirmation',
        kind: 'warning',
      }
    )

    if (confirmed) {
      await onDelete(node.path)
    }
  }

  const renderName = () => {
    if (isRenaming) {
      return (
        <input
          ref={inputRef}
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onBlur={handleRenameSubmit}
          onKeyDown={handleKeyDown}
          className="bg-background border-none outline-none ring-1 ring-primary/50 rounded-sm px-1 w-full text-[13px] h-5 leading-none"
          onClick={(e) => e.stopPropagation()}
        />
      )
    }
    return <span>{element.name}</span>
  }

  if (isFolder) {
    return (
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <div>
            <Folder
              element={isRenaming ? "" : element.name}
              value={element.id}
              isSelectable={true}
            >
              {isRenaming && (
                <div className="flex items-center gap-1 -mt-6 ml-5">
                  {renderName()}
                </div>
              )}
              {element.children?.map((child) => (
                <TreeNode
                  key={child.id}
                  element={child}
                  nodeMap={nodeMap}
                  selectedId={selectedId}
                  onSelect={onSelect}
                  onCreateNote={onCreateNote}
                  onDelete={onDelete}
                  onDuplicate={onDuplicate}
                  onRename={onRename}
                />
              ))}
            </Folder>
          </div>
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
    )
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div>
          <File
            value={element.id}
            isSelect={selectedId === element.id}
            fileIcon={<IconMarkdown className="size-4" />}
            onClick={handleSelect}
          >
            {renderName()}
          </File>
        </div>
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
  )
}
