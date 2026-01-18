'use client';

import { useState, useCallback, useEffect } from 'react';
import { check, type Update } from '@tauri-apps/plugin-updater';
import { relaunch } from '@tauri-apps/plugin-process';
import { getVersion } from '@tauri-apps/api/app';
import { toast } from 'sonner';

export function useUpdate() {
  const [version, setVersion] = useState<string>('');
  const [isChecking, setIsChecking] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    getVersion().then(setVersion).catch(console.error);
  }, []);

  const handleUpdate = useCallback(async (update: Update) => {
    const toastId = toast.loading('Downloading update...', {
      description: `Version ${update.version} is being installed.`,
    });

    try {
      setIsUpdating(true);
      await update.downloadAndInstall((event) => {
        // We could track progress here if needed
      });

      toast.success('Update installed!', {
        id: toastId,
        description: 'The app will now restart to apply changes.',
        action: {
          label: 'Restart Now',
          onClick: () => relaunch(),
        },
      });

      setTimeout(() => relaunch(), 5000);
    } catch (error) {
      console.error('Failed to update:', error);
      toast.error('Failed to install update', {
        id: toastId,
        description: 'Please try again later.',
      });
    } finally {
      setIsUpdating(false);
    }
  }, []);

  const checkForUpdates = useCallback(async (isManual = false) => {
    try {
      setIsChecking(true);
      const update = await check();
      
      if (update) {
        toast('Update Available', {
          description: `Version ${update.version} is ready for download.`,
          action: {
            label: 'Update',
            onClick: () => handleUpdate(update),
          },
          duration: Infinity,
        });
        return update;
      } else if (isManual) {
        toast.info('No updates available', {
          description: 'You are running the latest version.',
        });
      }
    } catch (error) {
      console.error('Failed to check for updates:', error);
      if (isManual) {
        toast.error('Failed to check for updates', {
          description: 'Please check your internet connection.',
        });
      }
    } finally {
      setIsChecking(false);
    }
    return null;
  }, [handleUpdate]);

  return {
    version,
    isChecking,
    isUpdating,
    checkForUpdates,
    handleUpdate,
  };
}
