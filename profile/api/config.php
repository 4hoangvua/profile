<?php
/**
 * config.php — Kết nối SQLite + khởi tạo database
 * Tất cả các file API đều require file này.
 */

// Bật hiển thị lỗi khi dev (tắt khi deploy)
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Đường dẫn database
define('DB_PATH', __DIR__ . '/../data/profile.db');
define('UPLOAD_DIR', __DIR__ . '/../uploads/');
define('MAX_UPLOAD_SIZE', 2 * 1024 * 1024); // 2MB
define('ALLOWED_EXTENSIONS', ['jpg', 'jpeg', 'png', 'webp', 'pdf', 'docx']);

/**
 * Tạo thư mục data nếu chưa có
 */
$dataDir = dirname(DB_PATH);
if (!is_dir($dataDir)) {
    mkdir($dataDir, 0755, true);
}

/**
 * Tạo thư mục uploads nếu chưa có
 */
if (!is_dir(UPLOAD_DIR)) {
    mkdir(UPLOAD_DIR, 0755, true);
}

/**
 * Kết nối SQLite
 */
try {
    $db = new PDO('sqlite:' . DB_PATH);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $db->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    // Bật WAL mode để tăng hiệu suất
    $db->exec('PRAGMA journal_mode=WAL');
    $db->exec('PRAGMA foreign_keys=ON');
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database connection failed']);
    exit;
}

/**
 * Khởi tạo tất cả bảng
 */
$db->exec("
    CREATE TABLE IF NOT EXISTS admin (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        created_at TEXT DEFAULT (datetime('now', 'localtime'))
    )
");

$db->exec("
    CREATE TABLE IF NOT EXISTS profile (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        full_name TEXT DEFAULT '',
        title TEXT DEFAULT '',
        bio TEXT DEFAULT '',
        avatar TEXT DEFAULT '',
        email TEXT DEFAULT '',
        phone TEXT DEFAULT '',
        address TEXT DEFAULT '',
        github TEXT DEFAULT '',
        linkedin TEXT DEFAULT '',
        facebook TEXT DEFAULT '',
        website TEXT DEFAULT ''
    )
");

$db->exec("
    CREATE TABLE IF NOT EXISTS skills (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        level INTEGER DEFAULT 50 CHECK (level >= 0 AND level <= 100),
        category TEXT DEFAULT 'other',
        sort_order INTEGER DEFAULT 0
    )
");

$db->exec("
    CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT DEFAULT '',
        image TEXT DEFAULT '',
        tech_stack TEXT DEFAULT '',
        demo_url TEXT DEFAULT '',
        source_url TEXT DEFAULT '',
        sort_order INTEGER DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now', 'localtime'))
    )
");

$db->exec("
    CREATE TABLE IF NOT EXISTS education (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        school TEXT NOT NULL,
        degree TEXT DEFAULT '',
        start_year TEXT DEFAULT '',
        end_year TEXT DEFAULT '',
        description TEXT DEFAULT '',
        sort_order INTEGER DEFAULT 0
    )
");

$db->exec("
    CREATE TABLE IF NOT EXISTS experience (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        company TEXT NOT NULL,
        position TEXT DEFAULT '',
        start_date TEXT DEFAULT '',
        end_date TEXT DEFAULT '',
        description TEXT DEFAULT '',
        sort_order INTEGER DEFAULT 0
    )
");

$db->exec("
    CREATE TABLE IF NOT EXISTS contact_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        subject TEXT DEFAULT '',
        message TEXT NOT NULL,
        is_read INTEGER DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now', 'localtime'))
    )
");

$db->exec("
    CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT DEFAULT ''
    )
");

/**
 * Tạo tài khoản admin mặc định nếu chưa có
 * Username: admin | Password: admin123
 */
$stmt = $db->query("SELECT COUNT(*) as cnt FROM admin");
$row = $stmt->fetch();
if ((int)$row['cnt'] === 0) {
    $hashedPassword = password_hash('admin123', PASSWORD_DEFAULT);
    $stmt = $db->prepare("INSERT INTO admin (username, password) VALUES (?, ?)");
    $stmt->execute(['admin', $hashedPassword]);
}

/**
 * Tạo bản ghi profile mặc định nếu chưa có
 */
$stmt = $db->query("SELECT COUNT(*) as cnt FROM profile");
$row = $stmt->fetch();
if ((int)$row['cnt'] === 0) {
    $db->exec("INSERT INTO profile (id, full_name, title, bio) VALUES (1, 'Your Name', 'Web Developer', 'Hello! I am a passionate developer.')");
}

/**
 * Tạo settings mặc định
 */
$defaultSettings = [
    'theme' => 'dark',
    'primary_color' => '#6366f1',
    'site_title' => 'My Portfolio'
];
foreach ($defaultSettings as $key => $value) {
    $stmt = $db->prepare("INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)");
    $stmt->execute([$key, $value]);
}

/**
 * Helper: Sanitize string input
 */
function sanitize_input($input) {
    if ($input === null) return '';
    return htmlspecialchars(trim($input), ENT_QUOTES, 'UTF-8');
}

/**
 * Helper: Trả JSON response
 */
function json_response($data, $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

/**
 * Helper: Trả lỗi JSON
 */
function json_error($message, $statusCode = 400) {
    json_response(['success' => false, 'message' => $message], $statusCode);
}

/**
 * Helper: Trả thành công JSON
 */
function json_success($data = null, $message = 'OK') {
    $response = ['success' => true, 'message' => $message];
    if ($data !== null) {
        $response['data'] = $data;
    }
    json_response($response);
}

/**
 * Kiểm tra admin đã đăng nhập chưa (dùng trong các API cần auth)
 */
function require_auth() {
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    if (!isset($_SESSION['admin_id'])) {
        json_error('Unauthorized. Please login.', 401);
    }
}

/**
 * Kiểm tra trạng thái đăng nhập (không exit)
 */
function is_authenticated() {
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    return isset($_SESSION['admin_id']);
}
