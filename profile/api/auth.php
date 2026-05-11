<?php
/**
 * auth.php — Xác thực session admin
 * Actions: login, logout, check_auth, change_password
 */


// Xử lý action
switch ($action) {
    case 'login':
        handle_login($db);
        break;
    case 'logout':
        handle_logout();
        break;
    case 'check_auth':
        handle_check_auth();
        break;
    case 'change_password':
        handle_change_password($db);
        break;
    default:
        json_error('Invalid auth action');
}

/**
 * Đăng nhập admin
 */
function handle_login($db) {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        json_error('Method not allowed', 405);
    }

    // Lấy dữ liệu từ POST body (JSON hoặc form data)
    $input = json_decode(file_get_contents('php://input'), true);
    $username = sanitize_input($input['username'] ?? '');
    $password = $input['password'] ?? '';

    if (empty($username) || empty($password)) {
        json_error('Username and password are required');
    }

    // Tìm admin theo username
    $stmt = $db->prepare("SELECT id, username, password FROM admin WHERE username = ?");
    $stmt->execute([$username]);
    $admin = $stmt->fetch();

    if (!$admin || !password_verify($password, $admin['password'])) {
        json_error('Invalid username or password', 401);
    }

    // Tạo session
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    $_SESSION['admin_id'] = $admin['id'];
    $_SESSION['admin_username'] = $admin['username'];

    json_success([
        'id' => $admin['id'],
        'username' => $admin['username']
    ], 'Login successful');
}

/**
 * Đăng xuất
 */
function handle_logout() {
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    session_unset();
    session_destroy();
    json_success(null, 'Logged out successfully');
}

/**
 * Kiểm tra trạng thái auth
 */
function handle_check_auth() {
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    if (isset($_SESSION['admin_id'])) {
        json_success([
            'authenticated' => true,
            'username' => $_SESSION['admin_username'] ?? ''
        ]);
    } else {
        json_success(['authenticated' => false]);
    }
}

/**
 * Đổi mật khẩu admin
 */
function handle_change_password($db) {
    require_auth();

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        json_error('Method not allowed', 405);
    }

    $input = json_decode(file_get_contents('php://input'), true);
    $currentPassword = $input['current_password'] ?? '';
    $newPassword = $input['new_password'] ?? '';

    if (empty($currentPassword) || empty($newPassword)) {
        json_error('Current and new password are required');
    }

    if (strlen($newPassword) < 6) {
        json_error('New password must be at least 6 characters');
    }

    // Kiểm tra mật khẩu hiện tại
    $stmt = $db->prepare("SELECT password FROM admin WHERE id = ?");
    $stmt->execute([$_SESSION['admin_id']]);
    $admin = $stmt->fetch();

    if (!password_verify($currentPassword, $admin['password'])) {
        json_error('Current password is incorrect');
    }

    // Cập nhật mật khẩu mới
    $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);
    $stmt = $db->prepare("UPDATE admin SET password = ? WHERE id = ?");
    $stmt->execute([$hashedPassword, $_SESSION['admin_id']]);

    json_success(null, 'Password changed successfully');
}
