/**
 * File tree type definitions for the file tree feature
 */

/**
 * Represents a file or folder node in the tree
 * A node can be either a file or a folder with optional children
 */
export interface FileNode {
  /** Unique identifier derived from the file path */
  id: string;
  /** File or folder name extracted from path */
  name: string;
  /** Full filesystem path */
  path: string;
  /** Node type: either "file" or "folder" */
  type: "file" | "folder";
  /** Child nodes (only present for folders) */
  children?: FileNode[];
}

/**
 * Represents a filesystem change event
 * Emitted by the file watcher when files or folders are modified
 */
export interface FileEvent {
  /** Event type indicating the kind of change */
  type: "create" | "delete" | "rename" | "modify";
  /** Absolute path of the affected file or folder */
  path: string;
}

export interface FileStats {
  wordCount: number;
  charCount: number;
}

/**
 * Context value providing file tree state and operations to components
 */
export interface FileTreeContextValue {
  /** Root nodes of the file tree */
  nodes: FileNode[];
  /** Currently selected file node */
  selectedFile: FileNode | null;
  /** Content of the currently selected file */
  fileContent: string | null;
  /** Statistics for the currently selected file */
  stats: FileStats | null;
  /** Whether file tree operations are in progress */
  isLoading: boolean;
  /** Error state from file tree operations */
  error: Error | null;
  /** Select a file and load its content */
  selectFile: (node: FileNode) => Promise<void>;
  /** Create a new markdown note in the specified directory */
  createNewNote: (parentPath: string) => Promise<void>;
  /** Create a new folder in the specified directory */
  createNewFolder: (parentPath: string) => Promise<void>;
  /** Delete a file or directory at the specified path */
  deleteNode: (path: string) => Promise<void>;
  /** Duplicate a file at the specified path */
  duplicateFile: (path: string) => Promise<void>;
  /** Rename a file or directory at the specified path */
  renameNode: (path: string, newPath: string) => Promise<void>;
  /** ID of the node that should be in rename mode */
  renamingId: string | null;
  /** Set the ID of the node that should be in rename mode */
  setRenamingId: (id: string | null) => void;
  /** IDs of the folders that are expanded */
  expandedIds: string[];
  /** Toggle expansion of a folder */
  toggleExpand: (id: string) => void;
  /** Set expanded IDs directly */
  setExpandedIds: (ids: string[]) => void;
  /** Update the stats of the currently selected file */
  updateStats: (stats: FileStats) => void;
  /** Refresh the file tree from the filesystem */
  refresh: () => Promise<void>;
}
