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
        document.getElementById('btn-open-project').addEventListener('click', showOpenProjectModal);
        document.getElementById('btn-new-project').addEventListener('click', showNewProjectModal);
        document.getElementById('btn-upload-plan').addEventListener('click', showFileSelector);
        document.getElementById('btn-versions').addEventListener('click', showVersionsModal);
        document.getElementById('btn-export').addEventListener('click', showExportMenu);

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
        document.getElementById('file-input').addEventListener('change', handleFileSelect);
        document.getElementById('btn-browse-file').addEventListener('click', () => {
            document.getElementById('file-input').click();
        });

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
        document.getElementById('btn-calibrate').addEventListener('click', startCalibration);

        // Zoom controls
        document.getElementById('btn-zoom-in').addEventListener('click', () => zoomIn());
        document.getElementById('btn-zoom-out').addEventListener('click', () => zoomOut());
        document.getElementById('btn-zoom-fit').addEventListener('click', () => zoomFit());

        // PDF Navigation
        document.getElementById('btn-prev-page').addEventListener('click', () => previousPage());
        document.getElementById('btn-next-page').addEventListener('click', () => nextPage());

        // Properties
        document.getElementById('prop-color').addEventListener('change', updateToolProperties);
        document.getElementById('prop-thickness').addEventListener('input', updateToolProperties);
        document.getElementById('prop-opacity').addEventListener('input', updateToolProperties);

        // Measurements table
        document.getElementById('select-all-measurements').addEventListener('change', toggleSelectAllMeasurements);
        document.getElementById('btn-add-measurement').addEventListener('click', addManualMeasurement);
        document.getElementById('btn-delete-selected').addEventListener('click', deleteSelectedMeasurements);
        document.getElementById('btn-create-avenant').addEventListener('click', createAvenantFromSelection);
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
        document.getElementById('create-project-confirm').addEventListener('click', createNewProject);

        // Modal calibration
        document.getElementById('calibration-confirm').addEventListener('click', confirmCalibration);
        document.getElementById('calibration-cancel').addEventListener('click', cancelCalibration);
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
            // Masquer drop zone
            document.getElementById('drop-zone').classList.add('hidden');

            // Upload et chargement
            console.log('Chargement PDF:', file.name);

            // Upload vers serveur
            const uploadResult = await StorageManager.uploadFile(file, currentProject.project_id, {
                file_type: 'pdf'
            });

            // Charger dans le viewer
            if (typeof PDFLoader !== 'undefined') {
                await PDFLoader.loadPDF(file);
                currentVersion = uploadResult.version_id;
                updateVersionDisplay();
                PubSub.publish(EVENTS.PLAN_LOADED, { file, type: 'pdf' });
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
            document.getElementById('drop-zone').classList.add('hidden');
            console.log('Chargement DXF:', file.name);

            const uploadResult = await StorageManager.uploadFile(file, currentProject.project_id, {
                file_type: 'dxf'
            });

            if (typeof DXFLoader !== 'undefined') {
                await DXFLoader.loadDXF(file);
                currentVersion = uploadResult.version_id;
                updateVersionDisplay();
                PubSub.publish(EVENTS.PLAN_LOADED, { file, type: 'dxf' });
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
        if (currentProject) {
            document.getElementById('current-project').textContent = currentProject.project_name;
        } else {
            document.getElementById('current-project').textContent = 'Aucun projet';
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
        const color = document.getElementById('prop-color').value;
        const thickness = document.getElementById('prop-thickness').value;
        const opacity = document.getElementById('prop-opacity').value;

        document.getElementById('thickness-value').textContent = thickness + 'px';
        document.getElementById('opacity-value').textContent = opacity + '%';

        PubSub.publish('tool:properties:changed', {
            color,
            thickness: parseInt(thickness),
            opacity: parseInt(opacity) / 100
        });
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
     * Afficher menu export
     */
    function showExportMenu() {
        if (typeof ExportManager !== 'undefined') {
            ExportManager.showMenu();
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
