<?php
/**
 * ProjectManager - Gestion des projets
 */

class ProjectManager {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    /**
     * Créer un projet
     */
    public function create($data, $userId) {
        $sql = "INSERT INTO projects (project_name, client_name, contract_reference, address, created_by)
                VALUES (:name, :client, :contract, :address, :user_id)";

        $projectId = $this->db->insert($sql, [
            ':name' => $data['project_name'],
            ':client' => $data['client_name'] ?? null,
            ':contract' => $data['contract_reference'] ?? null,
            ':address' => $data['address'] ?? null,
            ':user_id' => $userId
        ]);

        return $this->getById($projectId);
    }

    /**
     * Obtenir un projet par ID
     */
    public function getById($projectId) {
        $sql = "SELECT * FROM projects WHERE project_id = :id";
        return $this->db->fetchOne($sql, [':id' => $projectId]);
    }

    /**
     * Obtenir tous les projets
     */
    public function getAll($status = 'active') {
        $sql = "SELECT p.*, u.name as created_by_name
                FROM projects p
                LEFT JOIN users u ON p.created_by = u.user_id
                WHERE p.status = :status
                ORDER BY p.updated_at DESC";

        return $this->db->fetchAll($sql, [':status' => $status]);
    }

    /**
     * Mettre à jour un projet
     */
    public function update($projectId, $data) {
        $fields = [];
        $params = [':id' => $projectId];

        foreach (['project_name', 'client_name', 'contract_reference', 'address'] as $field) {
            if (isset($data[$field])) {
                $fields[] = "$field = :$field";
                $params[":$field"] = $data[$field];
            }
        }

        if (empty($fields)) {
            return $this->getById($projectId);
        }

        $sql = "UPDATE projects SET " . implode(', ', $fields) . " WHERE project_id = :id";
        $this->db->query($sql, $params);

        return $this->getById($projectId);
    }

    /**
     * Supprimer un projet
     */
    public function delete($projectId) {
        $sql = "DELETE FROM projects WHERE project_id = :id";
        $this->db->query($sql, [':id' => $projectId]);

        // Supprimer dossier saves
        $projectPath = SAVES_PATH . "/projet_$projectId";
        if (is_dir($projectPath)) {
            $this->deleteDirectory($projectPath);
        }

        return true;
    }

    /**
     * Archiver un projet
     */
    public function archive($projectId) {
        $sql = "UPDATE projects SET status = 'archived' WHERE project_id = :id";
        $this->db->query($sql, [':id' => $projectId]);
        return $this->getById($projectId);
    }

    /**
     * Supprimer récursivement un dossier
     */
    private function deleteDirectory($dir) {
        if (!is_dir($dir)) {
            return false;
        }

        $files = array_diff(scandir($dir), ['.', '..']);

        foreach ($files as $file) {
            $path = $dir . '/' . $file;
            is_dir($path) ? $this->deleteDirectory($path) : unlink($path);
        }

        return rmdir($dir);
    }
}
