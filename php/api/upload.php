<?php
/**
 * API Upload - Upload de fichiers PDF/DXF
 */

require_once '../config.php';
require_once '../classes/Database.php';

$db = Database::getInstance();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        jsonError('Méthode non autorisée', 405);
    }

    // Vérifier fichier
    if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
        jsonError('Aucun fichier uploadé ou erreur d\'upload');
    }

    $file = $_FILES['file'];
    $projectId = $_POST['project_id'] ?? null;

    if (!$projectId) {
        jsonError('project_id requis');
    }

    // Vérifier taille
    if ($file['size'] > MAX_UPLOAD_SIZE) {
        jsonError('Fichier trop volumineux (max ' . (MAX_UPLOAD_SIZE / 1024 / 1024) . ' MB)');
    }

    // Vérifier extension
    $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    if (!in_array($extension, ALLOWED_EXTENSIONS)) {
        jsonError('Type de fichier non autorisé. Utilisez PDF ou DXF.');
    }

    // Créer dossier projet
    $projectPath = SAVES_PATH . "/projet_$projectId";
    if (!is_dir($projectPath)) {
        mkdir($projectPath, 0755, true);
    }

    // Obtenir numéro de version
    $sql = "SELECT COALESCE(MAX(version_number), 0) + 1 as next_version
            FROM plan_versions
            WHERE project_id = :project_id";

    $nextVersion = $db->fetchValue($sql, [':project_id' => $projectId]);
    $versionLabel = 'v' . str_pad($nextVersion, 3, '0', STR_PAD_LEFT);

    // Créer dossier version
    $versionPath = "$projectPath/versions/v$nextVersion";
    if (!is_dir($versionPath)) {
        mkdir($versionPath, 0755, true);
    }

    // Calculer hash
    $hash = hash_file('sha256', $file['tmp_name']);

    // Vérifier si fichier déjà uploadé
    $sql = "SELECT version_id FROM plan_versions
            WHERE project_id = :project_id AND file_hash = :hash";

    $existingVersion = $db->fetchValue($sql, [
        ':project_id' => $projectId,
        ':hash' => $hash
    ]);

    if ($existingVersion) {
        jsonError('Ce fichier a déjà été uploadé (version #' . $existingVersion . ')');
    }

    // Déplacer fichier
    $fileName = 'plan.' . $extension;
    $filePath = "$versionPath/$fileName";

    if (!move_uploaded_file($file['tmp_name'], $filePath)) {
        jsonError('Erreur lors de l\'enregistrement du fichier');
    }

    // Créer version en BDD
    $sql = "INSERT INTO plan_versions
            (project_id, version_number, version_label, file_path, file_name,
             file_hash, file_size_bytes, mime_type, uploaded_by, is_current)
            VALUES
            (:project_id, :version_number, :version_label, :file_path, :file_name,
             :file_hash, :file_size, :mime_type, :user_id, 1)";

    // Désactiver les autres versions courantes
    $db->query("UPDATE plan_versions SET is_current = 0 WHERE project_id = :project_id", [
        ':project_id' => $projectId
    ]);

    $versionId = $db->insert($sql, [
        ':project_id' => $projectId,
        ':version_number' => $nextVersion,
        ':version_label' => $versionLabel,
        ':file_path' => $filePath,
        ':file_name' => $file['name'],
        ':file_hash' => $hash,
        ':file_size' => $file['size'],
        ':mime_type' => $file['type'],
        ':user_id' => 1 // TODO: Session
    ]);

    // Créer fichier metadata.json
    $metadata = [
        'version_id' => $versionId,
        'version_number' => $nextVersion,
        'version_label' => $versionLabel,
        'file_name' => $file['name'],
        'file_size' => $file['size'],
        'file_hash' => $hash,
        'uploaded_at' => date('Y-m-d H:i:s')
    ];

    file_put_contents("$versionPath/metadata.json", json_encode($metadata, JSON_PRETTY_PRINT));

    jsonSuccess([
        'version_id' => $versionId,
        'version_label' => $versionLabel,
        'file_path' => $filePath
    ], 'Fichier uploadé avec succès');

} catch (Exception $e) {
    error_log('Upload API error: ' . $e->getMessage());
    jsonError('Erreur serveur: ' . $e->getMessage(), 500);
}
