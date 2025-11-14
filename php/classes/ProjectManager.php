<?php
/**
 * ProjectManager - Gestion des projets (version FlatFile)
 */

class ProjectManager {

    /**
     * Créer un projet
     */
    public function create($data, $userId = 1) {
        $projectId = 'projet_' . date('Ymd_His') . '_' . bin2hex(random_bytes(4));

        // Créer structure dossiers
        $projectPath = FlatFileDB::createProjectStructure($projectId);

        // Créer données projet
        $project = [
            'project_id' => $projectId,
            'project_name' => $data['project_name'],
            'client_name' => $data['client_name'] ?? '',
            'contract_reference' => $data['contract_reference'] ?? '',
            'address' => $data['address'] ?? '',
            'created_at' => FlatFileDB::now(),
            'created_by' => $userId,
            'updated_at' => FlatFileDB::now(),
            'status' => 'active'
        ];

        // Sauvegarder
        FlatFileDB::write($projectPath . '/project.json', $project);

        // Créer fichiers vides pour versions et mesures
        FlatFileDB::write($projectPath . '/versions/versions.json', []);
        FlatFileDB::write($projectPath . '/avenants/avenants.json', []);

        return $project;
    }

    /**
     * Obtenir un projet par ID
     */
    public function getById($projectId) {
        $projectFile = SAVES_PATH . '/' . $projectId . '/project.json';
        return FlatFileDB::read($projectFile);
    }

    /**
     * Obtenir tous les projets
     */
    public function getAll($status = 'active') {
        $allProjects = FlatFileDB::getAllProjects();

        if ($status === 'all') {
            return $allProjects;
        }

        return array_filter($allProjects, function($p) use ($status) {
            return ($p['status'] ?? 'active') === $status;
        });
    }

    /**
     * Mettre à jour un projet
     */
    public function update($projectId, $data) {
        $projectFile = SAVES_PATH . '/' . $projectId . '/project.json';
        $project = FlatFileDB::read($projectFile);

        if (!$project) {
            throw new Exception('Projet non trouvé');
        }

        // Mettre à jour les champs
        foreach (['project_name', 'client_name', 'contract_reference', 'address'] as $field) {
            if (isset($data[$field])) {
                $project[$field] = $data[$field];
            }
        }

        $project['updated_at'] = FlatFileDB::now();

        FlatFileDB::write($projectFile, $project);

        return $project;
    }

    /**
     * Supprimer un projet
     */
    public function delete($projectId) {
        $projectPath = SAVES_PATH . '/' . $projectId;

        if (!is_dir($projectPath)) {
            throw new Exception('Projet non trouvé');
        }

        FlatFileDB::deleteDirectory($projectPath);

        return true;
    }

    /**
     * Archiver un projet
     */
    public function archive($projectId) {
        $projectFile = SAVES_PATH . '/' . $projectId . '/project.json';
        $project = FlatFileDB::read($projectFile);

        if (!$project) {
            throw new Exception('Projet non trouvé');
        }

        $project['status'] = 'archived';
        $project['updated_at'] = FlatFileDB::now();

        FlatFileDB::write($projectFile, $project);

        return $project;
    }
}
