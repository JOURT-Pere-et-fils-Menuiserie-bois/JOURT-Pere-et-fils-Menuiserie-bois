/**
 * Storage Manager
 * Gère la sauvegarde locale et serveur
 */

const StorageManager = (function() {
    const API_BASE = 'php/api';

    /**
     * Sauvegarder en localStorage
     */
    function saveLocal(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Local storage error:', error);
            return false;
        }
    }

    /**
     * Charger depuis localStorage
     */
    function loadLocal(key) {
        try {
            const data = localStorage.getItem(key);
            // Gérer les cas: null, undefined (string), données vides
            if (!data || data === 'undefined' || data === 'null') {
                return null;
            }
            return JSON.parse(data);
        } catch (error) {
            console.error('Local storage error:', error);
            return null;
        }
    }

    /**
     * Supprimer de localStorage
     */
    function removeLocal(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Local storage error:', error);
            return false;
        }
    }

    /**
     * Effectuer une requête API
     */
    async function apiRequest(endpoint, method = 'GET', data = null) {
        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        if (data && (method === 'POST' || method === 'PUT')) {
            options.body = JSON.stringify(data);
        }

        try {
            const response = await fetch(`${API_BASE}${endpoint}`, options);
            const responseText = await response.text();

            if (!response.ok) {
                // Essayer de parser l'erreur JSON si possible
                let errorMessage = `HTTP error! status: ${response.status}`;
                try {
                    const errorData = JSON.parse(responseText);
                    errorMessage = errorData.error || errorMessage;
                } catch (e) {
                    // Pas du JSON, garder le message par défaut
                }
                throw new Error(errorMessage);
            }

            // Valider que c'est du JSON
            try {
                return JSON.parse(responseText);
            } catch (e) {
                console.error('Invalid JSON response:', responseText.substring(0, 500));
                throw new Error('Le serveur a retourné une réponse invalide (pas du JSON)');
            }
        } catch (error) {
            console.error('API request error:', error);
            throw error;
        }
    }

    /**
     * Upload de fichier
     */
    async function uploadFile(file, projectId, metadata = {}) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('project_id', projectId);
        formData.append('metadata', JSON.stringify(metadata));

        try {
            const response = await fetch(`${API_BASE}/upload.php`, {
                method: 'POST',
                body: formData
            });

            // Lire le texte de la réponse une seule fois
            const responseText = await response.text();

            if (!response.ok) {
                // Essayer de lire le message d'erreur du serveur
                let errorMessage = `HTTP ${response.status}`;
                try {
                    const errorData = JSON.parse(responseText);
                    errorMessage = errorData.error || errorMessage;
                } catch (e) {
                    // Si ce n'est pas du JSON, utiliser le texte brut (mais tronquer si trop long)
                    errorMessage = responseText.length > 200
                        ? responseText.substring(0, 200) + '...'
                        : responseText;
                }
                console.error('Upload error details:', errorMessage);
                throw new Error(`Upload error: ${errorMessage}`);
            }

            // Valider que la réponse est du JSON valide
            try {
                return JSON.parse(responseText);
            } catch (e) {
                console.error('Invalid JSON response:', responseText.substring(0, 500));
                throw new Error('Le serveur a retourné une réponse invalide (pas du JSON)');
            }
        } catch (error) {
            console.error('File upload error:', error);
            throw error;
        }
    }

    /**
     * Sauvegarder projet
     */
    async function saveProject(projectData) {
        // Sauvegarde locale d'abord
        saveLocal(`project_${projectData.project_id}`, projectData);

        // Puis serveur
        try {
            const result = await apiRequest('/projects.php', 'PUT', projectData);
            PubSub.publish(EVENTS.SAVE_COMPLETED, { type: 'project', data: result });
            return result;
        } catch (error) {
            PubSub.publish(EVENTS.SAVE_ERROR, { type: 'project', error: error.message });
            throw error;
        }
    }

    /**
     * Charger projet
     */
    async function loadProject(projectId) {
        try {
            const result = await apiRequest(`/projects.php?id=${projectId}`, 'GET');
            saveLocal(`project_${projectId}`, result);
            return result;
        } catch (error) {
            // Fallback sur local si serveur non disponible
            const localData = loadLocal(`project_${projectId}`);
            if (localData) {
                return localData;
            }
            throw error;
        }
    }

    /**
     * Sauvegarder mesures d'un plan spécifique
     */
    async function saveMeasurements(projectId, versionId, planId, measurements) {
        // Si planId n'est pas fourni, utiliser ancienne méthode (rétrocompatibilité)
        if (!planId) {
            console.warn('saveMeasurements: planId non fourni, mode rétrocompatibilité');
            saveLocal(`measurements_${versionId}`, measurements);

            try {
                const result = await apiRequest('/measurements.php', 'POST', {
                    project_id: projectId,
                    version_id: versionId,
                    measurements: measurements
                });
                return result;
            } catch (error) {
                console.error('Error saving measurements:', error);
                throw error;
            }
        }

        // NOUVELLE MÉTHODE: Sauvegarder par plan
        saveLocal(`measurements_${versionId}_${planId}`, measurements);

        try {
            // Charger measurements_by_plan existants
            let allMeasurements = { measurements_by_plan: {} };

            try {
                const existing = await apiRequest(`/measurements.php?project_id=${projectId}&version_id=${versionId}`, 'GET');
                if (existing && existing.measurements_by_plan) {
                    allMeasurements = existing;
                } else if (existing && Array.isArray(existing.measurements)) {
                    // Ancienne structure { measurements: [] } - migrer
                    allMeasurements.measurements_by_plan = {};
                } else if (Array.isArray(existing)) {
                    // Très ancienne structure (array direct) - migrer
                    allMeasurements.measurements_by_plan = {};
                }
            } catch (e) {
                // Pas de mesures existantes, OK
                console.log('Pas de mesures existantes, création nouvelle structure');
            }

            // Mettre à jour mesures du plan courant
            allMeasurements.measurements_by_plan[planId] = measurements;

            console.log(`💾 Sauvegarde mesures: plan ${planId}, ${measurements.length} mesure(s)`);

            // Sauvegarder tout avec nouvelle structure
            const result = await apiRequest('/measurements.php', 'POST', {
                project_id: projectId,
                version_id: versionId,
                measurements_by_plan: allMeasurements.measurements_by_plan
            });

            return result;
        } catch (error) {
            console.error('Error saving measurements:', error);
            throw error;
        }
    }

    /**
     * Charger mesures (version ou plan spécifique)
     */
    async function loadMeasurements(projectId, versionId, planId = null) {
        try {
            const result = await apiRequest(`/measurements.php?project_id=${projectId}&version_id=${versionId}`, 'GET');
            saveLocal(`measurements_${versionId}`, result);

            // Si planId fourni, retourner seulement ce plan
            if (planId) {
                if (result.measurements_by_plan && result.measurements_by_plan[planId]) {
                    console.log(`📦 Mesures chargées pour plan ${planId}:`, result.measurements_by_plan[planId].length);
                    return result.measurements_by_plan[planId];
                } else {
                    console.log(`📦 Aucune mesure pour plan ${planId}`);
                    return [];
                }
            }

            // Sinon retourner structure complète
            return result;
        } catch (error) {
            const localData = loadLocal(`measurements_${versionId}`);
            if (localData) {
                if (planId && localData.measurements_by_plan) {
                    return localData.measurements_by_plan[planId] || [];
                }
                return localData;
            }
            throw error;
        }
    }

    // API publique
    return {
        saveLocal,
        loadLocal,
        removeLocal,
        apiRequest,
        uploadFile,
        saveProject,
        loadProject,
        saveMeasurements,
        loadMeasurements
    };
})();
