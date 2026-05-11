<?php
/**
 * settings.php — Cài đặt giao diện
 */
switch ($action) {
    case 'get_settings':
        $stmt = $db->query("SELECT key, value FROM settings");
        $rows = $stmt->fetchAll();
        $settings = [];
        foreach ($rows as $row) {
            $settings[$row['key']] = $row['value'];
        }
        json_success($settings);
        break;

    case 'save_settings':
        require_auth();
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_error('Method not allowed', 405);
        $input = json_decode(file_get_contents('php://input'), true);
        if (!is_array($input) || empty($input)) json_error('No settings to save');
        
        $allowedKeys = ['theme', 'primary_color', 'site_title'];
        foreach ($input as $key => $value) {
            if (!in_array($key, $allowedKeys)) continue;
            $stmt = $db->prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)");
            $stmt->execute([sanitize_input($key), sanitize_input($value)]);
        }
        json_success(null, 'Settings saved');
        break;
}
