/**
 * Auto Save Manager
 * Sauvegarde automatique toutes les 30 secondes
 */

const AutoSave = (function() {
    const SAVE_INTERVAL = 30000; // 30 secondes
    let saveTimer = null;
    let isDirty = false;
    let currentPlanId = null;
    let measurements = [];

    /**
     * Initialiser
     */
    function init() {
        setupSubscriptions();
        startAutoSave();
        console.log('AutoSave initialized (interval: 30s)');
    }

    /**
     * Configurer les abonnements
     */
    function setupSubscriptions() {
        // Marquer comme modifié quand une mesure est créée
        PubSub.subscribe(EVENTS.MEASUREMENT_CREATED, () => {
            markAsDirty();
        });

        // Marquer comme modifié quand une mesure est modifiée
        PubSub.subscribe(EVENTS.MEASUREMENT_UPDATED, () => {
            markAsDirty();
        });

        // Marquer comme modifié quand une mesure est supprimée
        PubSub.subscribe(EVENTS.MEASUREMENT_DELETED, () => {
            markAsDirty();
        });

        // Sauvegarder avant changement de plan + mémoriser nouveau plan
        PubSub.subscribe(EVENTS.PLAN_CHANGED, async (data) => {
            const project = App.getCurrentProject();
            const version = App.getCurrentVersion();

            // Sauvegarder ancien plan avant de changer
            if (isDirty && currentPlanId && project && version) {
                console.log('💾 Auto-save avant changement de plan');
                await saveNow();
            }

            // Mémoriser nouveau plan
            currentPlanId = data.planId;
            console.log('📄 Plan changé:', currentPlanId);
        });
    }

    /**
     * Démarrer la sauvegarde automatique
     */
    function startAutoSave() {
        if (saveTimer) {
            clearInterval(saveTimer);
        }

        saveTimer = setInterval(() => {
            if (isDirty) {
                save();
            }
        }, SAVE_INTERVAL);
    }

    /**
     * Arrêter la sauvegarde automatique
     */
    function stopAutoSave() {
        if (saveTimer) {
            clearInterval(saveTimer);
            saveTimer = null;
        }
    }

    /**
     * Marquer comme modifié
     */
    function markAsDirty() {
        isDirty = true;
    }

    /**
     * Sauvegarder
     */
    async function save() {
        const project = App.getCurrentProject();
        const version = App.getCurrentVersion();

        if (!project) {
            console.log('AutoSave: Pas de projet courant');
            return;
        }

        if (!version) {
            console.log('AutoSave: Pas de version courante');
            return;
        }

        if (!currentPlanId) {
            console.log('AutoSave: Pas de plan courant');
            return;
        }

        try {
            // Mettre à jour l'indicateur
            if (typeof InfoPanel !== 'undefined') {
                InfoPanel.updateSaveIndicator('saving');
            }

            // Récupérer les mesures depuis le tableau
            measurements = getMeasurementsFromTable();

            console.log(`💾 Auto-save: ${measurements.length} mesure(s) pour plan ${currentPlanId}`);

            // Sauvegarder les mesures avec plan_id
            await StorageManager.saveMeasurements(
                project.project_id,
                version,
                currentPlanId,
                measurements
            );

            // Marquer comme sauvegardé
            isDirty = false;

            // Mettre à jour l'indicateur
            if (typeof InfoPanel !== 'undefined') {
                InfoPanel.updateSaveIndicator('saved');
            }

            console.log('✅ Auto-save réussi');

        } catch (error) {
            console.error('❌ Auto-save échoué:', error);

            // Mettre à jour l'indicateur
            if (typeof InfoPanel !== 'undefined') {
                InfoPanel.updateSaveIndicator('error');
            }
        }
    }

    /**
     * Récupérer les mesures depuis le tableau
     * TODO: Adapter selon l'implémentation du tableau de mesures
     */
    function getMeasurementsFromTable() {
        // Placeholder - à adapter selon le module table.js
        const rows = document.querySelectorAll('#measurements-tbody tr:not(.empty-state)');
        const measures = [];

        rows.forEach((row, index) => {
            const cells = row.querySelectorAll('td');
            if (cells.length > 0) {
                measures.push({
                    id: row.dataset.measurementId || `m_${index}`,
                    code: cells[1]?.textContent || '',
                    description: cells[2]?.textContent || '',
                    category: cells[3]?.textContent || '',
                    quantity: parseFloat(cells[4]?.textContent) || 0,
                    unit: cells[5]?.textContent || '',
                    unit_price: parseFloat(cells[6]?.textContent) || 0,
                    total: parseFloat(cells[7]?.textContent) || 0,
                    status: cells[8]?.textContent || 'draft'
                });
            }
        });

        return measures;
    }

    /**
     * Sauvegarder maintenant (force)
     */
    async function saveNow() {
        await save();
    }

    /**
     * Désactiver (cleanup)
     */
    function destroy() {
        stopAutoSave();
    }

    // Sauvegarder avant de quitter la page
    window.addEventListener('beforeunload', (e) => {
        if (isDirty) {
            saveNow();
            e.preventDefault();
            e.returnValue = '';
            return 'Des modifications non sauvegardées existent. Voulez-vous vraiment quitter ?';
        }
    });

    // API publique
    return {
        init,
        save,
        saveNow,
        markAsDirty,
        startAutoSave,
        stopAutoSave,
        destroy
    };
})();

// Initialiser au chargement
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', AutoSave.init);
} else {
    AutoSave.init();
}
