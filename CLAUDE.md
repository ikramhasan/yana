# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Yana is a note-taking desktop application built with Next.js 16 + React 19 frontend and Tauri (Rust) backend. It features a vault-based file system with a Milkdown WYSIWYG markdown editor.

## Development Commands

```bash
bun dev              # Start Next.js dev server (Tauri will invoke this)
bun tauri dev        # Start full Tauri app in development mode
bun build            # Build Next.js static export
bun tauri build      # Build production desktop app
bun lint             # Run ESLint
bun typecheck        # Run TypeScript type checking (tsc --noEmit)
```

## Architecture

### Frontend Structure (`/src`)

- **App Router**: Next.js static export (`output: "export"`) with single page at `src/app/page.tsx`
- **Path Alias**: `@/*` maps to `./src/*`

### State Management

Three React Context providers wrap the app in this order:
1. **SettingsContext** (`/src/contexts/settings-context.tsx`) - App preferences, persists to `settings.json`
2. **VaultContext** (`/src/contexts/vault-context.tsx`) - Vault management, persists to `vaults.json`
3. **FileTreeContext** (`/src/contexts/file-tree-context.tsx`) - File tree state, integrates with file watcher

Provider hierarchy in `/src/components/providers.tsx`:
```
ThemeProvider → SettingsProvider → VaultProvider → FileTreeProvider → SidebarProvider
```

### Service Layer (`/src/services`)

Services abstract Tauri integration:
- `vault-service.ts` - Vault CRUD via Tauri Store plugin
- `file-tree-service.ts` - File operations via Tauri commands + file watcher events
- `settings-service.ts` - Settings persistence via Tauri Store plugin

Services use `invoke()` from `@tauri-apps/api/core` to call Rust commands.

### Tauri Backend (`/src-tauri/src`)

Rust commands in `/src-tauri/src/commands/file_tree.rs`:
- `scan_directory` - Recursive file tree scanning
- `read_file`, `write_file` - File content operations
- `create_new_note`, `delete_path`, `duplicate_file`, `rename_path` - File management
- `start_watching`, `stop_watching` - File system watcher (emits `file-tree-change` events)

Commands registered in `/src-tauri/src/lib.rs`.

### UI Components

- **Component Library**: shadcn/ui with Radix UI primitives in `/src/components/ui/`
- **Icons**: @tabler/icons-react
- **Styling**: Tailwind CSS v4 with CSS variables for theming
- **Editor**: Milkdown (`@milkdown/crepe`) WYSIWYG markdown editor at `/src/components/editor/milkdown-editor.tsx`

### Key Types (`/src/types`)

```typescript
// FileNode - represents file/folder in tree
{ id: string, name: string, path: string, type: "file" | "folder", children?: FileNode[] }

// Vault - represents a vault directory
{ id: string, path: string, name: string, isDefault: boolean }
```

## Data Persistence

- **Vaults & Settings**: Stored via Tauri's `LazyStore` plugin as JSON files in app data directory
- **File Content**: Saved directly to vault filesystem via Tauri commands

## File Watcher Integration

The file tree subscribes to `file-tree-change` events from Tauri and refreshes with 300ms debounce. The watcher is started when a vault is selected and stopped when switching vaults.
