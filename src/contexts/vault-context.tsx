'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Vault, VaultContextValue } from '@/types/vault';
import { vaultService } from '@/services/vault-service';

/**
 * React context for vault state management.
 * Provides vault data and operations to the component tree.
 */
const VaultContext = createContext<VaultContextValue | null>(null);

/**
 * Provider component that manages vault state and operations.
 * Loads vaults on mount and provides methods for vault CRUD operations.
 */
export function VaultProvider({ children }: { children: React.ReactNode }) {
  const [vaults, setVaults] = useState<Vault[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Compute current vault (the default vault)
  const currentVault = vaults.find((v) => v.isDefault) || null;

  // Load vaults on mount
  useEffect(() => {
    const loadVaults = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const loadedVaults = await vaultService.loadVaults();
        setVaults(loadedVaults);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to load vaults');
        setError(error);
        console.error('Failed to load vaults:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadVaults();
  }, []);

  /**
   * Open folder dialog and add a new vault.
   * Returns the new vault on success, null on cancellation.
   */
  const addVault = useCallback(async (): Promise<Vault | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const newVault = await vaultService.chooseAndAddVault(vaults);
      setVaults((prev) => [...prev, newVault]);
      return newVault;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to add vault');
      setError(error);
      console.error('Failed to add vault:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [vaults]);

  /**
   * Set a vault as the default vault.
   * Updates isDefault to true for the target vault and false for all others.
   */
  const setDefaultVault = useCallback(async (id: string): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      const updatedVaults = await vaultService.setDefaultVault(id, vaults);
      setVaults(updatedVaults);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to set default vault');
      setError(error);
      console.error('Failed to set default vault:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [vaults]);

  /**
   * Remove a vault from the list.
   * If the removed vault was default, sets the first remaining vault as default.
   */
  const removeVault = useCallback(async (id: string): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      const updatedVaults = await vaultService.removeVault(id, vaults);
      setVaults(updatedVaults);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to remove vault');
      setError(error);
      console.error('Failed to remove vault:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [vaults]);

  const value: VaultContextValue = {
    vaults,
    currentVault,
    isLoading,
    error,
    addVault,
    setDefaultVault,
    removeVault,
  };

  return <VaultContext.Provider value={value}>{children}</VaultContext.Provider>;
}

/**
 * Custom hook to access vault context.
 * Must be used within a VaultProvider.
 * @throws Error if used outside VaultProvider
 */
export function useVault(): VaultContextValue {
  const context = useContext(VaultContext);
  if (!context) {
    throw new Error('useVault must be used within a VaultProvider');
  }
  return context;
}
