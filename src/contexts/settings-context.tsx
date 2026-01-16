'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Settings, SettingsContextValue } from '@/types/settings';
import { settingsService } from '@/services/settings-service';

/**
 * React context for settings state management.
 * Provides settings data and operations to the component tree.
 */
const SettingsContext = createContext<SettingsContextValue | null>(null);

/**
 * Provider component that manages settings state and operations.
 * Loads settings on mount and provides methods for settings operations.
 */
export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>({
    hideEditorToolbar: false,
    maxTabs: 5,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Load settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const loadedSettings = await settingsService.loadSettings();
        setSettings(loadedSettings);
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        console.error('Failed to load settings:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  /**
   * Update a specific setting.
   */
  const updateSetting = useCallback(
    async <K extends keyof Settings>(key: K, value: Settings[K]): Promise<void> => {
      try {
        setError(null);
        const updatedSettings = await settingsService.updateSetting(key, value, settings);
        setSettings(updatedSettings);
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        console.error('Failed to update setting:', err);
        throw error;
      }
    },
    [settings]
  );

  const value: SettingsContextValue = {
    settings,
    isLoading,
    error,
    updateSetting,
  };

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

/**
 * Custom hook to access settings context.
 * Must be used within a SettingsProvider.
 * @throws Error if used outside SettingsProvider
 */
export function useSettings(): SettingsContextValue {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
