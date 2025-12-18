import { v4 as uuidv4 } from 'uuid';
import { LazyStore } from '@tauri-apps/plugin-store';
import { open, message } from '@tauri-apps/plugin-dialog';
import { info, error as logError } from '@tauri-apps/plugin-log';
import type { Vault, VaultStore } from '@/types/vault';

/**
 * Service layer for vault CRUD operations and business logic.
 * Abstracts Tauri plugin interactions for vault management.
 */
class VaultService {
  private store: LazyStore;

  constructor() {
    this.store = new LazyStore('vaults.json');
  }

  /**
   * Load all vaults from storage.
   * If the store doesn't exist or is empty, returns an empty array.
   * @returns Promise resolving to array of Vault entries
   */
  async loadVaults(): Promise<Vault[]> {
    try {
      const data = await this.store.get<VaultStore>('data');
      if (data && data.vaults) {
        await info(`Loaded ${data.vaults.length} vaults from store`);
        return data.vaults;
      }
      await info('No vaults found in store, returning empty array');
      return [];
    } catch (err) {
      await logError(`Failed to load vaults: ${err}`);
      return [];
    }
  }

  /**
   * Save vaults to storage.
   * Persists immediately to prevent data loss.
   * @param vaults - Array of Vault entries to persist
   */
  async saveVaults(vaults: Vault[]): Promise<void> {
    try {
      const data: VaultStore = { vaults };
      await this.store.set('data', data);
      await this.store.save();
      await info(`Saved ${vaults.length} vaults to store`);
    } catch (err) {
      await logError(`Failed to save vaults: ${err}`);
      throw new Error(`Failed to save vaults: ${err}`);
    }
  }

  /**
   * Extract folder name from a full filesystem path.
   * Works with both Unix and Windows path separators.
   * @param path - Full filesystem path
   * @returns The folder name (last path segment)
   */
  extractFolderName(path: string): string {
    // Handle both Unix (/) and Windows (\) path separators
    const normalizedPath = path.replace(/\\/g, '/');
    // Remove trailing slash if present
    const trimmedPath = normalizedPath.endsWith('/')
      ? normalizedPath.slice(0, -1)
      : normalizedPath;
    // Get the last segment
    const segments = trimmedPath.split('/');
    return segments[segments.length - 1] || '';
  }

  /**
   * Generate a unique UUID v4 for a vault.
   * @returns UUID v4 string
   */
  generateId(): string {
    return uuidv4();
  }

  /**
   * Open native folder dialog and create a new vault entry.
   * Sets isDefault to true if this is the first vault.
   * @param existingVaults - Current list of vaults to determine default status
   * @returns Promise resolving to the new Vault entry
   * @throws Error if user cancels the dialog
   */
  async chooseAndAddVault(existingVaults: Vault[]): Promise<Vault> {
    const folder = await open({
      multiple: false,
      directory: true,
      canCreateDirectories: true,
      title: 'Choose Vault',
    });

    await info(`Chosen vault folder: ${folder}`);

    if (!folder) {
      await message('A folder must be selected', {
        title: 'Error',
        kind: 'error',
      });
      throw new Error('Vault selection cancelled: A folder must be selected');
    }

    // Create the vault entry
    const vault: Vault = {
      id: this.generateId(),
      path: folder,
      name: this.extractFolderName(folder),
      isDefault: existingVaults.length === 0, // First vault is default
    };

    // Add to existing vaults and save
    const updatedVaults = [...existingVaults, vault];
    await this.saveVaults(updatedVaults);

    await info(`Created new vault: ${vault.name} (${vault.id})`);
    return vault;
  }

  /**
   * Set a vault as the default vault.
   * Updates isDefault to true for the target vault and false for all others.
   * @param id - UUID of the vault to set as default
   * @param existingVaults - Current list of vaults
   * @returns Promise resolving to the updated vaults array
   * @throws Error if vault with given id is not found
   */
  async setDefaultVault(id: string, existingVaults: Vault[]): Promise<Vault[]> {
    const vaultExists = existingVaults.some((v) => v.id === id);
    if (!vaultExists) {
      throw new Error(`Vault with id ${id} not found`);
    }

    const updatedVaults = existingVaults.map((vault) => ({
      ...vault,
      isDefault: vault.id === id,
    }));

    await this.saveVaults(updatedVaults);
    await info(`Set vault ${id} as default`);

    return updatedVaults;
  }

  /**
   * Remove a vault from the list.
   * If the removed vault was default, sets the first remaining vault as default.
   * @param id - UUID of the vault to remove
   * @param existingVaults - Current list of vaults
   * @returns Promise resolving to the updated vaults array
   */
  async removeVault(id: string, existingVaults: Vault[]): Promise<Vault[]> {
    const vaultToRemove = existingVaults.find((v) => v.id === id);
    if (!vaultToRemove) {
      throw new Error(`Vault with id ${id} not found`);
    }

    let updatedVaults = existingVaults.filter((v) => v.id !== id);

    // If we removed the default vault and there are remaining vaults,
    // set the first one as default
    if (vaultToRemove.isDefault && updatedVaults.length > 0) {
      updatedVaults = updatedVaults.map((vault, index) => ({
        ...vault,
        isDefault: index === 0,
      }));
    }

    await this.saveVaults(updatedVaults);
    await info(`Removed vault ${id}`);

    return updatedVaults;
  }

  /**
   * Update a vault's name.
   * @param id - UUID of the vault to update
   * @param newName - New name for the vault
   * @param existingVaults - Current list of vaults
   * @returns Promise resolving to the updated vaults array
   */
  async updateVaultName(id: string, newName: string, existingVaults: Vault[]): Promise<Vault[]> {
    const vaultExists = existingVaults.some((v) => v.id === id);
    if (!vaultExists) {
      throw new Error(`Vault with id ${id} not found`);
    }

    const updatedVaults = existingVaults.map((vault) =>
      vault.id === id ? { ...vault, name: newName.trim() } : vault
    );

    await this.saveVaults(updatedVaults);
    await info(`Updated vault ${id} name to ${newName}`);

    return updatedVaults;
  }
}

export const vaultService = new VaultService();
export { VaultService };
