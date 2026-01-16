'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type { FileNode, FileTreeContextValue, FileEvent } from '@/types/file-tree';
import { fileTreeService } from '@/services/file-tree-service';
import { useVault } from './vault-context';

// Image file extensions
const IMAGE_EXTENSIONS = ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'bmp', 'ico'];

/**
 * Check if a file is an image based on its extension
 */
function isImageFile(filename: string): boolean {
  const ext = filename.split('.').pop()?.toLowerCase() ?? '';
  return IMAGE_EXTENSIONS.includes(ext);
}

/**
 * React context for file tree state management.
 * Provides file tree data and operations to the component tree.
 */
const FileTreeContext = createContext<FileTreeContextValue | null>(null);

/**
 * Provider component that manages file tree state and operations.
 * Loads file tree on mount and provides methods for file operations.
 * Integrates with VaultContext to track current vault and reload on vault changes.
 */
export function FileTreeProvider({ children }: { children: React.ReactNode }) {
  const [nodes, setNodes] = useState<FileNode[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  
  const { currentVault } = useVault();
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const selectedFileRef = useRef<FileNode | null>(null);

  // Keep ref in sync for optimization checks without triggering re-renders
  useEffect(() => {
    selectedFileRef.current = selectedFile;
  }, [selectedFile]);

  /**
   * Load file tree from the current vault path.
   * Sets loading state and handles errors.
   * Gracefully handles invalid vault paths by showing empty state.
   */
  const loadFileTree = useCallback(async (vaultPath: string) => {
    // Validate vault path before attempting to load
    if (!vaultPath || vaultPath.trim() === '') {
      setError(new Error('Invalid vault path: path is empty'));
      setNodes([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const loadedNodes = await fileTreeService.scanDirectory(vaultPath);
      setNodes(loadedNodes);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load file tree');
      setError(error);
      console.error('Failed to load file tree:', error);
      setNodes([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Refresh the file tree from the filesystem.
   * Public method exposed via context.
   */
  const refresh = useCallback(async () => {
    if (currentVault?.path) {
      await loadFileTree(currentVault.path);
    }
  }, [currentVault?.path, loadFileTree]);

  /**
   * Get all parent folder nodes for a given path
   */
  const getParentNodes = useCallback((nodes: FileNode[], targetPath: string): FileNode[] => {
    const parents: FileNode[] = [];
    let currentPath = targetPath;
    
    const findInTree = (currentNodes: FileNode[], path: string): FileNode | null => {
        for (const node of currentNodes) {
            if (node.path === path) return node;
            if (node.children) {
                const found = findInTree(node.children, path);
                if (found) return found;
            }
        }
        return null;
    };

    while (currentPath.includes('/')) {
        currentPath = currentPath.substring(0, currentPath.lastIndexOf('/'));
        if (!currentPath) break;
        
        const parentNode = findInTree(nodes, currentPath);
        if (parentNode) {
            parents.push(parentNode);
        }
    }
    return parents;
  }, []);

  /**
   * Expand all parents of a new node
   */
  const expandToNode = useCallback((allNodes: FileNode[], path: string) => {
    const parents = getParentNodes(allNodes, path);
    const parentIds = parents.map(p => p.id);
    setExpandedIds(prev => {
        const next = [...prev];
        parentIds.forEach(id => {
            if (!next.includes(id)) next.push(id);
        });
        return next;
    });
  }, [getParentNodes]);

  // Auto-expand to renaming node when it appears in the tree
  useEffect(() => {
    if (renamingId && nodes.length > 0) {
      const findPath = (currentNodes: FileNode[]): string | null => {
        for (const node of currentNodes) {
          if (node.id === renamingId) return node.path;
          if (node.children) {
            const found = findPath(node.children);
            if (found) return found;
          }
        }
        return null;
      };

      const path = findPath(nodes);
      if (path) {
        expandToNode(nodes, path);
      }
    }
  }, [renamingId, nodes, expandToNode]);

  /**
   * Toggle expansion of a folder
   */
  const toggleExpand = useCallback((id: string) => {
    setExpandedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  }, []);

  /**
   * Select a file and load its content.
   * Updates selectedFile and fileContent state.
   * For image files, sets content to null (they're displayed differently).
   * Handles file read errors gracefully with user feedback.
   */
  const selectFile = useCallback(async (node: FileNode) => {
    if (node.type !== 'file') {
      return;
    }

    // Skip if already selected
    if (selectedFileRef.current?.id === node.id) {
      return;
    }

    // Validate file path
    if (!node.path || node.path.trim() === '') {
      setError(new Error('Invalid file path'));
      return;
    }

    // For image files, just select without reading content
    if (isImageFile(node.name)) {
      setSelectedFile(node);
      setFileContent(null);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const content = await fileTreeService.readFile(node.path);
      setSelectedFile(node);
      setFileContent(content);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to read file');
      setError(error);
      console.error('Failed to read file:', error);
      // Don't clear selectedFile on error - keep the selection but show error state
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Create a new markdown note in the specified directory.
   * Automatically selects the new note after creation.
   */
  const createNewNote = useCallback(async (parentPath: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const newNode = await fileTreeService.createNewNote(parentPath);
      // Set as renaming
      setRenamingId(newNode.id);
      
      // Refresh to get updated tree
      await refresh();
      
      // Select the newly created note
      await selectFile(newNode);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to create new note');
      setError(error);
      console.error('Failed to create new note:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectFile, refresh]);
  
  /**
   * Create a new folder in the specified directory.
   */
  const createNewFolder = useCallback(async (parentPath: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const newNode = await fileTreeService.createNewFolder(parentPath);
      // Set as renaming
      setRenamingId(newNode.id);
      // Refresh to get updated tree
      await refresh();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to create new folder');
      setError(error);
      console.error('Failed to create new folder:', error);
    } finally {
      setIsLoading(false);
    }
  }, [refresh]);

  /**
   * Delete a file or directory at the specified path.
   * If the currently selected file is deleted, clears the selection.
   */
  const deleteNode = useCallback(async (path: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await fileTreeService.deletePath(path);
      
      // If the selected file was deleted (or is inside a deleted folder), clear it
      if (selectedFile && (selectedFile.path === path || selectedFile.path.startsWith(path + '/'))) {
        setSelectedFile(null);
        setFileContent(null);
      }
      
      // Backend watcher will trigger a refresh, but we refresh manually for speed
      await refresh();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to delete');
      setError(error);
      console.error('Failed to delete:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedFile, refresh]);

  /**
   * Duplicate a file at the specified path.
   * Automatically selects the new duplicate after creation.
   */
  const duplicateFile = useCallback(async (path: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const newNode = await fileTreeService.duplicateFile(path);
      // Refresh immediately for instant UI feedback
      await refresh();
      // Select the newly created duplicate
      await selectFile(newNode);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to duplicate');
      setError(error);
      console.error('Failed to duplicate:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectFile, refresh]);

  /**
   * Rename a file or directory at the specified path.
   * If the currently selected file is renamed, updates the selection.
   */
  const renameNode = useCallback(async (path: string, newPath: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const newNode = await fileTreeService.renamePath(path, newPath);
      
      // If the selected file was renamed (or is inside a renamed folder), update it
      if (selectedFile) {
          if (selectedFile.path === path) {
              setSelectedFile(newNode);
          } else if (selectedFile.path.startsWith(path + '/')) {
              // Path inside renamed folder
              setSelectedFile(null);
              setFileContent(null);
          }
      }
      
      // Backend watcher will trigger a refresh, but we refresh manually for speed
      await refresh();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to rename');
      setError(error);
      console.error('Failed to rename:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedFile, refresh]);

  // Load file tree when vault changes
  useEffect(() => {
    if (!currentVault?.path) {
      setNodes([]);
      setSelectedFile(null);
      setFileContent(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    loadFileTree(currentVault.path);
  }, [currentVault?.path, loadFileTree]);

  // Set up file watcher when vault loads
  useEffect(() => {
    if (!currentVault?.path) {
      return;
    }

    let isSubscribed = true;

    const setupWatcher = async () => {
      try {
        // Start watching the vault directory
        await fileTreeService.startWatching(currentVault.path);

        // Subscribe to file events
        const unsubscribe = fileTreeService.onFileEvent((event: FileEvent) => {
          if (!isSubscribed) return;

          console.log('File event received:', event);

          // Debounce file events to prevent excessive refreshes
          if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
          }

          debounceTimerRef.current = setTimeout(() => {
            if (isSubscribed && currentVault?.path) {
              loadFileTree(currentVault.path);
            }
          }, 300); // 300ms debounce
        });

        return unsubscribe;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to start file watcher');
        console.error('Failed to start file watcher:', error);
        // Set error state but don't block the UI - file tree can still work without watching
        setError(error);
      }
    };

    const watcherPromise = setupWatcher();

    // Cleanup function
    return () => {
      isSubscribed = false;
      
      // Clear debounce timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Stop watching and unsubscribe
      watcherPromise.then((unsubscribe) => {
        if (unsubscribe) {
          unsubscribe();
        }
      });
      
      fileTreeService.stopWatching().catch((err) => {
        console.error('Failed to stop file watcher:', err);
      });
    };
  }, [currentVault?.path, loadFileTree]);

  const value: FileTreeContextValue = React.useMemo(() => ({
    nodes,
    selectedFile,
    fileContent,
    isLoading,
    error,
    selectFile,
    createNewNote,
    createNewFolder,
    deleteNode,
    duplicateFile,
    renameNode,
    renamingId,
    setRenamingId,
    expandedIds,
    toggleExpand,
    setExpandedIds,
    refresh,
  }), [
    nodes,
    selectedFile,
    fileContent,
    isLoading,
    error,
    selectFile,
    createNewNote,
    createNewFolder,
    deleteNode,
    duplicateFile,
    renameNode,
    renamingId,
    expandedIds,
    toggleExpand,
    refresh
  ]);

  return <FileTreeContext.Provider value={value}>{children}</FileTreeContext.Provider>;
}

/**
 * Custom hook to access file tree context.
 * Must be used within a FileTreeProvider.
 * @throws Error if used outside FileTreeProvider
 */
export function useFileTree(): FileTreeContextValue {
  const context = useContext(FileTreeContext);
  if (!context) {
    throw new Error('useFileTree must be used within a FileTreeProvider');
  }
  return context;
}
