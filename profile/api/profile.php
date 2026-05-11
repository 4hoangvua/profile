<?php
/**
 * profile.php — CRUD thông tin cá nhân
 */
switch ($action) {
    case 'get_profile':
        $stmt = $db->query("SELECT * FROM profile WHERE id = 1");
        $profile = $stmt->fetch();
        json_success($profile ?: []);
        break;

    case 'save_profile':
        require_auth();
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_error('Method not allowed', 405);
        
        $input = json_decode(file_get_contents('php://input'), true);
        $fields = ['full_name','title','bio','avatar','email','phone','address','github','linkedin','facebook','website','cv_url'];
        $sets = [];
        $values = [];
        foreach ($fields as $f) {
            if (isset($input[$f])) {
                $sets[] = "$f = ?";
                $values[] = sanitize_input($input[$f]);
            }
        }
        if (empty($sets)) json_error('No fields to update');
        
        $sql = "UPDATE profile SET " . implode(', ', $sets) . " WHERE id = 1";
        $stmt = $db->prepare($sql);
        $stmt->execute($values);
        
        $stmt = $db->query("SELECT * FROM profile WHERE id = 1");
        json_success($stmt->fetch(), 'Profile updated');
        break;
}
