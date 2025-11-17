/**
 * Plan Manager
 * Gère les plans multiples par version
 */

const PlanManager = (function() {
    let currentPlans = [];  // Plans de la version courante
    let currentPlanId = null;  // Plan actuellement affiché
    let currentProjectId = null;
    let currentVersionId = null;

    /**
     * Initialiser
     */
    function init() {
        console.log('PlanManager initialized');

        // S'abonner aux événements
        PubSub.subscribe(EVENTS.PROJECT_LOADED, (project) => {
            currentProjectId = project.project_id;
        });

        PubSub.subscribe(EVENTS.PROJECT_CREATED, (project) => {
            currentProjectId = project.project_id;
        });

        PubSub.subscribe(EVENTS.VERSION_CHANGED, async (data) => {
            currentVersionId = data.versionId;
            // Charger les plans de cette version
            try {
                await loadPlans(currentProjectId, data.versionId);
            } catch (error) {
                console.error('Erreur chargement plans:', error);
            }
        });

        // Événements UI
        setupEventListeners();
    }

    /**
     * Configurer les écouteurs d'événements
     */
    function setupEventListeners() {
        // Sélecteur de plans
        const selector = document.getElementById('plans-selector');
        if (selector) {
            selector.addEventListener('change', (e) => {
                const planId = e.target.value;
                if (planId) {
                    loadPlan(planId);
                }
            });
        }

        // Bouton ajouter plan
        const btnAdd = document.getElementById('btn-add-plan');
        if (btnAdd) {
            btnAdd.addEventListener('click', showAddPlanModal);
        }

        // Bouton confirmer ajout plan
        const btnConfirmAdd = document.getElementById('add-plan-confirm');
        if (btnConfirmAdd) {
            btnConfirmAdd.addEventListener('click', handleAddPlanConfirm);
        }

        // Bouton remplacer plan
        const btnReplace = document.getElementById('btn-replace-plan');
        if (btnReplace) {
            btnReplace.addEventListener('click', showReplacePlanModal);
        }

        // Gestion du select personnalisé pour le niveau
        const floorSelect = document.getElementById('floor-level-select');
        const customLabel = document.getElementById('custom-level-label');
        if (floorSelect && customLabel) {
            floorSelect.addEventListener('change', (e) => {
                customLabel.style.display = e.target.value === 'custom' ? 'block' : 'none';
            });
        }
    }

    /**
     * Charger tous les plans d'une version
     */
    async function loadPlans(projectId, versionId) {
        if (!projectId || !versionId) {
            console.warn('loadPlans: projectId ou versionId manquant');
            return;
        }

        try {
            console.log('🗂️ Chargement plans pour version:', versionId);

            const result = await StorageManager.apiRequest(
                `/plans.php?project_id=${projectId}&version_id=${versionId}`,
                'GET'
            );

            currentPlans = result.plans || [];
            currentProjectId = projectId;
            currentVersionId = versionId;

            // Trier par floor_order
            currentPlans.sort((a, b) => (a.floor_order || 0) - (b.floor_order || 0));

            console.log(`✅ ${currentPlans.length} plan(s) chargé(s)`);

            renderPlansList();

            // Charger le premier plan valide par défaut
            if (currentPlans.length > 0) {
                // Trouver le premier plan avec un fichier
                const validPlan = currentPlans.find(p => p.file_path && !p.pending_upload);
                if (validPlan) {
                    await loadPlan(validPlan.plan_id);
                } else {
                    console.warn('Aucun plan valide à charger (tous en attente upload)');
                }
            }

            return currentPlans;

        } catch (error) {
            console.error('❌ Erreur chargement plans:', error);
            throw error;
        }
    }

    /**
     * Charger un plan spécifique
     */
    async function loadPlan(planId) {
        const plan = currentPlans.find(p => p.plan_id === planId);

        if (!plan) {
            throw new Error('Plan non trouvé: ' + planId);
        }

        console.log('📄 Chargement plan:', plan.floor_level);

        // Vérifier si le plan a un fichier
        if (!plan.file_path || plan.pending_upload) {
            alert(`⚠️ Le plan "${plan.floor_level}" n'a pas encore de fichier.\n\nVeuillez l'uploader.`);
            return;
        }

        try {
            // Détecter le type de fichier (PDF ou DXF)
            const isPDF = plan.mime_type?.includes('pdf') || plan.file_path.toLowerCase().endsWith('.pdf');
            const isDXF = plan.mime_type?.includes('dxf') || plan.file_path.toLowerCase().endsWith('.dxf');

            if (isDXF) {
                // Charger le DXF
                console.log('📐 Chargement DXF:', plan.file_path);
                if (typeof DXFLoader !== 'undefined') {
                    await DXFLoader.loadDXFFromURL(plan.file_path);
                } else {
                    throw new Error('DXFLoader non disponible');
                }
            } else {
                // Charger le PDF (par défaut)
                console.log('📄 Chargement PDF:', plan.file_path);
                if (typeof PDFLoader !== 'undefined') {
                    await PDFLoader.loadPDFFromURL(plan.file_path);
                } else {
                    throw new Error('PDFLoader non disponible. Vérifiez que PDF.js est chargé (js/lib/pdf.min.mjs)');
                }
            }

            // Charger les mesures de ce plan
            console.log('📏 Chargement mesures du plan...');
            const measData = await StorageManager.loadMeasurements(currentProjectId, currentVersionId);

            console.log('📦 Mesures reçues:', measData);

            // Nouvelle structure: measurements_by_plan
            let planMeasurements = [];

            if (measData.measurements_by_plan && measData.measurements_by_plan[planId]) {
                planMeasurements = measData.measurements_by_plan[planId];
            } else if (measData.measurements && Array.isArray(measData.measurements)) {
                // Structure intermédiaire
                planMeasurements = measData.measurements;
            } else if (Array.isArray(measData)) {
                // Ancienne structure (array direct)
                planMeasurements = measData;
            }

            console.log(`✅ ${planMeasurements.length} mesure(s) pour ce plan`);

            // Afficher les mesures
            if (typeof MeasurementTable !== 'undefined') {
                MeasurementTable.loadMeasurements(planMeasurements);
            }

            // Dessiner les mesures
            if (typeof DrawingManager !== 'undefined') {
                planMeasurements.forEach(m => {
                    try {
                        DrawingManager.drawMeasurement(m);
                    } catch (drawError) {
                        console.error('Erreur dessin mesure:', drawError);
                    }
                });
            }

            currentPlanId = planId;

            // Mettre à jour l'UI
            updatePlanSelector();

            // Publier événement
            PubSub.publish(EVENTS.PLAN_CHANGED, { planId, plan });

            console.log('✅ Plan chargé:', plan.floor_level);

        } catch (error) {
            console.error('❌ Erreur chargement plan:', error);
            alert(`❌ Erreur lors du chargement du plan "${plan.floor_level}":\n\n${error.message}`);
            throw error;
        }
    }

    /**
     * Ajouter un nouveau plan à la version
     */
    async function addPlan(file, floorLevel, floorOrder) {
        if (!currentProjectId || !currentVersionId) {
            throw new Error('Aucun projet/version ouvert');
        }

        try {
            console.log('➕ Ajout plan:', floorLevel, '| Fichier:', file.name);

            // ✅ NOUVELLE API: Upload + création du plan en une seule opération
            // Le nom original du fichier est conservé !
            const result = await StorageManager.uploadPlan(
                file,
                currentProjectId,
                currentVersionId,
                floorLevel,
                floorOrder
            );

            const newPlan = result.plan;

            console.log('✅ Plan créé:', newPlan.floor_level, '| Nom original:', result.original_name);

            currentPlans.push(newPlan);
            currentPlans.sort((a, b) => (a.floor_order || 0) - (b.floor_order || 0));

            renderPlansList();

            // Charger ce nouveau plan
            await loadPlan(newPlan.plan_id);

            alert(`✅ Plan "${floorLevel}" ajouté avec succès\n📄 Fichier: ${result.original_name}`);

            return newPlan;

        } catch (error) {
            console.error('❌ Erreur ajout plan:', error);
            alert(`❌ Erreur lors de l'ajout du plan:\n\n${error.message}`);
            throw error;
        }
    }

    /**
     * Remplacer un plan existant (avec backup auto)
     */
    async function replacePlan(planId, newFile) {
        const plan = currentPlans.find(p => p.plan_id === planId);

        if (!plan) {
            throw new Error('Plan non trouvé');
        }

        const confirmMsg = `⚠️ Vous êtes sur le point de remplacer le plan "${plan.floor_level}".\n\n` +
                          `Fichier actuel: ${plan.file_name}\n` +
                          `Nouveau fichier: ${newFile.name}\n\n` +
                          `L'ancien plan sera sauvegardé automatiquement.\n\n` +
                          `Continuer ?`;

        if (!confirm(confirmMsg)) {
            return;
        }

        try {
            console.log('🔄 Remplacement plan:', plan.floor_level, '| Nouveau fichier:', newFile.name);

            // ⚠️ NOTE: Pour le remplacement, on utilise encore l'ancienne API
            // TODO: Créer une API replace-plan.php dédiée qui garde le nom original
            const uploadResult = await StorageManager.uploadFile(newFile, currentProjectId, {
                version_id: currentVersionId,
                floor_level: plan.floor_level
            });

            console.log('✅ Nouveau fichier uploadé:', uploadResult.file_path);

            // Appel API de remplacement
            const replaceData = {
                project_id: currentProjectId,
                version_id: currentVersionId,
                plan_id: planId,
                new_file_path: uploadResult.file_path,
                new_file_name: newFile.name, // ✅ Utiliser le nom original, pas celui de l'upload
                new_file_hash: uploadResult.file_hash || null,
                new_file_size: uploadResult.file_size,
                mime_type: uploadResult.mime_type
            };

            const result = await StorageManager.apiRequest('/plans.php', 'PUT', replaceData);

            console.log('✅ Plan remplacé:', result.plan);
            console.log('💾 Backup créé:', result.backup);

            // Mettre à jour la liste locale
            const index = currentPlans.findIndex(p => p.plan_id === planId);
            if (index !== -1) {
                currentPlans[index] = result.plan;
            }

            renderPlansList();

            // Recharger le plan
            await loadPlan(planId);

            const backupPath = result.backup.file_path || 'backup créé';
            alert(`✅ Plan "${plan.floor_level}" remplacé avec succès\n\n` +
                  `Nouveau fichier: ${newFile.name}\n` +
                  `Backup: ${backupPath}`);

            return result;

        } catch (error) {
            console.error('❌ Erreur remplacement plan:', error);
            alert(`❌ Erreur lors du remplacement du plan:\n\n${error.message}`);
            throw error;
        }
    }

    /**
     * Supprimer un plan
     */
    async function deletePlan(planId) {
        const plan = currentPlans.find(p => p.plan_id === planId);

        if (!plan) {
            throw new Error('Plan non trouvé');
        }

        if (!confirm(`Supprimer le plan "${plan.floor_level}" ?\n\nCette action est irréversible.`)) {
            return;
        }

        try {
            console.log('🗑️ Suppression plan:', plan.floor_level);

            await StorageManager.apiRequest(
                `/plans.php?project_id=${currentProjectId}&version_id=${currentVersionId}&plan_id=${planId}`,
                'DELETE'
            );

            // Retirer de la liste
            currentPlans = currentPlans.filter(p => p.plan_id !== planId);

            renderPlansList();

            // Charger un autre plan si disponible
            if (currentPlans.length > 0) {
                const validPlan = currentPlans.find(p => p.file_path && !p.pending_upload);
                if (validPlan) {
                    await loadPlan(validPlan.plan_id);
                }
            } else {
                // Plus de plans
                if (typeof PDFLoader !== 'undefined' && PDFLoader.clear) {
                    PDFLoader.clear();
                }
                if (typeof MeasurementTable !== 'undefined' && MeasurementTable.clear) {
                    MeasurementTable.clear();
                }
            }

            alert(`✅ Plan "${plan.floor_level}" supprimé`);

        } catch (error) {
            console.error('❌ Erreur suppression plan:', error);
            alert(`❌ Erreur lors de la suppression:\n\n${error.message}`);
            throw error;
        }
    }

    /**
     * Afficher la liste des plans (dans un sélecteur)
     */
    function renderPlansList() {
        const container = document.getElementById('plans-selector');
        if (!container) return;

        if (currentPlans.length === 0) {
            container.innerHTML = '<option value="">Aucun plan</option>';
            return;
        }

        container.innerHTML = currentPlans.map(plan => {
            const badge = plan.is_modified ? ' 🔄' : '';
            const inherited = plan.inherited_from ? ' (hérité)' : '';
            const pending = plan.pending_upload ? ' ⏳ (à uploader)' : '';
            const selected = plan.plan_id === currentPlanId ? 'selected' : '';

            return `<option value="${plan.plan_id}" ${selected}>
                ${plan.floor_level}${badge}${inherited}${pending}
            </option>`;
        }).join('');

        // Activer/désactiver bouton remplacer
        const btnReplace = document.getElementById('btn-replace-plan');
        if (btnReplace) {
            btnReplace.disabled = !currentPlanId;
        }
    }

    /**
     * Mettre à jour le sélecteur de plan
     */
    function updatePlanSelector() {
        const selector = document.getElementById('plans-selector');
        if (selector) {
            selector.value = currentPlanId || '';
        }

        // Mettre à jour le label du plan actuel
        const currentPlan = currentPlans.find(p => p.plan_id === currentPlanId);
        if (currentPlan) {
            const label = document.getElementById('current-plan-label');
            if (label) {
                label.textContent = `Plan: ${currentPlan.floor_level}`;
            }
        }
    }

    /**
     * Gérer la confirmation d'ajout de plan
     */
    async function handleAddPlanConfirm() {
        const form = document.getElementById('add-plan-form');
        const fileInput = document.getElementById('plan-file-input');
        const floorSelect = document.getElementById('floor-level-select');
        const customFloorInput = document.getElementById('custom-floor-level');
        const floorOrderInput = document.getElementById('floor-order-input');

        if (!form || !fileInput || !floorSelect) {
            console.error('Éléments du formulaire manquants');
            return;
        }

        // Validation
        const file = fileInput.files[0];
        if (!file) {
            alert('Veuillez sélectionner un fichier plan');
            return;
        }

        let floorLevel = floorSelect.value;
        if (floorLevel === 'custom') {
            floorLevel = customFloorInput.value.trim();
            if (!floorLevel) {
                alert('Veuillez entrer un nom personnalisé pour le niveau');
                return;
            }
        }

        const floorOrder = parseInt(floorOrderInput.value) || 0;

        // Ajouter le plan
        try {
            await addPlan(file, floorLevel, floorOrder);

            // Fermer la modale et réinitialiser le formulaire
            const modal = document.getElementById('add-plan-modal');
            if (modal) {
                modal.classList.remove('active');
            }
            form.reset();
            const customLabel = document.getElementById('custom-level-label');
            if (customLabel) {
                customLabel.style.display = 'none';
            }
        } catch (error) {
            console.error('Erreur ajout plan:', error);
            alert('Erreur lors de l\'ajout du plan: ' + error.message);
        }
    }

    /**
     * Afficher modal ajout plan
     */
    function showAddPlanModal() {
        if (!currentProjectId || !currentVersionId) {
            alert('Aucun projet ou version ouvert');
            return;
        }

        const modal = document.getElementById('add-plan-modal');
        if (modal) {
            modal.classList.add('active');
        } else {
            console.warn('Modal add-plan-modal non trouvée');
        }
    }

    /**
     * Afficher modal remplacement plan
     */
    function showReplacePlanModal() {
        if (!currentPlanId) {
            alert('Aucun plan sélectionné');
            return;
        }

        const plan = currentPlans.find(p => p.plan_id === currentPlanId);
        if (!plan) return;

        // Utiliser input file simple pour le moment
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.pdf';

        input.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) {
                await replacePlan(currentPlanId, file);
            }
        });

        input.click();
    }

    /**
     * Obtenir le plan courant
     */
    function getCurrentPlan() {
        return currentPlans.find(p => p.plan_id === currentPlanId);
    }

    /**
     * Obtenir tous les plans
     */
    function getAllPlans() {
        return currentPlans;
    }

    // API publique
    return {
        init,
        loadPlans,
        loadPlan,
        addPlan,
        replacePlan,
        deletePlan,
        getCurrentPlan,
        getAllPlans
    };
})();

// Auto-initialiser
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', PlanManager.init);
} else {
    PlanManager.init();
}
