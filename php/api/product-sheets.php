<?php
/**
 * API Gestion Fiches Produits (Bibliothèque Centralisée)
 *
 * Actions supportées:
 * - GET: Récupérer toutes les fiches
 * - POST: Upload nouvelle fiche + métadonnées
 * - PUT: Modifier métadonnées d'une fiche
 * - DELETE: Supprimer fiche (vérification utilisation)
 */

header('Content-Type: application/json');
require_once __DIR__ . '/../config.php';

// Chemins
$library_file = SAVES_DIR . '/product-sheets-library.json';
$upload_dir = dirname(__DIR__, 2) . '/uploads/product-sheets/';

// Créer le fichier bibliothèque si inexistant
if (!file_exists($library_file)) {
    file_put_contents($library_file, json_encode(['sheets' => []], JSON_PRETTY_PRINT));
}

// Créer le dossier upload si inexistant
if (!is_dir($upload_dir)) {
    mkdir($upload_dir, 0755, true);
}

$method = $_SERVER['REQUEST_METHOD'];

try {
    switch ($method) {
        case 'GET':
            handleGet($library_file);
            break;

        case 'POST':
            handlePost($library_file, $upload_dir);
            break;

        case 'PUT':
            handlePut($library_file);
            break;

        case 'DELETE':
            handleDelete($library_file, $upload_dir);
            break;

        default:
            http_response_code(405);
            echo json_encode(['success' => false, 'error' => 'Méthode non supportée']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}

/**
 * GET: Récupérer toutes les fiches
 */
function handleGet($library_file) {
    $library = json_decode(file_get_contents($library_file), true);

    echo json_encode([
        'success' => true,
        'sheets' => $library['sheets']
    ]);
}

/**
 * POST: Upload nouvelle fiche PDF + métadonnées
 */
function handlePost($library_file, $upload_dir) {
    // Vérifier qu'un fichier a été uploadé
    if (!isset($_FILES['pdf'])) {
        throw new Exception('Aucun fichier PDF fourni');
    }

    $file = $_FILES['pdf'];

    // Vérifications
    if ($file['error'] !== UPLOAD_ERR_OK) {
        throw new Exception('Erreur lors de l\'upload du fichier');
    }

    // Vérifier que c'est un PDF
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mime = finfo_file($finfo, $file['tmp_name']);
    finfo_close($finfo);

    if ($mime !== 'application/pdf') {
        throw new Exception('Le fichier doit être un PDF');
    }

    // Limite de taille (10 MB)
    if ($file['size'] > 10 * 1024 * 1024) {
        throw new Exception('Le fichier est trop volumineux (max 10 MB)');
    }

    // Générer ID unique
    $sheet_id = 'sheet_' . time() . '_' . substr(md5(uniqid()), 0, 8);

    // Générer nom de fichier sécurisé
    $filename = $sheet_id . '.pdf';
    $filepath = $upload_dir . $filename;

    // Déplacer le fichier uploadé
    if (!move_uploaded_file($file['tmp_name'], $filepath)) {
        throw new Exception('Impossible de sauvegarder le fichier');
    }

    // Récupérer métadonnées depuis POST
    $metadata = [
        'id' => $sheet_id,
        'name' => $_POST['name'] ?? 'Fiche sans nom',
        'reference' => $_POST['reference'] ?? '',
        'manufacturer' => $_POST['manufacturer'] ?? '',
        'norms' => isset($_POST['norms']) ? json_decode($_POST['norms'], true) : [],
        'category' => $_POST['category'] ?? '',
        'tags' => isset($_POST['tags']) ? json_decode($_POST['tags'], true) : [],
        'pdf_filename' => $filename,
        'created_at' => date('Y-m-d H:i:s'),
        'updated_at' => date('Y-m-d H:i:s')
    ];

    // Ajouter à la bibliothèque
    $library = json_decode(file_get_contents($library_file), true);
    $library['sheets'][$sheet_id] = $metadata;

    file_put_contents($library_file, json_encode($library, JSON_PRETTY_PRINT));

    echo json_encode([
        'success' => true,
        'sheet' => $metadata
    ]);
}

/**
 * PUT: Modifier métadonnées d'une fiche
 */
function handlePut($library_file) {
    $input = json_decode(file_get_contents('php://input'), true);

    if (!isset($input['sheet_id'])) {
        throw new Exception('sheet_id requis');
    }

    $sheet_id = $input['sheet_id'];

    $library = json_decode(file_get_contents($library_file), true);

    if (!isset($library['sheets'][$sheet_id])) {
        throw new Exception('Fiche non trouvée');
    }

    // Mettre à jour les métadonnées
    if (isset($input['name'])) {
        $library['sheets'][$sheet_id]['name'] = $input['name'];
    }
    if (isset($input['reference'])) {
        $library['sheets'][$sheet_id]['reference'] = $input['reference'];
    }
    if (isset($input['manufacturer'])) {
        $library['sheets'][$sheet_id]['manufacturer'] = $input['manufacturer'];
    }
    if (isset($input['norms'])) {
        $library['sheets'][$sheet_id]['norms'] = $input['norms'];
    }
    if (isset($input['category'])) {
        $library['sheets'][$sheet_id]['category'] = $input['category'];
    }
    if (isset($input['tags'])) {
        $library['sheets'][$sheet_id]['tags'] = $input['tags'];
    }

    $library['sheets'][$sheet_id]['updated_at'] = date('Y-m-d H:i:s');

    file_put_contents($library_file, json_encode($library, JSON_PRETTY_PRINT));

    echo json_encode([
        'success' => true,
        'sheet' => $library['sheets'][$sheet_id]
    ]);
}

/**
 * DELETE: Supprimer fiche (avec vérification utilisation)
 */
function handleDelete($library_file, $upload_dir) {
    $input = json_decode(file_get_contents('php://input'), true);

    if (!isset($input['sheet_id'])) {
        throw new Exception('sheet_id requis');
    }

    $sheet_id = $input['sheet_id'];

    $library = json_decode(file_get_contents($library_file), true);

    if (!isset($library['sheets'][$sheet_id])) {
        throw new Exception('Fiche non trouvée');
    }

    // Vérifier si la fiche est utilisée dans des projets
    $projects_dir = dirname(__DIR__, 2) . '/saves/projects/';
    if (is_dir($projects_dir)) {
        $is_used = false;
        $used_in_projects = [];

        foreach (glob($projects_dir . '*.json') as $project_file) {
            $project = json_decode(file_get_contents($project_file), true);

            // Parcourir les versions
            if (isset($project['versions'])) {
                foreach ($project['versions'] as $version) {
                    if (isset($version['measurements'])) {
                        foreach ($version['measurements'] as $measurement) {
                            if (isset($measurement['product_sheets']) &&
                                in_array($sheet_id, $measurement['product_sheets'])) {
                                $is_used = true;
                                $used_in_projects[] = $project['name'];
                                break 3; // Sortir des 3 boucles
                            }
                        }
                    }
                }
            }
        }

        if ($is_used) {
            throw new Exception('Impossible de supprimer: fiche utilisée dans les projets: ' . implode(', ', $used_in_projects));
        }
    }

    // Supprimer le fichier PDF
    $pdf_file = $upload_dir . $library['sheets'][$sheet_id]['pdf_filename'];
    if (file_exists($pdf_file)) {
        unlink($pdf_file);
    }

    // Supprimer de la bibliothèque
    unset($library['sheets'][$sheet_id]);

    file_put_contents($library_file, json_encode($library, JSON_PRETTY_PRINT));

    echo json_encode([
        'success' => true,
        'message' => 'Fiche supprimée'
    ]);
}
