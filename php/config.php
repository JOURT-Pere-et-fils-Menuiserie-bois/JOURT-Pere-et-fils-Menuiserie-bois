<?php
/**
 * Configuration globale - Version Flatfile
 */

// Configuration chemins
define('BASE_PATH', dirname(__DIR__));
define('SAVES_PATH', BASE_PATH . '/saves');
define('UPLOADS_PATH', BASE_PATH . '/uploads');

// Configuration uploads
define('MAX_UPLOAD_SIZE', 200 * 1024 * 1024); // 200 MB
define('ALLOWED_EXTENSIONS', ['pdf', 'dxf']);

// Créer dossiers si nécessaire
if (!file_exists(SAVES_PATH)) {
    mkdir(SAVES_PATH, 0755, true);
}
if (!file_exists(UPLOADS_PATH)) {
    mkdir(UPLOADS_PATH, 0755, true);
}

// Configuration erreurs
error_reporting(E_ALL);
ini_set('display_errors', 1); // Mettre à 0 en production
ini_set('log_errors', 1);

$logsDir = BASE_PATH . '/logs';
if (!file_exists($logsDir)) {
    mkdir($logsDir, 0755, true);
}
ini_set('error_log', $logsDir . '/php_errors.log');

// Timezone
date_default_timezone_set('Europe/Paris');

// Headers CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Session
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

/**
 * Fonction utilitaire pour réponse JSON
 */
function jsonResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}

/**
 * Fonction utilitaire pour erreur JSON
 */
function jsonError($message, $statusCode = 400) {
    jsonResponse([
        'success' => false,
        'error' => $message
    ], $statusCode);
}

/**
 * Fonction utilitaire pour succès JSON
 */
function jsonSuccess($data = [], $message = '') {
    $response = ['success' => true];

    if (!empty($message)) {
        $response['message'] = $message;
    }

    if (!empty($data)) {
        $response = array_merge($response, $data);
    }

    jsonResponse($response);
}
