<?php
/**
 * index.php — API Router chính
 * Nhận request qua ?action=..., phân phối đến file xử lý tương ứng.
 */
session_start();

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/config.php';

$action = $_GET['action'] ?? '';

if (empty($action)) {
    json_error('No action specified');
}

$routes = [
    'login' => 'auth.php', 'logout' => 'auth.php',
    'check_auth' => 'auth.php', 'change_password' => 'auth.php',
    'get_profile' => 'profile.php', 'save_profile' => 'profile.php',
    'get_skills' => 'skills.php', 'add_skill' => 'skills.php',
    'update_skill' => 'skills.php', 'delete_skill' => 'skills.php',
    'get_projects' => 'projects.php', 'add_project' => 'projects.php',
    'update_project' => 'projects.php', 'delete_project' => 'projects.php',
    'get_education' => 'education.php', 'add_education' => 'education.php',
    'update_education' => 'education.php', 'delete_education' => 'education.php',
    'get_experience' => 'experience.php', 'add_experience' => 'experience.php',
    'update_experience' => 'experience.php', 'delete_experience' => 'experience.php',
    'send_contact' => 'contact.php', 'get_messages' => 'contact.php',
    'mark_read' => 'contact.php', 'delete_message' => 'contact.php',
    'get_settings' => 'settings.php', 'save_settings' => 'settings.php',
    'upload_image' => 'upload.php',
];

if (isset($routes[$action])) {
    require_once __DIR__ . '/' . $routes[$action];
} else {
    json_error('Unknown action: ' . $action, 404);
}
