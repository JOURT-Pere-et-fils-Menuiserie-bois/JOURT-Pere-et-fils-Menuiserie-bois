/**
 * Project Selector
 * Gestion de la liste et sélection des projets
 */

const ProjectSelector = (function() {
    let allProjects = [];

    /**
     * Initialiser
     */
    function init() {
        loadProjectsList();
    }

    /**
     * Charger la liste des projets
     */
    async function loadProjectsList() {
        try {
            const result = await StorageManager.apiRequest('/projects.php', 'GET');
            allProjects = result.projects || [];
            console.log('Projets chargés:', allProjects.length);
        } catch (error) {
            console.error('Erreur chargement projets:', error);
            allProjects = [];
        }
    }

    /**
     * Afficher la modale de sélection de projet
     */
    function showProjectSelector() {
        const modal = document.getElementById('open-project-modal');
        if (!modal) {
            console.error('Modale open-project-modal introuvable');
            alert('❌ Erreur : Modale non trouvée dans le HTML');
            return;
        }

        // Afficher la modale immédiatement avec un loader
        const container = document.getElementById('projects-list');
        if (container) {
            container.innerHTML = '<div class="loading">Chargement des projets...</div>';
        }
        modal.classList.add('active');

        // Recharger la liste
        loadProjectsList()
            .then(() => {
                renderProjectsList();
            })
            .catch((error) => {
                console.error('Erreur chargement projets:', error);
                if (container) {
                    container.innerHTML = `
                        <div class="empty-state">
                            <p>❌</p>
                            <p>Erreur de connexion au serveur</p>
                            <p style="font-size: 12px; color: #999;">Vérifiez que le serveur PHP est démarré</p>
                            <button class="btn btn-primary" onclick="ProjectSelector.showProjectSelector()">Réessayer</button>
                        </div>
                    `;
                }
            });
    }

    /**
     * Rendre la liste des projets
     */
    function renderProjectsList() {
        const container = document.getElementById('projects-list');
        if (!container) return;

        container.innerHTML = '';

        if (allProjects.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>📂 Aucun projet existant</p>
                    <p>Créez votre premier projet avec le bouton "Nouveau Projet"</p>
                </div>
            `;
            return;
        }

        allProjects.forEach(project => {
            const card = createProjectCard(project);
            container.appendChild(card);
        });
    }

    /**
     * Créer une carte de projet
     */
    function createProjectCard(project) {
        const card = document.createElement('div');
        card.className = 'project-card';
        card.dataset.projectId = project.project_id;

        const createdDate = new Date(project.created_at).toLocaleDateString('fr-FR');
        const updatedDate = new Date(project.updated_at).toLocaleDateString('fr-FR');

        card.innerHTML = `
            <div class="project-card-header">
                <h4>${escapeHtml(project.project_name)}</h4>
                <span class="project-status ${project.status}">${project.status}</span>
            </div>
            <div class="project-card-body">
                ${project.client_name ? `<p><strong>Client:</strong> ${escapeHtml(project.client_name)}</p>` : ''}
                ${project.contract_reference ? `<p><strong>Réf:</strong> ${escapeHtml(project.contract_reference)}</p>` : ''}
                <p><strong>Créé:</strong> ${createdDate}</p>
                <p><strong>Modifié:</strong> ${updatedDate}</p>
            </div>
            <div class="project-card-footer">
                <button class="btn btn-primary btn-open-project" data-project-id="${project.project_id}">
                    Ouvrir
                </button>
                <button class="btn btn-secondary btn-project-info" data-project-id="${project.project_id}">
                    Détails
                </button>
            </div>
        `;

        // Event listeners
        card.querySelector('.btn-open-project').addEventListener('click', () => {
            openProject(project.project_id);
        });

        card.querySelector('.btn-project-info').addEventListener('click', () => {
            showProjectDetails(project.project_id);
        });

        return card;
    }

    /**
     * Ouvrir un projet
     */
    async function openProject(projectId) {
        try {
            console.log('Ouverture du projet:', projectId);

            // 1. Charger les métadonnées du projet
            const result = await StorageManager.loadProject(projectId);
            const project = result.project || result;

            // Publier événement de chargement du projet
            PubSub.publish(EVENTS.PROJECT_LOADED, project);

            // 2. Charger les versions du projet
            const versionsResult = await StorageManager.apiRequest(`/versions.php?project_id=${projectId}`, 'GET');
            const versions = versionsResult.versions || [];

            console.log('Versions trouvées:', versions.length);

            // Charger les versions dans VersionManager pour la modale
            if (typeof VersionManager !== 'undefined') {
                await VersionManager.loadVersions(projectId);
            }

            // 3. Trouver la version actuelle ou la plus récente
            let currentVersion = versions.find(v => v.is_current === 1 || v.is_current === '1');
            if (!currentVersion && versions.length > 0) {
                // Prendre la plus récente (tri par date)
                currentVersion = versions.sort((a, b) =>
                    new Date(b.upload_date) - new Date(a.upload_date)
                )[0];
            }

            // 4. Publier événement VERSION_CHANGED pour que PlanManager charge les plans
            if (currentVersion) {
                console.log('Chargement de la version:', currentVersion.version_label);

                // Publier événement VERSION_CHANGED
                // PlanManager s'abonne à cet événement et va:
                // 1. Charger la liste des plans de cette version
                // 2. Charger le premier plan disponible (PDF + mesures)
                // 3. Mettre à jour le sélecteur de plans
                PubSub.publish(EVENTS.VERSION_CHANGED, {
                    versionId: currentVersion.version_id,
                    version: currentVersion
                });

                showNotification(`✅ Projet "${project.project_name}" ouvert avec ${versions.length} version(s)`, 'success');
            } else {
                showNotification(`✅ Projet "${project.project_name}" ouvert (aucun plan)`, 'success');
            }

            // Fermer la modale
            document.getElementById('open-project-modal').classList.remove('active');

        } catch (error) {
            console.error('Erreur ouverture projet:', error);
            showNotification('❌ Erreur lors de l\'ouverture du projet: ' + error.message, 'error');
        }
    }

    /**
     * Afficher les détails d'un projet
     */
    function showProjectDetails(projectId) {
        const project = allProjects.find(p => p.project_id === projectId);
        if (!project) return;

        alert(`Détails du projet:\n\n${JSON.stringify(project, null, 2)}`);
        // TODO: Créer une vraie modale de détails
    }

    /**
     * Rechercher dans les projets
     */
    function filterProjects(searchTerm) {
        const term = searchTerm.toLowerCase();
        const cards = document.querySelectorAll('.project-card');

        cards.forEach(card => {
            const projectId = card.dataset.projectId;
            const project = allProjects.find(p => p.project_id === projectId);

            if (!project) return;

            const matches =
                project.project_name.toLowerCase().includes(term) ||
                (project.client_name && project.client_name.toLowerCase().includes(term)) ||
                (project.contract_reference && project.contract_reference.toLowerCase().includes(term));

            card.style.display = matches ? 'block' : 'none';
        });
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

    /**
     * Afficher une notification
     */
    function showNotification(message, type = 'info') {
        // Simple alert pour l'instant
        // TODO: Créer un système de notifications toast
        if (type === 'error') {
            alert('❌ ' + message);
        } else {
            console.log(message);
        }
    }

    // API publique
    return {
        init,
        showProjectSelector,
        loadProjectsList,
        renderProjectsList,
        filterProjects
    };
})();

// Initialiser au chargement
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ProjectSelector.init);
} else {
    ProjectSelector.init();
}
