<?php
/**
 * skills.php — CRUD kỹ năng
 */
switch ($action) {
    case 'get_skills':
        $stmt = $db->query("SELECT * FROM skills ORDER BY sort_order ASC, id ASC");
        json_success($stmt->fetchAll());
        break;

    case 'add_skill':
        require_auth();
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_error('Method not allowed', 405);
        $input = json_decode(file_get_contents('php://input'), true);
        $name = sanitize_input($input['name'] ?? '');
        $level = (int)($input['level'] ?? 50);
        $category = sanitize_input($input['category'] ?? 'other');
        $sort_order = (int)($input['sort_order'] ?? 0);
        if (empty($name)) json_error('Skill name is required');
        if ($level < 0 || $level > 100) json_error('Level must be 0-100');
        
        $stmt = $db->prepare("INSERT INTO skills (name, level, category, sort_order) VALUES (?, ?, ?, ?)");
        $stmt->execute([$name, $level, $category, $sort_order]);
        json_success(['id' => $db->lastInsertId()], 'Skill added');
        break;

    case 'update_skill':
        require_auth();
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_error('Method not allowed', 405);
        $input = json_decode(file_get_contents('php://input'), true);
        $id = (int)($input['id'] ?? 0);
        if ($id <= 0) json_error('Invalid skill ID');
        
        $fields = ['name','level','category','sort_order'];
        $sets = []; $values = [];
        foreach ($fields as $f) {
            if (isset($input[$f])) {
                $sets[] = "$f = ?";
                $values[] = ($f === 'level' || $f === 'sort_order') ? (int)$input[$f] : sanitize_input($input[$f]);
            }
        }
        if (empty($sets)) json_error('No fields to update');
        $values[] = $id;
        $stmt = $db->prepare("UPDATE skills SET " . implode(', ', $sets) . " WHERE id = ?");
        $stmt->execute($values);
        json_success(null, 'Skill updated');
        break;

    case 'delete_skill':
        require_auth();
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_error('Method not allowed', 405);
        $input = json_decode(file_get_contents('php://input'), true);
        $id = (int)($input['id'] ?? 0);
        if ($id <= 0) json_error('Invalid skill ID');
        $stmt = $db->prepare("DELETE FROM skills WHERE id = ?");
        $stmt->execute([$id]);
        json_success(null, 'Skill deleted');
        break;
}
