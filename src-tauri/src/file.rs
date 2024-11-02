use dirs;
use serde_json::Value;
use std::fs;
use std::path::PathBuf;

fn get_todo_file_path() -> PathBuf {
    let home = dirs::home_dir().expect("Unable to get home directory");
    home.join(".todotodo")
}

#[tauri::command]
pub fn save_todo(todo_data: Value) -> Result<String, String> {
    let file_path = get_todo_file_path();
    let todo_data = serde_json::to_value(todo_data).unwrap();
    let contents = fs::read_to_string(&file_path).unwrap_or_default();
    let mut new_contents = String::new();
    let mut is_updated = false;
    for line in contents.lines() {
        let line_data: Value = serde_json::from_str(line).unwrap();
        if line_data["id"] == todo_data["id"] {
            new_contents.push_str(&serde_json::to_string(&todo_data).unwrap());
            new_contents.push_str("\n");
            is_updated = true;
        } else {
            new_contents.push_str(line);
            new_contents.push_str("\n");
        }
    }
    if !is_updated {
        new_contents.push_str(&serde_json::to_string(&todo_data).unwrap());
        new_contents.push_str("\n");
    }
    fs::write(file_path, new_contents)
        .map_err(|e| e.to_string())
        .and_then(|_| Ok("투두 데이터가 성공적으로 저장되었습니다.".to_string()))
}

#[tauri::command]
pub fn load_todo_list() -> Result<Vec<Value>, String> {
    let file_path = get_todo_file_path();
    let contents = fs::read_to_string(&file_path).unwrap_or_default();
    let todo_list = contents
        .lines()
        .map(|line| serde_json::from_str(line).unwrap())
        .collect();
    Ok(todo_list)
}

#[tauri::command]
pub fn delete_todo(todo_data: Value) -> Result<Vec<Value>, String> {
    let file_path = get_todo_file_path();
    let todo_items_serialized = serde_json::to_string(&todo_data).unwrap();
    let contents = fs::read_to_string(&file_path).unwrap();
    let mut new_contents_string = String::new();
    for line in contents.lines() {
        if line != todo_items_serialized {
            new_contents_string.push_str(line);
            new_contents_string.push_str("\n");
        }
    }

    let todo_list = contents
        .lines()
        .map(|line| serde_json::from_str(line).unwrap())
        .filter(|item| item != &todo_data)
        .collect::<Vec<Value>>();

    fs::write(file_path, new_contents_string)
        .map_err(|e| e.to_string())
        .and_then(|_| Ok(todo_list))
}
