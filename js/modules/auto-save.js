/**
 * Auto Save Manager
 * Sauvegarde automatique toutes les 30 secondes
 */

const AutoSave = (function() {
    const SAVE_INTERVAL = 30000; // 30 secondes
    let saveTimer = null;
    let isDirty = false;
    let currentProject = null;
    let currentVersion = null;
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
        PubSub.subscribe('measurement:updated', () => {
            markAsDirty();
        });

        // Marquer comme modifié quand une mesure est supprimée
        PubSub.subscribe('measurement:deleted', () => {
            markAsDirty();
        });

        // Mémoriser le projet courant
        PubSub.subscribe(EVENTS.PROJECT_LOADED, (project) => {
            currentProject = project;
        });

        PubSub.subscribe(EVENTS.PROJECT_CREATED, (project) => {
            currentProject = project;
        });

        // Mémoriser la version courante
        PubSub.subscribe(EVENTS.VERSION_CHANGED, (data) => {
            currentVersion = data.versionId;
        });

        PubSub.subscribe(EVENTS.PLAN_LOADED, (data) => {
            if (data.versionId) {
                currentVersion = data.versionId;
            }
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
        if (!currentProject) {
            console.log('AutoSave: Pas de projet courant');
            return;
        }

        if (!currentVersion) {
            console.log('AutoSave: Pas de version courante');
            return;
        }

        try {
            // Mettre à jour l'indicateur
            if (typeof InfoPanel !== 'undefined') {
                InfoPanel.updateSaveIndicator('saving');
            }

            // Récupérer les mesures depuis le tableau
            measurements = getMeasurementsFromTable();

            // Sauvegarder les mesures
            await StorageManager.saveMeasurements(currentVersion, measurements);

            // Marquer comme sauvegardé
            isDirty = false;

            // Mettre à jour l'indicateur
            if (typeof InfoPanel !== 'undefined') {
                InfoPanel.updateSaveIndicator('saved');
            }

            console.log('AutoSave: Sauvegarde réussie', measurements.length, 'mesures');

        } catch (error) {
            console.error('AutoSave: Erreur de sauvegarde', error);

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
