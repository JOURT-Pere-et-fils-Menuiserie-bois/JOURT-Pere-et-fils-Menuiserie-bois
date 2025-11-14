<?php
/**
 * Migration Script: Ancienne structure → Nouvelle structure multi-plans
 *
 * Transforme:
 *   - Version avec 1 fichier PDF unique
 *   - measurements.json = array direct
 *
 * Vers:
 *   - Version avec plans[] array
 *   - measurements.json = { measurements_by_plan: {} }
 *
 * Usage: php php/scripts/migrate_to_multiplan.php
 */

require_once __DIR__ . '/../config.php';

echo "=== MIGRATION VERS STRUCTURE MULTI-PLANS ===\n\n";

/**
 * Migrer un projet
 */
function migrateProject($projectId) {
    $versionsFile = SAVES_PATH . "/{$projectId}/versions/versions.json";

    if (!file_exists($versionsFile)) {
        echo "[{$projectId}] ⏭️  Pas de fichier versions.json, skip\n";
        return;
    }

    echo "[{$projectId}] 📂 Migration du projet...\n";

    $data = json_decode(file_get_contents($versionsFile), true);

    if (!$data || !isset($data['versions'])) {
        echo "[{$projectId}] ❌ Fichier versions.json invalide\n";
        return;
    }

    $modified = false;

    foreach ($data['versions'] as &$version) {
        $versionId = $version['version_id'];

        // Vérifier si structure ancienne (pas de clé "plans")
        if (!isset($version['plans'])) {
            echo "  [{$versionId}] 🔄 Migration vers structure plans[]...\n";

            // Créer un plan unique "RDC" avec les données existantes
            $plan = [
                'plan_id' => 'plan_' . substr(md5($versionId . time()), 0, 12),
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
                'migrated' => true
            ];

            $version['plans'] = [$plan];
            $modified = true;

            echo "    ✓ Plan créé: {$plan['plan_id']} (RDC)\n";

            // Migrer measurements.json aussi
            $measFile = SAVES_PATH . "/{$projectId}/versions/{$versionId}/measurements.json";

            if (file_exists($measFile)) {
                $meas = json_decode(file_get_contents($measFile), true);

                // Vérifier si structure ancienne
                if (is_array($meas)) {
                    // Si c'est déjà la nouvelle structure, skip
                    if (isset($meas['measurements_by_plan'])) {
                        echo "    ⏭️  Measurements déjà migré\n";
                    } else {
                        // Ancienne structure: soit array direct, soit { measurements: [] }
                        $measurements = [];

                        if (isset($meas['measurements']) && is_array($meas['measurements'])) {
                            // Structure intermédiaire
                            $measurements = $meas['measurements'];
                        } elseif (isset($meas[0])) {
                            // Array direct
                            $measurements = $meas;
                        }

                        // Transformer en structure par plan
                        $newMeas = [
                            'measurements_by_plan' => [
                                $plan['plan_id'] => $measurements
                            ]
                        ];

                        file_put_contents($measFile, json_encode($newMeas, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
                        echo "    ✓ Measurements migré: " . count($measurements) . " mesure(s)\n";
                    }
                }
            }
        } else {
            echo "  [{$versionId}] ✅ Déjà en structure multi-plans\n";
        }
    }

    if ($modified) {
        // Sauvegarder versions.json
        file_put_contents($versionsFile, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
        echo "  ✅ versions.json sauvegardé\n";
    }

    echo "[{$projectId}] ✅ Migration terminée\n\n";
}

/**
 * Point d'entrée principal
 */
function main() {
    // Trouver tous les projets
    $projectDirs = glob(SAVES_PATH . '/projet_*', GLOB_ONLYDIR);

    if (empty($projectDirs)) {
        echo "⚠️  Aucun projet trouvé dans " . SAVES_PATH . "\n";
        return;
    }

    echo "📊 " . count($projectDirs) . " projet(s) trouvé(s)\n\n";

    foreach ($projectDirs as $dir) {
        $projectId = basename($dir);
        migrateProject($projectId);
    }

    echo "\n=== MIGRATION TERMINÉE ===\n";
    echo "✅ Tous les projets ont été migrés vers la structure multi-plans\n\n";
    echo "Vous pouvez maintenant:\n";
    echo "  - Créer plusieurs plans par version\n";
    echo "  - Remplacer des plans individuellement (avec backup auto)\n";
    echo "  - Créer des versions en copiant sélectivement les plans\n\n";
}

// Exécuter
main();
