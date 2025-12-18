/**
 * Settings type definitions for the application settings system
 */

/**
 * Represents the application settings
 */
export interface Settings {
  /** Whether to hide the fixed editor toolbar */
  hideEditorToolbar: boolean;
}

/**
 * Storage format for persisting settings to settings.json
 */
export interface SettingsStore {
  settings: Settings;
}

/**
 * Context value providing settings state and operations to components
 */
export interface SettingsContextValue {
  /** Current settings */
  settings: Settings;
  /** Whether settings operations are in progress */
  isLoading: boolean;
  /** Error state from settings operations */
  error: Error | null;
  /** Update a specific setting */
  updateSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => Promise<void>;
}
