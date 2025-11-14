<?php
/**
 * API Versions - Gestion versions de plans (FlatFile)
 */

require_once '../config.php';
require_once '../classes/FlatFileDB.php';
require_once '../classes/VersionManager.php';

$manager = new VersionManager();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

try {
    // GET - Obtenir versions
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $projectId = $_GET['project_id'] ?? null;

        if (!$projectId) {
            jsonError('project_id requis');
        }

        $versions = $manager->getAll($projectId);
        jsonSuccess(['versions' => $versions]);
    }

    // POST - Créer nouvelle version
    elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);

        if (empty($data['project_id'])) {
            jsonError('project_id requis');
        }

        $version = $manager->create($data['project_id'], $data);
        jsonSuccess(['version' => $version], 'Version créée');
    }

    // PUT - Mettre à jour version (ex: échelle)
    elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
        $data = json_decode(file_get_contents('php://input'), true);

        if (empty($data['project_id']) || empty($data['version_id'])) {
            jsonError('project_id et version_id requis');
        }

        $version = $manager->update($data['project_id'], $data['version_id'], $data);
        jsonSuccess(['version' => $version], 'Version mise à jour');
    }

    else {
        jsonError('Méthode non autorisée', 405);
    }

} catch (Exception $e) {
    error_log('Versions API error: ' . $e->getMessage());
    jsonError('Erreur serveur: ' . $e->getMessage(), 500);
}
