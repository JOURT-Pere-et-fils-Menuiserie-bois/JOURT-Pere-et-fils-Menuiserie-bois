<?php
/**
 * PIP-SURVIVAL - Point d'entrée principal
 * Application PWA de survivalisme avec IA locale (style Pip-Boy)
 * 100% OFFLINE - Fonctionne sans connexion
 */

// Auto-redirect vers setup wizard si pas installé
if (!file_exists(__DIR__ . '/data/.installed') &&
    strpos($_SERVER['REQUEST_URI'], 'setup') === false) {
    header('Location: /setup-wizard.php');
    exit;
}

// Gestion des requêtes API
if (isset($_SERVER['REQUEST_URI']) && strpos($_SERVER['REQUEST_URI'], '/api/') === 0) {
    require_once __DIR__ . '/api/router.php';
    exit;
}

// Headers pour PWA
header('Service-Worker-Allowed: /');
header('X-Content-Type-Options: nosniff');
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <meta name="description" content="Base de connaissances survivalisme avec IA locale - 100% offline">
    <meta name="theme-color" content="#00ff00">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="mobile-web-app-capable" content="yes">

    <title>PIP-SURVIVAL v3000</title>

    <!-- PWA Manifest -->
    <link rel="manifest" href="/manifest.json">

    <!-- Icons -->
    <link rel="icon" type="image/png" sizes="192x192" href="/assets/images/icons/icon-192.png">
    <link rel="apple-touch-icon" href="/assets/images/icons/icon-512.png">

    <!-- Preload critical resources -->
    <link rel="preload" href="/assets/fonts/vt323.woff2" as="font" type="font/woff2" crossorigin>
    <link rel="preload" href="/assets/css/pipboy.css" as="style">

    <!-- Styles -->
    <link rel="stylesheet" href="/assets/css/pipboy.css">
    <link rel="stylesheet" href="/assets/css/modules.css">
    <link rel="stylesheet" href="/assets/css/animations.css">
</head>
<body class="pip-body">

    <!-- Boot screen -->
    <div id="boot-screen" class="boot-screen">
        <div class="boot-content">
            <pre class="boot-logo">
 ______ _____ ______        ____   ______     __
|   __ \_   _|   __ \______|    \ /      |___|  |
|    __/ | | |    __/______|  |  |  --  | . |_   |
|___|   |___||___|        |____/|______|  _|   |
                                        |__| v3.0
            </pre>
            <div class="boot-text">
                <p>> ROBCO INDUSTRIES UNIFIED OPERATING SYSTEM</p>
                <p>> COPYRIGHT 2077-2287 ROBCO INDUSTRIES</p>
                <p>> -Server 1-</p>
                <p class="loading-line">> LOADING SURVIVAL DATABASE...</p>
            </div>
            <div class="boot-progress">
                <div class="boot-progress-bar" id="boot-progress"></div>
            </div>
        </div>
    </div>

    <!-- Main app container -->
    <div id="app" class="pip-container" style="display: none;">

        <!-- Header -->
        <header class="pip-header">
            <div class="pip-status-bar">
                <span class="status-item" id="status-time">12:00</span>
                <span class="status-item" id="status-battery">
                    <span class="battery-icon">⚡</span>
                    <span id="battery-level">100%</span>
                </span>
                <span class="status-item" id="status-offline">
                    <span class="offline-indicator">●</span> OFFLINE
                </span>
            </div>
            <h1 class="pip-title">
                <span class="glitch" data-text="PIP-SURVIVAL">PIP-SURVIVAL</span>
            </h1>
        </header>

        <!-- Navigation tabs -->
        <nav class="pip-nav">
            <button class="nav-tab active" data-module="stat">
                <span class="nav-icon">📊</span>
                <span class="nav-label">STAT</span>
            </button>
            <button class="nav-tab" data-module="data">
                <span class="nav-icon">💾</span>
                <span class="nav-label">DATA</span>
            </button>
            <button class="nav-tab" data-module="chemistry">
                <span class="nav-icon">⚗️</span>
                <span class="nav-label">CHEM</span>
            </button>
            <button class="nav-tab" data-module="lockpicking">
                <span class="nav-icon">🔓</span>
                <span class="nav-label">LOCK</span>
            </button>
            <button class="nav-tab" data-module="urban-survival">
                <span class="nav-icon">🏙️</span>
                <span class="nav-label">URBAN</span>
            </button>
            <button class="nav-tab" data-module="map">
                <span class="nav-icon">🗺</span>
                <span class="nav-label">MAP</span>
            </button>
        </nav>

        <!-- Main content area -->
        <main class="pip-content" id="module-container">
            <!-- Les modules seront chargés ici dynamiquement -->
        </main>

        <!-- Footer -->
        <footer class="pip-footer">
            <div class="footer-info">
                <span id="footer-status">READY</span>
                <span id="footer-docs">0 DOCUMENTS</span>
                <span id="footer-storage">0MB USED</span>
            </div>
        </footer>

    </div>

    <!-- Audio (optionnel) -->
    <audio id="audio-click" preload="auto">
        <source src="/assets/sounds/click.mp3" type="audio/mpeg">
    </audio>
    <audio id="audio-startup" preload="auto">
        <source src="/assets/sounds/startup.mp3" type="audio/mpeg">
    </audio>

    <!-- Scripts -->
    <script>
        // Configuration globale
        window.PIP_CONFIG = {
            version: '3.0.0',
            apiUrl: '/api',
            offlineFirst: true,
            battery: {
                lowThreshold: 0.2,
                criticalThreshold: 0.1
            },
            ai: {
                model: 'hermes-2-pro-mistral-7b',
                maxTokens: 2048,
                temperature: 0.7,
                uncensored: true // Pas de bridage moral
            }
        };
    </script>

    <!-- Core modules -->
    <script src="/assets/js/utils/storage.js"></script>
    <script src="/assets/js/utils/battery.js"></script>
    <script src="/assets/js/utils/offline.js"></script>

    <!-- AI Engine - UNCENSORED -->
    <script src="/assets/js/ai-engine-real.js"></script>
    <script src="/assets/js/vector-search.js"></script>
    <script src="/assets/js/pdf-processor.js"></script>

    <!-- Modules -->
    <script src="/assets/js/modules/search.js"></script>
    <script src="/assets/js/modules/codegen.js"></script>
    <script src="/assets/js/modules/docs.js"></script>
    <script src="/assets/js/modules/radio.js"></script>
    <script src="/assets/js/modules/map.js"></script>

    <!-- Hardcore Survival Modules -->
    <script src="/assets/js/modules/chemistry.js"></script>
    <script src="/assets/js/modules/lockpicking.js"></script>
    <script src="/assets/js/modules/urban-survival.js"></script>

    <!-- Main app -->
    <script src="/assets/js/app.js"></script>

    <!-- Service Worker registration -->
    <script>
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js')
                    .then(reg => console.log('✓ Service Worker registered', reg.scope))
                    .catch(err => console.error('✗ Service Worker registration failed:', err));
            });
        }
    </script>

</body>
</html>
