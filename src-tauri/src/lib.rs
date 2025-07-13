use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct AudioFileInfo {
    name: String,
    path: String,
    size: u64,
    is_audio: bool,
}

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
async fn scan_audio_files(directory: String) -> Result<Vec<AudioFileInfo>, String> {
    use std::fs;
    use std::path::Path;
    
    let path = Path::new(&directory);
    
    // 먼저 경로가 존재하는지 확인
    if !path.exists() {
        return Ok(Vec::new()); // 빈 벡터 반환 (에러가 아님)
    }
    
    if !path.is_dir() {
        return Err("Path is not a directory".to_string());
    }
    
    let mut audio_files = Vec::new();
    let audio_extensions = vec!["mp3", "wav", "ogg", "m4a", "aac", "flac"];
    
    match fs::read_dir(path) {
        Ok(entries) => {
            for entry in entries {
                if let Ok(entry) = entry {
                    let file_path = entry.path();
                    if file_path.is_file() {
                        if let Some(extension) = file_path.extension() {
                            if let Some(ext_str) = extension.to_str() {
                                let is_audio = audio_extensions.contains(&ext_str.to_lowercase().as_str());
                                
                                if is_audio {
                                    if let Ok(metadata) = entry.metadata() {
                                        if let Some(file_name) = file_path.file_name() {
                                            if let Some(name_str) = file_name.to_str() {
                                                audio_files.push(AudioFileInfo {
                                                    name: name_str.to_string(),
                                                    path: file_path.to_string_lossy().to_string(),
                                                    size: metadata.len(),
                                                    is_audio: true,
                                                });
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        Err(e) => {
            // 권한 문제일 수 있으므로 로깅만 하고 빈 벡터 반환
            eprintln!("Failed to read directory {}: {}", directory, e);
            return Ok(Vec::new());
        }
    }
    
    Ok(audio_files)
}

#[tauri::command]
async fn get_default_music_directories() -> Result<Vec<String>, String> {
    let mut directories = Vec::new();
    
    // Android 기본 음악 폴더들 (일반적으로 접근 가능한 폴더들)
    #[cfg(target_os = "android")]
    {
        // 더 안전한 경로들 추가
        let potential_dirs = vec![
            "/storage/emulated/0/Music",
            "/storage/emulated/0/Download", 
            "/storage/emulated/0/Downloads",
            "/storage/emulated/0/DCIM",
            "/storage/emulated/0/Documents",
            "/sdcard/Music",
            "/sdcard/Download",
            "/sdcard/Downloads",
        ];
        
        // 실제로 존재하는 폴더만 추가
        for dir in potential_dirs {
            if std::path::Path::new(dir).exists() {
                directories.push(dir.to_string());
            }
        }
        
        // 기본 폴더가 없으면 최소한 하나는 제공
        if directories.is_empty() {
            directories.push("/storage/emulated/0".to_string());
        }
    }
    
    // 데스크톱 폴더들
    #[cfg(not(any(target_os = "android", target_os = "ios")))]
    {
        use std::env;
        if let Ok(home) = env::var("HOME") {
            let potential_dirs = vec![
                format!("{}/Music", home),
                format!("{}/Downloads", home),
                format!("{}/Documents", home),
            ];
            
            for dir in potential_dirs {
                if std::path::Path::new(&dir).exists() {
                    directories.push(dir);
                }
            }
        }
        
        // 기본값 제공
        if directories.is_empty() {
            if let Ok(home) = env::var("HOME") {
                directories.push(home);
            }
        }
    }
    
    Ok(directories)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![
            greet, 
            scan_audio_files, 
            get_default_music_directories
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
