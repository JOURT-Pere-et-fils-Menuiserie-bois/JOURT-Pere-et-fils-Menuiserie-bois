/**
 * Version Manager
 * Gère les versions de plans
 */

const VersionManager = (function() {
    let versions = [];
    let currentVersionId = null;
    let currentProjectId = null;

    /**
     * Initialiser - S'abonner aux événements
     */
    function init() {
        // Mémoriser le projet courant
        PubSub.subscribe(EVENTS.PROJECT_LOADED, (project) => {
            currentProjectId = project.project_id;
        });

        PubSub.subscribe(EVENTS.PROJECT_CREATED, (project) => {
            currentProjectId = project.project_id;
        });
    }

    /**
     * Charger les versions d'un projet
     */
    async function loadVersions(projectId) {
        currentProjectId = projectId;

        try {
            const result = await StorageManager.apiRequest(`/versions.php?project_id=${projectId}`, 'GET');

            versions = result.versions || [];
            renderVersionsList();

        } catch (error) {
            console.error('Erreur chargement versions:', error);
        }
    }

    /**
     * Afficher la liste des versions
     */
    function renderVersionsList() {
        const container = document.getElementById('versions-container');
        if (!container) return;

        if (versions.length === 0) {
            container.innerHTML = '<p>Aucune version de plan</p>';
            return;
        }

        container.innerHTML = '';

        versions.forEach(version => {
            const item = document.createElement('div');
            item.className = 'version-item' + (version.is_current ? ' current' : '');

            const date = new Date(version.upload_date).toLocaleDateString('fr-FR');
            const sizeKB = (version.file_size / 1024).toFixed(1);

            item.innerHTML = `
                <div class="version-item-info">
                    <h4>
                        ${escapeHtml(version.version_label)}
                        ${version.is_current ? '<span class="version-badge">Actuelle</span>' : ''}
                    </h4>
                    <p>${escapeHtml(version.file_name)} - ${date} - ${sizeKB} KB</p>
                    ${version.change_description ? `<p><em>${escapeHtml(version.change_description)}</em></p>` : ''}
                </div>
                <div class="version-item-actions">
                    <button class="btn-small btn-load-version" data-version-id="${version.version_id}">
                        Charger
                    </button>
                    <button class="btn-small btn-compare-version" data-version-id="${version.version_id}">
                        Comparer
                    </button>
                </div>
            `;

            // Event listeners
            item.querySelector('.btn-load-version').addEventListener('click', () => {
                loadVersion(version.version_id);
            });

            item.querySelector('.btn-compare-version').addEventListener('click', () => {
                compareWith(version.version_id);
            });

            container.appendChild(item);
        });
    }

    /**
     * Charger une version
     */
    async function loadVersion(versionId) {
        try {
            const version = versions.find(v => v.version_id === versionId);
            if (!version) return;

            // Vérifier qu'on a un projet courant
            if (!currentProjectId) {
                alert('❌ Erreur : Aucun projet ouvert');
                return;
            }

            // Charger le plan
            await PDFLoader.loadPDFFromURL(version.file_path);

            // Charger les mesures (ne pas bloquer si erreur)
            try {
                const measurementsData = await StorageManager.loadMeasurements(currentProjectId, versionId);
                const measurements = measurementsData.measurements || measurementsData || [];

                console.log('Mesures chargées pour version:', versionId, measurements.length);

                if (measurements.length > 0) {
                    MeasurementTable.loadMeasurements(measurements);

                    // Dessiner les mesures
                    measurements.forEach(m => {
                        DrawingManager.drawMeasurement(m);
                    });
                }
            } catch (measError) {
                console.log('Aucune mesure pour cette version (normal si nouveau)');
            }

            currentVersionId = versionId;

            // Publier événement
            PubSub.publish(EVENTS.VERSION_CHANGED, { versionId });

            // Fermer modal
            document.getElementById('versions-modal').classList.remove('active');

            alert(`Version ${version.version_label} chargée`);

        } catch (error) {
            console.error('Erreur chargement version:', error);
            alert('Erreur lors du chargement de la version');
        }
    }

    /**
     * Comparer avec une version
     */
    function compareWith(versionId) {
        if (!currentVersionId) {
            alert('Aucune version courante chargée');
            return;
        }

        if (currentVersionId === versionId) {
            alert('Sélectionnez une version différente');
            return;
        }

        // TODO: Implémenter la comparaison visuelle
        alert(`Comparaison entre version ${currentVersionId} et ${versionId}\n(Fonctionnalité en développement)`);
    }

    /**
     * Obtenir version courante
     */
    function getCurrentVersion() {
        return versions.find(v => v.version_id === currentVersionId);
    }

    /**
     * Échapper HTML
     */
    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // API publique
    return {
        init,
        loadVersions,
        loadVersion,
        compareWith,
        getCurrentVersion
    };
})();

// Initialiser au chargement
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', VersionManager.init);
} else {
    VersionManager.init();
}
