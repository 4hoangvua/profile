<?php
/**
 * upload.php — Upload ảnh (avatar, project images)
 */
require_auth();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_error('Method not allowed', 405);
}

if (!isset($_FILES['image'])) {
    json_error('No image file uploaded');
}

$file = $_FILES['image'];

// Kiểm tra lỗi upload
if ($file['error'] !== UPLOAD_ERR_OK) {
    json_error('Upload error: ' . $file['error']);
}

// Kiểm tra kích thước (2MB)
if ($file['size'] > MAX_UPLOAD_SIZE) {
    json_error('File too large. Maximum size is 2MB');
}

// Kiểm tra extension
$ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
if (!in_array($ext, ALLOWED_EXTENSIONS)) {
    json_error('Invalid file type. Allowed: jpg, jpeg, png, webp');
}

// Kiểm tra MIME type
$allowedMimes = [
    'image/jpeg', 'image/png', 'image/webp', 
    'application/pdf', 
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];
$finfo = finfo_open(FILEINFO_MIME_TYPE);
$mime = finfo_file($finfo, $file['tmp_name']);
finfo_close($finfo);
if (!in_array($mime, $allowedMimes)) {
    json_error('Invalid file content type');
}

// Tạo tên file unique
$filename = uniqid('img_') . '.' . $ext;
$destination = UPLOAD_DIR . $filename;

if (!move_uploaded_file($file['tmp_name'], $destination)) {
    json_error('Failed to save uploaded file', 500);
}

json_success([
    'filename' => $filename,
    'url' => 'uploads/' . $filename
], 'Image uploaded successfully');
