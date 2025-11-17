<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Logiciel de Métré Pro - JOURT Père et Fils</title>

    <!-- Styles -->
    <link rel="stylesheet" href="./css/reset.css">
    <link rel="stylesheet" href="./css/main.css">
    <link rel="stylesheet" href="./css/viewer.css">
    <link rel="stylesheet" href="./css/table.css">
    <link rel="stylesheet" href="./css/modal.css">
    <link rel="stylesheet" href="./css/versioning.css">
    <link rel="stylesheet" href="./css/dropdown.css">
    <link rel="stylesheet" href="./css/product-sheets.css">
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
                    <!-- NOUVEAU: Sélecteur de plans -->
                    <div class="plan-selector-container">
                        <label for="plans-selector">Plan:</label>
                        <select id="plans-selector" class="plan-selector">
                            <option value="">Aucun plan</option>
                        </select>
                        <button id="btn-add-plan" class="btn-icon" title="Ajouter un plan">➕</button>
                        <button id="btn-replace-plan" class="btn-icon" title="Remplacer ce plan" disabled>🔄</button>
                    </div>
                </div>
            </div>
            <div class="header-right">
                <button id="btn-open-project" class="btn btn-primary">📂 Ouvrir Projet</button>
                <button id="btn-new-project" class="btn btn-secondary">+ Nouveau</button>
                <button id="btn-upload-plan" class="btn btn-secondary">📄 Charger Plan</button>
                <button id="btn-versions" class="btn btn-secondary">📋 Versions</button>
                <button id="btn-product-sheets-library" class="btn btn-secondary">📚 Bibliothèque Fiches</button>
                <div class="btn-group">
                    <button id="btn-export" class="btn btn-secondary">💾 Exporter ▼</button>
                    <div class="dropdown-menu" id="export-menu">
                        <button id="btn-export-excel">📊 Excel (.xlsx)</button>
                        <button id="btn-export-csv">📄 CSV</button>
                        <button id="btn-export-pdf">📑 Rapport PDF</button>
                        <button id="btn-export-product-sheets">📋 Tableau Fiches Techniques</button>
                        <hr>
                        <button id="btn-import-catalogue">📥 Importer catalogue</button>
                    </div>
                </div>
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
                        <h4>Annotations</h4>
                        <button class="tool-btn" data-tool="markup:arrow" title="Flèche">
                            <span>➡️</span> Flèche
                        </button>
                        <button class="tool-btn" data-tool="markup:text" title="Texte">
                            <span>🆎</span> Texte
                        </button>
                        <button class="tool-btn" data-tool="markup:freehand" title="Dessin libre">
                            <span>✏️</span> Libre
                        </button>
                        <button class="tool-btn" data-tool="markup:cloud" title="Nuage">
                            <span>☁️</span> Nuage
                        </button>
                        <button class="tool-btn" data-tool="markup:symbol" title="Symbole">
                            <span>⭐</span> Symbole
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
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <h3>📊 Projet</h3>
                        <button id="btn-edit-project" class="btn btn-small btn-primary" style="display: none;" title="Modifier le projet">✏️</button>
                    </div>
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

    <!-- Modal: Edit Project -->
    <div id="edit-project-modal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h2>Modifier le projet</h2>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <form id="edit-project-form">
                    <label>
                        Nom du projet *
                        <input type="text" name="project_name" id="edit-project-name" required>
                    </label>
                    <label>
                        Client
                        <input type="text" name="client_name" id="edit-client-name">
                    </label>
                    <label>
                        Référence contrat
                        <input type="text" name="contract_reference" id="edit-contract-reference">
                    </label>
                    <label>
                        Adresse
                        <textarea name="address" id="edit-address" rows="3"></textarea>
                    </label>
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary modal-close">Annuler</button>
                <button class="btn btn-primary" id="edit-project-confirm">Enregistrer</button>
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

    <!-- Modal: Add Plan -->
    <div id="add-plan-modal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h2>Ajouter un plan à la version</h2>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <form id="add-plan-form">
                    <label>
                        Niveau / Étage *
                        <select name="floor_level" id="floor-level-select">
                            <option value="Sous-sol">Sous-sol</option>
                            <option value="RDC" selected>RDC (Rez-de-chaussée)</option>
                            <option value="R+1">R+1 (1er étage)</option>
                            <option value="R+2">R+2 (2ème étage)</option>
                            <option value="R+3">R+3 (3ème étage)</option>
                            <option value="R+4">R+4 (4ème étage)</option>
                            <option value="Combles">Combles</option>
                            <option value="Toiture">Toiture</option>
                            <option value="custom">Autre (personnalisé)...</option>
                        </select>
                    </label>

                    <label id="custom-level-label" style="display: none;">
                        Nom personnalisé *
                        <input type="text" name="custom_floor_level" id="custom-floor-level" placeholder="Ex: Mezzanine, Parking">
                    </label>

                    <label>
                        Ordre d'affichage
                        <input type="number" name="floor_order" id="floor-order-input" value="0" min="-10" max="100">
                        <small>Ordre de tri (ex: Sous-sol=-1, RDC=0, R+1=1, etc.)</small>
                    </label>

                    <label>
                        Fichier Plan (PDF ou DXF) *
                        <input type="file" name="plan_file" id="plan-file-input" accept=".pdf,.dxf" required>
                    </label>
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary modal-close">Annuler</button>
                <button class="btn btn-primary" id="add-plan-confirm">Ajouter</button>
            </div>
        </div>
    </div>

    <!-- Modal Bibliothèque Fiches Produits -->
    <div id="product-sheets-library-modal" class="modal">
        <div class="modal-content modal-large">
            <div class="modal-header">
                <h2>📚 Bibliothèque de Fiches Techniques</h2>
                <span class="modal-close">&times;</span>
            </div>
            <div class="modal-body">
                <div class="product-sheets-toolbar">
                    <input type="text" id="product-sheets-search" placeholder="🔍 Rechercher une fiche..." class="search-input">
                    <button id="btn-add-sheet" class="btn btn-primary">➕ Nouvelle Fiche</button>
                </div>

                <div id="add-sheet-form" class="add-sheet-form" style="display: none; margin-top: 20px; padding: 20px; border: 1px solid #ddd; border-radius: 4px;">
                    <h3>Ajouter une fiche technique</h3>
                    <div class="form-group">
                        <label for="product-sheet-pdf-file">Fichier PDF *</label>
                        <input type="file" id="product-sheet-pdf-file" accept=".pdf" required>
                    </div>
                    <div class="form-group">
                        <label for="product-sheet-name">Nom de la fiche *</label>
                        <input type="text" id="product-sheet-name" placeholder="Ex: Lambris Pin Classe 2 - ABC Bois" required>
                    </div>
                    <div class="form-group">
                        <label for="product-sheet-ref">Référence</label>
                        <input type="text" id="product-sheet-ref" placeholder="Ex: LP-C2-2024">
                    </div>
                    <div class="form-group">
                        <label for="product-sheet-manufacturer">Fabricant</label>
                        <input type="text" id="product-sheet-manufacturer" placeholder="Ex: ABC Bois">
                    </div>
                    <div class="form-group">
                        <label for="product-sheet-norms">Normes (séparées par virgule)</label>
                        <input type="text" id="product-sheet-norms" placeholder="Ex: NF EN 14915, CE">
                    </div>
                    <div class="form-group">
                        <label for="product-sheet-category">Catégorie</label>
                        <input type="text" id="product-sheet-category" placeholder="Ex: Lambris, Isolation, etc.">
                    </div>
                    <div class="form-group">
                        <label for="product-sheet-tags">Tags (séparés par virgule)</label>
                        <input type="text" id="product-sheet-tags" placeholder="Ex: pin, classe 2, extérieur">
                    </div>
                    <div class="form-actions">
                        <button id="btn-upload-product-sheet" class="btn btn-primary">💾 Enregistrer</button>
                        <button id="btn-cancel-add-sheet" class="btn btn-secondary">Annuler</button>
                    </div>
                </div>

                <div id="product-sheets-list" class="product-sheets-list">
                    <!-- Rempli dynamiquement par product-sheets.js -->
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary modal-close">Fermer</button>
            </div>
        </div>
    </div>

    <!-- Modal Association Fiches → Ligne Tableau -->
    <div id="product-sheets-assign-modal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h2>📄 Fiches Techniques de l'Ouvrage</h2>
                <span class="modal-close">&times;</span>
            </div>
            <div class="modal-body">
                <div class="assigned-section">
                    <h3>Fiches associées</h3>
                    <div id="assigned-sheets-list">
                        <!-- Rempli dynamiquement -->
                    </div>
                </div>

                <hr style="margin: 20px 0;">

                <div class="available-section">
                    <h3>Ajouter une fiche</h3>
                    <div id="available-sheets-list">
                        <!-- Rempli dynamiquement -->
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary modal-close">Fermer</button>
            </div>
        </div>
    </div>

    <!-- Scripts -->
    <!-- Bibliothèques externes (100% LOCAL - pas de CDN) -->
    <!-- PDF.js (Mozilla) - Lecture PDF -->
    <script src="./js/lib/pdf.min.mjs" type="module"></script>

    <!-- SheetJS - Export/Import Excel -->
    <script src="./js/lib/xlsx.full.min.js"></script>

    <!-- jsPDF - Génération PDF -->
    <script src="./js/lib/jspdf.umd.min.js"></script>
    <script src="./js/lib/jspdf.plugin.autotable.min.js"></script>

    <!-- Modules Core -->
    <script src="./js/modules/pubsub.js"></script>
    <script src="./js/modules/storage.js"></script>
    <script src="./js/modules/pdf-loader.js"></script>
    <script src="./js/modules/dxf-loader.js"></script>
    <script src="./js/modules/calibration.js"></script>
    <script src="./js/modules/drawing.js"></script>
    <script src="./js/modules/tools.js"></script>
    <script src="./js/modules/layers.js"></script>
    <script src="./js/modules/table.js"></script>
    <script src="./js/modules/versioning.js"></script>
    <script src="./js/modules/plan-manager.js"></script>
    <script src="./js/modules/project-selector.js"></script>
    <script src="./js/modules/info-panel.js"></script>
    <script src="./js/modules/auto-save.js"></script>
    <script src="./js/modules/shortcuts.js"></script>

    <!-- Modules Avancés -->
    <script src="./js/modules/advanced-measurements.js"></script>
    <script src="./js/modules/markup.js"></script>
    <script src="./js/modules/excel-export.js"></script>
    <script src="./js/modules/pdf-reports.js"></script>
    <script src="./js/modules/ui-handlers.js"></script>
    <script src="./js/modules/product-sheets.js"></script>

    <!-- Application principale -->
    <script src="./js/app.js"></script>
    <script>
        // Gestion modal Add Plan
        document.addEventListener('DOMContentLoaded', function() {
            const floorLevelSelect = document.getElementById('floor-level-select');
            const customLevelLabel = document.getElementById('custom-level-label');
            const customLevelInput = document.getElementById('custom-floor-level');
            const floorOrderInput = document.getElementById('floor-order-input');
            const addPlanConfirm = document.getElementById('add-plan-confirm');

            // Ordre par défaut selon niveau
            const floorOrders = {
                'Sous-sol': -1,
                'RDC': 0,
                'R+1': 1,
                'R+2': 2,
                'R+3': 3,
                'R+4': 4,
                'Combles': 5,
                'Toiture': 6
            };

            // Afficher/masquer champ personnalisé
            if (floorLevelSelect) {
                floorLevelSelect.addEventListener('change', function() {
                    if (this.value === 'custom') {
                        customLevelLabel.style.display = 'block';
                        customLevelInput.required = true;
                    } else {
                        customLevelLabel.style.display = 'none';
                        customLevelInput.required = false;

                        // Mettre à jour ordre automatiquement
                        if (floorOrders[this.value] !== undefined) {
                            floorOrderInput.value = floorOrders[this.value];
                        }
                    }
                });
            }

            // Confirmer ajout plan
            if (addPlanConfirm) {
                addPlanConfirm.addEventListener('click', async function() {
                    const form = document.getElementById('add-plan-form');
                    const formData = new FormData(form);

                    const floorLevelValue = formData.get('floor_level');
                    let floorLevel = floorLevelValue === 'custom' ? formData.get('custom_floor_level') : floorLevelValue;
                    const floorOrder = parseInt(formData.get('floor_order'));
                    const file = formData.get('plan_file');

                    if (!floorLevel || !file) {
                        alert('Veuillez remplir tous les champs obligatoires');
                        return;
                    }

                    try {
                        await PlanManager.addPlan(file, floorLevel, floorOrder);

                        // Fermer modal et réinitialiser form
                        document.getElementById('add-plan-modal').classList.remove('active');
                        form.reset();
                        customLevelLabel.style.display = 'none';
                        customLevelInput.required = false;
                    } catch (error) {
                        console.error('Erreur ajout plan:', error);
                        // L'erreur est déjà gérée dans PlanManager.addPlan
                    }
                });
            }

            // Gestion formulaire ajout fiche produit
            const btnAddSheet = document.getElementById('btn-add-sheet');
            const btnCancelAddSheet = document.getElementById('btn-cancel-add-sheet');
            const addSheetForm = document.getElementById('add-sheet-form');

            if (btnAddSheet) {
                btnAddSheet.addEventListener('click', function() {
                    addSheetForm.style.display = addSheetForm.style.display === 'none' ? 'block' : 'none';
                });
            }

            if (btnCancelAddSheet) {
                btnCancelAddSheet.addEventListener('click', function() {
                    addSheetForm.style.display = 'none';
                    // Réinitialiser le formulaire
                    document.getElementById('product-sheet-pdf-file').value = '';
                    document.getElementById('product-sheet-name').value = '';
                    document.getElementById('product-sheet-ref').value = '';
                    document.getElementById('product-sheet-manufacturer').value = '';
                    document.getElementById('product-sheet-norms').value = '';
                    document.getElementById('product-sheet-category').value = '';
                    document.getElementById('product-sheet-tags').value = '';
                });
            }
        });
    </script>
</body>
</html>
