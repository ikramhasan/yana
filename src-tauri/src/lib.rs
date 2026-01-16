mod commands;

use commands::WatcherState;
use std::sync::Mutex;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .manage(Mutex::new(WatcherState {
            watcher: None,
            watching_path: None,
        }))
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::scan_directory,
            commands::read_file,
            commands::write_file,
            commands::create_new_note,
            commands::delete_path,
            commands::duplicate_file,
            commands::rename_path,
            commands::start_watching,
            commands::stop_watching,
            commands::save_image_to_assets,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
