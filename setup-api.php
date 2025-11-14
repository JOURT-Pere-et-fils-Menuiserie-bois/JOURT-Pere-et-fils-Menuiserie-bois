<?php
/**
 * Setup API - Backend pour le wizard d'installation
 */

header('Content-Type: application/json');

$input = json_decode(file_get_contents('php://input'), true);
$action = $input['action'] ?? '';

// Fonction helper pour réponse JSON
function respond($success, $data = [], $error = null) {
    echo json_encode([
        'success' => $success,
        'data' => $data,
        'error' => $error
    ]);
    exit;
}

try {
    switch ($action) {

        // Vérifier version PHP
        case 'check_php':
            $version = phpversion();
            $isOk = version_compare($version, '8.1.0', '>=');
            respond($isOk, ['version' => $version]);
            break;

        // Vérifier SQLite
        case 'check_sqlite':
            $hasSQLite = extension_loaded('sqlite3');
            respond($hasSQLite);
            break;

        // Vérifier permissions
        case 'check_permissions':
            $testFile = __DIR__ . '/data/.permtest';
            @mkdir(__DIR__ . '/data', 0755, true);

            $canWrite = @file_put_contents($testFile, 'test') !== false;
            if ($canWrite) {
                @unlink($testFile);
            }

            respond($canWrite);
            break;

        // Vérifier espace disque
        case 'check_disk_space':
            $freeSpace = disk_free_space(__DIR__);
            $freeGB = round($freeSpace / 1024 / 1024 / 1024, 2);
            respond(true, ['space' => $freeGB]);
            break;

        // Initialiser base de données
        case 'init_database':
            require_once __DIR__ . '/api/models/Database.php';
            define('DB_PATH', __DIR__ . '/data/database.sqlite');

            $db = Database::getInstance();
            $db->init();

            respond(true, ['message' => 'Database initialized']);
            break;

        // Lancer téléchargement du pack
        case 'download_pack':
            $pack = $input['pack'] ?? 'essential';
            $taskId = uniqid('download_', true);

            // Créer fichier de tâche
            $taskFile = __DIR__ . '/data/downloads/' . $taskId . '.json';
            @mkdir(__DIR__ . '/data/downloads', 0755, true);

            $task = [
                'id' => $taskId,
                'pack' => $pack,
                'status' => 'starting',
                'progress' => 0,
                'downloaded' => 0,
                'total' => 0,
                'currentFile' => null,
                'complete' => false,
                'error' => null,
                'log' => [],
                'started' => time()
            ];

            file_put_contents($taskFile, json_encode($task));

            // Lancer téléchargement en arrière-plan
            $cmd = sprintf(
                'php %s %s %s > /dev/null 2>&1 &',
                escapeshellarg(__DIR__ . '/setup-downloader.php'),
                escapeshellarg($pack),
                escapeshellarg($taskId)
            );

            exec($cmd);

            respond(true, ['taskId' => $taskId]);
            break;

        // Obtenir statut téléchargement
        case 'download_status':
            $taskId = $input['taskId'] ?? '';
            $taskFile = __DIR__ . '/data/downloads/' . $taskId . '.json';

            if (!file_exists($taskFile)) {
                respond(false, [], 'Task not found');
            }

            $task = json_decode(file_get_contents($taskFile), true);

            // Retourner seulement les nouveaux logs
            $lastLogIndex = $input['lastLogIndex'] ?? 0;
            $newLogs = array_slice($task['log'], $lastLogIndex);

            respond(true, [
                'status' => [
                    'progress' => $task['progress'],
                    'downloaded' => $task['downloaded'],
                    'total' => $task['total'],
                    'currentFile' => $task['currentFile'],
                    'complete' => $task['complete'],
                    'error' => $task['error'],
                    'log' => $newLogs
                ]
            ]);
            break;

        // Terminer setup
        case 'complete_setup':
            // Créer marqueur d'installation
            file_put_contents(__DIR__ . '/data/.installed', date('Y-m-d H:i:s'));

            respond(true, ['message' => 'Setup complete']);
            break;

        default:
            respond(false, [], 'Unknown action');
    }

} catch (Exception $e) {
    respond(false, [], $e->getMessage());
}
