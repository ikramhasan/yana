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
  IconPhoto,
  IconLayout,
} from "@tabler/icons-react"

// Image file extensions
const IMAGE_EXTENSIONS = ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'bmp', 'ico'];

/**
 * Check if a file is an image based on its extension
 */
function isImageFile(filename: string): boolean {
  const ext = filename.split('.').pop()?.toLowerCase() ?? '';
  return IMAGE_EXTENSIONS.includes(ext);
}
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
import { useVault } from "@/contexts/vault-context"
import type { FileNode } from "@/types/file-tree"
import { ask } from "@tauri-apps/plugin-dialog"

import { TemplateDialog } from "@/components/template-dialog"

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
  const { 
    nodes, 
    selectedFile, 
    isLoading, 
    error, 
    selectFile, 
    createNewNote, 
    createNewFolder, 
    deleteNode, 
    duplicateFile, 
    renameNode,
    expandedIds,
    setExpandedIds
  } = useFileTree()
  const { currentVault } = useVault()

  const [activeTemplate, setActiveTemplate] = React.useState<{path: string, name: string} | null>(null)

  const treeElements = React.useMemo(() => convertToTreeElements(nodes), [nodes])
  const nodeMap = React.useMemo(() => createNodeMap(nodes), [nodes])

  const handleTemplate = (path: string, name: string) => {
    setActiveTemplate({ path, name })
  }

  return (
    <SidebarGroup className="p-0 flex flex-col h-full">
      <SidebarGroupLabel>Workspace</SidebarGroupLabel>
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <div className="flex-1 min-h-[100px]">
            {isLoading && nodes.length === 0 ? (
              <SidebarMenu className="gap-0">
                <div className="px-4 py-2 text-sm text-muted-foreground">
                  Loading...
                </div>
              </SidebarMenu>
            ) : nodes.length === 0 ? (
              <SidebarMenu className="gap-0">
                <div className="px-4 py-2 text-sm text-muted-foreground">
                  No files found
                </div>
              </SidebarMenu>
            ) : (
              <Tree
                className="px-0"
                indicator={true}
                elements={treeElements}
                initialSelectedId={selectedFile?.id}
                expandedItems={expandedIds}
                onExpandedItemsChange={setExpandedIds}
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
                    onCreateFolder={createNewFolder}
                    onDelete={deleteNode}
                    onDuplicate={duplicateFile}
                    onRename={renameNode}
                    onTemplate={handleTemplate}
                  />
                ))}
              </Tree>
            )}
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem onSelect={() => currentVault?.path && createNewNote(currentVault.path)}>
            <IconFilePlus className="mr-2 size-4" />
            New note
          </ContextMenuItem>
          <ContextMenuItem onSelect={() => currentVault?.path && createNewFolder(currentVault.path)}>
            <IconFolderPlus className="mr-2 size-4" />
            New folder
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      <TemplateDialog
        open={!!activeTemplate}
        onOpenChange={(open) => !open && setActiveTemplate(null)}
        folderPath={activeTemplate?.path || ""}
        folderName={activeTemplate?.name || ""}
      />
    </SidebarGroup>
  )
}

interface TreeNodeProps {
  element: TreeViewElement
  nodeMap: Map<string, FileNode>
  selectedId: string | undefined
  onSelect: (node: FileNode) => void
  onCreateNote: (parentPath: string) => Promise<void>
  onCreateFolder: (parentPath: string) => Promise<void>
  onDelete: (path: string) => Promise<void>
  onDuplicate: (path: string) => Promise<void>
  onRename: (oldPath: string, newPath: string) => Promise<void>
  onTemplate: (path: string, name: string) => void
}

function TreeNode({
  element,
  nodeMap,
  selectedId,
  onSelect,
  onCreateNote,
  onCreateFolder,
  onDelete,
  onDuplicate,
  onRename,
  onTemplate
}: TreeNodeProps) {
  const node = nodeMap.get(element.id)
  const isFolder = element.children !== undefined
  const [isRenaming, setIsRenaming] = React.useState(false)
  const [newName, setNewName] = React.useState(element.name)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const { renamingId, setRenamingId } = useFileTree()

  React.useEffect(() => {
    if (renamingId === element.id) {
      setIsRenaming(true)
      setNewName(element.name)
      setRenamingId(null)
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus()
          const lastDotIndex = element.name.lastIndexOf('.')
          if (!isFolder && lastDotIndex > 0) {
            inputRef.current.setSelectionRange(0, lastDotIndex)
          } else {
            inputRef.current.select()
          }
        }
      }, 0)
    }
  }, [renamingId, element.id, setRenamingId, element.name, isFolder])

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

  const handleNewFolder = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isFolder) {
      await onCreateFolder(node.path)
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
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus()
        const lastDotIndex = element.name.lastIndexOf('.')
        if (!isFolder && lastDotIndex > 0) {
          inputRef.current.setSelectionRange(0, lastDotIndex)
        } else {
          inputRef.current.select()
        }
      }
    }, 0)
  }

  const handleTemplate = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isFolder) {
      onTemplate(node.path, element.name)
    }
  }

  const handleRenameSubmit = async () => {
    if (newName.trim() === "" || newName === element.name) {
      setIsRenaming(false)
      return
    }

    // Optimistically close input to allow editor focus
    setIsRenaming(false)

    const parentPath = node.path.substring(0, node.path.lastIndexOf('/'))
    const newPath = `${parentPath}/${newName}`

    try {
      await onRename(node.path, newPath)
    } catch (err) {
      console.error("Rename failed", err)
      setNewName(element.name)
      setIsRenaming(true)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation()
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewName(e.target.value)
  }

  if (isFolder) {
    // When renaming folder, render input outside of Folder component
    if (isRenaming) {
      return (
        <div>
          <div className="flex items-center gap-1">
            <IconFolder className="size-4 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              autoFocus
              value={newName}
              onChange={handleInputChange}
              onBlur={handleRenameSubmit}
              onKeyDown={handleKeyDown}
              className="bg-background border-none outline-none ring-1 ring-primary/50 rounded-sm px-1 w-full text-[13px] h-5 leading-none"
            />
          </div>
        </div>
      )
    }

    return (
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <div>
            <Folder
              element={element.name}
              value={element.id}
              isSelectable={true}
            >
              {element.children?.map((child) => (
                <TreeNode
                  key={child.id}
                  element={child}
                  nodeMap={nodeMap}
                  selectedId={selectedId}
                  onSelect={onSelect}
                  onCreateNote={onCreateNote}
                  onCreateFolder={onCreateFolder}
                  onDelete={onDelete}
                  onDuplicate={onDuplicate}
                  onRename={onRename}
                  onTemplate={onTemplate}
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
          <ContextMenuItem onClick={handleNewFolder}>
            <IconFolderPlus className="mr-2 size-4" />
            New folder
          </ContextMenuItem>
          <ContextMenuItem onClick={handleTemplate}>
            <IconLayout className="mr-2 size-4" />
            Template
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

  const isImage = isImageFile(element.name);
  const fileIcon = isImage
    ? <IconPhoto className="size-4" />
    : <IconMarkdown className="size-4" />;

  // When renaming, render input outside of File component to avoid button capturing keyboard events
  if (isRenaming) {
    return (
      <div className="flex items-center gap-1 px-1">
        {isImage ? <IconPhoto className="size-4 shrink-0" /> : <IconMarkdown className="size-4 shrink-0" />}
        <input
          ref={inputRef}
          type="text"
          autoFocus
          value={newName}
          onChange={handleInputChange}
          onBlur={handleRenameSubmit}
          onKeyDown={handleKeyDown}
          className="bg-background border-none outline-none ring-1 ring-primary/50 rounded-sm px-1 w-full text-[13px] h-5 leading-none"
        />
      </div>
    )
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div>
          <File
            value={element.id}
            isSelect={selectedId === element.id}
            fileIcon={fileIcon}
            onClick={handleSelect}
          >
            <span>{element.name}</span>
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

