<?php
/**
 * contact.php — Nhận và quản lý tin nhắn liên hệ
 */
switch ($action) {
    case 'send_contact':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_error('Method not allowed', 405);
        $input = json_decode(file_get_contents('php://input'), true);
        $name = sanitize_input($input['name'] ?? '');
        $email = sanitize_input($input['email'] ?? '');
        $subject = sanitize_input($input['subject'] ?? '');
        $message = sanitize_input($input['message'] ?? '');
        
        if (empty($name)) json_error('Name is required');
        if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) json_error('Valid email is required');
        if (empty($message)) json_error('Message is required');
        
        $stmt = $db->prepare("INSERT INTO contact_messages (name, email, subject, message) VALUES (?, ?, ?, ?)");
        $stmt->execute([$name, $email, $subject, $message]);
        json_success(null, 'Message sent successfully');
        break;

    case 'get_messages':
        require_auth();
        $stmt = $db->query("SELECT * FROM contact_messages ORDER BY created_at DESC");
        $messages = $stmt->fetchAll();
        $unread = $db->query("SELECT COUNT(*) as cnt FROM contact_messages WHERE is_read = 0")->fetch();
        json_success(['messages' => $messages, 'unread_count' => (int)$unread['cnt']]);
        break;

    case 'mark_read':
        require_auth();
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_error('Method not allowed', 405);
        $input = json_decode(file_get_contents('php://input'), true);
        $id = (int)($input['id'] ?? 0);
        if ($id <= 0) json_error('Invalid message ID');
        $stmt = $db->prepare("UPDATE contact_messages SET is_read = 1 WHERE id = ?");
        $stmt->execute([$id]);
        json_success(null, 'Message marked as read');
        break;

    case 'delete_message':
        require_auth();
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_error('Method not allowed', 405);
        $input = json_decode(file_get_contents('php://input'), true);
        $id = (int)($input['id'] ?? 0);
        if ($id <= 0) json_error('Invalid message ID');
        $stmt = $db->prepare("DELETE FROM contact_messages WHERE id = ?");
        $stmt->execute([$id]);
        json_success(null, 'Message deleted');
        break;
}
