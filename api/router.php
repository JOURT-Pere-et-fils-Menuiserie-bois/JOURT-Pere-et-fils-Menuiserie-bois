<?php
/**
 * Router - Gestion des routes API
 */

require_once __DIR__ . '/bootstrap.php';

// Parse l'URI et la méthode
$requestUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$requestMethod = $_SERVER['REQUEST_METHOD'];

// Enlever le préfixe /api
$route = str_replace('/api', '', $requestUri);
$route = trim($route, '/');
$parts = explode('/', $route);

// Router
try {

    // Health check
    if ($route === 'health' || $route === '') {
        jsonResponse([
            'status' => 'online',
            'version' => '3.0.0',
            'database' => file_exists(DB_PATH) ? 'connected' : 'not found',
            'timestamp' => date('Y-m-d H:i:s')
        ]);
    }

    // Routes par ressource
    $resource = $parts[0] ?? null;
    $id = $parts[1] ?? null;

    switch ($resource) {

        // Documents
        case 'documents':
            $controller = new DocumentController();
            switch ($requestMethod) {
                case 'GET':
                    if ($id) {
                        $controller->get($id);
                    } else {
                        $controller->getAll();
                    }
                    break;
                case 'POST':
                    $controller->create();
                    break;
                case 'PUT':
                    if (!$id) jsonError('Document ID required', 400);
                    $controller->update($id);
                    break;
                case 'DELETE':
                    if (!$id) jsonError('Document ID required', 400);
                    $controller->delete($id);
                    break;
                default:
                    jsonError('Method not allowed', 405);
            }
            break;

        // Search (recherche vectorielle)
        case 'search':
            $controller = new SearchController();
            if ($requestMethod === 'POST') {
                $controller->search();
            } else {
                jsonError('Method not allowed', 405);
            }
            break;

        // AI (génération IA)
        case 'ai':
            $controller = new AIController();
            $action = $id ?? 'generate';

            switch ($action) {
                case 'generate':
                    if ($requestMethod === 'POST') {
                        $controller->generate();
                    } else {
                        jsonError('Method not allowed', 405);
                    }
                    break;
                case 'embed':
                    if ($requestMethod === 'POST') {
                        $controller->embed();
                    } else {
                        jsonError('Method not allowed', 405);
                    }
                    break;
                case 'status':
                    if ($requestMethod === 'GET') {
                        $controller->status();
                    } else {
                        jsonError('Method not allowed', 405);
                    }
                    break;
                default:
                    jsonError('Unknown AI action', 404);
            }
            break;

        // Modules
        case 'modules':
            $controller = new ModuleController();
            switch ($requestMethod) {
                case 'GET':
                    if ($id) {
                        $controller->get($id);
                    } else {
                        $controller->getAll();
                    }
                    break;
                case 'POST':
                    $controller->toggle();
                    break;
                default:
                    jsonError('Method not allowed', 405);
            }
            break;

        // Upload PDF
        case 'upload':
            if ($requestMethod === 'POST') {
                $controller = new DocumentController();
                $controller->upload();
            } else {
                jsonError('Method not allowed', 405);
            }
            break;

        // Stats
        case 'stats':
            if ($requestMethod === 'GET') {
                $db = Database::getInstance();
                $stats = [
                    'documents' => $db->count('documents'),
                    'chunks' => $db->count('chunks'),
                    'vectors' => $db->count('vectors'),
                    'storage' => [
                        'database' => file_exists(DB_PATH) ? filesize(DB_PATH) : 0,
                        'pdfs' => 0 // TODO: calculer
                    ]
                ];
                jsonResponse($stats);
            } else {
                jsonError('Method not allowed', 405);
            }
            break;

        // 404
        default:
            jsonError('Endpoint not found', 404);
    }

} catch (Exception $e) {
    error_log('API Error: ' . $e->getMessage());
    jsonError('Internal server error', 500, $e->getMessage());
}
