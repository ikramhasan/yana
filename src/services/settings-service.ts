import { LazyStore } from '@tauri-apps/plugin-store';
import { info, error as logError } from '@tauri-apps/plugin-log';
import type { Settings, SettingsStore } from '@/types/settings';

/**
 * Default settings values
 */
const DEFAULT_SETTINGS: Settings = {
  hideEditorToolbar: false,
  maxTabs: 5,
  autoCheckUpdates: true,
  devMode: false,
};

/**
 * Service layer for settings CRUD operations and business logic.
 * Abstracts Tauri plugin interactions for settings management.
 */
class SettingsService {
  private store: LazyStore;

  constructor() {
    this.store = new LazyStore('settings.json');
  }

  /**
   * Load settings from storage.
   * If the store doesn't exist or is empty, returns default settings.
   * @returns Promise resolving to Settings object
   */
  async loadSettings(): Promise<Settings> {
    try {
      const data = await this.store.get<SettingsStore>('data');
      if (data && data.settings) {
        await info('Loaded settings from store');
        // Merge with defaults to ensure all keys exist
        return { ...DEFAULT_SETTINGS, ...data.settings };
      }
      await info('No settings found in store, returning defaults');
      return DEFAULT_SETTINGS;
    } catch (err) {
      await logError(`Failed to load settings: ${err}`);
      throw err; // Re-throw to let the context handle it
    }
  }

  /**
   * Save settings to storage.
   * Persists immediately to prevent data loss.
   * @param settings - Settings object to persist
   */
  async saveSettings(settings: Settings): Promise<void> {
    try {
      const data: SettingsStore = { settings };
      await this.store.set('data', data);
      await this.store.save();
      await info('Saved settings to store');
    } catch (err) {
      await logError(`Failed to save settings: ${err}`);
      throw new Error(`Failed to save settings: ${err}`);
    }
  }

  /**
   * Update a specific setting.
   * @param key - Setting key to update
   * @param value - New value for the setting
   * @param currentSettings - Current settings object
   * @returns Promise resolving to the updated settings
   */
  async updateSetting<K extends keyof Settings>(
    key: K,
    value: Settings[K],
    currentSettings: Settings
  ): Promise<Settings> {
    const updatedSettings = {
      ...currentSettings,
      [key]: value,
    };

    await this.saveSettings(updatedSettings);
    await info(`Updated setting ${String(key)} to ${value}`);

    return updatedSettings;
  }
}

export const settingsService = new SettingsService();
export { SettingsService };
