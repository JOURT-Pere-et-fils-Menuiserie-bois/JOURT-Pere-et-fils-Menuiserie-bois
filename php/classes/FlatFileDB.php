<?php
/**
 * FlatFileDB - Gestion base de données fichiers plats (JSON)
 */

class FlatFileDB {

    /**
     * Lire un fichier JSON
     */
    public static function read($filePath, $default = []) {
        if (!file_exists($filePath)) {
            return $default;
        }

        $content = file_get_contents($filePath);
        if ($content === false) {
            return $default;
        }

        $data = json_decode($content, true);
        return $data !== null ? $data : $default;
    }

    /**
     * Écrire dans un fichier JSON
     */
    public static function write($filePath, $data) {
        // Créer dossier si nécessaire
        $dir = dirname($filePath);
        if (!file_exists($dir)) {
            mkdir($dir, 0755, true);
        }

        $json = json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

        if ($json === false) {
            throw new Exception('Erreur encodage JSON');
        }

        $result = file_put_contents($filePath, $json, LOCK_EX);

        if ($result === false) {
            throw new Exception('Erreur écriture fichier');
        }

        return true;
    }

    /**
     * Générer un ID unique
     */
    public static function generateId($prefix = '') {
        return $prefix . uniqid() . '_' . bin2hex(random_bytes(4));
    }

    /**
     * Obtenir timestamp actuel
     */
    public static function now() {
        return date('Y-m-d H:i:s');
    }

    /**
     * Créer structure projet
     */
    public static function createProjectStructure($projectId) {
        $projectPath = SAVES_PATH . '/' . $projectId;

        $dirs = [
            $projectPath,
            $projectPath . '/versions',
            $projectPath . '/avenants',
            $projectPath . '/exports'
        ];

        foreach ($dirs as $dir) {
            if (!file_exists($dir)) {
                mkdir($dir, 0755, true);
            }
        }

        return $projectPath;
    }

    /**
     * Supprimer récursivement un dossier
     */
    public static function deleteDirectory($dir) {
        if (!is_dir($dir)) {
            return false;
        }

        $files = array_diff(scandir($dir), ['.', '..']);

        foreach ($files as $file) {
            $path = $dir . '/' . $file;
            is_dir($path) ? self::deleteDirectory($path) : unlink($path);
        }

        return rmdir($dir);
    }

    /**
     * Obtenir la liste de tous les projets
     */
    public static function getAllProjects() {
        if (!is_dir(SAVES_PATH)) {
            return [];
        }

        $projects = [];
        $dirs = array_diff(scandir(SAVES_PATH), ['.', '..', '.htaccess']);

        foreach ($dirs as $dir) {
            $projectPath = SAVES_PATH . '/' . $dir;
            if (is_dir($projectPath)) {
                $projectFile = $projectPath . '/project.json';
                if (file_exists($projectFile)) {
                    $project = self::read($projectFile);
                    if ($project) {
                        $projects[] = $project;
                    }
                }
            }
        }

        // Trier par date de mise à jour
        usort($projects, function($a, $b) {
            return strtotime($b['updated_at']) - strtotime($a['updated_at']);
        });

        return $projects;
    }
}
