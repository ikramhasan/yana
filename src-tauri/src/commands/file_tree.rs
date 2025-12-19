use notify::{RecommendedWatcher, RecursiveMode, Watcher};
// use notify_debouncer_mini::{new_debouncer, DebouncedEventKind, Debouncer}; // Removed
use serde::{Deserialize, Serialize};
use std::collections::hash_map::DefaultHasher;
use std::fs;
use std::hash::{Hash, Hasher};
use std::path::Path;
use std::sync::Mutex;
// use std::time::Duration; // Removed
use tauri::{AppHandle, Emitter, Manager};

/// Supported file extensions for the file tree
const SUPPORTED_EXTENSIONS: &[&str] = &["md", "MD", "png", "jpg", "jpeg", "gif", "svg", "webp"];

/// Debounce window in milliseconds for file watcher events (Unused now)
// const DEBOUNCE_MS: u64 = 500;

/// Event name for file system changes emitted to frontend
const FILE_EVENT_NAME: &str = "file-tree-change";

/// File event structure sent to frontend
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FileEvent {
    #[serde(rename = "type")]
    pub event_type: String, // "create", "delete", "rename", "modify"
    pub path: String,
}

/// State to hold the file watcher
pub struct WatcherState {
    pub watcher: Option<RecommendedWatcher>,
    pub watching_path: Option<String>,
}

/// Represents a file or folder node in the tree
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FileNode {
    pub id: String,
    pub name: String,
    pub path: String,
    #[serde(rename = "type")]
    pub node_type: String, // "file" or "folder"
    #[serde(skip_serializing_if = "Option::is_none")]
    pub children: Option<Vec<FileNode>>,
}

impl FileNode {
    /// Create a new FileNode from a path
    fn new(path: &Path, node_type: &str, children: Option<Vec<FileNode>>) -> Self {
        let path_str = path.to_string_lossy().to_string();
        let name = path
            .file_name()
            .map(|n| n.to_string_lossy().to_string())
            .unwrap_or_default();

        // Generate id from path hash
        let mut hasher = DefaultHasher::new();
        path_str.hash(&mut hasher);
        let id = format!("{:x}", hasher.finish());

        FileNode {
            id,
            name,
            path: path_str,
            node_type: node_type.to_string(),
            children,
        }
    }
}

/// Check if a file has a supported extension
fn is_supported_file(path: &Path) -> bool {
    path.extension()
        .and_then(|ext| ext.to_str())
        .map(|ext| SUPPORTED_EXTENSIONS.contains(&ext))
        .unwrap_or(false)
}

/// Recursively scan a directory and build the file tree
fn scan_directory_recursive(dir_path: &Path) -> Result<Vec<FileNode>, String> {
    let entries = fs::read_dir(dir_path).map_err(|e| {
        let error_msg = format!("Failed to read directory '{}': {}", dir_path.display(), e);
        log::error!("{}", error_msg);
        error_msg
    })?;

    let mut folders: Vec<FileNode> = Vec::new();
    let mut files: Vec<FileNode> = Vec::new();

    for entry in entries {
        let entry = match entry {
            Ok(e) => e,
            Err(e) => {
                // Log but don't fail - skip problematic entries
                log::warn!("Failed to read directory entry in '{}': {}", dir_path.display(), e);
                continue;
            }
        };
        
        let path = entry.path();
        let file_name = path
            .file_name()
            .map(|n| n.to_string_lossy().to_string())
            .unwrap_or_default();

        // Skip hidden files and directories (starting with .)
        if file_name.starts_with('.') {
            continue;
        }

        if path.is_dir() {
            // Recursively scan subdirectory - log but don't fail on permission errors
            match scan_directory_recursive(&path) {
                Ok(children) => {
                    let node = FileNode::new(&path, "folder", Some(children));
                    folders.push(node);
                }
                Err(e) => {
                    log::warn!("Failed to scan subdirectory '{}': {}", path.display(), e);
                    // Still add the folder node, but with empty children
                    let node = FileNode::new(&path, "folder", Some(Vec::new()));
                    folders.push(node);
                }
            }
        } else if path.is_file() && is_supported_file(&path) {
            let node = FileNode::new(&path, "file", None);
            files.push(node);
        }
    }

    // Sort folders and files alphabetically (case-insensitive)
    folders.sort_by(|a, b| a.name.to_lowercase().cmp(&b.name.to_lowercase()));
    files.sort_by(|a, b| a.name.to_lowercase().cmp(&b.name.to_lowercase()));

    // Combine: folders first, then files
    folders.extend(files);
    Ok(folders)
}

/// Scan a directory and return hierarchical file tree
#[tauri::command]
pub async fn scan_directory(path: String) -> Result<Vec<FileNode>, String> {
    log::info!("Scanning directory: {}", path);
    
    let dir_path = Path::new(&path);

    if !dir_path.exists() {
        let error_msg = format!("Directory does not exist: {}", path);
        log::error!("{}", error_msg);
        return Err(error_msg);
    }

    if !dir_path.is_dir() {
        let error_msg = format!("Path is not a directory: {}", path);
        log::error!("{}", error_msg);
        return Err(error_msg);
    }

    match scan_directory_recursive(dir_path) {
        Ok(nodes) => {
            log::info!("Successfully scanned directory '{}' with {} top-level entries", path, nodes.len());
            Ok(nodes)
        }
        Err(e) => {
            log::error!("Failed to scan directory '{}': {}", path, e);
            Err(e)
        }
    }
}

/// Read file contents as string
#[tauri::command]
pub async fn read_file(path: String) -> Result<String, String> {
    log::info!("Reading file: {}", path);
    
    let file_path = Path::new(&path);

    if !file_path.exists() {
        let error_msg = format!("File does not exist: {}", path);
        log::error!("{}", error_msg);
        return Err(error_msg);
    }

    if !file_path.is_file() {
        let error_msg = format!("Path is not a file: {}", path);
        log::error!("{}", error_msg);
        return Err(error_msg);
    }

    match fs::read_to_string(file_path) {
        Ok(content) => {
            log::info!("Successfully read file '{}' ({} bytes)", path, content.len());
            Ok(content)
        }
        Err(e) => {
            let error_msg = format!("Failed to read file '{}': {}", path, e);
            log::error!("{}", error_msg);
            Err(error_msg)
        }
    }
}


/// Write content to a file
#[tauri::command]
pub async fn write_file(path: String, content: String) -> Result<(), String> {
    log::info!("Writing to file: {}", path);
    
    let file_path = Path::new(&path);

    // Basic validation to ensure we're writing to a valid path structure
    // We don't strictly check for file existence because we might want to create it,
    // but for this specific use case (saving existing file), we could.
    // However, standard save behavior usually allows creating/overwriting.
    // Let's at least check parent directory exists to avoid random writes.
    if let Some(parent) = file_path.parent() {
        if !parent.exists() {
             let error_msg = format!("Parent directory does not exist: {}", parent.display());
             log::error!("{}", error_msg);
             return Err(error_msg);
        }
    }

    match fs::write(file_path, content) {
        Ok(_) => {
            log::info!("Successfully wrote to file '{}'", path);
            Ok(())
        }
        Err(e) => {
            let error_msg = format!("Failed to write file '{}': {}", path, e);
            log::error!("{}", error_msg);
            Err(error_msg)
        }
    }
}

/// Start watching a directory for changes
#[tauri::command]
pub async fn start_watching(app: AppHandle, path: String) -> Result<(), String> {
    log::info!("Starting file watcher for: {}", path);
    
    let watch_path = Path::new(&path);

    if !watch_path.exists() {
        let error_msg = format!("Directory does not exist: {}", path);
        log::error!("{}", error_msg);
        return Err(error_msg);
    }

    if !watch_path.is_dir() {
        let error_msg = format!("Path is not a directory: {}", path);
        log::error!("{}", error_msg);
        return Err(error_msg);
    }

    // Get the watcher state from app state
    let state = app.state::<Mutex<WatcherState>>();
    let mut watcher_state = state.lock().map_err(|e| {
        let error_msg = format!("Failed to lock watcher state: {}", e);
        log::error!("{}", error_msg);
        error_msg
    })?;

    // Stop existing watcher if any
    if watcher_state.watcher.is_some() {
        log::info!("Stopping existing file watcher");
        watcher_state.watcher = None;
        watcher_state.watching_path = None;
    }

    // Clone app handle for the event callback
    let app_handle = app.clone();
    let watched_path = path.clone();

    // Create raw watcher
    let mut watcher = notify::recommended_watcher(move |res: Result<notify::Event, notify::Error>| {
        match res {
            Ok(event) => {
                let event_type = match event.kind {
                    notify::EventKind::Create(_) => Some("create"),
                    notify::EventKind::Remove(_) => Some("delete"),
                    notify::EventKind::Modify(notify::event::ModifyKind::Name(_)) => Some("rename"),
                    _ => None,
                };

                if let Some(event_type_str) = event_type {
                    for path in event.paths {
                        let file_event = FileEvent {
                            event_type: event_type_str.to_string(),
                            path: path.to_string_lossy().to_string(),
                        };

                        log::debug!(
                            "File event: {} - {}",
                            file_event.event_type,
                            file_event.path
                        );

                        // Emit event to frontend
                        // Since this is raw notify, events might burst. 
                        // Frontend likely still has debounce (FileTreeService comments say "Events are debounced by the backend" but that was old code).
                        // If frontend relies on debounce, we might spam it.
                        // However, user specifically asked to use existing libraries and "subscribe to CreateKind...".
                        // Basic file operations usually don't burst too much compared to Modify(Data).
                        if let Err(e) = app_handle.emit(FILE_EVENT_NAME, &file_event) {
                            log::error!("Failed to emit file event: {}", e);
                        }
                    }
                }
            }
            Err(e) => {
                 log::error!("File watcher error: {:?}", e);
            }
        }
    })
    .map_err(|e| {
        let error_msg = format!("Failed to create file watcher: {}", e);
        log::error!("{}", error_msg);
        error_msg
    })?;

    // Start watching the directory
    watcher
        .watch(watch_path, RecursiveMode::Recursive)
        .map_err(|e| {
            let error_msg = format!("Failed to start watching '{}': {}", path, e);
            log::error!("{}", error_msg);
            error_msg
        })?;

    log::info!("Successfully started watching directory: {}", path);

    // Store the watcher in state
    watcher_state.watcher = Some(watcher);
    watcher_state.watching_path = Some(watched_path);

    Ok(())
}

/// Stop watching the current directory
#[tauri::command]
pub async fn stop_watching(app: AppHandle) -> Result<(), String> {
    let state = app.state::<Mutex<WatcherState>>();
    let mut watcher_state = state.lock().map_err(|e| {
        let error_msg = format!("Failed to lock watcher state: {}", e);
        log::error!("{}", error_msg);
        error_msg
    })?;

    if let Some(watching_path) = &watcher_state.watching_path {
        log::info!("Stopping file watcher for: {}", watching_path);
    } else {
        log::debug!("No active file watcher to stop");
    }

    // Drop the watcher to stop watching
    watcher_state.watcher = None;
    watcher_state.watching_path = None;

    log::info!("File watcher stopped successfully");
    Ok(())
}
