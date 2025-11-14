<?php
/**
 * API Plans
 * Gestion des plans multiples par version
 */

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../classes/PlanManager.php';

// CORS headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$manager = new PlanManager();

try {
    switch ($_SERVER['REQUEST_METHOD']) {
        case 'GET':
            handleGet($manager);
            break;

        case 'POST':
            handlePost($manager);
            break;

        case 'PUT':
            handlePut($manager);
            break;

        case 'DELETE':
            handleDelete($manager);
            break;

        default:
            jsonError('Méthode non supportée', 405);
    }
} catch (Exception $e) {
    jsonError($e->getMessage(), 500);
}

/**
 * GET - Récupérer les plans d'une version
 */
function handleGet($manager) {
    $projectId = $_GET['project_id'] ?? null;
    $versionId = $_GET['version_id'] ?? null;

    if (!$projectId || !$versionId) {
        jsonError('project_id et version_id requis', 400);
    }

    try {
        $plans = $manager->getAllByVersion($projectId, $versionId);
        jsonSuccess(['plans' => $plans]);
    } catch (Exception $e) {
        jsonError($e->getMessage(), 500);
    }
}

/**
 * POST - Créer un nouveau plan
 */
function handlePost($manager) {
    $data = json_decode(file_get_contents('php://input'), true);

    if (!$data) {
        jsonError('Données JSON invalides', 400);
    }

    if (!isset($data['project_id'], $data['version_id'], $data['floor_level'])) {
        jsonError('project_id, version_id et floor_level requis', 400);
    }

    try {
        $plan = $manager->create($data);
        jsonSuccess(['plan' => $plan], 'Plan ajouté avec succès', 201);
    } catch (Exception $e) {
        jsonError($e->getMessage(), 500);
    }
}

/**
 * PUT - Remplacer un plan existant
 */
function handlePut($manager) {
    $data = json_decode(file_get_contents('php://input'), true);

    if (!$data) {
        jsonError('Données JSON invalides', 400);
    }

    if (!isset($data['project_id'], $data['version_id'], $data['plan_id'])) {
        jsonError('project_id, version_id et plan_id requis', 400);
    }

    try {
        $result = $manager->replace($data);
        jsonSuccess($result, 'Plan remplacé avec succès');
    } catch (Exception $e) {
        jsonError($e->getMessage(), 500);
    }
}

/**
 * DELETE - Supprimer un plan
 */
function handleDelete($manager) {
    $projectId = $_GET['project_id'] ?? null;
    $versionId = $_GET['version_id'] ?? null;
    $planId = $_GET['plan_id'] ?? null;

    if (!$projectId || !$versionId || !$planId) {
        jsonError('project_id, version_id et plan_id requis', 400);
    }

    try {
        $manager->delete($projectId, $versionId, $planId);
        jsonSuccess([], 'Plan supprimé');
    } catch (Exception $e) {
        jsonError($e->getMessage(), 500);
    }
}
