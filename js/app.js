/**
 * Application principale
 * Point d'entrée et initialisation
 */

const App = (function() {
    let currentProject = null;
    let currentVersion = null;

    /**
     * Initialiser l'application
     */
    function init() {
        console.log('🚀 Initialisation du logiciel de métré...');

        // Initialiser les modules
        initEventListeners();
        initModals();
        initDragAndDrop();

        // Initialiser ProductSheets
        if (typeof ProductSheets !== 'undefined') {
            ProductSheets.init();
        }

        // Charger dernier projet si disponible
        loadLastProject();

        // Écouter les événements
        setupEventSubscriptions();

        console.log('✅ Application prête');
    }

    /**
     * Initialiser les écouteurs d'événements
     */
    function initEventListeners() {
        // Header buttons
        const btnOpenProject = document.getElementById('btn-open-project');
        const btnNewProject = document.getElementById('btn-new-project');
        const btnUploadPlan = document.getElementById('btn-upload-plan');
        const btnVersions = document.getElementById('btn-versions');
        const btnEditProject = document.getElementById('btn-edit-project');

        if (btnOpenProject) btnOpenProject.addEventListener('click', showOpenProjectModal);
        if (btnNewProject) btnNewProject.addEventListener('click', showNewProjectModal);
        if (btnUploadPlan) btnUploadPlan.addEventListener('click', showFileSelector);
        if (btnVersions) btnVersions.addEventListener('click', showVersionsModal);
        if (btnEditProject) btnEditProject.addEventListener('click', showEditProjectModal);

        // Project search
        const searchInput = document.getElementById('project-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                if (typeof ProjectSelector !== 'undefined') {
                    ProjectSelector.filterProjects(e.target.value);
                }
            });
        }

        // File input
        const fileInput = document.getElementById('file-input');
        const btnBrowseFile = document.getElementById('btn-browse-file');

        if (fileInput) fileInput.addEventListener('change', handleFileSelect);
        if (btnBrowseFile) {
            btnBrowseFile.addEventListener('click', () => {
                if (fileInput) fileInput.click();
            });
        }

        // Tools
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const tool = this.dataset.tool;
                if (tool) {
                    selectTool(tool);
                }
            });
        });

        // Calibration
        const btnCalibrate = document.getElementById('btn-calibrate');
        if (btnCalibrate) btnCalibrate.addEventListener('click', startCalibration);

        // Zoom controls
        const btnZoomIn = document.getElementById('btn-zoom-in');
        const btnZoomOut = document.getElementById('btn-zoom-out');
        const btnZoomFit = document.getElementById('btn-zoom-fit');

        if (btnZoomIn) btnZoomIn.addEventListener('click', () => zoomIn());
        if (btnZoomOut) btnZoomOut.addEventListener('click', () => zoomOut());
        if (btnZoomFit) btnZoomFit.addEventListener('click', () => zoomFit());

        // View controls (Grid & Measurements)
        const btnToggleGrid = document.getElementById('btn-toggle-grid');
        const btnToggleMeasurements = document.getElementById('btn-toggle-measurements');

        if (btnToggleGrid) btnToggleGrid.addEventListener('click', () => toggleGrid());
        if (btnToggleMeasurements) btnToggleMeasurements.addEventListener('click', () => toggleMeasurements());

        // PDF Navigation
        const btnPrevPage = document.getElementById('btn-prev-page');
        const btnNextPage = document.getElementById('btn-next-page');

        if (btnPrevPage) btnPrevPage.addEventListener('click', () => previousPage());
        if (btnNextPage) btnNextPage.addEventListener('click', () => nextPage());

        // Properties
        const propColor = document.getElementById('prop-color');
        const propThickness = document.getElementById('prop-thickness');
        const propOpacity = document.getElementById('prop-opacity');

        if (propColor) propColor.addEventListener('change', updateToolProperties);
        if (propThickness) propThickness.addEventListener('input', updateToolProperties);
        if (propOpacity) propOpacity.addEventListener('input', updateToolProperties);

        // Measurements table
        const selectAllMeasurements = document.getElementById('select-all-measurements');
        const btnAddMeasurement = document.getElementById('btn-add-measurement');
        const btnDeleteSelected = document.getElementById('btn-delete-selected');
        const btnCreateAvenant = document.getElementById('btn-create-avenant');

        if (selectAllMeasurements) selectAllMeasurements.addEventListener('change', toggleSelectAllMeasurements);
        if (btnAddMeasurement) btnAddMeasurement.addEventListener('click', addManualMeasurement);
        if (btnDeleteSelected) btnDeleteSelected.addEventListener('click', deleteSelectedMeasurements);
        if (btnCreateAvenant) btnCreateAvenant.addEventListener('click', createAvenantFromSelection);
    }

    /**
     * Initialiser les modales
     */
    function initModals() {
        // Fermer modales au clic sur X ou fond
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', function() {
                this.closest('.modal').classList.remove('active');
            });
        });

        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', function(e) {
                if (e.target === this) {
                    this.classList.remove('active');
                }
            });
        });

        // Modal nouveau projet
        const createProjectConfirm = document.getElementById('create-project-confirm');
        if (createProjectConfirm) createProjectConfirm.addEventListener('click', createNewProject);

        // Modal éditer projet
        const editProjectConfirm = document.getElementById('edit-project-confirm');
        if (editProjectConfirm) editProjectConfirm.addEventListener('click', handleEditProjectConfirm);

        // Modal calibration
        const calibrationConfirm = document.getElementById('calibration-confirm');
        const calibrationCancel = document.getElementById('calibration-cancel');

        if (calibrationConfirm) calibrationConfirm.addEventListener('click', confirmCalibration);
        if (calibrationCancel) calibrationCancel.addEventListener('click', cancelCalibration);
    }

    /**
     * Initialiser le drag & drop
     */
    function initDragAndDrop() {
        const dropZone = document.getElementById('drop-zone');
        const viewerMain = document.getElementById('viewer-main');

        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            viewerMain.addEventListener(eventName, preventDefaults, false);
        });

        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }

        ['dragenter', 'dragover'].forEach(eventName => {
            viewerMain.addEventListener(eventName, () => {
                dropZone.classList.add('drag-over');
            }, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            viewerMain.addEventListener(eventName, () => {
                dropZone.classList.remove('drag-over');
            }, false);
        });

        viewerMain.addEventListener('drop', handleDrop, false);
    }

    /**
     * Gérer le drop de fichier
     */
    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;

        if (files.length > 0) {
            handleFiles(files);
        }
    }

    /**
     * Gérer la sélection de fichier
     */
    function handleFileSelect(e) {
        const files = e.target.files;
        if (files.length > 0) {
            handleFiles(files);
        }
    }

    /**
     * Traiter les fichiers uploadés
     */
    async function handleFiles(files) {
        const file = files[0];
        const fileName = file.name.toLowerCase();

        if (!currentProject) {
            alert('Veuillez d\'abord créer un projet');
            showNewProjectModal();
            return;
        }

        if (fileName.endsWith('.pdf')) {
            await loadPDFFile(file);
        } else if (fileName.endsWith('.dxf')) {
            await loadDXFFile(file);
        } else {
            alert('Format de fichier non supporté. Utilisez PDF ou DXF.');
        }
    }

    /**
     * Charger fichier PDF
     */
    async function loadPDFFile(file) {
        try {
            if (!currentProject) {
                alert('Veuillez d\'abord créer un projet');
                showNewProjectModal();
                return;
            }

            // Masquer drop zone
            document.getElementById('drop-zone').classList.add('hidden');

            console.log('Upload PDF:', file.name);

            // Demander le niveau du plan
            const floorLevel = prompt('Niveau du plan (ex: RDC, R+1, R+2, Sous-sol, Combles):', 'RDC');
            if (!floorLevel) {
                document.getElementById('drop-zone').classList.remove('hidden');
                return;
            }

            // Ordre automatique selon niveau
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
            const floorOrder = floorOrders[floorLevel] || 0;

            // Si aucune version, créer version initiale
            if (!currentVersion) {
                console.log('Création première version...');
                const versionResult = await StorageManager.apiRequest('/versions.php', 'POST', {
                    project_id: currentProject.project_id,
                    version_label: 'Version initiale',
                    description: 'Première version du projet'
                });

                currentVersion = versionResult.version.version_id;
                console.log('Version créée:', currentVersion);

                // Publier événement
                PubSub.publish(EVENTS.VERSION_CHANGED, {
                    versionId: currentVersion,
                    version: versionResult.version
                });
            }

            // Ajouter plan via PlanManager
            if (typeof PlanManager !== 'undefined') {
                await PlanManager.addPlan(file, floorLevel, floorOrder);
                console.log('✅ Plan ajouté via PlanManager');
            } else {
                throw new Error('PlanManager non disponible');
            }

        } catch (error) {
            console.error('Erreur chargement PDF:', error);
            alert('Erreur lors du chargement du PDF: ' + error.message);
            document.getElementById('drop-zone').classList.remove('hidden');
        }
    }

    /**
     * Charger fichier DXF
     */
    async function loadDXFFile(file) {
        try {
            if (!currentProject) {
                alert('Veuillez d\'abord créer un projet');
                showNewProjectModal();
                return;
            }

            document.getElementById('drop-zone').classList.add('hidden');
            console.log('Upload DXF:', file.name);

            // DXF: Demander aussi le niveau
            const floorLevel = prompt('Niveau du plan (ex: RDC, R+1, R+2, Sous-sol, Combles):', 'RDC');
            if (!floorLevel) {
                document.getElementById('drop-zone').classList.remove('hidden');
                return;
            }

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
            const floorOrder = floorOrders[floorLevel] || 0;

            // Si aucune version, créer version initiale
            if (!currentVersion) {
                console.log('Création première version...');
                const versionResult = await StorageManager.apiRequest('/versions.php', 'POST', {
                    project_id: currentProject.project_id,
                    version_label: 'Version initiale',
                    description: 'Première version du projet'
                });

                currentVersion = versionResult.version.version_id;

                PubSub.publish(EVENTS.VERSION_CHANGED, {
                    versionId: currentVersion,
                    version: versionResult.version
                });
            }

            // Ajouter plan via PlanManager (même workflow que PDF)
            if (typeof PlanManager !== 'undefined') {
                await PlanManager.addPlan(file, floorLevel, floorOrder);
                console.log('✅ Plan DXF ajouté via PlanManager');
            } else {
                throw new Error('PlanManager non disponible');
            }

        } catch (error) {
            console.error('Erreur chargement DXF:', error);
            alert('Erreur lors du chargement du DXF: ' + error.message);
            document.getElementById('drop-zone').classList.remove('hidden');
        }
    }

    /**
     * Afficher modal ouverture projet
     */
    function showOpenProjectModal() {
        if (typeof ProjectSelector !== 'undefined') {
            ProjectSelector.showProjectSelector();
        } else {
            alert('Module ProjectSelector non chargé');
        }
    }

    /**
     * Afficher modal nouveau projet
     */
    function showNewProjectModal() {
        document.getElementById('new-project-modal').classList.add('active');
    }

    /**
     * Créer nouveau projet
     */
    async function createNewProject() {
        const form = document.getElementById('new-project-form');
        const formData = new FormData(form);

        const projectData = {
            project_name: formData.get('project_name'),
            client_name: formData.get('client_name'),
            contract_reference: formData.get('contract_reference'),
            address: formData.get('address')
        };

        try {
            const result = await StorageManager.apiRequest('/projects.php', 'POST', projectData);

            currentProject = result.project;
            updateProjectDisplay();

            document.getElementById('new-project-modal').classList.remove('active');
            form.reset();

            PubSub.publish(EVENTS.PROJECT_CREATED, currentProject);

            alert('Projet créé avec succès !');

        } catch (error) {
            console.error('Erreur création projet:', error);
            alert('Erreur lors de la création du projet: ' + error.message);
        }
    }

    /**
     * Afficher modal éditer projet
     */
    function showEditProjectModal() {
        if (!currentProject) {
            alert('Aucun projet ouvert');
            return;
        }

        // Pré-remplir le formulaire avec les données actuelles
        document.getElementById('edit-project-name').value = currentProject.project_name || '';
        document.getElementById('edit-client-name').value = currentProject.client_name || '';
        document.getElementById('edit-contract-reference').value = currentProject.contract_reference || '';
        document.getElementById('edit-address').value = currentProject.address || '';

        document.getElementById('edit-project-modal').classList.add('active');
    }

    /**
     * Enregistrer modifications du projet
     */
    async function handleEditProjectConfirm() {
        if (!currentProject) {
            alert('Aucun projet ouvert');
            return;
        }

        const form = document.getElementById('edit-project-form');
        const formData = new FormData(form);

        const updatedData = {
            project_id: currentProject.project_id,
            project_name: formData.get('project_name'),
            client_name: formData.get('client_name'),
            contract_reference: formData.get('contract_reference'),
            address: formData.get('address')
        };

        try {
            const result = await StorageManager.saveProject(updatedData);

            // Mettre à jour le projet courant avec les nouvelles données
            currentProject = result.project;
            updateProjectDisplay();

            document.getElementById('edit-project-modal').classList.remove('active');

            PubSub.publish(EVENTS.PROJECT_UPDATED, currentProject);

            alert('Projet modifié avec succès !');

        } catch (error) {
            console.error('Erreur modification projet:', error);
            alert('Erreur lors de la modification du projet: ' + error.message);
        }
    }

    /**
     * Charger dernier projet
     */
    function loadLastProject() {
        const lastProjectId = StorageManager.loadLocal('last_project_id');
        if (lastProjectId) {
            loadProject(lastProjectId);
        }
    }

    /**
     * Charger un projet
     */
    async function loadProject(projectId) {
        try {
            currentProject = await StorageManager.loadProject(projectId);
            updateProjectDisplay();
            StorageManager.saveLocal('last_project_id', projectId);
            PubSub.publish(EVENTS.PROJECT_LOADED, currentProject);
        } catch (error) {
            console.error('Erreur chargement projet:', error);
        }
    }

    /**
     * Mettre à jour l'affichage du projet
     */
    function updateProjectDisplay() {
        const btnEditProject = document.getElementById('btn-edit-project');

        if (currentProject) {
            document.getElementById('current-project').textContent = currentProject.project_name;

            // Afficher le bouton d'édition
            if (btnEditProject) {
                btnEditProject.style.display = 'inline-block';
            }
        } else {
            document.getElementById('current-project').textContent = 'Aucun projet';

            // Masquer le bouton d'édition
            if (btnEditProject) {
                btnEditProject.style.display = 'none';
            }
        }
    }

    /**
     * Mettre à jour l'affichage de la version
     */
    function updateVersionDisplay() {
        const versionSpan = document.getElementById('current-version');
        if (currentVersion) {
            versionSpan.textContent = `Version: ${currentVersion}`;
        } else {
            versionSpan.textContent = '';
        }
    }

    /**
     * Sélectionner un outil
     */
    function selectTool(toolName) {
        // Mettre à jour l'UI
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tool="${toolName}"]`)?.classList.add('active');

        // Notifier les autres modules
        PubSub.publish(EVENTS.TOOL_CHANGED, { tool: toolName });
    }

    /**
     * Démarrer la calibration
     */
    function startCalibration() {
        if (typeof CalibrationManager !== 'undefined') {
            CalibrationManager.start();
        }
    }

    /**
     * Confirmer calibration
     */
    function confirmCalibration() {
        if (typeof CalibrationManager !== 'undefined') {
            CalibrationManager.confirm();
        }
    }

    /**
     * Annuler calibration
     */
    function cancelCalibration() {
        if (typeof CalibrationManager !== 'undefined') {
            CalibrationManager.cancel();
        }
    }

    /**
     * Zoom
     */
    function zoomIn() {
        PubSub.publish('viewer:zoom', { direction: 'in' });
    }

    function zoomOut() {
        PubSub.publish('viewer:zoom', { direction: 'out' });
    }

    function zoomFit() {
        PubSub.publish('viewer:zoom', { direction: 'fit' });
    }

    /**
     * Navigation PDF
     */
    function previousPage() {
        if (typeof PDFLoader !== 'undefined') {
            PDFLoader.previousPage();
        }
    }

    function nextPage() {
        if (typeof PDFLoader !== 'undefined') {
            PDFLoader.nextPage();
        }
    }

    /**
     * Toggle affichage de la grille
     */
    function toggleGrid() {
        const viewerMain = document.getElementById('viewer-main');
        const canvas = document.getElementById('plan-canvas');

        if (!viewerMain || !canvas) return;

        // Vérifier si la grille existe déjà
        let gridCanvas = document.getElementById('grid-canvas');

        if (gridCanvas) {
            // Toggle visibilité
            const isVisible = gridCanvas.style.display !== 'none';
            gridCanvas.style.display = isVisible ? 'none' : 'block';

            // Mettre à jour l'état du bouton
            const btn = document.getElementById('btn-toggle-grid');
            if (btn) {
                btn.classList.toggle('active', !isVisible);
            }
        } else {
            // Créer la grille
            gridCanvas = document.createElement('canvas');
            gridCanvas.id = 'grid-canvas';
            gridCanvas.style.position = 'absolute';
            gridCanvas.style.top = '0';
            gridCanvas.style.left = '0';
            gridCanvas.style.pointerEvents = 'none';
            gridCanvas.style.zIndex = '1';

            // Insérer avant le canvas principal
            viewerMain.insertBefore(gridCanvas, canvas);

            // Dessiner la grille
            drawGrid(gridCanvas, canvas);

            // Activer le bouton
            const btn = document.getElementById('btn-toggle-grid');
            if (btn) btn.classList.add('active');
        }
    }

    /**
     * Dessiner la grille sur le canvas
     */
    function drawGrid(gridCanvas, mainCanvas) {
        // Ajuster la taille du canvas grille
        gridCanvas.width = mainCanvas.width || 800;
        gridCanvas.height = mainCanvas.height || 600;

        const ctx = gridCanvas.getContext('2d');
        const gridSize = 50; // Taille de la grille en pixels

        ctx.strokeStyle = '#e0e0e0';
        ctx.lineWidth = 0.5;

        // Lignes verticales
        for (let x = 0; x <= gridCanvas.width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, gridCanvas.height);
            ctx.stroke();
        }

        // Lignes horizontales
        for (let y = 0; y <= gridCanvas.height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(gridCanvas.width, y);
            ctx.stroke();
        }

        // Lignes principales (tous les 5 carreaux)
        ctx.strokeStyle = '#c0c0c0';
        ctx.lineWidth = 1;

        for (let x = 0; x <= gridCanvas.width; x += gridSize * 5) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, gridCanvas.height);
            ctx.stroke();
        }

        for (let y = 0; y <= gridCanvas.height; y += gridSize * 5) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(gridCanvas.width, y);
            ctx.stroke();
        }
    }

    /**
     * Toggle affichage des mesures (annotations)
     */
    function toggleMeasurements() {
        const annotationsLayer = document.getElementById('annotations-layer');
        const btn = document.getElementById('btn-toggle-measurements');

        if (!annotationsLayer) return;

        // Toggle visibilité
        const isVisible = annotationsLayer.style.visibility !== 'hidden';
        annotationsLayer.style.visibility = isVisible ? 'hidden' : 'visible';

        // Mettre à jour l'état du bouton
        if (btn) {
            btn.classList.toggle('active', !isVisible);
        }
    }

    /**
     * Mettre à jour les contrôles de navigation PDF
     */
    function updatePDFNavigation(currentPage, totalPages) {
        const pageInfo = document.getElementById('page-info');
        const btnPrev = document.getElementById('btn-prev-page');
        const btnNext = document.getElementById('btn-next-page');

        if (totalPages > 0) {
            pageInfo.textContent = `Page ${currentPage}/${totalPages}`;
            btnPrev.disabled = currentPage <= 1;
            btnNext.disabled = currentPage >= totalPages;
        } else {
            pageInfo.textContent = '-';
            btnPrev.disabled = true;
            btnNext.disabled = true;
        }
    }

    /**
     * Mettre à jour propriétés outil
     */
    function updateToolProperties() {
        const propColor = document.getElementById('prop-color');
        const propThickness = document.getElementById('prop-thickness');
        const propOpacity = document.getElementById('prop-opacity');
        const thicknessValue = document.getElementById('thickness-value');
        const opacityValue = document.getElementById('opacity-value');

        if (!propColor || !propThickness || !propOpacity) return;

        const color = propColor.value;
        const thickness = propThickness.value;
        const opacity = propOpacity.value;

        if (thicknessValue) thicknessValue.textContent = thickness + 'px';
        if (opacityValue) opacityValue.textContent = opacity + '%';

        const props = {
            color,
            thickness: parseInt(thickness),
            opacity: parseInt(opacity) / 100
        };

        // Publier pour les outils standards
        PubSub.publish('tool:properties:changed', props);

        // Publier aussi pour les outils markup
        PubSub.publish('markup:properties:changed', props);
    }

    /**
     * Sélectionner/Désélectionner toutes les mesures
     */
    function toggleSelectAllMeasurements(e) {
        const checked = e.target.checked;
        document.querySelectorAll('#measurements-tbody input[type="checkbox"]').forEach(cb => {
            cb.checked = checked;
        });
    }

    /**
     * Ajouter mesure manuelle
     */
    function addManualMeasurement() {
        PubSub.publish('measurement:manual:add');
    }

    /**
     * Supprimer mesures sélectionnées
     */
    function deleteSelectedMeasurements() {
        const selected = Array.from(document.querySelectorAll('#measurements-tbody input[type="checkbox"]:checked'))
            .map(cb => cb.closest('tr').dataset.measurementId);

        if (selected.length === 0) {
            alert('Aucune mesure sélectionnée');
            return;
        }

        if (confirm(`Supprimer ${selected.length} mesure(s) ?`)) {
            PubSub.publish('measurement:delete:multiple', { ids: selected });
        }
    }

    /**
     * Créer avenant depuis sélection
     */
    function createAvenantFromSelection() {
        const selected = Array.from(document.querySelectorAll('#measurements-tbody input[type="checkbox"]:checked'))
            .map(cb => cb.closest('tr').dataset.measurementId);

        if (selected.length === 0) {
            alert('Aucune mesure sélectionnée');
            return;
        }

        PubSub.publish('avenant:create:from:selection', { measurementIds: selected });
    }

    /**
     * Afficher sélecteur de fichier
     */
    function showFileSelector() {
        if (!currentProject) {
            alert('Veuillez d\'abord créer un projet');
            showNewProjectModal();
            return;
        }
        document.getElementById('file-input').click();
    }

    /**
     * Afficher modal versions
     */
    function showVersionsModal() {
        if (!currentProject) {
            alert('Aucun projet ouvert');
            return;
        }
        document.getElementById('versions-modal').classList.add('active');
        // Charger les versions
        if (typeof VersionManager !== 'undefined') {
            VersionManager.loadVersions(currentProject.project_id);
        }
    }

    /**
     * Configurer les abonnements aux événements
     */
    function setupEventSubscriptions() {
        PubSub.subscribe(EVENTS.PROJECT_LOADED, (project) => {
            console.log('Projet chargé:', project);
            currentProject = project;
            updateProjectDisplay();
            StorageManager.saveLocal('last_project_id', project.project_id);
        });

        PubSub.subscribe(EVENTS.PROJECT_CREATED, (project) => {
            console.log('Projet créé:', project);
            currentProject = project;
            updateProjectDisplay();
        });

        // NOUVEAU: Mémoriser version courante
        PubSub.subscribe(EVENTS.VERSION_CHANGED, (data) => {
            console.log('Version changée:', data.versionId);
            currentVersion = data.versionId;
            updateVersionDisplay();
        });

        PubSub.subscribe(EVENTS.PLAN_LOADED, (data) => {
            console.log('Plan chargé:', data);
            if (data.pages) {
                updatePDFNavigation(1, data.pages);
            }
        });

        PubSub.subscribe('pdf:page:changed', (data) => {
            if (data.currentPage && data.totalPages) {
                updatePDFNavigation(data.currentPage, data.totalPages);
            }
        });

        PubSub.subscribe(EVENTS.CALIBRATION_COMPLETED, (data) => {
            document.getElementById('scale-info').textContent =
                `Échelle: ${data.scale.toFixed(4)} m/px`;
        });

        PubSub.subscribe(EVENTS.MEASUREMENT_CREATED, (data) => {
            console.log('Mesure créée:', data);
        });

        PubSub.subscribe(EVENTS.UI_ERROR, (data) => {
            console.error('UI Error:', data);
            alert(data.message);
        });
    }

    // API publique
    return {
        init,
        getCurrentProject: () => currentProject,
        getCurrentVersion: () => currentVersion
    };
})();

// Initialiser l'application au chargement du DOM
document.addEventListener('DOMContentLoaded', function() {
    App.init();
});
