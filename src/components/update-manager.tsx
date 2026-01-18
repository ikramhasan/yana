import { useEffect } from 'react';
import { useSettings } from '@/contexts/settings-context';
import { useUpdate } from '@/hooks/use-update';

export function UpdateManager() {
  const { settings } = useSettings();
  const { checkForUpdates } = useUpdate();

  useEffect(() => {
    if (settings.autoCheckUpdates) {
      checkForUpdates();
    }
  }, [settings.autoCheckUpdates, checkForUpdates]);

  return null;
}
