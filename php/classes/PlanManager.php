<?php

/**
 * PlanManager
 * Gère les plans multiples par version
 */
class PlanManager {
    private $basePath;

    public function __construct() {
        $this->basePath = SAVES_PATH;
    }

    /**
     * Récupérer tous les plans d'une version
     *
     * @param string $projectId ID du projet
     * @param string $versionId ID de la version
     * @return array Liste des plans
     */
    public function getAllByVersion($projectId, $versionId) {
        $versionsFile = $this->basePath . "/{$projectId}/versions/versions.json";

        if (!file_exists($versionsFile)) {
            return [];
        }

        $data = json_decode(file_get_contents($versionsFile), true);

        if (!$data) {
            return [];
        }

        // Le fichier versions.json contient directement un array de versions, pas un objet
        // Structure: [{version1}, {version2}] et non {versions: [...]}
        $versions = $data;

        $version = $this->findVersion($versions, $versionId);

        if (!$version) {
            return [];
        }

        // Si structure ancienne (pas de clé "plans")
        if (!isset($version['plans'])) {
            // Retourner un plan unique créé à partir des données de version
            return [[
                'plan_id' => 'plan_' . substr(md5($versionId), 0, 8),
                'floor_level' => 'RDC',
                'floor_order' => 0,
                'file_path' => $version['file_path'] ?? '',
                'file_name' => $version['file_name'] ?? '',
                'file_hash' => $version['file_hash'] ?? null,
                'file_size' => $version['file_size'] ?? 0,
                'mime_type' => $version['mime_type'] ?? 'application/pdf',
                'uploaded_at' => $version['upload_date'] ?? date('Y-m-d\TH:i:s'),
                'is_modified' => false,
                'source_version_id' => null,
                'source_plan_id' => null,
                'legacy' => true
            ]];
        }

        return $version['plans'];
    }

    /**
     * Récupérer un plan spécifique
     *
     * @param string $projectId ID du projet
     * @param string $versionId ID de la version
     * @param string $planId ID du plan
     * @return array|null Plan trouvé ou null
     */
    public function getById($projectId, $versionId, $planId) {
        $plans = $this->getAllByVersion($projectId, $versionId);

        foreach ($plans as $plan) {
            if ($plan['plan_id'] === $planId) {
                return $plan;
            }
        }

        return null;
    }

    /**
     * Ajouter un plan à une version
     *
     * @param array $data Données du plan
     * @return array Plan créé
     * @throws Exception Si données invalides
     */
    public function create($data) {
        $projectId = $data['project_id'] ?? null;
        $versionId = $data['version_id'] ?? null;
        $floorLevel = $data['floor_level'] ?? null;

        if (!$projectId || !$versionId || !$floorLevel) {
            throw new Exception('project_id, version_id et floor_level requis');
        }

        // Générer plan_id unique
        $planId = 'plan_' . substr(md5(uniqid() . $floorLevel . time()), 0, 12);

        $plan = [
            'plan_id' => $planId,
            'floor_level' => $floorLevel,
            'floor_order' => $data['floor_order'] ?? 0,
            'file_path' => $data['file_path'] ?? '',
            'file_name' => $data['file_name'] ?? '',
            'file_hash' => $data['file_hash'] ?? null,
            'file_size' => $data['file_size'] ?? 0,
            'mime_type' => $data['mime_type'] ?? 'application/pdf',
            'uploaded_at' => date('Y-m-d\TH:i:s'),
            'is_modified' => false,
            'source_version_id' => null,
            'source_plan_id' => null
        ];

        // Ajouter le plan dans versions.json
        $versionsFile = $this->basePath . "/{$projectId}/versions/versions.json";

        if (!file_exists($versionsFile)) {
            throw new Exception('Fichier versions.json non trouvé');
        }

        $versionsData = json_decode(file_get_contents($versionsFile), true);

        if (!$versionsData || !is_array($versionsData)) {
            throw new Exception('Structure versions.json invalide');
        }

        $versionFound = false;

        foreach ($versionsData as &$version) {
            if ($version['version_id'] === $versionId) {
                // Initialiser plans[] si n'existe pas
                if (!isset($version['plans'])) {
                    $version['plans'] = [];
                }

                $version['plans'][] = $plan;
                $versionFound = true;
                break;
            }
        }

        if (!$versionFound) {
            throw new Exception('Version non trouvée');
        }

        // Sauvegarder (versionsData est un array direct)
        file_put_contents($versionsFile, json_encode($versionsData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));

        return $plan;
    }

    /**
     * Remplacer un plan existant (avec backup automatique)
     *
     * @param array $data Données de remplacement
     * @return array Résultat avec plan et info backup
     * @throws Exception Si plan non trouvé
     */
    public function replace($data) {
        $projectId = $data['project_id'] ?? null;
        $versionId = $data['version_id'] ?? null;
        $planId = $data['plan_id'] ?? null;

        if (!$projectId || !$versionId || !$planId) {
            throw new Exception('project_id, version_id et plan_id requis');
        }

        // 1. Récupérer le plan actuel
        $versionsFile = $this->basePath . "/{$projectId}/versions/versions.json";

        if (!file_exists($versionsFile)) {
            throw new Exception('Fichier versions.json non trouvé');
        }

        $versionsData = json_decode(file_get_contents($versionsFile), true);

        $oldPlan = null;
        $versionIndex = null;
        $planIndex = null;

        foreach ($versionsData as $vIdx => &$version) {
            if ($version['version_id'] === $versionId) {
                if (isset($version['plans'])) {
                    foreach ($version['plans'] as $pIdx => &$plan) {
                        if ($plan['plan_id'] === $planId) {
                            $oldPlan = $plan;
                            $versionIndex = $vIdx;
                            $planIndex = $pIdx;
                            break 2;
                        }
                    }
                }
            }
        }

        if (!$oldPlan) {
            throw new Exception("Plan non trouvé: {$planId}");
        }

        // 2. BACKUP du plan actuel
        $backupDir = $this->basePath . "/{$projectId}/backups/{$versionId}";
        if (!file_exists($backupDir)) {
            mkdir($backupDir, 0755, true);
        }

        $timestamp = date('YmdHis');
        $backupFileName = pathinfo($oldPlan['file_name'], PATHINFO_FILENAME) .
                          "_backup_{$timestamp}." .
                          pathinfo($oldPlan['file_name'], PATHINFO_EXTENSION);

        $backupPath = $backupDir . '/' . $backupFileName;

        // Copier l'ancien fichier vers backup (si existe)
        if (isset($oldPlan['file_path']) && file_exists($oldPlan['file_path'])) {
            copy($oldPlan['file_path'], $backupPath);
        }

        // Backup des mesures aussi
        $backupMeasFile = null;
        $oldMeasurementsFile = $this->basePath . "/{$projectId}/versions/{$versionId}/measurements.json";

        if (file_exists($oldMeasurementsFile)) {
            $measData = json_decode(file_get_contents($oldMeasurementsFile), true);

            // Support ancienne et nouvelle structure
            $oldMeasurements = [];

            if (isset($measData['measurements_by_plan'][$planId])) {
                // Nouvelle structure
                $oldMeasurements = $measData['measurements_by_plan'][$planId];
            } elseif (isset($measData['measurements']) && is_array($measData['measurements'])) {
                // Structure intermédiaire
                $oldMeasurements = $measData['measurements'];
            } elseif (is_array($measData) && !isset($measData['measurements_by_plan'])) {
                // Ancienne structure (array direct)
                $oldMeasurements = $measData;
            }

            if (!empty($oldMeasurements)) {
                $backupMeasFile = $backupDir . "/measurements_{$planId}_{$timestamp}.json";
                file_put_contents($backupMeasFile, json_encode($oldMeasurements, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
            }
        }

        // 3. Remplacer le plan
        $newPlan = [
            'plan_id' => $planId,  // Garder le même ID
            'floor_level' => $oldPlan['floor_level'],
            'floor_order' => $oldPlan['floor_order'],
            'file_path' => $data['new_file_path'] ?? $oldPlan['file_path'],
            'file_name' => $data['new_file_name'] ?? $oldPlan['file_name'],
            'file_hash' => $data['new_file_hash'] ?? null,
            'file_size' => $data['new_file_size'] ?? $oldPlan['file_size'],
            'mime_type' => $data['mime_type'] ?? $oldPlan['mime_type'],
            'uploaded_at' => date('Y-m-d\TH:i:s'),
            'is_modified' => true,
            'source_version_id' => $versionId,
            'source_plan_id' => $planId,
            'replaced_at' => date('Y-m-d\TH:i:s'),
            'backup_path' => $backupPath,
            'previous_file_path' => $oldPlan['file_path'] ?? null
        ];

        $versionsData[$versionIndex]['plans'][$planIndex] = $newPlan;

        // Sauvegarder (versionsData est un array direct)
        file_put_contents($versionsFile, json_encode($versionsData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));

        return [
            'plan' => $newPlan,
            'backup' => [
                'file_path' => $backupPath,
                'measurements_path' => $backupMeasFile
            ]
        ];
    }

    /**
     * Supprimer un plan
     *
     * @param string $projectId ID du projet
     * @param string $versionId ID de la version
     * @param string $planId ID du plan
     * @throws Exception Si plan non trouvé
     */
    public function delete($projectId, $versionId, $planId) {
        $versionsFile = $this->basePath . "/{$projectId}/versions/versions.json";

        if (!file_exists($versionsFile)) {
            throw new Exception('Fichier versions.json non trouvé');
        }

        $data = json_decode(file_get_contents($versionsFile), true);

        if (!$data || !is_array($data)) {
            throw new Exception('Structure versions.json invalide');
        }

        $planFound = false;

        foreach ($data as &$version) {
            if ($version['version_id'] === $versionId) {
                if (isset($version['plans'])) {
                    $version['plans'] = array_filter($version['plans'], function($p) use ($planId, &$planFound) {
                        if ($p['plan_id'] === $planId) {
                            $planFound = true;
                            return false;
                        }
                        return true;
                    });

                    // Réindexer
                    $version['plans'] = array_values($version['plans']);
                }
                break;
            }
        }

        if (!$planFound) {
            throw new Exception('Plan non trouvé');
        }

        // Sauvegarder
        file_put_contents($versionsFile, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
    }

    /**
     * Copier un plan d'une version à une autre (héritage)
     *
     * @param string $projectId ID du projet
     * @param string $sourceVersionId Version source
     * @param string $targetVersionId Version cible
     * @param string $sourcePlanId Plan à copier
     * @return array Plan copié
     */
    public function copyPlan($projectId, $sourceVersionId, $targetVersionId, $sourcePlanId) {
        $sourcePlan = $this->getById($projectId, $sourceVersionId, $sourcePlanId);

        if (!$sourcePlan) {
            throw new Exception('Plan source non trouvé');
        }

        // Créer une copie avec héritage
        $inheritedPlan = $sourcePlan;
        $inheritedPlan['inherited_from'] = $sourceVersionId;
        $inheritedPlan['source_version_id'] = $sourceVersionId;
        $inheritedPlan['source_plan_id'] = $sourcePlanId;
        $inheritedPlan['is_modified'] = false;

        // Ajouter à la version cible
        $versionsFile = $this->basePath . "/{$projectId}/versions/versions.json";
        $versionsData = json_decode(file_get_contents($versionsFile), true);

        foreach ($versionsData as &$version) {
            if ($version['version_id'] === $targetVersionId) {
                if (!isset($version['plans'])) {
                    $version['plans'] = [];
                }
                $version['plans'][] = $inheritedPlan;
                break;
            }
        }

        file_put_contents($versionsFile, json_encode($versionsData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));

        return $inheritedPlan;
    }

    /**
     * Trouver une version par ID
     *
     * @param array $versions Liste des versions
     * @param string $versionId ID recherché
     * @return array|null Version trouvée ou null
     */
    private function findVersion($versions, $versionId) {
        foreach ($versions as $v) {
            if ($v['version_id'] === $versionId) {
                return $v;
            }
        }
        return null;
    }
}
