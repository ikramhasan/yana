/**
 * Tab type definitions for the tabs system
 */

import type { FileNode } from "./file-tree";

/**
 * Represents a single open tab
 */
export interface Tab {
  /** Unique identifier (same as FileNode.id for consistency) */
  id: string;
  /** File name for display */
  name: string;
  /** Full filesystem path */
  path: string;
  /** Timestamp when tab was opened (for LRU eviction) */
  openedAt: number;
}

/**
 * Tabs state for a single vault
 */
export interface VaultTabs {
  /** Vault ID this tab state belongs to */
  vaultId: string;
  /** Array of open tabs */
  tabs: Tab[];
  /** ID of the currently active tab */
  activeTabId: string | null;
}

/**
 * Storage format for persisting tabs to tabs.json
 */
export interface TabsStore {
  /** Map of vault ID to tab state */
  vaultTabs: Record<string, VaultTabs>;
}

/**
 * Context value providing tabs state and operations to components
 */
export interface TabsContextValue {
  /** Currently open tabs */
  tabs: Tab[];
  /** Currently active tab ID */
  activeTabId: string | null;
  /** Whether tabs operations are in progress */
  isLoading: boolean;
  /** Error state from tabs operations */
  error: Error | null;
  /** Open a file as a tab (or switch to it if already open) */
  openTab: (file: FileNode) => void;
  /** Close a specific tab */
  closeTab: (tabId: string) => void;
  /** Switch to a specific tab */
  setActiveTab: (tabId: string) => void;
  /** Close all tabs */
  closeAllTabs: () => void;
}
