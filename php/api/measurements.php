<?php
/**
 * API Measurements - Gestion mesures
 */

require_once '../config.php';
require_once '../classes/Database.php';

$db = Database::getInstance();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

try {
    // GET - Obtenir mesures
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $versionId = $_GET['version_id'] ?? null;

        if (!$versionId) {
            jsonError('version_id requis');
        }

        $sql = "SELECT * FROM measurements
                WHERE version_id = :version_id
                ORDER BY created_at DESC";

        $measurements = $db->fetchAll($sql, [':version_id' => $versionId]);
        jsonSuccess(['measurements' => $measurements]);
    }

    // POST - Créer/Sauvegarder mesures
    elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);

        if (empty($data['version_id']) || empty($data['measurements'])) {
            jsonError('Données incomplètes');
        }

        $versionId = $data['version_id'];
        $measurements = $data['measurements'];
        $userId = 1; // TODO: Session

        $db->beginTransaction();

        try {
            foreach ($measurements as $m) {
                $sql = "INSERT INTO measurements
                        (project_id, version_id, layer_id, item_code, description, category,
                         quantity, unit, unit_price, geometry_type, coordinates,
                         color, thickness, opacity, created_by)
                        VALUES
                        (:project_id, :version_id, :layer_id, :item_code, :description, :category,
                         :quantity, :unit, :unit_price, :geometry_type, :coordinates,
                         :color, :thickness, :opacity, :user_id)";

                $db->query($sql, [
                    ':project_id' => $m['project_id'] ?? null,
                    ':version_id' => $versionId,
                    ':layer_id' => $m['layer_id'] ?? null,
                    ':item_code' => $m['item_code'] ?? '',
                    ':description' => $m['description'] ?? '',
                    ':category' => $m['category'] ?? null,
                    ':quantity' => $m['value'] ?? $m['quantity'] ?? 0,
                    ':unit' => $m['unit'] ?? 'm',
                    ':unit_price' => $m['unit_price'] ?? 0,
                    ':geometry_type' => $m['type'],
                    ':coordinates' => json_encode($m['coordinates']),
                    ':color' => $m['color'] ?? '#FF0000',
                    ':thickness' => $m['thickness'] ?? 2,
                    ':opacity' => $m['opacity'] ?? 0.5,
                    ':user_id' => $userId
                ]);
            }

            $db->commit();
            jsonSuccess([], 'Mesures sauvegardées');

        } catch (Exception $e) {
            $db->rollBack();
            throw $e;
        }
    }

    // PUT - Mettre à jour mesure
    elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
        $data = json_decode(file_get_contents('php://input'), true);

        if (empty($data['measurement_id'])) {
            jsonError('measurement_id requis');
        }

        // Gérer mise à jour statut
        if (isset($data['update_type'])) {
            $field = $data['update_type'] . '_date';

            $sql = "UPDATE measurements SET $field = :date WHERE measurement_id = :id";
            $db->query($sql, [
                ':date' => $data['value'] ? $data['date'] : null,
                ':id' => $data['measurement_id']
            ]);

            jsonSuccess([], 'Statut mis à jour');
        }

        // Sinon mise à jour générale
        else {
            $fields = [];
            $params = [':id' => $data['measurement_id']];

            foreach (['item_code', 'description', 'category', 'quantity', 'unit', 'unit_price'] as $field) {
                if (isset($data[$field])) {
                    $fields[] = "$field = :$field";
                    $params[":$field"] = $data[$field];
                }
            }

            if (!empty($fields)) {
                $sql = "UPDATE measurements SET " . implode(', ', $fields) . " WHERE measurement_id = :id";
                $db->query($sql, $params);
            }

            jsonSuccess([], 'Mesure mise à jour');
        }
    }

    // DELETE - Supprimer mesure
    elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
        $data = json_decode(file_get_contents('php://input'), true);

        if (empty($data['measurement_id'])) {
            jsonError('measurement_id requis');
        }

        $sql = "DELETE FROM measurements WHERE measurement_id = :id";
        $db->query($sql, [':id' => $data['measurement_id']]);

        jsonSuccess([], 'Mesure supprimée');
    }

    else {
        jsonError('Méthode non autorisée', 405);
    }

} catch (Exception $e) {
    error_log('Measurements API error: ' . $e->getMessage());
    jsonError('Erreur serveur: ' . $e->getMessage(), 500);
}
