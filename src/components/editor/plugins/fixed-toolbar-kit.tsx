'use client';

import { createPlatePlugin } from 'platejs/react';

import { FixedToolbar } from '@/components/editor/ui/fixed-toolbar';
import { FixedToolbarButtons } from '@/components/editor/ui/fixed-toolbar-buttons';
import { useSettings } from '@/contexts/settings-context';

function FixedToolbarRenderer() {
  const { settings } = useSettings();

  if (settings.hideEditorToolbar) {
    return null;
  }

  return (
    <FixedToolbar>
      <FixedToolbarButtons />
    </FixedToolbar>
  );
}

export const FixedToolbarKit = [
  createPlatePlugin({
    key: 'fixed-toolbar',
    render: {
      beforeEditable: FixedToolbarRenderer,
    },
  }),
];
