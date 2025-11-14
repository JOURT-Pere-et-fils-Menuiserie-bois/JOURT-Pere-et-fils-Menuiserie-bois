/**
 * Version Manager
 * Gère les versions de plans
 */

const VersionManager = (function() {
    let versions = [];
    let currentVersionId = null;

    /**
     * Charger les versions d'un projet
     */
    async function loadVersions(projectId) {
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

            item.innerHTML = `
                <div class="version-item-info">
                    <h4>
                        ${version.version_label}
                        ${version.is_current ? '<span class="version-badge">Actuelle</span>' : ''}
                    </h4>
                    <p>${version.file_name} - ${date}</p>
                    ${version.change_description ? `<p><em>${version.change_description}</em></p>` : ''}
                </div>
                <div class="version-item-actions">
                    <button class="btn-small" onclick="VersionManager.loadVersion(${version.version_id})">
                        Charger
                    </button>
                    <button class="btn-small" onclick="VersionManager.compareWith(${version.version_id})">
                        Comparer
                    </button>
                </div>
            `;

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

            // Charger le plan
            await PDFLoader.loadPDFFromURL(version.file_path);

            // Charger les mesures
            const measurements = await StorageManager.loadMeasurements(versionId);
            MeasurementTable.loadMeasurements(measurements);

            // Dessiner les mesures
            measurements.forEach(m => {
                DrawingManager.drawMeasurement(m);
            });

            currentVersionId = versionId;

            // Fermer modal
            document.getElementById('versions-modal').classList.remove('active');

            PubSub.publish(EVENTS.VERSION_CHANGED, { versionId });

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

    // API publique
    return {
        loadVersions,
        loadVersion,
        compareWith,
        getCurrentVersion
    };
})();
