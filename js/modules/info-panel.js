/**
 * Info Panel Manager
 * Gère l'affichage des informations projet et statistiques
 */

const InfoPanel = (function() {
    let currentProject = null;
    let measurements = [];

    /**
     * Initialiser
     */
    function init() {
        setupSubscriptions();
        console.log('InfoPanel initialized');
    }

    /**
     * Configurer les abonnements
     */
    function setupSubscriptions() {
        PubSub.subscribe(EVENTS.PROJECT_LOADED, (project) => {
            currentProject = project;
            updateProjectInfo();
        });

        PubSub.subscribe(EVENTS.PROJECT_CREATED, (project) => {
            currentProject = project;
            updateProjectInfo();
        });

        PubSub.subscribe(EVENTS.MEASUREMENT_CREATED, (data) => {
            if (data.measurement) {
                measurements.push(data.measurement);
                updateStatistics();
            }
        });

        // Écouter les mises à jour de mesures
        PubSub.subscribe('measurements:updated', (data) => {
            measurements = data.measurements || [];
            updateStatistics();
        });
    }

    /**
     * Mettre à jour les informations projet
     */
    function updateProjectInfo() {
        if (!currentProject) {
            clearProjectInfo();
            return;
        }

        document.getElementById('info-project-name').textContent = currentProject.project_name || '-';
        document.getElementById('info-client').textContent = currentProject.client_name || '-';
        document.getElementById('info-reference').textContent = currentProject.contract_reference || '-';

        const createdDate = currentProject.created_at
            ? new Date(currentProject.created_at).toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            })
            : '-';

        const updatedDate = currentProject.updated_at
            ? new Date(currentProject.updated_at).toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })
            : '-';

        document.getElementById('info-created').textContent = createdDate;
        document.getElementById('info-updated').textContent = updatedDate;
    }

    /**
     * Effacer les informations projet
     */
    function clearProjectInfo() {
        document.getElementById('info-project-name').textContent = '-';
        document.getElementById('info-client').textContent = '-';
        document.getElementById('info-reference').textContent = '-';
        document.getElementById('info-created').textContent = '-';
        document.getElementById('info-updated').textContent = '-';

        clearStatistics();
    }

    /**
     * Mettre à jour les statistiques
     */
    function updateStatistics() {
        const stats = calculateStatistics();

        document.getElementById('stat-measurements').textContent = stats.count;
        document.getElementById('stat-total-length').textContent = stats.length.toFixed(2) + ' m';
        document.getElementById('stat-total-area').textContent = stats.area.toFixed(2) + ' m²';
        document.getElementById('stat-total-price').textContent = stats.total.toFixed(2) + ' €';
    }

    /**
     * Calculer les statistiques
     */
    function calculateStatistics() {
        let totalLength = 0;
        let totalArea = 0;
        let totalPrice = 0;

        measurements.forEach(m => {
            // Calculer longueur totale (lignes, polylignes)
            if (m.type === 'line' || m.type === 'polyline') {
                totalLength += m.value || 0;
            }

            // Calculer surface totale (rectangles, polygones, cercles)
            if (m.type === 'rectangle' || m.type === 'polygon' || m.type === 'circle') {
                totalArea += m.value || 0;
            }

            // Calculer total prix
            const quantity = m.quantity || m.value || 0;
            const unitPrice = m.unit_price || 0;
            totalPrice += quantity * unitPrice;
        });

        return {
            count: measurements.length,
            length: totalLength,
            area: totalArea,
            total: totalPrice
        };
    }

    /**
     * Effacer les statistiques
     */
    function clearStatistics() {
        document.getElementById('stat-measurements').textContent = '0';
        document.getElementById('stat-total-length').textContent = '0 m';
        document.getElementById('stat-total-area').textContent = '0 m²';
        document.getElementById('stat-total-price').textContent = '0 €';
    }

    /**
     * Mettre à jour l'indicateur de sauvegarde
     */
    function updateSaveIndicator(status) {
        const indicator = document.getElementById('save-indicator');

        // Retirer toutes les classes de statut
        indicator.classList.remove('saving', 'saved', 'error');

        switch(status) {
            case 'saving':
                indicator.textContent = '💾 Sauvegarde...';
                indicator.classList.add('saving');
                break;
            case 'saved':
                indicator.textContent = '✅ Sauvegardé';
                indicator.classList.add('saved');
                // Retour au statut normal après 2 secondes
                setTimeout(() => {
                    indicator.textContent = '💾 Sauvegardé';
                    indicator.classList.remove('saved');
                }, 2000);
                break;
            case 'error':
                indicator.textContent = '❌ Erreur sauvegarde';
                indicator.classList.add('error');
                break;
            default:
                indicator.textContent = '💾 Sauvegardé';
        }
    }

    /**
     * Mettre à jour les infos de sélection
     */
    function updateSelectionInfo(selection) {
        const container = document.getElementById('selection-info');

        if (!selection || selection.length === 0) {
            container.innerHTML = '<p>Aucune sélection</p>';
            return;
        }

        let html = `<p><strong>${selection.length} élément(s) sélectionné(s)</strong></p>`;

        if (selection.length === 1) {
            const item = selection[0];
            html += `
                <p><strong>Type:</strong> ${item.type}</p>
                <p><strong>Valeur:</strong> ${item.value ? item.value.toFixed(2) : '-'} ${item.unit || ''}</p>
                ${item.description ? `<p><strong>Description:</strong> ${item.description}</p>` : ''}
            `;
        }

        container.innerHTML = html;
    }

    // API publique
    return {
        init,
        updateProjectInfo,
        updateStatistics,
        updateSaveIndicator,
        updateSelectionInfo,
        clearProjectInfo,
        clearStatistics
    };
})();

// Initialiser au chargement
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', InfoPanel.init);
} else {
    InfoPanel.init();
}
