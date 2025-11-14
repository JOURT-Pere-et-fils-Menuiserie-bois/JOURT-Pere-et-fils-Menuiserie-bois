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

        // Créer version - NOUVELLE STRUCTURE avec plans[]
        $version = [
            'version_id' => $versionId,
            'version_number' => $versionNumber,
            'version_label' => $data['version_label'] ?? $versionId,
            'description' => $data['description'] ?? '',
            'scale_factor' => null,
            'origin_x' => 0,
            'origin_y' => 0,
            'rotation_degrees' => 0,
            'created_at' => FlatFileDB::now(),
            'created_by' => $data['user_id'] ?? 1,
            'is_current' => true,
            'status' => 'draft',
            'plans' => []  // NOUVEAU: Array de plans
        ];

        // Si données anciennes (file_path fourni), créer un plan unique
        if (isset($data['file_path']) && $data['file_path']) {
            $version['plans'][] = [
                'plan_id' => 'plan_' . substr(md5($versionId), 0, 8),
                'floor_level' => $data['floor_level'] ?? 'RDC',
                'floor_order' => 0,
                'file_path' => $data['file_path'],
                'file_name' => $data['file_name'] ?? '',
                'file_hash' => $data['file_hash'] ?? null,
                'file_size' => $data['file_size'] ?? 0,
                'mime_type' => $data['mime_type'] ?? 'application/pdf',
                'uploaded_at' => FlatFileDB::now(),
                'is_modified' => false,
                'source_version_id' => null,
                'source_plan_id' => null
            ];

            // Garder aussi l'ancienne structure pour rétrocompatibilité
            $version['file_path'] = $data['file_path'];
            $version['file_name'] = $data['file_name'] ?? null;
            $version['file_hash'] = $data['file_hash'] ?? null;
            $version['file_size'] = $data['file_size'] ?? 0;
            $version['mime_type'] = $data['mime_type'] ?? null;
            $version['upload_date'] = FlatFileDB::now();
            $version['uploaded_by'] = $data['user_id'] ?? 1;
        }

        // Marquer les autres versions comme non courantes
        foreach ($versions as &$v) {
            $v['is_current'] = false;
        }

        // Ajouter nouvelle version
        $versions[] = $version;

        // Sauvegarder
        FlatFileDB::write($versionsFile, $versions);

        // Créer fichier measurements avec nouvelle structure
        FlatFileDB::write($versionPath . '/measurements.json', [
            'measurements_by_plan' => []
        ]);

        // Créer metadata
        FlatFileDB::write($versionPath . '/metadata.json', [
            'version_id' => $versionId,
            'created_at' => FlatFileDB::now()
        ]);

        return $version;
    }

    /**
     * Créer une nouvelle version depuis une version précédente
     * Avec copie sélective de plans
     */
    public function createFromPrevious($projectId, $data) {
        $parentVersionId = $data['parent_version_id'] ?? null;

        if (!$parentVersionId) {
            throw new Exception('parent_version_id requis');
        }

        // Charger version parent
        $parentVersion = $this->getById($projectId, $parentVersionId);

        if (!$parentVersion) {
            throw new Exception('Version parent non trouvée');
        }

        // Créer nouvelle version vide
        $newVersion = $this->create($projectId, [
            'version_label' => $data['version_label'] ?? 'Nouvelle version',
            'description' => $data['description'] ?? '',
            'user_id' => $data['user_id'] ?? 1
        ]);

        $projectPath = SAVES_PATH . '/' . $projectId;
        $versionsFile = $projectPath . '/versions/versions.json';
        $versions = FlatFileDB::read($versionsFile, []);

        // Plans à conserver (copier depuis parent)
        $plansToKeep = $data['plans_to_keep'] ?? [];

        // Plans à remplacer (laisser vide pour upload ultérieur)
        $plansToReplace = $data['plans_to_replace'] ?? [];

        // Récupérer plans du parent
        $parentPlans = [];

        if (isset($parentVersion['plans']) && is_array($parentVersion['plans'])) {
            $parentPlans = $parentVersion['plans'];
        } elseif (isset($parentVersion['file_path'])) {
            // Structure ancienne - créer un plan unique
            $parentPlans = [[
                'plan_id' => 'plan_' . substr(md5($parentVersionId), 0, 8),
                'floor_level' => 'RDC',
                'floor_order' => 0,
                'file_path' => $parentVersion['file_path'],
                'file_name' => $parentVersion['file_name'] ?? '',
                'file_hash' => $parentVersion['file_hash'] ?? null,
                'file_size' => $parentVersion['file_size'] ?? 0,
                'mime_type' => $parentVersion['mime_type'] ?? 'application/pdf',
                'uploaded_at' => $parentVersion['upload_date'] ?? FlatFileDB::now(),
                'is_modified' => false,
                'source_version_id' => null,
                'source_plan_id' => null
            ]];
        }

        // Copier plans à conserver
        $newPlans = [];

        foreach ($parentPlans as $parentPlan) {
            $floorLevel = $parentPlan['floor_level'];

            if (in_array($floorLevel, $plansToKeep)) {
                // Copier (héritage)
                $inheritedPlan = $parentPlan;
                $inheritedPlan['inherited_from'] = $parentVersionId;
                $inheritedPlan['source_version_id'] = $parentVersionId;
                $inheritedPlan['source_plan_id'] = $parentPlan['plan_id'];
                $inheritedPlan['is_modified'] = false;

                $newPlans[] = $inheritedPlan;
            } elseif (in_array($floorLevel, $plansToReplace)) {
                // Créer placeholder vide pour remplacement ultérieur
                $newPlans[] = [
                    'plan_id' => 'plan_' . substr(md5(uniqid() . $floorLevel), 0, 12),
                    'floor_level' => $floorLevel,
                    'floor_order' => $parentPlan['floor_order'],
                    'file_path' => null,
                    'file_name' => null,
                    'file_hash' => null,
                    'file_size' => 0,
                    'mime_type' => 'application/pdf',
                    'uploaded_at' => null,
                    'is_modified' => false,
                    'source_version_id' => $parentVersionId,
                    'source_plan_id' => $parentPlan['plan_id'],
                    'pending_upload' => true
                ];
            }
        }

        // Mettre à jour la nouvelle version avec plans copiés
        foreach ($versions as &$v) {
            if ($v['version_id'] === $newVersion['version_id']) {
                $v['plans'] = $newPlans;
                $v['parent_version_id'] = $parentVersionId;
                break;
            }
        }

        FlatFileDB::write($versionsFile, $versions);

        // Copier les measurements des plans hérités
        $parentMeasFile = $projectPath . '/versions/' . $parentVersionId . '/measurements.json';
        $newMeasFile = $projectPath . '/versions/' . $newVersion['version_id'] . '/measurements.json';

        if (file_exists($parentMeasFile)) {
            $parentMeas = json_decode(file_get_contents($parentMeasFile), true);

            $newMeas = ['measurements_by_plan' => []];

            // Copier mesures des plans hérités uniquement
            foreach ($newPlans as $plan) {
                if (isset($plan['inherited_from']) && isset($plan['source_plan_id'])) {
                    $sourcePlanId = $plan['source_plan_id'];

                    // Support ancienne et nouvelle structure
                    if (isset($parentMeas['measurements_by_plan'][$sourcePlanId])) {
                        $newMeas['measurements_by_plan'][$plan['plan_id']] = $parentMeas['measurements_by_plan'][$sourcePlanId];
                    } elseif (isset($parentMeas['measurements'])) {
                        // Ancienne structure
                        $newMeas['measurements_by_plan'][$plan['plan_id']] = $parentMeas['measurements'];
                    } elseif (is_array($parentMeas) && !isset($parentMeas['measurements_by_plan'])) {
                        // Très ancienne structure (array direct)
                        $newMeas['measurements_by_plan'][$plan['plan_id']] = $parentMeas;
                    }
                }
            }

            file_put_contents($newMeasFile, json_encode($newMeas, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
        }

        return $this->getById($projectId, $newVersion['version_id']);
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
     * Mettre à jour une version (ex: échelle, file_path)
     */
    public function update($projectId, $versionId, $data) {
        $versionsFile = SAVES_PATH . '/' . $projectId . '/versions/versions.json';
        $versions = FlatFileDB::read($versionsFile, []);

        foreach ($versions as &$version) {
            if ($version['version_id'] === $versionId) {
                // Mettre à jour les champs autorisés
                $allowedFields = ['scale_factor', 'origin_x', 'origin_y', 'rotation_degrees', 'file_path', 'version_label', 'status'];
                foreach ($allowedFields as $field) {
                    if (isset($data[$field])) {
                        $version[$field] = $data[$field];
                    }
                }
                $version['updated_at'] = FlatFileDB::now();
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
