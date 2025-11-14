<?php
/**
 * MeasurementManager - Gestion des mesures (FlatFile)
 */

class MeasurementManager {

    /**
     * Sauvegarder des mesures
     */
    public function save($projectId, $versionId, $measurements, $userId = 1) {
        $measurementsFile = SAVES_PATH . '/' . $projectId . '/versions/' . $versionId . '/measurements.json';

        // Ajouter métadonnées à chaque mesure
        $timestamp = FlatFileDB::now();

        foreach ($measurements as &$m) {
            if (!isset($m['measurement_id'])) {
                $m['measurement_id'] = FlatFileDB::generateId('meas_');
            }
            if (!isset($m['created_at'])) {
                $m['created_at'] = $timestamp;
                $m['created_by'] = $userId;
            }
            $m['updated_at'] = $timestamp;
            $m['project_id'] = $projectId;
            $m['version_id'] = $versionId;
        }

        FlatFileDB::write($measurementsFile, $measurements);

        return $measurements;
    }

    /**
     * Sauvegarder mesures par plan (structure multi-plans)
     *
     * @param string $projectId
     * @param string $versionId
     * @param array $measurementsByPlan Format: ['plan_id' => [mesures...], ...]
     * @param int $userId
     * @return array
     */
    public function saveByPlan($projectId, $versionId, $measurementsByPlan, $userId = 1) {
        $measurementsFile = SAVES_PATH . '/' . $projectId . '/versions/' . $versionId . '/measurements.json';

        $timestamp = FlatFileDB::now();

        // Traiter chaque plan
        foreach ($measurementsByPlan as $planId => &$measurements) {
            foreach ($measurements as &$m) {
                // Générer ID si manquant
                if (!isset($m['measurement_id'])) {
                    $m['measurement_id'] = FlatFileDB::generateId('meas_');
                }

                // Timestamps
                if (!isset($m['created_at'])) {
                    $m['created_at'] = $timestamp;
                    $m['created_by'] = $userId;
                }
                $m['updated_at'] = $timestamp;

                // Métadonnées
                $m['project_id'] = $projectId;
                $m['version_id'] = $versionId;
                $m['plan_id'] = $planId;
            }
        }

        // Sauvegarder structure complète
        $data = ['measurements_by_plan' => $measurementsByPlan];
        FlatFileDB::write($measurementsFile, $data);

        return $measurementsByPlan;
    }

    /**
     * Obtenir toutes les mesures (structure multi-plans)
     *
     * @param string $projectId
     * @param string $versionId
     * @return array Format: ['measurements_by_plan' => [...]]
     */
    public function getAllByPlan($projectId, $versionId) {
        $measurementsFile = SAVES_PATH . '/' . $projectId . '/versions/' . $versionId . '/measurements.json';
        $data = FlatFileDB::read($measurementsFile, []);

        // Structure measurements_by_plan existe
        if (isset($data['measurements_by_plan'])) {
            return $data;
        }

        // Migration automatique ancienne structure → nouvelle
        if (is_array($data) && !empty($data)) {
            // Ancienne structure détectée
            if (isset($data['measurements']) && is_array($data['measurements'])) {
                // Structure intermédiaire { measurements: [...] }
                return ['measurements_by_plan' => []];
            } elseif (isset($data[0])) {
                // Array direct (très ancienne structure)
                return ['measurements_by_plan' => []];
            }
        }

        // Aucune mesure
        return ['measurements_by_plan' => []];
    }

    /**
     * Obtenir toutes les mesures d'une version (ancienne méthode - rétrocompatibilité)
     */
    public function getAll($projectId, $versionId) {
        $measurementsFile = SAVES_PATH . '/' . $projectId . '/versions/' . $versionId . '/measurements.json';
        return FlatFileDB::read($measurementsFile, []);
    }

    /**
     * Mettre à jour une mesure
     */
    public function update($projectId, $versionId, $measurementId, $data) {
        $measurementsFile = SAVES_PATH . '/' . $projectId . '/versions/' . $versionId . '/measurements.json';
        $measurements = FlatFileDB::read($measurementsFile, []);

        foreach ($measurements as &$m) {
            if ($m['measurement_id'] === $measurementId) {
                // Mettre à jour les champs
                foreach ($data as $key => $value) {
                    if ($key !== 'measurement_id' && $key !== 'created_at') {
                        $m[$key] = $value;
                    }
                }
                $m['updated_at'] = FlatFileDB::now();
                break;
            }
        }

        FlatFileDB::write($measurementsFile, $measurements);

        return $measurements;
    }

    /**
     * Supprimer une mesure
     */
    public function delete($projectId, $versionId, $measurementId) {
        $measurementsFile = SAVES_PATH . '/' . $projectId . '/versions/' . $versionId . '/measurements.json';
        $measurements = FlatFileDB::read($measurementsFile, []);

        $measurements = array_filter($measurements, function($m) use ($measurementId) {
            return $m['measurement_id'] !== $measurementId;
        });

        // Réindexer
        $measurements = array_values($measurements);

        FlatFileDB::write($measurementsFile, $measurements);

        return true;
    }
}
