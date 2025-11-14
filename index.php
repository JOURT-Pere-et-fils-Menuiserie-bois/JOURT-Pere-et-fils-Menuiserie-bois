<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Logiciel de Métré Pro - JOURT Père et Fils</title>

    <!-- Styles -->
    <link rel="stylesheet" href="css/reset.css">
    <link rel="stylesheet" href="css/main.css">
    <link rel="stylesheet" href="css/viewer.css">
    <link rel="stylesheet" href="css/table.css">
    <link rel="stylesheet" href="css/modal.css">
    <link rel="stylesheet" href="css/versioning.css">
</head>
<body>
    <div class="app-container">
        <!-- Header -->
        <header class="app-header">
            <div class="header-left">
                <h1>📐 Métré Pro</h1>
                <div class="project-info">
                    <span id="current-project">Aucun projet</span>
                    <span id="current-version"></span>
                </div>
            </div>
            <div class="header-right">
                <button id="btn-open-project" class="btn btn-primary">📂 Ouvrir Projet</button>
                <button id="btn-new-project" class="btn btn-secondary">+ Nouveau</button>
                <button id="btn-upload-plan" class="btn btn-secondary">📄 Charger Plan</button>
                <button id="btn-versions" class="btn btn-secondary">📋 Versions</button>
                <button id="btn-export" class="btn btn-secondary">💾 Exporter</button>
            </div>
        </header>

        <!-- Main Content -->
        <div class="main-content">
            <!-- Left Panel: Tools -->
            <aside class="left-panel">
                <div class="tools-section">
                    <h3>Outils</h3>

                    <div class="tool-group">
                        <button class="tool-btn" data-tool="select" title="Sélection">
                            <span>↖️</span> Sélection
                        </button>
                        <button class="tool-btn" data-tool="pan" title="Déplacement">
                            <span>✋</span> Déplacement
                        </button>
                    </div>

                    <div class="tool-group">
                        <h4>Mesures linéaires</h4>
                        <button class="tool-btn" data-tool="line" title="Ligne simple">
                            <span>📏</span> Ligne
                        </button>
                        <button class="tool-btn" data-tool="polyline" title="Polyligne">
                            <span>〰️</span> Polyligne
                        </button>
                    </div>

                    <div class="tool-group">
                        <h4>Surfaces</h4>
                        <button class="tool-btn" data-tool="rectangle" title="Rectangle">
                            <span>▭</span> Rectangle
                        </button>
                        <button class="tool-btn" data-tool="polygon" title="Polygone">
                            <span>⬡</span> Polygone
                        </button>
                        <button class="tool-btn" data-tool="circle" title="Cercle">
                            <span>⭕</span> Cercle
                        </button>
                    </div>

                    <div class="tool-group">
                        <h4>Comptage</h4>
                        <button class="tool-btn" data-tool="count" title="Comptage">
                            <span>🔢</span> Comptage
                        </button>
                    </div>

                    <div class="tool-group">
                        <h4>Calibration</h4>
                        <button class="tool-btn" id="btn-calibrate" title="Calibrer l'échelle">
                            <span>⚙️</span> Calibrer
                        </button>
                    </div>
                </div>

                <div class="layers-section">
                    <h3>Calques</h3>
                    <div id="layers-list"></div>
                    <button id="btn-add-layer" class="btn-small">+ Nouveau calque</button>
                </div>

                <div class="properties-section">
                    <h3>Propriétés</h3>
                    <div id="properties-panel">
                        <label>
                            Couleur:
                            <input type="color" id="prop-color" value="#FF0000">
                        </label>
                        <label>
                            Épaisseur:
                            <input type="range" id="prop-thickness" min="1" max="10" value="2">
                            <span id="thickness-value">2px</span>
                        </label>
                        <label>
                            Opacité:
                            <input type="range" id="prop-opacity" min="0" max="100" value="50">
                            <span id="opacity-value">50%</span>
                        </label>
                    </div>
                </div>
            </aside>

            <!-- Center: Viewer -->
            <main class="viewer-container">
                <div class="viewer-header">
                    <div class="zoom-controls">
                        <button id="btn-zoom-out">-</button>
                        <span id="zoom-level">100%</span>
                        <button id="btn-zoom-in">+</button>
                        <button id="btn-zoom-fit">Ajuster</button>
                    </div>
                    <div class="view-controls">
                        <button id="btn-toggle-grid">Grille</button>
                        <button id="btn-toggle-measurements">Mesures</button>
                    </div>
                </div>

                <div class="viewer-main" id="viewer-main">
                    <div class="drop-zone" id="drop-zone">
                        <div class="drop-zone-content">
                            <p>📄 Glissez-déposez un plan PDF ou DXF ici</p>
                            <p>ou</p>
                            <button class="btn btn-primary" id="btn-browse-file">Parcourir les fichiers</button>
                            <input type="file" id="file-input" accept=".pdf,.dxf" style="display: none;">
                        </div>
                    </div>

                    <canvas id="plan-canvas"></canvas>
                    <svg id="annotations-layer"></svg>
                </div>

                <div class="viewer-footer">
                    <div class="pdf-navigation">
                        <button id="btn-prev-page" class="btn-icon" title="Page précédente" disabled>◀</button>
                        <span id="page-info">-</span>
                        <button id="btn-next-page" class="btn-icon" title="Page suivante" disabled>▶</button>
                    </div>
                    <span id="cursor-position">Position: -</span>
                    <span id="scale-info">Échelle: Non calibrée</span>
                </div>
            </main>

            <!-- Right Panel: Info -->
            <aside class="right-panel">
                <div class="info-section">
                    <h3>📊 Projet</h3>
                    <div id="project-details" class="project-details">
                        <div class="info-row">
                            <span class="info-label">Nom:</span>
                            <span class="info-value" id="info-project-name">-</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Client:</span>
                            <span class="info-value" id="info-client">-</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Référence:</span>
                            <span class="info-value" id="info-reference">-</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Créé le:</span>
                            <span class="info-value" id="info-created">-</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Modifié le:</span>
                            <span class="info-value" id="info-updated">-</span>
                        </div>
                    </div>
                </div>

                <div class="info-section">
                    <h3>📈 Statistiques</h3>
                    <div id="project-stats" class="project-stats">
                        <div class="stat-item">
                            <span class="stat-value" id="stat-measurements">0</span>
                            <span class="stat-label">Mesures</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-value" id="stat-total-length">0 m</span>
                            <span class="stat-label">Longueur totale</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-value" id="stat-total-area">0 m²</span>
                            <span class="stat-label">Surface totale</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-value" id="stat-total-price">0 €</span>
                            <span class="stat-label">Total estimé</span>
                        </div>
                    </div>
                </div>

                <div class="info-section">
                    <h3>ℹ️ Sélection</h3>
                    <div id="selection-info" class="selection-info">
                        <p>Aucune sélection</p>
                    </div>
                </div>

                <div class="info-section">
                    <div class="save-status">
                        <span id="save-indicator">💾 Sauvegardé</span>
                    </div>
                </div>
            </aside>
        </div>

        <!-- Bottom Panel: Measurements Table -->
        <section class="measurements-section">
            <div class="measurements-header">
                <h3>Tableau des mesures</h3>
                <div class="measurements-actions">
                    <button id="btn-add-measurement" class="btn-small">+ Ajouter ligne</button>
                    <button id="btn-delete-selected" class="btn-small">Supprimer sélection</button>
                    <button id="btn-create-avenant" class="btn-small">Créer avenant</button>
                </div>
            </div>
            <div class="measurements-table-container" id="measurements-table-container">
                <table class="measurements-table" id="measurements-table">
                    <thead>
                        <tr>
                            <th><input type="checkbox" id="select-all-measurements"></th>
                            <th>Code</th>
                            <th>Description</th>
                            <th>Catégorie</th>
                            <th>Quantité</th>
                            <th>Unité</th>
                            <th>P.U. (€)</th>
                            <th>Total (€)</th>
                            <th>Statut</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="measurements-tbody">
                        <tr class="empty-state">
                            <td colspan="10">Aucune mesure. Utilisez les outils pour commencer.</td>
                        </tr>
                    </tbody>
                    <tfoot>
                        <tr class="total-row">
                            <td colspan="7"><strong>TOTAL</strong></td>
                            <td id="total-amount"><strong>0.00 €</strong></td>
                            <td colspan="2"></td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </section>
    </div>

    <!-- Modal: Calibration -->
    <div id="calibration-modal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h2>Calibration de l'échelle</h2>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <p>1. Tracez une ligne sur une dimension connue du plan</p>
                <p>2. Entrez la longueur réelle de cette ligne</p>

                <div class="calibration-form">
                    <label>
                        Longueur mesurée sur le plan:
                        <input type="number" id="calibration-pixels" readonly> pixels
                    </label>

                    <label>
                        Longueur réelle:
                        <input type="number" id="calibration-real" step="0.01" placeholder="Ex: 10.50">
                        <select id="calibration-unit">
                            <option value="m">mètres</option>
                            <option value="cm">centimètres</option>
                            <option value="mm">millimètres</option>
                        </select>
                    </label>

                    <div class="calibration-result">
                        <strong>Échelle calculée:</strong>
                        <span id="calculated-scale">-</span>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" id="calibration-cancel">Annuler</button>
                <button class="btn btn-primary" id="calibration-confirm">Confirmer</button>
            </div>
        </div>
    </div>

    <!-- Modal: New Project -->
    <div id="new-project-modal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h2>Nouveau projet</h2>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <form id="new-project-form">
                    <label>
                        Nom du projet *
                        <input type="text" name="project_name" required>
                    </label>
                    <label>
                        Client
                        <input type="text" name="client_name">
                    </label>
                    <label>
                        Référence contrat
                        <input type="text" name="contract_reference">
                    </label>
                    <label>
                        Adresse
                        <textarea name="address" rows="3"></textarea>
                    </label>
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary modal-close">Annuler</button>
                <button class="btn btn-primary" id="create-project-confirm">Créer</button>
            </div>
        </div>
    </div>

    <!-- Modal: Versions -->
    <div id="versions-modal" class="modal">
        <div class="modal-content modal-large">
            <div class="modal-header">
                <h2>Gestion des versions</h2>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <div class="versions-container" id="versions-container">
                    <!-- Populated by JS -->
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary modal-close">Fermer</button>
            </div>
        </div>
    </div>

    <!-- Modal: Open Project -->
    <div id="open-project-modal" class="modal">
        <div class="modal-content modal-large">
            <div class="modal-header">
                <h2>Ouvrir un projet</h2>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <div class="projects-search">
                    <input type="text" id="project-search" placeholder="🔍 Rechercher un projet...">
                </div>
                <div class="projects-list" id="projects-list">
                    <!-- Populated by project-selector.js -->
                    <div class="loading">Chargement des projets...</div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary modal-close">Fermer</button>
            </div>
        </div>
    </div>

    <!-- Scripts -->
    <!-- PDF.js depuis CDN -->
    <script src="https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.mjs" type="module"></script>
    <script src="js/modules/pubsub.js"></script>
    <script src="js/modules/storage.js"></script>
    <script src="js/modules/pdf-loader.js"></script>
    <script src="js/modules/dxf-loader.js"></script>
    <script src="js/modules/calibration.js"></script>
    <script src="js/modules/drawing.js"></script>
    <script src="js/modules/tools.js"></script>
    <script src="js/modules/layers.js"></script>
    <script src="js/modules/table.js"></script>
    <script src="js/modules/versioning.js"></script>
    <script src="js/modules/export.js"></script>
    <script src="js/modules/project-selector.js"></script>
    <script src="js/modules/info-panel.js"></script>
    <script src="js/modules/auto-save.js"></script>
    <script src="js/modules/shortcuts.js"></script>
    <script src="js/app.js"></script>
</body>
</html>
