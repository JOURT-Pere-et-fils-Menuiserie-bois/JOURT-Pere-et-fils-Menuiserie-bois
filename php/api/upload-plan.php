<?php
/**
 * API Upload Plan - Upload d'un plan pour une version (multi-plans)
 * Contrairement à upload.php qui crée des versions, cette API ajoute des plans à une version
 */

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../classes/FlatFileDB.php';
require_once __DIR__ . '/../classes/PlanManager.php';

$planManager = new PlanManager();

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
    $versionId = $_POST['version_id'] ?? null;
    $floorLevel = $_POST['floor_level'] ?? 'RDC';
    $floorOrder = isset($_POST['floor_order']) ? (int)$_POST['floor_order'] : 0;

    if (!$projectId || !$versionId) {
        jsonError('project_id et version_id requis');
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

    // Créer dossier version si nécessaire
    $versionPath = SAVES_PATH . '/' . $projectId . '/versions/' . $versionId;
    if (!file_exists($versionPath)) {
        mkdir($versionPath, 0755, true);
    }

    // GARDER LE NOM ORIGINAL (sécurisé)
    $originalName = $file['name'];
    $safeName = preg_replace('/[^a-zA-Z0-9_\-\.]/', '_', $originalName);
    
    // Ajouter timestamp pour éviter les collisions
    $timestamp = date('YmdHis');
    $nameWithoutExt = pathinfo($safeName, PATHINFO_FILENAME);
    $fileName = $nameWithoutExt . '_' . $timestamp . '.' . $extension;
    $filePath = $versionPath . '/' . $fileName;

    // Déplacer fichier
    if (!move_uploaded_file($file['tmp_name'], $filePath)) {
        jsonError('Erreur lors de l\'enregistrement du fichier');
    }

    // Créer le plan via PlanManager
    $planData = [
        'project_id' => $projectId,
        'version_id' => $versionId,
        'floor_level' => $floorLevel,
        'floor_order' => $floorOrder,
        'file_path' => $filePath,
        'file_name' => $originalName, // ✅ Nom original conservé
        'file_hash' => $hash,
        'file_size' => $file['size'],
        'mime_type' => $file['type']
    ];

    $plan = $planManager->create($planData);

    jsonSuccess([
        'plan' => $plan,
        'plan_id' => $plan['plan_id'],
        'floor_level' => $plan['floor_level'],
        'file_path' => $filePath,
        'original_name' => $originalName
    ], 'Plan uploadé avec succès');

} catch (Exception $e) {
    error_log('Upload Plan API error: ' . $e->getMessage());
    jsonError('Erreur serveur: ' . $e->getMessage(), 500);
}
