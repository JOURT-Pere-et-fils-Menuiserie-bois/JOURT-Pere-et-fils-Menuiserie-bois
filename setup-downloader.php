<?php
/**
 * Setup Downloader - Télécharge les PDFs hardcore
 * Exécuté en arrière-plan par setup-api.php
 */

if (php_sapi_name() !== 'cli' && !isset($argv)) {
    die('Ce script doit être exécuté en ligne de commande');
}

$pack = $argv[1] ?? 'essential';
$taskId = $argv[2] ?? '';

if (!$taskId) {
    die('Task ID required');
}

$taskFile = __DIR__ . '/data/downloads/' . $taskId . '.json';
$downloadDir = __DIR__ . '/data/pdfs/';

@mkdir($downloadDir, 0755, true);

/**
 * Définition des packs
 */
$packs = [
    'essential' => [
        // Anarchist Cookbook
        [
            'name' => 'Anarchist Cookbook',
            'url' => 'https://the-eye.eu/public/Books/Radical_Militant_Library/Anarchist%20Cookbook/William_Powell-The_Anarchist_Cookbook.pdf',
            'file' => 'anarchist-cookbook.pdf',
            'size' => 2000000
        ],
        // US Army Survival (backup URL si archive.org fail)
        [
            'name' => 'US Army Survival FM 21-76',
            'url' => 'https://irp.fas.org/doddir/army/fm21-76.pdf',
            'file' => 'fm-21-76-survival.pdf',
            'size' => 15000000
        ],
        // TM 31-210 Improvised Munitions
        [
            'name' => 'TM 31-210 Improvised Munitions',
            'url' => 'https://the-eye.eu/public/Books/Military/TM%2031-210%20Improvised%20Munitions%20Handbook.pdf',
            'file' => 'tm-31-210-improvised-munitions.pdf',
            'size' => 15000000
        ],
        // MIT Lock Picking
        [
            'name' => 'MIT Guide to Lock Picking',
            'url' => 'http://www.lysator.liu.se/mit-guide/mit-guide.pdf',
            'file' => 'mit-lock-picking.pdf',
            'size' => 2000000
        ],
        // Where There Is No Doctor
        [
            'name' => 'Where There Is No Doctor',
            'url' => 'https://hesperian.org/wp-content/uploads/pdf/en_wtnd_2020/en_wtnd_2020_full.pdf',
            'file' => 'where-there-is-no-doctor.pdf',
            'size' => 20000000
        ],
        // SAS Survival Handbook
        [
            'name' => 'SAS Survival Handbook',
            'url' => 'https://the-eye.eu/public/Books/Military/SAS%20Survival%20Guide.pdf',
            'file' => 'sas-survival-handbook.pdf',
            'size' => 30000000
        ],
        // Nuclear War Survival
        [
            'name' => 'Nuclear War Survival Skills',
            'url' => 'http://www.oism.org/nwss/nwss.pdf',
            'file' => 'nuclear-war-survival.pdf',
            'size' => 25000000
        ]
    ],

    'complete' => [
        // Tout le pack essential +
        // Poor Man's James Bond
        [
            'name' => 'Poor Mans James Bond Vol 1',
            'url' => 'https://the-eye.eu/public/Books/Radical_Militant_Library/Poor%20Man%27s%20James%20Bond/',
            'file' => 'pmjb-vol1.pdf',
            'size' => 12000000
        ],
        // Ragnar Benson
        [
            'name' => 'Ragnar Benson - Mantrapping',
            'url' => 'https://the-eye.eu/public/Books/Radical_Militant_Library/Ragnar%20Benson/',
            'file' => 'ragnar-mantrapping.pdf',
            'size' => 8000000
        ],
        // etc... (ajouter plus)
    ],

    'apocalypse' => [
        // TOUT + archives additionnelles
    ]
];

// Si complete ou apocalypse, inclure essential
if ($pack === 'complete') {
    $packs['complete'] = array_merge($packs['essential'], $packs['complete']);
} elseif ($pack === 'apocalypse') {
    $packs['apocalypse'] = array_merge($packs['essential'], $packs['complete'], $packs['apocalypse']);
}

$files = $packs[$pack] ?? $packs['essential'];

/**
 * Charger état de la tâche
 */
function loadTask() {
    global $taskFile;
    return json_decode(file_get_contents($taskFile), true);
}

/**
 * Sauvegarder état de la tâche
 */
function saveTask($task) {
    global $taskFile;
    file_put_contents($taskFile, json_encode($task, JSON_PRETTY_PRINT));
}

/**
 * Logger un message
 */
function logMessage($message, $type = 'info') {
    $task = loadTask();
    $task['log'][] = [
        'message' => $message,
        'type' => $type,
        'time' => date('H:i:s')
    ];
    saveTask($task);
    echo "[" . date('H:i:s') . "] $message\n";
}

/**
 * Télécharger un fichier avec progression
 */
function downloadFile($url, $destination) {
    $ch = curl_init($url);
    $fp = fopen($destination, 'w+');

    if (!$fp) {
        return false;
    }

    curl_setopt($ch, CURLOPT_FILE, $fp);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 300); // 5 minutes max par fichier
    curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (survival app)');
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // Pour the-eye.eu

    // Progression callback
    curl_setopt($ch, CURLOPT_NOPROGRESS, false);
    curl_setopt($ch, CURLOPT_PROGRESSFUNCTION, function($resource, $downloadSize, $downloaded, $uploadSize, $uploaded) {
        if ($downloadSize > 0) {
            $percent = round(($downloaded / $downloadSize) * 100);
            // Optionnel : Update progress dans la task
        }
    });

    $result = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

    curl_close($ch);
    fclose($fp);

    // Vérifier si succès
    if (!$result || $httpCode !== 200) {
        @unlink($destination);
        return false;
    }

    return true;
}

/**
 * MAIN LOOP - Télécharger tous les fichiers
 */
logMessage("Démarrage du téléchargement du pack: $pack", 'info');

$task = loadTask();
$task['total'] = count($files);
$task['status'] = 'downloading';
saveTask($task);

$downloaded = 0;
$failed = [];

foreach ($files as $index => $fileInfo) {
    $task = loadTask();
    $task['currentFile'] = $fileInfo['name'];
    $task['downloaded'] = $downloaded;
    $task['progress'] = round(($downloaded / count($files)) * 100);
    saveTask($task);

    logMessage("Téléchargement: {$fileInfo['name']}...", 'info');

    $destination = $downloadDir . $fileInfo['file'];

    // Vérifier si déjà téléchargé
    if (file_exists($destination) && filesize($destination) > 0) {
        logMessage("  → Déjà présent, skip", 'warning');
        $downloaded++;
        continue;
    }

    // Télécharger
    $success = downloadFile($fileInfo['url'], $destination);

    if ($success) {
        logMessage("  ✓ Téléchargé: " . round(filesize($destination) / 1024 / 1024, 2) . " MB", 'success');
        $downloaded++;
    } else {
        logMessage("  ✗ ÉCHEC: {$fileInfo['name']}", 'error');
        $failed[] = $fileInfo['name'];

        // Créer fichier placeholder pour pas bloquer
        file_put_contents($destination . '.failed', $fileInfo['url']);
    }

    // Small delay pour pas surcharger serveurs
    sleep(2);
}

// Finaliser
$task = loadTask();
$task['status'] = 'complete';
$task['complete'] = true;
$task['progress'] = 100;
$task['downloaded'] = $downloaded;

if (count($failed) > 0) {
    logMessage("⚠️  Certains fichiers ont échoué: " . implode(', ', $failed), 'warning');
    logMessage("Vous pourrez les retélécharger manuellement plus tard.", 'info');
} else {
    logMessage("✅ TOUS LES FICHIERS TÉLÉCHARGÉS AVEC SUCCÈS!", 'success');
}

saveTask($task);

echo "\n=== TÉLÉCHARGEMENT TERMINÉ ===\n";
echo "Pack: $pack\n";
echo "Téléchargés: $downloaded/" . count($files) . "\n";
echo "Échecs: " . count($failed) . "\n";
