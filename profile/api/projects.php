<?php
/**
 * projects.php — CRUD dự án
 */
switch ($action) {
    case 'get_projects':
        $stmt = $db->query("SELECT * FROM projects ORDER BY sort_order ASC, id DESC");
        json_success($stmt->fetchAll());
        break;

    case 'add_project':
        require_auth();
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_error('Method not allowed', 405);
        $input = json_decode(file_get_contents('php://input'), true);
        $title = sanitize_input($input['title'] ?? '');
        if (empty($title)) json_error('Project title is required');
        
        $stmt = $db->prepare("INSERT INTO projects (title, description, image, tech_stack, demo_url, source_url, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $title,
            sanitize_input($input['description'] ?? ''),
            sanitize_input($input['image'] ?? ''),
            sanitize_input($input['tech_stack'] ?? ''),
            sanitize_input($input['demo_url'] ?? ''),
            sanitize_input($input['source_url'] ?? ''),
            (int)($input['sort_order'] ?? 0)
        ]);
        json_success(['id' => $db->lastInsertId()], 'Project added');
        break;

    case 'update_project':
        require_auth();
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_error('Method not allowed', 405);
        $input = json_decode(file_get_contents('php://input'), true);
        $id = (int)($input['id'] ?? 0);
        if ($id <= 0) json_error('Invalid project ID');
        
        $fields = ['title','description','image','tech_stack','demo_url','source_url','sort_order'];
        $sets = []; $values = [];
        foreach ($fields as $f) {
            if (isset($input[$f])) {
                $sets[] = "$f = ?";
                $values[] = $f === 'sort_order' ? (int)$input[$f] : sanitize_input($input[$f]);
            }
        }
        if (empty($sets)) json_error('No fields to update');
        $values[] = $id;
        $stmt = $db->prepare("UPDATE projects SET " . implode(', ', $sets) . " WHERE id = ?");
        $stmt->execute($values);
        json_success(null, 'Project updated');
        break;

    case 'delete_project':
        require_auth();
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_error('Method not allowed', 405);
        $input = json_decode(file_get_contents('php://input'), true);
        $id = (int)($input['id'] ?? 0);
        if ($id <= 0) json_error('Invalid project ID');
        $stmt = $db->prepare("DELETE FROM projects WHERE id = ?");
        $stmt->execute([$id]);
        json_success(null, 'Project deleted');
        break;
}
