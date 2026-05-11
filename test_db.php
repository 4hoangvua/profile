<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

$db_path = __DIR__ . '/profile/data/profile.db';
$data_dir = dirname($db_path);

echo "Attempting to create directory: $data_dir\n";
if (!is_dir($data_dir)) {
    if (mkdir($data_dir, 0755, true)) {
        echo "Directory created successfully.\n";
    } else {
        echo "Failed to create directory.\n";
        print_r(error_get_last());
    }
} else {
    echo "Directory already exists.\n";
}

try {
    $db = new PDO('sqlite:' . $db_path);
    echo "Connected to SQLite successfully.\n";
    $db->exec("CREATE TABLE IF NOT EXISTS test (id INTEGER PRIMARY KEY, val TEXT)");
    $db->exec("INSERT INTO test (val) VALUES ('test')");
    echo "Write successful.\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
