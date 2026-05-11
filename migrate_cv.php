<?php
require_once __DIR__ . '/profile/api/config.php';
try {
    $db->exec("ALTER TABLE profile ADD COLUMN cv_url TEXT DEFAULT ''");
    echo "Database updated: Added cv_url to profile table.\n";
} catch (Exception $e) {
    echo "Note: " . $e->getMessage() . " (It might already exist)\n";
}
?>
