/**
 * Keyboard shortcuts configuration
 * Add new shortcuts here by defining the key combination and action
 */

export type KeyboardShortcut = {
  /** The key to press (e.g., "k", "n", "Enter") */
  key: string;
  /** Whether Meta/Cmd key must be pressed (Mac) or Ctrl key (Windows/Linux) */
  metaOrCtrl?: boolean;
  /** Whether Shift key must be pressed */
  shift?: boolean;
  /** Whether Alt/Option key must be pressed */
  alt?: boolean;
  /** Unique identifier for this shortcut */
  id: string;
  /** Description of what this shortcut does */
  description: string;
  /** Callback function to execute when shortcut is pressed */
  action: (e: KeyboardEvent) => void;
};

/**
 * Check if a keyboard event matches a shortcut configuration
 */
export function matchesShortcut(
  e: KeyboardEvent,
  shortcut: Omit<KeyboardShortcut, "action" | "id" | "description">
): boolean {
  if (e.key !== shortcut.key) return false;
  if (shortcut.metaOrCtrl && !(e.metaKey || e.ctrlKey)) return false;
  if (shortcut.shift && !e.shiftKey) return false;
  if (shortcut.alt && !e.altKey) return false;
  // Ensure no extra modifiers are pressed (unless shift/alt are explicitly allowed)
  if (shortcut.metaOrCtrl && e.shiftKey && !shortcut.shift) return false;
  if (shortcut.metaOrCtrl && e.altKey && !shortcut.alt) return false;
  return true;
}

/**
 * Register keyboard shortcuts
 * Returns a cleanup function to remove event listeners
 */
export function registerKeyboardShortcuts(
  shortcuts: KeyboardShortcut[]
): () => void {
  const handler = (e: KeyboardEvent) => {
    for (const shortcut of shortcuts) {
      if (matchesShortcut(e, shortcut)) {
        e.preventDefault();
        shortcut.action(e);
        break; // Only trigger the first matching shortcut
      }
    }
  };

  document.addEventListener("keydown", handler);
  return () => document.removeEventListener("keydown", handler);
}
