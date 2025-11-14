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
            console.log('🔄 Chargement version:', versionId);

            const version = versions.find(v => v.version_id === versionId);
            if (!version) {
                console.error('❌ Version non trouvée:', versionId);
                alert('Version non trouvée');
                return;
            }

            console.log('✅ Version trouvée:', version);

            // Vérifier qu'on a un projet courant
            if (!currentProjectId) {
                console.error('❌ Aucun projet ouvert (currentProjectId est null)');
                alert('❌ Erreur : Aucun projet ouvert');
                return;
            }

            console.log('✅ Projet courant:', currentProjectId);

            // Charger le plan
            console.log('📄 Chargement PDF depuis:', version.file_path);
            try {
                await PDFLoader.loadPDFFromURL(version.file_path);
                console.log('✅ PDF chargé avec succès');
            } catch (pdfError) {
                console.error('❌ Erreur chargement PDF:', pdfError);
                throw new Error(`Impossible de charger le PDF: ${pdfError.message}`);
            }

            // Charger les mesures (ne pas bloquer si erreur)
            console.log('📏 Chargement mesures...');
            try {
                const measurementsData = await StorageManager.loadMeasurements(currentProjectId, versionId);
                console.log('📦 Données mesures reçues:', measurementsData);

                const measurements = measurementsData.measurements || measurementsData || [];

                console.log('✅ Mesures extraites:', measurements.length, 'mesure(s)');

                if (measurements.length > 0) {
                    console.log('📊 Chargement dans table...');
                    MeasurementTable.loadMeasurements(measurements);

                    console.log('🎨 Dessin des mesures...');
                    // Dessiner les mesures
                    measurements.forEach((m, index) => {
                        try {
                            DrawingManager.drawMeasurement(m);
                            console.log(`  ✓ Mesure ${index + 1} dessinée`);
                        } catch (drawError) {
                            console.error(`  ✗ Erreur dessin mesure ${index + 1}:`, drawError);
                        }
                    });

                    console.log('✅ Toutes les mesures dessinées');
                }
            } catch (measError) {
                console.warn('⚠️ Aucune mesure pour cette version (normal si nouveau):', measError.message);
            }

            currentVersionId = versionId;

            // Publier événement
            console.log('📢 Publication événement VERSION_CHANGED');
            PubSub.publish(EVENTS.VERSION_CHANGED, { versionId });

            // Fermer modal
            document.getElementById('versions-modal').classList.remove('active');

            console.log('✅ Version chargée avec succès:', version.version_label);
            alert(`✅ Version ${version.version_label} chargée`);

        } catch (error) {
            console.error('❌ ERREUR CHARGEMENT VERSION:', error);
            console.error('Stack trace:', error.stack);
            alert(`❌ Erreur lors du chargement de la version:\n\n${error.message}\n\nVoir console pour détails (F12)`);
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
