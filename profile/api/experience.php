<?php
/**
 * experience.php — CRUD kinh nghiệm làm việc
 */
switch ($action) {
    case 'get_experience':
        $stmt = $db->query("SELECT * FROM experience ORDER BY sort_order ASC, id DESC");
        json_success($stmt->fetchAll());
        break;

    case 'add_experience':
        require_auth();
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_error('Method not allowed', 405);
        $input = json_decode(file_get_contents('php://input'), true);
        $company = sanitize_input($input['company'] ?? '');
        if (empty($company)) json_error('Company name is required');
        
        $stmt = $db->prepare("INSERT INTO experience (company, position, start_date, end_date, description, sort_order) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $company,
            sanitize_input($input['position'] ?? ''),
            sanitize_input($input['start_date'] ?? ''),
            sanitize_input($input['end_date'] ?? ''),
            sanitize_input($input['description'] ?? ''),
            (int)($input['sort_order'] ?? 0)
        ]);
        json_success(['id' => $db->lastInsertId()], 'Experience added');
        break;

    case 'update_experience':
        require_auth();
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_error('Method not allowed', 405);
        $input = json_decode(file_get_contents('php://input'), true);
        $id = (int)($input['id'] ?? 0);
        if ($id <= 0) json_error('Invalid experience ID');
        
        $fields = ['company','position','start_date','end_date','description','sort_order'];
        $sets = []; $values = [];
        foreach ($fields as $f) {
            if (isset($input[$f])) {
                $sets[] = "$f = ?";
                $values[] = $f === 'sort_order' ? (int)$input[$f] : sanitize_input($input[$f]);
            }
        }
        if (empty($sets)) json_error('No fields to update');
        $values[] = $id;
        $stmt = $db->prepare("UPDATE experience SET " . implode(', ', $sets) . " WHERE id = ?");
        $stmt->execute($values);
        json_success(null, 'Experience updated');
        break;

    case 'delete_experience':
        require_auth();
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_error('Method not allowed', 405);
        $input = json_decode(file_get_contents('php://input'), true);
        $id = (int)($input['id'] ?? 0);
        if ($id <= 0) json_error('Invalid experience ID');
        $stmt = $db->prepare("DELETE FROM experience WHERE id = ?");
        $stmt->execute([$id]);
        json_success(null, 'Experience deleted');
        break;
}
