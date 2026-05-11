<?php
/**
 * education.php — CRUD học vấn
 */
switch ($action) {
    case 'get_education':
        $stmt = $db->query("SELECT * FROM education ORDER BY sort_order ASC, id DESC");
        json_success($stmt->fetchAll());
        break;

    case 'add_education':
        require_auth();
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_error('Method not allowed', 405);
        $input = json_decode(file_get_contents('php://input'), true);
        $school = sanitize_input($input['school'] ?? '');
        if (empty($school)) json_error('School name is required');
        
        $stmt = $db->prepare("INSERT INTO education (school, degree, start_year, end_year, description, sort_order) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $school,
            sanitize_input($input['degree'] ?? ''),
            sanitize_input($input['start_year'] ?? ''),
            sanitize_input($input['end_year'] ?? ''),
            sanitize_input($input['description'] ?? ''),
            (int)($input['sort_order'] ?? 0)
        ]);
        json_success(['id' => $db->lastInsertId()], 'Education added');
        break;

    case 'update_education':
        require_auth();
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_error('Method not allowed', 405);
        $input = json_decode(file_get_contents('php://input'), true);
        $id = (int)($input['id'] ?? 0);
        if ($id <= 0) json_error('Invalid education ID');
        
        $fields = ['school','degree','start_year','end_year','description','sort_order'];
        $sets = []; $values = [];
        foreach ($fields as $f) {
            if (isset($input[$f])) {
                $sets[] = "$f = ?";
                $values[] = $f === 'sort_order' ? (int)$input[$f] : sanitize_input($input[$f]);
            }
        }
        if (empty($sets)) json_error('No fields to update');
        $values[] = $id;
        $stmt = $db->prepare("UPDATE education SET " . implode(', ', $sets) . " WHERE id = ?");
        $stmt->execute($values);
        json_success(null, 'Education updated');
        break;

    case 'delete_education':
        require_auth();
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_error('Method not allowed', 405);
        $input = json_decode(file_get_contents('php://input'), true);
        $id = (int)($input['id'] ?? 0);
        if ($id <= 0) json_error('Invalid education ID');
        $stmt = $db->prepare("DELETE FROM education WHERE id = ?");
        $stmt->execute([$id]);
        json_success(null, 'Education deleted');
        break;
}
