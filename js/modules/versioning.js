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

            currentVersionId = versionId;

            // Publier événement VERSION_CHANGED
            // PlanManager s'abonne à cet événement et chargera automatiquement les plans
            console.log('📢 Publication événement VERSION_CHANGED');
            PubSub.publish(EVENTS.VERSION_CHANGED, {
                versionId,
                version
            });

            // PlanManager va:
            // 1. Charger la liste des plans de cette version
            // 2. Charger le premier plan disponible (PDF + mesures)
            // 3. Mettre à jour le sélecteur de plans
            // Pas besoin de charger PDF ou mesures ici!

            // Fermer modal
            document.getElementById('versions-modal').classList.remove('active');

            console.log('✅ Version changée, PlanManager va charger les plans');
            alert(`✅ Version ${version.version_label} sélectionnée\n\nChargement des plans en cours...`);

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
