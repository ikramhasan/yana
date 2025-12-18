/**
 * Vault type definitions for the vault management system
 */

/**
 * Represents a single vault entry
 * A vault is a folder on the user's filesystem that contains notes and documents
 */
export interface Vault {
  /** UUID v4 identifier */
  id: string;
  /** Full filesystem path to vault folder */
  path: string;
  /** Human-readable name (folder name extracted from path) */
  name: string;
  /** Whether this vault loads on app start */
  isDefault: boolean;
}

/**
 * Storage format for persisting vaults to vaults.json
 */
export interface VaultStore {
  vaults: Vault[];
}

/**
 * Context value providing vault state and operations to components
 */
export interface VaultContextValue {
  /** List of all configured vaults */
  vaults: Vault[];
  /** The currently active vault (default vault) */
  currentVault: Vault | null;
  /** Whether vault operations are in progress */
  isLoading: boolean;
  /** Error state from vault operations */
  error: Error | null;
  /** Open folder dialog and add a new vault */
  addVault: () => Promise<Vault | null>;
  /** Set a vault as the default vault */
  setDefaultVault: (id: string) => Promise<void>;
  /** Remove a vault from the list */
  removeVault: (id: string) => Promise<void>;
}
