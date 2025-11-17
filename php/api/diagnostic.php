<?php
/**
 * Script de diagnostic pour identifier les problèmes
 */

header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/../config.php';

$diagnostic = [
    'php_file_location' => __FILE__,
    'BASE_PATH' => BASE_PATH,
    'SAVES_PATH' => SAVES_PATH,
    'UPLOADS_PATH' => UPLOADS_PATH,
    'saves_exists' => file_exists(SAVES_PATH),
    'saves_writable' => is_writable(SAVES_PATH),
    'saves_content' => [],
    'projects_found' => 0
];

if (is_dir(SAVES_PATH)) {
    $items = array_diff(scandir(SAVES_PATH), ['.', '..']);
    $diagnostic['saves_content'] = array_values($items);
    
    foreach ($items as $item) {
        $path = SAVES_PATH . '/' . $item;
        if (is_dir($path) && file_exists($path . '/project.json')) {
            $diagnostic['projects_found']++;
        }
    }
}

echo json_encode($diagnostic, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
