<?php
/**
 * API Projects - CRUD projets
 */

require_once '../config.php';
require_once '../classes/Database.php';
require_once '../classes/ProjectManager.php';

$manager = new ProjectManager();

// Gérer OPTIONS pour CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

try {
    // GET - Obtenir projet(s)
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        if (isset($_GET['id'])) {
            $project = $manager->getById($_GET['id']);
            if ($project) {
                jsonSuccess(['project' => $project]);
            } else {
                jsonError('Projet non trouvé', 404);
            }
        } else {
            $status = $_GET['status'] ?? 'active';
            $projects = $manager->getAll($status);
            jsonSuccess(['projects' => $projects]);
        }
    }

    // POST - Créer projet
    elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);

        if (empty($data['project_name'])) {
            jsonError('Le nom du projet est requis');
        }

        // TODO: Récupérer user_id depuis session
        $userId = 1;

        $project = $manager->create($data, $userId);
        jsonSuccess(['project' => $project], 'Projet créé avec succès');
    }

    // PUT - Mettre à jour projet
    elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
        $data = json_decode(file_get_contents('php://input'), true);

        if (empty($data['project_id'])) {
            jsonError('ID du projet requis');
        }

        $project = $manager->update($data['project_id'], $data);
        jsonSuccess(['project' => $project], 'Projet mis à jour');
    }

    // DELETE - Supprimer projet
    elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
        $data = json_decode(file_get_contents('php://input'), true);

        if (empty($data['project_id'])) {
            jsonError('ID du projet requis');
        }

        $manager->delete($data['project_id']);
        jsonSuccess([], 'Projet supprimé');
    }

    else {
        jsonError('Méthode non autorisée', 405);
    }

} catch (Exception $e) {
    error_log('Projects API error: ' . $e->getMessage());
    jsonError('Erreur serveur: ' . $e->getMessage(), 500);
}
