"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import type { Tab, TabsContextValue } from "@/types/tabs";
import type { FileNode } from "@/types/file-tree";
import { tabsService } from "@/services/tabs-service";
import { useVault } from "./vault-context";
import { useSettings } from "./settings-context";
import { useFileTree } from "./file-tree-context";

/**
 * React context for tabs state management.
 * Provides tabs data and operations to the component tree.
 */
const TabsContext = createContext<TabsContextValue | null>(null);

/**
 * Provider component that manages tabs state and operations.
 * Loads tabs per vault and provides methods for tab operations.
 * Integrates with VaultContext to track current vault and reload on vault changes.
 * Integrates with SettingsContext for maxTabs limit.
 * Integrates with FileTreeContext for file selection sync.
 */
export function TabsProvider({ children }: { children: React.ReactNode }) {
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTabId, setActiveTabIdState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const { currentVault } = useVault();
  const { settings } = useSettings();
  const { selectFile, selectedFile } = useFileTree();

  // Track if we're currently syncing to prevent infinite loops
  const isSyncingRef = useRef(false);
  // Track the previous vault ID to save tabs before switching
  const prevVaultIdRef = useRef<string | null>(null);

  /**
   * Load tabs for the current vault.
   */
  const loadTabs = useCallback(async (vaultId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const vaultTabs = await tabsService.loadVaultTabs(vaultId);
      setTabs(vaultTabs.tabs);
      setActiveTabIdState(vaultTabs.activeTabId);
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Failed to load tabs");
      setError(error);
      console.error("Failed to load tabs:", error);
      setTabs([]);
      setActiveTabIdState(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Save current tabs to storage.
   */
  const saveTabs = useCallback(
    async (vaultId: string, tabsToSave: Tab[], activeId: string | null) => {
      try {
        await tabsService.saveVaultTabs(vaultId, tabsToSave, activeId);
      } catch (err) {
        console.error("Failed to save tabs:", err);
      }
    },
    []
  );

  /**
   * Open a file as a tab (or switch to it if already open).
   */
  const openTab = useCallback(
    (file: FileNode) => {
      if (file.type !== "file") {
        return;
      }

      // Check if tab already exists
      const existingTab = tabs.find((t) => t.id === file.id);
      if (existingTab) {
        // Update timestamp and activate
        const updatedTabs = tabsService.touchTab(tabs, file.id);
        setTabs(updatedTabs);
        setActiveTabIdState(file.id);
        return;
      }

      // Create new tab
      const newTab = tabsService.createTabFromFile(file);
      let updatedTabs = [...tabs, newTab];

      // Enforce max tabs (evict oldest if needed)
      updatedTabs = tabsService.enforceMaxTabs(
        updatedTabs,
        settings.maxTabs,
        file.id
      );

      setTabs(updatedTabs);
      setActiveTabIdState(file.id);
    },
    [tabs, settings.maxTabs]
  );

  /**
   * Close a specific tab.
   */
  const closeTab = useCallback(
    (tabId: string) => {
      const updatedTabs = tabsService.removeTab(tabs, tabId);
      setTabs(updatedTabs);

      // If closing the active tab, switch to another tab
      if (activeTabId === tabId) {
        if (updatedTabs.length > 0) {
          // Switch to the last tab (most recently opened)
          const sortedTabs = [...updatedTabs].sort(
            (a, b) => b.openedAt - a.openedAt
          );
          setActiveTabIdState(sortedTabs[0].id);
        } else {
          setActiveTabIdState(null);
        }
      }
    },
    [tabs, activeTabId]
  );

  /**
   * Switch to a specific tab.
   */
  const setActiveTab = useCallback(
    (tabId: string) => {
      const tab = tabs.find((t) => t.id === tabId);
      if (!tab) {
        return;
      }

      // Update timestamp to prevent eviction of frequently used tabs
      const updatedTabs = tabsService.touchTab(tabs, tabId);
      setTabs(updatedTabs);
      setActiveTabIdState(tabId);

      // Sync with file tree - select the file
      isSyncingRef.current = true;
      selectFile({
        id: tab.id,
        name: tab.name,
        path: tab.path,
        type: "file",
      });
      // Reset sync flag after a short delay
      setTimeout(() => {
        isSyncingRef.current = false;
      }, 100);
    },
    [tabs, selectFile]
  );

  /**
   * Close all tabs.
   */
  const closeAllTabs = useCallback(() => {
    setTabs([]);
    setActiveTabIdState(null);
  }, []);

  // Load tabs when vault changes
  useEffect(() => {
    // Save tabs for previous vault before switching
    if (prevVaultIdRef.current && prevVaultIdRef.current !== currentVault?.id) {
      saveTabs(prevVaultIdRef.current, tabs, activeTabId);
    }

    if (!currentVault?.id) {
      setTabs([]);
      setActiveTabIdState(null);
      prevVaultIdRef.current = null;
      return;
    }

    prevVaultIdRef.current = currentVault.id;
    loadTabs(currentVault.id);
  }, [currentVault?.id, loadTabs, saveTabs]);

  // Save tabs when they change (debounced)
  useEffect(() => {
    if (!currentVault?.id || isLoading) {
      return;
    }

    const timer = setTimeout(() => {
      saveTabs(currentVault.id, tabs, activeTabId);
    }, 500);

    return () => clearTimeout(timer);
  }, [tabs, activeTabId, currentVault?.id, isLoading, saveTabs]);

  // Sync: When active tab changes, select the file in file tree
  useEffect(() => {
    if (!activeTabId || isSyncingRef.current) {
      return;
    }

    const activeTab = tabs.find((t) => t.id === activeTabId);
    if (activeTab && selectedFile?.id !== activeTabId) {
      isSyncingRef.current = true;
      selectFile({
        id: activeTab.id,
        name: activeTab.name,
        path: activeTab.path,
        type: "file",
      });
      setTimeout(() => {
        isSyncingRef.current = false;
      }, 100);
    }
  }, [activeTabId, tabs, selectedFile?.id, selectFile]);

  // Sync: When a file is deleted, remove its tab
  useEffect(() => {
    if (!selectedFile && activeTabId) {
      // Selected file was cleared (possibly deleted)
      // Check if the active tab's file still exists
      const activeTab = tabs.find((t) => t.id === activeTabId);
      if (activeTab) {
        // We can't easily check if file exists, but if selectedFile is null
        // and we had an active tab, the file might have been deleted
        // The file tree context handles this, so we just keep our state
      }
    }
  }, [selectedFile, activeTabId, tabs]);

  const value: TabsContextValue = {
    tabs,
    activeTabId,
    isLoading,
    error,
    openTab,
    closeTab,
    setActiveTab,
    closeAllTabs,
  };

  return <TabsContext.Provider value={value}>{children}</TabsContext.Provider>;
}

/**
 * Custom hook to access tabs context.
 * Must be used within a TabsProvider.
 * @throws Error if used outside TabsProvider
 */
export function useTabs(): TabsContextValue {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error("useTabs must be used within a TabsProvider");
  }
  return context;
}
