<?php
/**
 * Bootstrap - Initialisation de l'application
 */

// Configuration PHP
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/../data/error.log');

// Timezone
date_default_timezone_set('Europe/Paris');

// Headers CORS et sécurité
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('X-XSS-Protection: 1; mode=block');

// Gestion OPTIONS pour CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Chemins
define('BASE_PATH', dirname(__DIR__));
define('DATA_PATH', BASE_PATH . '/data');
define('PDF_PATH', DATA_PATH . '/pdfs');
define('MODEL_PATH', DATA_PATH . '/models');
define('DB_PATH', DATA_PATH . '/database.sqlite');

// Autoloader simple
spl_autoload_register(function ($class) {
    $prefixes = [
        'Controller' => __DIR__ . '/controllers/',
        'Model' => __DIR__ . '/models/',
        'Service' => __DIR__ . '/services/',
    ];

    foreach ($prefixes as $prefix => $dir) {
        if (strpos($class, $prefix) !== false) {
            $file = $dir . $class . '.php';
            if (file_exists($file)) {
                require_once $file;
                return;
            }
        }
    }
});

// Fonction utilitaire : réponse JSON
function jsonResponse($data, $statusCode = 200, $success = true) {
    http_response_code($statusCode);
    echo json_encode([
        'success' => $success,
        'data' => $data,
        'timestamp' => time()
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

// Fonction utilitaire : erreur JSON
function jsonError($message, $statusCode = 400, $details = null) {
    http_response_code($statusCode);
    echo json_encode([
        'success' => false,
        'error' => $message,
        'details' => $details,
        'timestamp' => time()
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

// Fonction utilitaire : sanitize input
function sanitize($data) {
    if (is_array($data)) {
        return array_map('sanitize', $data);
    }
    return htmlspecialchars(strip_tags(trim($data)), ENT_QUOTES, 'UTF-8');
}

// Fonction utilitaire : get JSON input
function getJsonInput() {
    $input = file_get_contents('php://input');
    if (empty($input)) {
        return [];
    }
    $data = json_decode($input, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        jsonError('Invalid JSON input', 400);
    }
    return $data ?? [];
}

// Vérifier que les dossiers existent
$requiredDirs = [DATA_PATH, PDF_PATH, MODEL_PATH];
foreach ($requiredDirs as $dir) {
    if (!is_dir($dir)) {
        mkdir($dir, 0755, true);
    }
}

// Initialiser la base de données si nécessaire
if (!file_exists(DB_PATH)) {
    require_once __DIR__ . '/models/Database.php';
    Database::getInstance()->init();
}
