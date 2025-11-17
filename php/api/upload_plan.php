<?php
/**
 * API Upload Plan - Upload fichier pour une version EXISTANTE
 * NE CRÉE PAS de version, juste upload le fichier
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../config.php';

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

    // Créer dossier version si n'existe pas
    $versionPath = SAVES_PATH . '/' . $projectId . '/versions/' . $versionId;
    if (!file_exists($versionPath)) {
        mkdir($versionPath, 0755, true);
    }

    // Générer nom de fichier unique pour éviter écrasement
    $timestamp = time();
    $fileName = pathinfo($file['name'], PATHINFO_FILENAME') . '_' . $timestamp . '.' . $extension;
    $absolutePath = $versionPath . '/' . $fileName;

    // Déplacer fichier
    if (!move_uploaded_file($file['tmp_name'], $absolutePath)) {
        jsonError('Erreur lors de l\'enregistrement du fichier');
    }

    // Retourner path RELATIF depuis la racine web
    $relativePath = 'saves/' . $projectId . '/versions/' . $versionId . '/' . $fileName;

    jsonSuccess([
        'file_path' => $relativePath,  // Path relatif pour accès web
        'file_name' => $file['name'],
        'file_size' => $file['size'],
        'mime_type' => $file['type'],
        'file_hash' => $hash
    ], 'Fichier uploadé avec succès');

} catch (Exception $e) {
    error_log('Upload plan API error: ' . $e->getMessage());
    jsonError('Erreur serveur: ' . $e->getMessage(), 500);
}
