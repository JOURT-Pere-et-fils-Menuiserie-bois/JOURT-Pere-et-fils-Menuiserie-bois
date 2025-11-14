<?php
/**
 * API Upload - Upload de fichiers PDF/DXF (FlatFile)
 */

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../classes/FlatFileDB.php';
require_once __DIR__ . '/../classes/VersionManager.php';

$versionManager = new VersionManager();

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

    // Calculer hash
    $hash = hash_file('sha256', $file['tmp_name']);

    // Vérifier si fichier déjà uploadé
    $versions = $versionManager->getAll($projectId);
    foreach ($versions as $v) {
        if ($v['file_hash'] === $hash) {
            jsonError('Ce fichier a déjà été uploadé (version ' . $v['version_label'] . ')');
        }
    }

    // Créer version
    $versionData = [
        'file_name' => $file['name'],
        'file_hash' => $hash,
        'file_size' => $file['size'],
        'mime_type' => $file['type'],
        'user_id' => 1 // TODO: Session
    ];

    $version = $versionManager->create($projectId, $versionData);

    // Créer dossier version
    $versionPath = SAVES_PATH . '/' . $projectId . '/versions/' . $version['version_id'];
    if (!file_exists($versionPath)) {
        mkdir($versionPath, 0755, true);
    }

    // Déplacer fichier
    $fileName = 'plan.' . $extension;
    $filePath = $versionPath . '/' . $fileName;

    if (!move_uploaded_file($file['tmp_name'], $filePath)) {
        jsonError('Erreur lors de l\'enregistrement du fichier');
    }

    // Mettre à jour le file_path dans la version
    $versionData['file_path'] = $filePath;
    $version = $versionManager->update($projectId, $version['version_id'], ['file_path' => $filePath]);

    jsonSuccess([
        'version' => $version,
        'version_id' => $version['version_id'],
        'version_label' => $version['version_label'],
        'file_path' => $filePath
    ], 'Fichier uploadé avec succès');

} catch (Exception $e) {
    error_log('Upload API error: ' . $e->getMessage());
    jsonError('Erreur serveur: ' . $e->getMessage(), 500);
}
