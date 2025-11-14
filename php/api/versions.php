<?php
/**
 * API Versions - Gestion versions de plans
 */

require_once '../config.php';
require_once '../classes/Database.php';

$db = Database::getInstance();

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

        $sql = "SELECT v.*, u.name as uploaded_by_name
                FROM plan_versions v
                LEFT JOIN users u ON v.uploaded_by = u.user_id
                WHERE v.project_id = :project_id
                ORDER BY v.version_number DESC";

        $versions = $db->fetchAll($sql, [':project_id' => $projectId]);
        jsonSuccess(['versions' => $versions]);
    }

    // POST - Créer nouvelle version
    elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);

        $sql = "INSERT INTO plan_versions
                (project_id, version_number, version_label, file_path, file_name,
                 file_hash, file_size_bytes, mime_type, uploaded_by)
                VALUES
                (:project_id, :version_number, :version_label, :file_path, :file_name,
                 :file_hash, :file_size, :mime_type, :user_id)";

        $versionId = $db->insert($sql, [
            ':project_id' => $data['project_id'],
            ':version_number' => $data['version_number'],
            ':version_label' => $data['version_label'],
            ':file_path' => $data['file_path'],
            ':file_name' => $data['file_name'],
            ':file_hash' => $data['file_hash'],
            ':file_size' => $data['file_size'],
            ':mime_type' => $data['mime_type'],
            ':user_id' => 1 // TODO: Session
        ]);

        jsonSuccess(['version_id' => $versionId], 'Version créée');
    }

    // PUT - Mettre à jour version (ex: échelle)
    elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
        $data = json_decode(file_get_contents('php://input'), true);

        if (empty($data['version_id'])) {
            jsonError('version_id requis');
        }

        $fields = [];
        $params = [':version_id' => $data['version_id']];

        foreach (['scale_factor', 'origin_x', 'origin_y', 'rotation_degrees'] as $field) {
            if (isset($data[$field])) {
                $fields[] = "$field = :$field";
                $params[":$field"] = $data[$field];
            }
        }

        if (!empty($fields)) {
            $sql = "UPDATE plan_versions SET " . implode(', ', $fields) . " WHERE version_id = :version_id";
            $db->query($sql, $params);
        }

        jsonSuccess([], 'Version mise à jour');
    }

    else {
        jsonError('Méthode non autorisée', 405);
    }

} catch (Exception $e) {
    error_log('Versions API error: ' . $e->getMessage());
    jsonError('Erreur serveur: ' . $e->getMessage(), 500);
}
