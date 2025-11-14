<?php
/**
 * API Measurements - Gestion mesures (FlatFile)
 */

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../classes/FlatFileDB.php';
require_once __DIR__ . '/../classes/MeasurementManager.php';

$manager = new MeasurementManager();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

try {
    // GET - Obtenir mesures (nouvelle structure multi-plans)
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $projectId = $_GET['project_id'] ?? null;
        $versionId = $_GET['version_id'] ?? null;

        if (!$projectId || !$versionId) {
            jsonError('project_id et version_id requis');
        }

        // Utiliser nouvelle méthode getAllByPlan()
        $measurements = $manager->getAllByPlan($projectId, $versionId);

        // Retourne directement { measurements_by_plan: {...} }
        jsonSuccess($measurements);
    }

    // POST - Créer/Sauvegarder mesures (supporte ancienne et nouvelle structure)
    elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);

        if (empty($data['project_id']) || empty($data['version_id'])) {
            jsonError('project_id et version_id requis');
        }

        // NOUVELLE structure: measurements_by_plan
        if (!empty($data['measurements_by_plan'])) {
            $measurements = $manager->saveByPlan(
                $data['project_id'],
                $data['version_id'],
                $data['measurements_by_plan'],
                $data['user_id'] ?? 1
            );

            jsonSuccess(['measurements_by_plan' => $measurements], 'Mesures sauvegardées');
        }
        // ANCIENNE structure: measurements (rétrocompatibilité)
        elseif (!empty($data['measurements'])) {
            $measurements = $manager->save(
                $data['project_id'],
                $data['version_id'],
                $data['measurements'],
                $data['user_id'] ?? 1
            );

            jsonSuccess(['measurements' => $measurements], 'Mesures sauvegardées');
        }
        else {
            jsonError('measurements ou measurements_by_plan requis');
        }
    }

    // PUT - Mettre à jour mesure
    elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
        $data = json_decode(file_get_contents('php://input'), true);

        if (empty($data['project_id']) || empty($data['version_id']) || empty($data['measurement_id'])) {
            jsonError('project_id, version_id et measurement_id requis');
        }

        $measurements = $manager->update(
            $data['project_id'],
            $data['version_id'],
            $data['measurement_id'],
            $data
        );

        jsonSuccess(['measurements' => $measurements], 'Mesure mise à jour');
    }

    // DELETE - Supprimer mesure
    elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
        $data = json_decode(file_get_contents('php://input'), true);

        if (empty($data['project_id']) || empty($data['version_id']) || empty($data['measurement_id'])) {
            jsonError('project_id, version_id et measurement_id requis');
        }

        $manager->delete($data['project_id'], $data['version_id'], $data['measurement_id']);
        jsonSuccess([], 'Mesure supprimée');
    }

    else {
        jsonError('Méthode non autorisée', 405);
    }

} catch (Exception $e) {
    error_log('Measurements API error: ' . $e->getMessage());
    jsonError('Erreur serveur: ' . $e->getMessage(), 500);
}
