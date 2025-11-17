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
ini_set('display_errors', 0); // DÉSACTIVÉ pour éviter HTML dans les réponses JSON
ini_set('log_errors', 1);

$logsDir = BASE_PATH . '/logs';
if (!file_exists($logsDir)) {
    mkdir($logsDir, 0755, true);
}
ini_set('error_log', $logsDir . '/php_errors.log');

// Gestionnaire d'erreurs global pour retourner du JSON au lieu de HTML
set_error_handler(function($errno, $errstr, $errfile, $errline) {
    error_log("PHP Error [$errno]: $errstr in $errfile on line $errline");
    // Ne pas interrompre l'exécution pour les warnings, seulement logger
    return false; // Laisser le gestionnaire d'erreurs par défaut continuer
});

// Gestionnaire d'exceptions global pour retourner du JSON
set_exception_handler(function($exception) {
    error_log("Uncaught Exception: " . $exception->getMessage());
    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'success' => false,
        'error' => 'Erreur serveur interne'
    ], JSON_UNESCAPED_UNICODE);
    exit;
});

// Gestionnaire de shutdown pour capturer les erreurs fatales
register_shutdown_function(function() {
    $error = error_get_last();
    if ($error !== null && in_array($error['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR])) {
        error_log("Fatal Error: " . $error['message'] . " in " . $error['file'] . " on line " . $error['line']);

        // Si les headers n'ont pas encore été envoyés
        if (!headers_sent()) {
            http_response_code(500);
            header('Content-Type: application/json; charset=utf-8');
            echo json_encode([
                'success' => false,
                'error' => 'Erreur serveur critique'
            ], JSON_UNESCAPED_UNICODE);
        }
    }
});

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
