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
     * Obtenir toutes les mesures d'une version
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
