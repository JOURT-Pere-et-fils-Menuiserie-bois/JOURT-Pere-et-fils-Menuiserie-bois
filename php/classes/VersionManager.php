<?php
/**
 * VersionManager - Gestion des versions de plans (FlatFile)
 */

class VersionManager {

    /**
     * Créer une nouvelle version
     */
    public function create($projectId, $data) {
        $projectPath = SAVES_PATH . '/' . $projectId;
        $versionsFile = $projectPath . '/versions/versions.json';

        // Charger versions existantes
        $versions = FlatFileDB::read($versionsFile, []);

        // Calculer numéro version
        $versionNumber = count($versions) + 1;
        $versionId = 'v' . str_pad($versionNumber, 3, '0', STR_PAD_LEFT);

        // Créer dossier version
        $versionPath = $projectPath . '/versions/' . $versionId;
        if (!file_exists($versionPath)) {
            mkdir($versionPath, 0755, true);
        }

        // Créer version
        $version = [
            'version_id' => $versionId,
            'version_number' => $versionNumber,
            'version_label' => $data['version_label'] ?? $versionId,
            'file_path' => $data['file_path'],
            'file_name' => $data['file_name'],
            'file_hash' => $data['file_hash'],
            'file_size' => $data['file_size'],
            'mime_type' => $data['mime_type'],
            'scale_factor' => null,
            'origin_x' => 0,
            'origin_y' => 0,
            'rotation_degrees' => 0,
            'upload_date' => FlatFileDB::now(),
            'uploaded_by' => $data['user_id'] ?? 1,
            'is_current' => true,
            'status' => 'draft'
        ];

        // Marquer les autres versions comme non courantes
        foreach ($versions as &$v) {
            $v['is_current'] = false;
        }

        // Ajouter nouvelle version
        $versions[] = $version;

        // Sauvegarder
        FlatFileDB::write($versionsFile, $versions);

        // Créer fichier measurements vide
        FlatFileDB::write($versionPath . '/measurements.json', []);

        // Créer metadata
        FlatFileDB::write($versionPath . '/metadata.json', [
            'version_id' => $versionId,
            'created_at' => FlatFileDB::now()
        ]);

        return $version;
    }

    /**
     * Obtenir toutes les versions d'un projet
     */
    public function getAll($projectId) {
        $versionsFile = SAVES_PATH . '/' . $projectId . '/versions/versions.json';
        return FlatFileDB::read($versionsFile, []);
    }

    /**
     * Obtenir une version
     */
    public function getById($projectId, $versionId) {
        $versions = $this->getAll($projectId);

        foreach ($versions as $version) {
            if ($version['version_id'] === $versionId) {
                return $version;
            }
        }

        return null;
    }

    /**
     * Mettre à jour une version (ex: échelle)
     */
    public function update($projectId, $versionId, $data) {
        $versionsFile = SAVES_PATH . '/' . $projectId . '/versions/versions.json';
        $versions = FlatFileDB::read($versionsFile, []);

        foreach ($versions as &$version) {
            if ($version['version_id'] === $versionId) {
                // Mettre à jour les champs
                foreach (['scale_factor', 'origin_x', 'origin_y', 'rotation_degrees'] as $field) {
                    if (isset($data[$field])) {
                        $version[$field] = $data[$field];
                    }
                }
                break;
            }
        }

        FlatFileDB::write($versionsFile, $versions);

        return $this->getById($projectId, $versionId);
    }

    /**
     * Obtenir la version courante
     */
    public function getCurrent($projectId) {
        $versions = $this->getAll($projectId);

        foreach ($versions as $version) {
            if ($version['is_current'] ?? false) {
                return $version;
            }
        }

        return end($versions) ?: null;
    }
}
