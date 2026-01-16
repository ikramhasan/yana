import { LazyStore } from "@tauri-apps/plugin-store";
import { info, error as logError } from "@tauri-apps/plugin-log";
import type { Tab, VaultTabs, TabsStore } from "@/types/tabs";
import type { FileNode } from "@/types/file-tree";

/**
 * Service layer for tabs persistence and operations.
 * Tabs are stored per vault in tabs.json.
 */
class TabsService {
  private store: LazyStore;

  constructor() {
    this.store = new LazyStore("tabs.json");
  }

  /**
   * Load tabs for a specific vault.
   * @param vaultId - The vault ID to load tabs for
   * @returns Promise resolving to VaultTabs object
   */
  async loadVaultTabs(vaultId: string): Promise<VaultTabs> {
    try {
      const data = await this.store.get<TabsStore>("data");
      if (data && data.vaultTabs && data.vaultTabs[vaultId]) {
        await info(`Loaded tabs for vault ${vaultId}`);
        return data.vaultTabs[vaultId];
      }
      await info(`No tabs found for vault ${vaultId}, returning empty state`);
      return {
        vaultId,
        tabs: [],
        activeTabId: null,
      };
    } catch (err) {
      await logError(`Failed to load tabs for vault ${vaultId}: ${err}`);
      return {
        vaultId,
        tabs: [],
        activeTabId: null,
      };
    }
  }

  /**
   * Save tabs for a specific vault.
   * @param vaultId - The vault ID to save tabs for
   * @param tabs - Array of open tabs
   * @param activeTabId - Currently active tab ID
   */
  async saveVaultTabs(
    vaultId: string,
    tabs: Tab[],
    activeTabId: string | null
  ): Promise<void> {
    try {
      const data = (await this.store.get<TabsStore>("data")) || {
        vaultTabs: {},
      };

      data.vaultTabs[vaultId] = {
        vaultId,
        tabs,
        activeTabId,
      };

      await this.store.set("data", data);
      await this.store.save();
      await info(`Saved tabs for vault ${vaultId}`);
    } catch (err) {
      await logError(`Failed to save tabs for vault ${vaultId}: ${err}`);
      throw new Error(`Failed to save tabs: ${err}`);
    }
  }

  /**
   * Create a Tab from a FileNode.
   * @param file - FileNode to create tab from
   * @returns Tab object
   */
  createTabFromFile(file: FileNode): Tab {
    return {
      id: file.id,
      name: file.name,
      path: file.path,
      openedAt: Date.now(),
    };
  }

  /**
   * Enforce max tabs limit using LRU eviction.
   * Removes oldest tabs (by openedAt) to stay within limit.
   * @param tabs - Current tabs array
   * @param maxTabs - Maximum allowed tabs
   * @param excludeId - Tab ID to never evict (usually the newly opened one)
   * @returns Updated tabs array within limit
   */
  enforceMaxTabs(tabs: Tab[], maxTabs: number, excludeId?: string): Tab[] {
    if (tabs.length <= maxTabs) {
      return tabs;
    }

    // Sort by openedAt (oldest first), but exclude the protected tab
    const sortedTabs = [...tabs].sort((a, b) => a.openedAt - b.openedAt);

    // Remove oldest tabs until we're within limit
    const toRemove = tabs.length - maxTabs;
    let removed = 0;
    const idsToRemove = new Set<string>();

    for (const tab of sortedTabs) {
      if (removed >= toRemove) break;
      if (tab.id !== excludeId) {
        idsToRemove.add(tab.id);
        removed++;
      }
    }

    return tabs.filter((tab) => !idsToRemove.has(tab.id));
  }

  /**
   * Remove a tab by ID and return updated array.
   * @param tabs - Current tabs array
   * @param tabId - Tab ID to remove
   * @returns Updated tabs array without the removed tab
   */
  removeTab(tabs: Tab[], tabId: string): Tab[] {
    return tabs.filter((tab) => tab.id !== tabId);
  }

  /**
   * Update the openedAt timestamp for a tab (when switching to it).
   * This keeps frequently used tabs from being evicted.
   * @param tabs - Current tabs array
   * @param tabId - Tab ID to update
   * @returns Updated tabs array with refreshed timestamp
   */
  touchTab(tabs: Tab[], tabId: string): Tab[] {
    return tabs.map((tab) =>
      tab.id === tabId ? { ...tab, openedAt: Date.now() } : tab
    );
  }
}

export const tabsService = new TabsService();
export { TabsService };
