import { invoke } from '@tauri-apps/api/core';
import { listen, UnlistenFn } from '@tauri-apps/api/event';
import { info, error as logError } from '@tauri-apps/plugin-log';
import { message } from '@tauri-apps/plugin-dialog';
import type { FileNode, FileEvent } from '@/types/file-tree';

/**
 * Service layer for file tree operations and file system watching.
 * Abstracts Tauri command interactions for file tree management.
 */
class FileTreeService {
  private unlistenFn: UnlistenFn | null = null;

  /**
   * Scan a directory and return hierarchical file tree.
   * Filters to show only supported files (.md, .MD, and image files).
   * Sorts folders before files, alphabetically within each group.
   * @param path - Absolute path to the directory to scan
   * @returns Promise resolving to array of root FileNode entries
   * @throws Error if directory doesn't exist or scan fails
   */
  async scanDirectory(path: string): Promise<FileNode[]> {
    try {
      await info(`Scanning directory: ${path}`);
      const nodes = await invoke<FileNode[]>('scan_directory', { path });
      await info(`Scanned ${nodes.length} root nodes from ${path}`);
      return nodes;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      await logError(`Failed to scan directory ${path}: ${errorMessage}`);
      
      // Show user-facing error dialog for critical failures
      await message(`Failed to scan directory:\n\n${errorMessage}`, {
        title: 'Directory Scan Error',
        kind: 'error',
      });
      
      throw new Error(`Failed to scan directory: ${errorMessage}`);
    }
  }

  /**
   * Read file contents as UTF-8 string.
   * @param path - Absolute path to the file to read
   * @returns Promise resolving to file contents as string
   * @throws Error if file doesn't exist or read fails
   */
  async readFile(path: string): Promise<string> {
    try {
      await info(`Reading file: ${path}`);
      const content = await invoke<string>('read_file', { path });
      return content;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      await logError(`Failed to read file ${path}: ${errorMessage}`);
      
      // Show user-facing error dialog
      await message(`Failed to read file:\n\n${errorMessage}`, {
        title: 'File Read Error',
        kind: 'error',
      });
      
      throw new Error(`Failed to read file: ${errorMessage}`);
    }
  }

  /**
   * Write content to a file.
   * @param path - Absolute path to the file to write
   * @param content - Content to write
   * @throws Error if write fails
   */
  async saveFile(path: string, content: string): Promise<void> {
    try {
      await invoke('write_file', { path, content });
      // We don't log success here to avoid spamming logs on every auto-save
      // The backend logs success anyway
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      await logError(`Failed to save file ${path}: ${errorMessage}`);
      
      // Show user-facing error dialog
      await message(`Failed to save file:\n\n${errorMessage}`, {
        title: 'File Save Error',
        kind: 'error',
      });
      
      throw new Error(`Failed to save file: ${errorMessage}`);
    }
  }

  /**
   * Create a new markdown note in the specified directory.
   * @param path - Absolute path to the directory where the note should be created
   * @returns Promise resolving to the FileNode of the newly created note
   * @throws Error if creation fails
   */
  async createNewNote(path: string): Promise<FileNode> {
    try {
      await info(`Creating new note in: ${path}`);
      const node = await invoke<FileNode>('create_new_note', { path });
      return node;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      await logError(`Failed to create new note in ${path}: ${errorMessage}`);
      
      await message(`Failed to create new note:\n\n${errorMessage}`, {
        title: 'New Note Error',
        kind: 'error',
      });
      
      throw new Error(`Failed to create new note: ${errorMessage}`);
    }
  }

  /**
   * Create a new folder in the specified directory.
   * @param path - Absolute path to the directory where the folder should be created
   * @returns Promise resolving to the FileNode of the newly created folder
   * @throws Error if creation fails
   */
  async createNewFolder(path: string): Promise<FileNode> {
    try {
      await info(`Creating new folder in: ${path}`);
      const node = await invoke<FileNode>('create_new_folder', { path });
      return node;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      await logError(`Failed to create new folder in ${path}: ${errorMessage}`);
      
      await message(`Failed to create new folder:\n\n${errorMessage}`, {
        title: 'New Folder Error',
        kind: 'error',
      });
      
      throw new Error(`Failed to create new folder: ${errorMessage}`);
    }
  }

  /**
   * Delete a file or directory at the specified path.
   * @param path - Absolute path to the file or directory to delete
   * @throws Error if deletion fails
   */
  async deletePath(path: string): Promise<void> {
    try {
      await info(`Deleting: ${path}`);
      await invoke('delete_path', { path });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      await logError(`Failed to delete ${path}: ${errorMessage}`);
      
      await message(`Failed to delete:\n\n${errorMessage}`, {
        title: 'Deletion Error',
        kind: 'error',
      });
      
      throw new Error(`Failed to delete: ${errorMessage}`);
    }
  }

  /**
   * Duplicate a file at the specified path.
   * @param path - Absolute path to the file to duplicate
   * @returns Promise resolving to the FileNode of the newly created duplicate
   * @throws Error if duplication fails
   */
  async duplicateFile(path: string): Promise<FileNode> {
    try {
      await info(`Duplicating: ${path}`);
      const node = await invoke<FileNode>('duplicate_file', { path });
      return node;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      await logError(`Failed to duplicate ${path}: ${errorMessage}`);
      
      await message(`Failed to duplicate:\n\n${errorMessage}`, {
        title: 'Duplication Error',
        kind: 'error',
      });
      
      throw new Error(`Failed to duplicate: ${errorMessage}`);
    }
  }

  /**
   * Rename a file or directory at the specified path.
   * @param path - Current absolute path
   * @param newPath - Target absolute path
   * @returns Promise resolving to the FileNode representing the renamed path
   * @throws Error if renaming fails
   */
  async renamePath(path: string, newPath: string): Promise<FileNode> {
    try {
      await info(`Renaming: ${path} to ${newPath}`);
      const node = await invoke<FileNode>('rename_path', { path, newPath });
      return node;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      await logError(`Failed to rename ${path}: ${errorMessage}`);
      
      await message(`Failed to rename:\n\n${errorMessage}`, {
        title: 'Rename Error',
        kind: 'error',
      });
      
      throw new Error(`Failed to rename: ${errorMessage}`);
    }
  }

  /**
   * Start watching a directory for filesystem changes.
   * Emits events when files or folders are created, deleted, renamed, or modified.
   * Events are debounced to prevent excessive updates.
   * @param path - Absolute path to the directory to watch
   * @throws Error if directory doesn't exist or watcher fails to start
   */
  async startWatching(path: string): Promise<void> {
    try {
      await info(`Starting file watcher for: ${path}`);
      await invoke('start_watching', { path });
      await info(`File watcher started for: ${path}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      await logError(`Failed to start watching ${path}: ${errorMessage}`);
      
      // Show user-facing error dialog
      await message(`Failed to start file watcher:\n\n${errorMessage}`, {
        title: 'File Watcher Error',
        kind: 'error',
      });
      
      throw new Error(`Failed to start file watcher: ${errorMessage}`);
    }
  }

  /**
   * Stop watching the current directory.
   * Cleans up watcher resources.
   * Should be called when switching vaults or unmounting.
   */
  async stopWatching(): Promise<void> {
    try {
      await info('Stopping file watcher');
      await invoke('stop_watching');
      
      // Unlisten from events if we have a listener
      if (this.unlistenFn) {
        this.unlistenFn();
        this.unlistenFn = null;
      }
      
      await info('File watcher stopped');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      await logError(`Failed to stop watching: ${errorMessage}`);
      // Don't show dialog for stop errors - they're less critical
      throw new Error(`Failed to stop file watcher: ${errorMessage}`);
    }
  }

  /**
   * Subscribe to file system change events.
   * The callback will be invoked when files or folders are created, deleted, renamed, or modified.
   * Events are debounced by the backend to prevent excessive updates.
   * @param callback - Function to call when file events occur
   * @returns Cleanup function to unsubscribe from events
   */
  onFileEvent(callback: (event: FileEvent) => void): () => void {
    // Store the unlisten function for cleanup
    const unlistenPromise = listen<FileEvent>('file-tree-change', (event) => {
      callback(event.payload);
    });

    // Store the unlisten function
    unlistenPromise.then((unlisten) => {
      this.unlistenFn = unlisten;
    });

    // Return cleanup function
    return () => {
      unlistenPromise.then((unlisten) => {
        unlisten();
        if (this.unlistenFn === unlisten) {
          this.unlistenFn = null;
        }
      });
    };
  }

  /**
   * Save an image to the attachments folder next to a markdown file.
   * Creates the attachments folder if it doesn't exist.
   * @param mdFilePath - Absolute path to the markdown file
   * @param imageFile - The image File object to save
   * @returns Promise resolving to the relative path to the saved image (e.g., "attachments/image.png")
   * @throws Error if save fails
   */
  async saveImageToAttachments(mdFilePath: string, imageFile: File): Promise<string> {
    try {
      await info(`Saving image to attachments for: ${mdFilePath}`);

      // Convert File to Uint8Array
      const arrayBuffer = await imageFile.arrayBuffer();
      const imageData = Array.from(new Uint8Array(arrayBuffer));

      const relativePath = await invoke<string>('save_image_to_attachments', {
        mdFilePath,
        imageName: imageFile.name,
        imageData,
      });

      await info(`Saved image to: ${relativePath}`);
      return relativePath;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      await logError(`Failed to save image to attachments: ${errorMessage}`);

      await message(`Failed to save image:\n\n${errorMessage}`, {
        title: 'Image Save Error',
        kind: 'error',
      });

      throw new Error(`Failed to save image: ${errorMessage}`);
    }
  }
}

export const fileTreeService = new FileTreeService();
export { FileTreeService };
